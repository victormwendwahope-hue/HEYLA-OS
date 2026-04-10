import pytest
from datetime import date


def test_list_employees_empty(client, auth_headers):
    resp = client.get("/api/v1/hr/employees", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)


def test_create_employee(client, auth_headers):
    resp = client.post("/api/v1/hr/employees", json={
        "first_name": "Test",
        "last_name": "Employee",
        "department": "Engineering",
        "position": "Developer",
        "hire_date": str(date.today()),
        "salary": "70000",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["data"]["first_name"] == "Test"
    assert data["data"]["employee_number"] is not None
    return data["data"]["id"]


def test_get_employee(client, auth_headers):
    # create first
    create_resp = client.post("/api/v1/hr/employees", json={
        "first_name": "Get",
        "last_name": "Me",
    }, headers=auth_headers)
    emp_id = create_resp.get_json()["data"]["id"]

    resp = client.get(f"/api/v1/hr/employees/{emp_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["id"] == emp_id


def test_update_employee(client, auth_headers):
    create_resp = client.post("/api/v1/hr/employees", json={
        "first_name": "Update",
        "last_name": "Me",
    }, headers=auth_headers)
    emp_id = create_resp.get_json()["data"]["id"]

    resp = client.put(f"/api/v1/hr/employees/{emp_id}", json={
        "department": "Finance",
        "position": "Analyst",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["department"] == "Finance"


def test_delete_employee(client, auth_headers):
    create_resp = client.post("/api/v1/hr/employees", json={
        "first_name": "Delete",
        "last_name": "Me",
    }, headers=auth_headers)
    emp_id = create_resp.get_json()["data"]["id"]

    resp = client.delete(f"/api/v1/hr/employees/{emp_id}", headers=auth_headers)
    assert resp.status_code == 200

    get_resp = client.get(f"/api/v1/hr/employees/{emp_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_create_attendance(client, auth_headers):
    create_resp = client.post("/api/v1/hr/employees", json={
        "first_name": "Att",
        "last_name": "Test",
    }, headers=auth_headers)
    emp_id = create_resp.get_json()["data"]["id"]

    resp = client.post("/api/v1/hr/attendance", json={
        "employee_id": emp_id,
        "date": str(date.today()),
        "status": "present",
        "hours_worked": "8.0",
    }, headers=auth_headers)
    assert resp.status_code == 201


def test_create_leave_request(client, auth_headers):
    create_resp = client.post("/api/v1/hr/employees", json={
        "first_name": "Leave",
        "last_name": "Test",
    }, headers=auth_headers)
    emp_id = create_resp.get_json()["data"]["id"]

    from datetime import timedelta
    resp = client.post("/api/v1/hr/leaves", json={
        "employee_id": emp_id,
        "leave_type": "annual",
        "start_date": str(date.today() + timedelta(days=5)),
        "end_date": str(date.today() + timedelta(days=10)),
        "reason": "Vacation",
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.get_json()["data"]["status"] == "pending"


def test_approve_leave(client, auth_headers):
    create_resp = client.post("/api/v1/hr/employees", json={
        "first_name": "Approve",
        "last_name": "Leave",
    }, headers=auth_headers)
    emp_id = create_resp.get_json()["data"]["id"]

    from datetime import timedelta
    leave_resp = client.post("/api/v1/hr/leaves", json={
        "employee_id": emp_id,
        "leave_type": "sick",
        "start_date": str(date.today() + timedelta(days=2)),
        "end_date": str(date.today() + timedelta(days=4)),
    }, headers=auth_headers)
    leave_id = leave_resp.get_json()["data"]["id"]

    resp = client.put(f"/api/v1/hr/leaves/{leave_id}/approve", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["status"] == "approved"


def test_list_employees_requires_auth(client):
    resp = client.get("/api/v1/hr/employees")
    assert resp.status_code == 401
