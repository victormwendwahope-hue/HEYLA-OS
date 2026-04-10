def test_create_lead(client, auth_headers):
    resp = client.post("/api/v1/crm/leads", json={
        "first_name": "Prospect",
        "last_name": "One",
        "email": "prospect@company.com",
        "company": "Prospect Co",
        "source": "website",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert data["first_name"] == "Prospect"
    assert data["status"] == "new"
    return data["id"]


def test_list_leads(client, auth_headers):
    resp = client.get("/api/v1/crm/leads", headers=auth_headers)
    assert resp.status_code == 200


def test_update_lead_status(client, auth_headers):
    create_resp = client.post("/api/v1/crm/leads", json={
        "first_name": "Update",
        "last_name": "Lead",
    }, headers=auth_headers)
    lead_id = create_resp.get_json()["data"]["id"]

    resp = client.put(f"/api/v1/crm/leads/{lead_id}", json={
        "status": "contacted",
        "score": 60,
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["status"] == "contacted"


def test_create_deal(client, auth_headers):
    resp = client.post("/api/v1/crm/deals", json={
        "title": "Big Enterprise Deal",
        "value": "50000",
        "stage": "prospecting",
        "probability": 30,
    }, headers=auth_headers)
    assert resp.status_code == 201


def test_pipeline(client, auth_headers):
    resp = client.get("/api/v1/crm/pipeline", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "prospecting" in data
    assert "closed_won" in data


def test_create_activity(client, auth_headers):
    lead_resp = client.post("/api/v1/crm/leads", json={"first_name": "Act"}, headers=auth_headers)
    lead_id = lead_resp.get_json()["data"]["id"]

    resp = client.post("/api/v1/crm/activities", json={
        "lead_id": lead_id,
        "activity_type": "call",
        "subject": "Initial outreach call",
    }, headers=auth_headers)
    assert resp.status_code == 201


def test_leads_require_auth(client):
    resp = client.get("/api/v1/crm/leads")
    assert resp.status_code == 401
