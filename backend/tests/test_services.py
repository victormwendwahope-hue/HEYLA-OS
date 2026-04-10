"""
Unit tests for service layer functions.
"""
import pytest
from datetime import date, timedelta
from app.models.hr import Employee
from app.models.crm import Lead, Deal
from app.models.inventory import Product
from app.models.organization import Organization
from app.extensions import db as _db


@pytest.fixture(scope="function")
def populated_org(db, org, admin_user):
    """Fixture that creates sample data for service tests."""
    # Employees
    emp1 = Employee(
        organization_id=org.id,
        employee_number="SVC001",
        first_name="Service",
        last_name="Test",
        department="Engineering",
        salary=72000,
        salary_currency="USD",
        status="active",
        hire_date=date.today() - timedelta(days=365),
    )
    emp2 = Employee(
        organization_id=org.id,
        employee_number="SVC002",
        first_name="Another",
        last_name="Employee",
        department="Sales",
        salary=55000,
        salary_currency="USD",
        status="active",
        hire_date=date.today() - timedelta(days=180),
    )
    db.session.add_all([emp1, emp2])

    # Leads
    lead1 = Lead(organization_id=org.id, first_name="Test", last_name="Lead",
                 status="qualified", source="website", created_by=admin_user.id)
    lead2 = Lead(organization_id=org.id, first_name="Another", last_name="Lead",
                 status="new", source="referral", created_by=admin_user.id)
    db.session.add_all([lead1, lead2])
    db.session.flush()

    # Deals
    deal1 = Deal(organization_id=org.id, lead_id=lead1.id, title="Won Deal",
                 value=50000, stage="closed_won", probability=100)
    deal2 = Deal(organization_id=org.id, lead_id=lead2.id, title="Lost Deal",
                 value=20000, stage="closed_lost", probability=0)
    deal3 = Deal(organization_id=org.id, title="Active Deal",
                 value=30000, stage="proposal", probability=60)
    db.session.add_all([deal1, deal2, deal3])

    # Products
    prod1 = Product(organization_id=org.id, name="Widget A", quantity=5,
                    reorder_level=10, unit_price=99.99, cost_price=50.00, is_active=True)
    prod2 = Product(organization_id=org.id, name="Widget B", quantity=100,
                    reorder_level=20, unit_price=49.99, cost_price=25.00, is_active=True)
    db.session.add_all([prod1, prod2])
    db.session.commit()

    return {"org": org, "employees": [emp1, emp2], "leads": [lead1, lead2],
            "deals": [deal1, deal2, deal3], "products": [prod1, prod2]}


class TestPayrollService:
    def test_calculate_net_pay_basic(self, app):
        with app.app_context():
            from app.services.payroll_service import calculate_net_pay
            result = calculate_net_pay(basic_salary=5000, tax_rate=20.0)
            assert result["gross"] == 5000.0
            assert result["tax"] == 1000.0
            assert result["net_pay"] == 4000.0

    def test_calculate_net_pay_with_allowances(self, app):
        with app.app_context():
            from app.services.payroll_service import calculate_net_pay
            result = calculate_net_pay(
                basic_salary=5000,
                allowances=500,
                overtime=200,
                deductions=100,
                tax_rate=20.0,
            )
            assert result["gross"] == 5700.0
            assert result["tax"] == 1140.0
            assert result["net_pay"] == round(5700 - 1140 - 100, 2)

    def test_calculate_net_pay_zero_tax(self, app):
        with app.app_context():
            from app.services.payroll_service import calculate_net_pay
            result = calculate_net_pay(basic_salary=3000, tax_rate=0.0)
            assert result["net_pay"] == 3000.0
            assert result["tax"] == 0.0

    def test_bulk_payroll_creates_records(self, app, populated_org):
        with app.app_context():
            from app.services.payroll_service import bulk_process_payroll
            from app.models.accounting import Payroll

            org_id = populated_org["org"].id
            ps = date.today().replace(day=1)
            pe = date.today()

            created = bulk_process_payroll(
                organization_id=org_id,
                period_start=ps,
                period_end=pe,
                processed_by=1,
            )
            assert len(created) == 2  # 2 active employees
            for p in created:
                assert p.net_pay > 0
                assert p.status == "draft"

    def test_bulk_payroll_no_duplicates(self, app, populated_org):
        with app.app_context():
            from app.services.payroll_service import bulk_process_payroll
            org_id = populated_org["org"].id
            ps = date(2025, 3, 1)
            pe = date(2025, 3, 31)

            first = bulk_process_payroll(org_id, ps, pe, 1)
            second = bulk_process_payroll(org_id, ps, pe, 1)

            assert len(second) == 0  # no duplicates for same period


class TestCRMService:
    def test_conversion_stats(self, app, populated_org):
        with app.app_context():
            from app.services.crm_service import conversion_stats
            stats = conversion_stats(populated_org["org"].id)
            assert "total_leads" in stats
            assert "win_rate" in stats
            assert stats["total_leads"] == 2
            assert stats["deals_won"] == 1
            assert stats["deals_lost"] == 1
            assert stats["win_rate"] == 50.0
            assert stats["total_won_value"] == 50000.0

    def test_pipeline_summary(self, app, populated_org):
        with app.app_context():
            from app.services.crm_service import get_pipeline_summary
            summary = get_pipeline_summary(populated_org["org"].id)
            assert isinstance(summary, list)
            assert len(summary) == 6  # all 6 stages
            stages = [s["stage"] for s in summary]
            assert "prospecting" in stages
            assert "closed_won" in stages

            won = next(s for s in summary if s["stage"] == "closed_won")
            assert won["count"] == 1
            assert won["total_value"] == 50000.0


class TestInventoryService:
    def test_low_stock_detection(self, app, populated_org):
        with app.app_context():
            from app.services.inventory_service import get_low_stock_products
            low = get_low_stock_products(populated_org["org"].id)
            assert len(low) == 1
            assert low[0]["name"] == "Widget A"
            assert low[0]["quantity"] == 5
            assert low[0]["shortage"] == 5

    def test_inventory_valuation(self, app, populated_org):
        with app.app_context():
            from app.services.inventory_service import get_inventory_valuation
            val = get_inventory_valuation(populated_org["org"].id)
            assert val["total_products"] == 2
            assert val["total_units"] == 105  # 5 + 100
            expected_cost = (5 * 50.0) + (100 * 25.0)
            assert val["cost_value"] == expected_cost
            assert val["potential_margin"] > 0

    def test_no_low_stock_when_all_stocked(self, app, db, org):
        with app.app_context():
            from app.services.inventory_service import get_low_stock_products
            p = Product(organization_id=org.id, name="Well Stocked",
                        quantity=500, reorder_level=10, is_active=True)
            db.session.add(p)
            db.session.commit()
            low = get_low_stock_products(org.id)
            names = [item["name"] for item in low]
            assert "Well Stocked" not in names


class TestEmployeeService:
    def test_employee_summary(self, app, populated_org):
        with app.app_context():
            from app.services.employee_service import get_employee_summary
            emp = populated_org["employees"][0]
            summary = get_employee_summary(emp.id, populated_org["org"].id)
            assert summary is not None
            assert summary["full_name"] == "Service Test"
            assert "attendance_this_month" in summary
            assert "leave" in summary

    def test_employee_summary_wrong_org(self, app, populated_org):
        with app.app_context():
            from app.services.employee_service import get_employee_summary
            emp = populated_org["employees"][0]
            result = get_employee_summary(emp.id, org_id=99999)
            assert result is None
