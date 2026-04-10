from flask import Blueprint
from sqlalchemy import func
from app.extensions import db
from app.models.hr import Employee, Attendance, LeaveRequest
from app.models.accounting import Invoice, Expense, Payroll
from app.models.crm import Lead, Deal
from app.models.inventory import Product
from app.models.transport import Vehicle, Trip
from app.models.fuel import FuelLog
from app.models.marketplace import Job, Application
from app.utils.helpers import success_response
from app.middleware.tenant import tenant_required
from datetime import date, timedelta

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/summary", methods=["GET"])
@tenant_required
def summary(org_id, current_user):
    today = date.today()
    month_start = today.replace(day=1)

    total_employees = Employee.query.filter_by(organization_id=org_id, status="active").count()
    total_leads = Lead.query.filter_by(organization_id=org_id).count()
    total_deals = Deal.query.filter_by(organization_id=org_id).count()
    open_deals = Deal.query.filter_by(organization_id=org_id).filter(
        Deal.stage.notin_(["closed_won", "closed_lost"])
    ).count()

    total_invoiced = db.session.query(func.sum(Invoice.total)).filter_by(organization_id=org_id).scalar() or 0
    total_paid = db.session.query(func.sum(Invoice.total)).filter_by(organization_id=org_id, status="paid").scalar() or 0
    total_expenses = db.session.query(func.sum(Expense.amount)).filter_by(organization_id=org_id, status="approved").scalar() or 0

    total_vehicles = Vehicle.query.filter_by(organization_id=org_id, status="active").count()
    active_trips = Trip.query.filter_by(organization_id=org_id, status="in_progress").count()
    open_jobs = Job.query.filter_by(organization_id=org_id, status="open").count()

    pending_leaves = LeaveRequest.query.filter_by(organization_id=org_id, status="pending").count()
    low_stock = Product.query.filter(
        Product.organization_id == org_id,
        Product.quantity <= Product.reorder_level,
        Product.is_active == True,
    ).count()

    return success_response({
        "hr": {
            "total_employees": total_employees,
            "pending_leaves": pending_leaves,
        },
        "crm": {
            "total_leads": total_leads,
            "total_deals": total_deals,
            "open_deals": open_deals,
        },
        "accounting": {
            "total_invoiced": float(total_invoiced),
            "total_paid": float(total_paid),
            "outstanding": float(total_invoiced) - float(total_paid),
            "total_expenses": float(total_expenses),
        },
        "transport": {
            "total_vehicles": total_vehicles,
            "active_trips": active_trips,
        },
        "inventory": {
            "low_stock_items": low_stock,
        },
        "marketplace": {
            "open_jobs": open_jobs,
        },
    })


@dashboard_bp.route("/hr", methods=["GET"])
@tenant_required
def hr_dashboard(org_id, current_user):
    today = date.today()
    month_start = today.replace(day=1)

    employees_by_dept = (
        db.session.query(Employee.department, func.count(Employee.id))
        .filter_by(organization_id=org_id, status="active")
        .group_by(Employee.department)
        .all()
    )

    leaves_by_status = (
        db.session.query(LeaveRequest.status, func.count(LeaveRequest.id))
        .filter_by(organization_id=org_id)
        .group_by(LeaveRequest.status)
        .all()
    )

    attendance_today = Attendance.query.filter_by(organization_id=org_id, date=today).count()
    employees_total = Employee.query.filter_by(organization_id=org_id, status="active").count()

    new_hires_month = Employee.query.filter(
        Employee.organization_id == org_id,
        Employee.hire_date >= month_start,
    ).count()

    return success_response({
        "employees_by_department": [
            {"department": dept or "Unassigned", "count": count}
            for dept, count in employees_by_dept
        ],
        "leaves_by_status": [
            {"status": status, "count": count}
            for status, count in leaves_by_status
        ],
        "attendance_today": attendance_today,
        "total_active_employees": employees_total,
        "attendance_rate_today": round(attendance_today / employees_total * 100, 1) if employees_total else 0,
        "new_hires_this_month": new_hires_month,
    })


@dashboard_bp.route("/accounting", methods=["GET"])
@tenant_required
def accounting_dashboard(org_id, current_user):
    invoices_by_status = (
        db.session.query(Invoice.status, func.count(Invoice.id), func.sum(Invoice.total))
        .filter_by(organization_id=org_id)
        .group_by(Invoice.status)
        .all()
    )

    expenses_by_category = (
        db.session.query(Expense.category, func.sum(Expense.amount))
        .filter_by(organization_id=org_id, status="approved")
        .group_by(Expense.category)
        .all()
    )

    # Monthly revenue (last 6 months)
    monthly = []
    for i in range(5, -1, -1):
        d = date.today().replace(day=1) - timedelta(days=i * 30)
        month_start = d.replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        paid = db.session.query(func.sum(Invoice.total)).filter(
            Invoice.organization_id == org_id,
            Invoice.status == "paid",
            Invoice.issue_date >= month_start,
            Invoice.issue_date <= month_end,
        ).scalar() or 0

        monthly.append({
            "month": month_start.strftime("%b %Y"),
            "revenue": float(paid),
        })

    return success_response({
        "invoices_by_status": [
            {"status": s, "count": c, "total": float(t or 0)}
            for s, c, t in invoices_by_status
        ],
        "expenses_by_category": [
            {"category": cat or "Other", "total": float(total or 0)}
            for cat, total in expenses_by_category
        ],
        "monthly_revenue": monthly,
    })


@dashboard_bp.route("/crm", methods=["GET"])
@tenant_required
def crm_dashboard(org_id, current_user):
    leads_by_status = (
        db.session.query(Lead.status, func.count(Lead.id))
        .filter_by(organization_id=org_id)
        .group_by(Lead.status)
        .all()
    )

    deals_by_stage = (
        db.session.query(Deal.stage, func.count(Deal.id), func.sum(Deal.value))
        .filter_by(organization_id=org_id)
        .group_by(Deal.stage)
        .all()
    )

    leads_by_source = (
        db.session.query(Lead.source, func.count(Lead.id))
        .filter_by(organization_id=org_id)
        .group_by(Lead.source)
        .all()
    )

    return success_response({
        "leads_by_status": [
            {"status": s, "count": c} for s, c in leads_by_status
        ],
        "deals_by_stage": [
            {"stage": s, "count": c, "value": float(v or 0)}
            for s, c, v in deals_by_stage
        ],
        "leads_by_source": [
            {"source": s or "Unknown", "count": c}
            for s, c in leads_by_source
        ],
    })


@dashboard_bp.route("/transport", methods=["GET"])
@tenant_required
def transport_dashboard(org_id, current_user):
    vehicles_by_status = (
        db.session.query(Vehicle.status, func.count(Vehicle.id))
        .filter_by(organization_id=org_id)
        .group_by(Vehicle.status)
        .all()
    )

    trips_by_status = (
        db.session.query(Trip.status, func.count(Trip.id))
        .filter_by(organization_id=org_id)
        .group_by(Trip.status)
        .all()
    )

    fuel_this_month = db.session.query(func.sum(FuelLog.total_cost)).filter(
        FuelLog.organization_id == org_id,
        FuelLog.date >= date.today().replace(day=1),
    ).scalar() or 0

    total_liters = db.session.query(func.sum(FuelLog.liters)).filter_by(
        organization_id=org_id
    ).scalar() or 0

    return success_response({
        "vehicles_by_status": [
            {"status": s, "count": c} for s, c in vehicles_by_status
        ],
        "trips_by_status": [
            {"status": s, "count": c} for s, c in trips_by_status
        ],
        "fuel_cost_this_month": float(fuel_this_month),
        "total_liters_all_time": float(total_liters),
    })
