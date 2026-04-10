from datetime import date, timedelta


def test_create_invoice(client, auth_headers):
    resp = client.post("/api/v1/accounting/invoices", json={
        "client_name": "Test Client",
        "client_email": "client@test.com",
        "issue_date": str(date.today()),
        "due_date": str(date.today() + timedelta(days=30)),
        "subtotal": "1000.00",
        "tax_rate": "10",
        "items": [{"description": "Service", "qty": 1, "unit_price": 1000}],
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert data["client_name"] == "Test Client"
    assert data["invoice_number"] is not None
    return data["id"]


def test_list_invoices(client, auth_headers):
    resp = client.get("/api/v1/accounting/invoices", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["data"], list)


def test_update_invoice_status(client, auth_headers):
    create_resp = client.post("/api/v1/accounting/invoices", json={
        "client_name": "Update Client",
        "issue_date": str(date.today()),
        "due_date": str(date.today() + timedelta(days=15)),
        "subtotal": "500",
    }, headers=auth_headers)
    inv_id = create_resp.get_json()["data"]["id"]

    resp = client.put(f"/api/v1/accounting/invoices/{inv_id}", json={
        "status": "sent",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["status"] == "sent"


def test_record_payment(client, auth_headers):
    resp = client.post("/api/v1/accounting/payments", json={
        "amount": "500.00",
        "payment_date": str(date.today()),
        "method": "bank_transfer",
        "reference": "REF-001",
    }, headers=auth_headers)
    assert resp.status_code == 201


def test_create_expense(client, auth_headers):
    resp = client.post("/api/v1/accounting/expenses", json={
        "category": "Travel",
        "description": "Flight to conference",
        "amount": "350.00",
        "expense_date": str(date.today()),
        "vendor": "Delta Airlines",
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.get_json()["data"]["status"] == "pending"


def test_financial_summary(client, auth_headers):
    resp = client.get("/api/v1/accounting/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "total_invoiced" in data
    assert "total_paid" in data
    assert "outstanding" in data


def test_invoices_require_auth(client):
    resp = client.get("/api/v1/accounting/invoices")
    assert resp.status_code == 401
