from datetime import date, timedelta


def _create_job(client, headers, title="Software Engineer"):
    resp = client.post("/api/v1/marketplace/jobs", json={
        "title": title,
        "description": "We are looking for an experienced engineer.",
        "requirements": "3+ years experience",
        "job_type": "full_time",
        "location": "Remote",
        "is_remote": True,
        "salary_min": "80000",
        "salary_max": "120000",
        "department": "Engineering",
        "status": "open",
        "deadline": str(date.today() + timedelta(days=30)),
        "skills": ["Python", "React"],
    }, headers=headers)
    assert resp.status_code == 201
    return resp.get_json()["data"]["id"]


def test_create_job(client, auth_headers):
    jid = _create_job(client, auth_headers)
    assert jid is not None


def test_list_jobs(client, auth_headers):
    resp = client.get("/api/v1/marketplace/jobs", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["data"], list)


def test_get_job(client, auth_headers):
    jid = _create_job(client, auth_headers, "Get Me Job")
    resp = client.get(f"/api/v1/marketplace/jobs/{jid}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["id"] == jid


def test_update_job(client, auth_headers):
    jid = _create_job(client, auth_headers, "Update Me Job")
    resp = client.put(f"/api/v1/marketplace/jobs/{jid}", json={
        "title": "Updated Senior Engineer",
        "salary_max": "150000",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["title"] == "Updated Senior Engineer"


def test_apply_to_job(client, auth_headers):
    jid = _create_job(client, auth_headers, "Apply Job")
    resp = client.post(f"/api/v1/marketplace/jobs/{jid}/apply", json={
        "applicant_name": "Jane Doe",
        "applicant_email": "jane@example.com",
        "applicant_phone": "+1-555-1234",
        "cover_letter": "I am very interested in this role.",
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.get_json()["data"]["status"] == "submitted"
    return resp.get_json()["data"]["id"]


def test_list_applications(client, auth_headers):
    jid = _create_job(client, auth_headers, "List Apps Job")
    client.post(f"/api/v1/marketplace/jobs/{jid}/apply", json={
        "applicant_name": "Bob Smith",
        "applicant_email": "bob@example.com",
    }, headers=auth_headers)

    resp = client.get(f"/api/v1/marketplace/jobs/{jid}/applications", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.get_json()["data"]) >= 1


def test_update_application_status(client, auth_headers):
    jid = _create_job(client, auth_headers, "Status Job")
    app_resp = client.post(f"/api/v1/marketplace/jobs/{jid}/apply", json={
        "applicant_name": "Status Test",
        "applicant_email": "status@example.com",
    }, headers=auth_headers)
    app_id = app_resp.get_json()["data"]["id"]

    resp = client.put(f"/api/v1/marketplace/applications/{app_id}/status", json={
        "status": "shortlisted",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["status"] == "shortlisted"


def test_close_job(client, auth_headers):
    jid = _create_job(client, auth_headers, "Close Me")
    resp = client.put(f"/api/v1/marketplace/jobs/{jid}/close", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["status"] == "closed"


def test_apply_to_closed_job_fails(client, auth_headers):
    jid = _create_job(client, auth_headers, "Closed Job")
    client.put(f"/api/v1/marketplace/jobs/{jid}/close", headers=auth_headers)

    resp = client.post(f"/api/v1/marketplace/jobs/{jid}/apply", json={
        "applicant_name": "Late Apply",
        "applicant_email": "late@example.com",
    }, headers=auth_headers)
    assert resp.status_code == 400


def test_marketplace_requires_auth(client):
    resp = client.get("/api/v1/marketplace/jobs")
    assert resp.status_code == 401
