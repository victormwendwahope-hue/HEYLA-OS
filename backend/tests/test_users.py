def test_list_users(client, auth_headers):
    resp = client.get("/api/v1/users/", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) >= 1


def test_get_user(client, auth_headers, admin_user):
    resp = client.get(f"/api/v1/users/{admin_user.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["id"] == admin_user.id


def test_get_nonexistent_user(client, auth_headers):
    resp = client.get("/api/v1/users/99999", headers=auth_headers)
    assert resp.status_code == 404


def test_update_own_user(client, auth_headers, admin_user):
    resp = client.put(f"/api/v1/users/{admin_user.id}", json={
        "first_name": "Alex",
        "last_name": "Updated",
        "phone": "+1-555-9999",
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["first_name"] == "Alex"
    assert data["phone"] == "+1-555-9999"


def test_invite_user(client, auth_headers):
    resp = client.post("/api/v1/auth/invite", json={
        "email": "newstaff@test.com",
        "first_name": "New",
        "last_name": "Staff",
        "role": "employee",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert data["user"]["email"] == "newstaff@test.com"
    assert "temp_password" in data


def test_update_user_roles(client, auth_headers, admin_user):
    resp = client.put(f"/api/v1/users/{admin_user.id}/roles", json={
        "roles": ["admin", "manager"],
    }, headers=auth_headers)
    assert resp.status_code == 200


def test_users_require_auth(client):
    resp = client.get("/api/v1/users/")
    assert resp.status_code == 401
