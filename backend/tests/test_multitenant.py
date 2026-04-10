"""
Multi-tenancy isolation tests.
Verifies that Org A cannot read or modify Org B's data.
"""
import pytest
from app.extensions import db as _db, bcrypt
from app.models.organization import Organization
from app.models.user import User, Role, UserRole
from app.models.hr import Employee


@pytest.fixture(scope="function")
def org_b(db):
    org = Organization(name="Org B", slug="org-b-test")
    db.session.add(org)
    db.session.flush()
    return org


@pytest.fixture(scope="function")
def user_b(db, org_b):
    pw = bcrypt.generate_password_hash("PassB123!").decode("utf-8")
    user = User(
        organization_id=org_b.id,
        email="user@orgb.com",
        password_hash=pw,
        first_name="User",
        last_name="B",
        is_active=True,
    )
    db.session.add(user)
    db.session.flush()
    role = Role.query.filter_by(name="admin").first()
    db.session.add(UserRole(user_id=user.id, role_id=role.id))
    db.session.commit()
    return user


@pytest.fixture(scope="function")
def headers_b(client, user_b):
    resp = client.post("/api/v1/auth/login", json={
        "email": "user@orgb.com",
        "password": "PassB123!",
    })
    token = resp.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def emp_in_org_a(db, org, admin_user):
    emp = Employee(
        organization_id=org.id,
        first_name="OrgA",
        last_name="Employee",
        employee_number="ORGA001",
    )
    db.session.add(emp)
    db.session.commit()
    return emp


class TestTenantIsolation:
    def test_org_b_cannot_list_org_a_employees(self, client, headers_b, emp_in_org_a):
        resp = client.get("/api/v1/hr/employees", headers=headers_b)
        assert resp.status_code == 200
        # Org B gets empty list, not Org A's data
        ids = [e["id"] for e in resp.get_json()["data"]]
        assert emp_in_org_a.id not in ids

    def test_org_b_cannot_get_org_a_employee(self, client, headers_b, emp_in_org_a):
        resp = client.get(f"/api/v1/hr/employees/{emp_in_org_a.id}", headers=headers_b)
        assert resp.status_code == 404

    def test_org_b_cannot_update_org_a_employee(self, client, headers_b, emp_in_org_a):
        resp = client.put(f"/api/v1/hr/employees/{emp_in_org_a.id}", json={
            "department": "Hacked",
        }, headers=headers_b)
        assert resp.status_code == 404

    def test_org_b_cannot_delete_org_a_employee(self, client, headers_b, emp_in_org_a):
        resp = client.delete(f"/api/v1/hr/employees/{emp_in_org_a.id}", headers=headers_b)
        assert resp.status_code == 404

    def test_org_a_cannot_see_org_b_data(self, client, auth_headers, db, org_b):
        # Create a lead in org B
        from app.models.crm import Lead
        lead = Lead(organization_id=org_b.id, first_name="Org B Lead",
                    created_by=1)
        db.session.add(lead)
        db.session.commit()

        resp = client.get("/api/v1/crm/leads", headers=auth_headers)
        ids = [l["id"] for l in resp.get_json()["data"]]
        assert lead.id not in ids

    def test_each_org_sees_own_invoices_only(self, client, auth_headers, headers_b):
        from datetime import date, timedelta

        # Org A creates invoice
        resp_a = client.post("/api/v1/accounting/invoices", json={
            "client_name": "Org A Client",
            "issue_date": str(date.today()),
            "due_date": str(date.today() + timedelta(days=30)),
            "subtotal": "1000",
        }, headers=auth_headers)
        assert resp_a.status_code == 201
        inv_a_id = resp_a.get_json()["data"]["id"]

        # Org B creates invoice
        resp_b = client.post("/api/v1/accounting/invoices", json={
            "client_name": "Org B Client",
            "issue_date": str(date.today()),
            "due_date": str(date.today() + timedelta(days=30)),
            "subtotal": "2000",
        }, headers=headers_b)
        assert resp_b.status_code == 201
        inv_b_id = resp_b.get_json()["data"]["id"]

        # Org A listing only sees its own
        list_a = client.get("/api/v1/accounting/invoices", headers=auth_headers)
        ids_a = [i["id"] for i in list_a.get_json()["data"]]
        assert inv_a_id in ids_a
        assert inv_b_id not in ids_a

        # Org B listing only sees its own
        list_b = client.get("/api/v1/accounting/invoices", headers=headers_b)
        ids_b = [i["id"] for i in list_b.get_json()["data"]]
        assert inv_b_id in ids_b
        assert inv_a_id not in ids_b

    def test_org_b_cannot_fetch_org_a_invoice_by_id(self, client, auth_headers, headers_b):
        from datetime import date, timedelta
        create = client.post("/api/v1/accounting/invoices", json={
            "client_name": "Secret Client",
            "issue_date": str(date.today()),
            "due_date": str(date.today() + timedelta(days=15)),
            "subtotal": "5000",
        }, headers=auth_headers)
        inv_id = create.get_json()["data"]["id"]

        resp = client.get(f"/api/v1/accounting/invoices/{inv_id}", headers=headers_b)
        assert resp.status_code == 404
