import pytest


def test_register(client, db):
    resp = client.post("/api/v1/auth/register", json={
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@neworg.com",
        "password": "Password123!",
        "organization_name": "New Org",
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "john@neworg.com"


def test_register_duplicate_email(client, db):
    payload = {
        "first_name": "Dup",
        "last_name": "User",
        "email": "dup@duporg.com",
        "password": "Password123!",
        "organization_name": "Dup Org",
    }
    client.post("/api/v1/auth/register", json=payload)
    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


def test_register_missing_fields(client, db):
    resp = client.post("/api/v1/auth/register", json={"email": "x@x.com"})
    assert resp.status_code == 422


def test_login_success(client, admin_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "TestPass123!",
    })
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]


def test_login_wrong_password(client, admin_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "WrongPassword!",
    })
    assert resp.status_code == 401


def test_login_wrong_email(client, db):
    resp = client.post("/api/v1/auth/login", json={
        "email": "nobody@test.com",
        "password": "SomePass123!",
    })
    assert resp.status_code == 401


def test_me_authenticated(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["data"]["user"]["email"] == "admin@test.com"


def test_me_unauthenticated(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_refresh_token(client, admin_user):
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "TestPass123!",
    })
    refresh_token = login_resp.get_json()["data"]["refresh_token"]
    resp = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.get_json()["data"]


def test_change_password(client, auth_headers, admin_user):
    resp = client.put("/api/v1/auth/change-password", json={
        "current_password": "TestPass123!",
        "new_password": "NewPassword456!",
    }, headers=auth_headers)
    assert resp.status_code == 200


def test_health_endpoint(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"
