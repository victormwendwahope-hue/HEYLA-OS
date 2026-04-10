def test_dashboard_summary(client, auth_headers):
    resp = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "hr" in data
    assert "crm" in data
    assert "accounting" in data
    assert "transport" in data
    assert "inventory" in data
    assert "marketplace" in data


def test_dashboard_hr(client, auth_headers):
    resp = client.get("/api/v1/dashboard/hr", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "employees_by_department" in data
    assert "leaves_by_status" in data


def test_dashboard_accounting(client, auth_headers):
    resp = client.get("/api/v1/dashboard/accounting", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "invoices_by_status" in data
    assert "monthly_revenue" in data


def test_dashboard_crm(client, auth_headers):
    resp = client.get("/api/v1/dashboard/crm", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "leads_by_status" in data
    assert "deals_by_stage" in data


def test_dashboard_requires_auth(client):
    resp = client.get("/api/v1/dashboard/summary")
    assert resp.status_code == 401
