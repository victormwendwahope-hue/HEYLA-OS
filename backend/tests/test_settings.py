def test_get_organization(client, auth_headers):
    resp = client.get("/api/v1/settings/organization", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "name" in data
    assert "slug" in data


def test_update_organization(client, auth_headers):
    resp = client.put("/api/v1/settings/organization", json={
        "name": "Updated Org Name",
        "industry": "Fintech",
        "phone": "+1-800-HEYLA",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["industry"] == "Fintech"


def test_get_org_profile(client, auth_headers):
    resp = client.get("/api/v1/settings/organization/profile", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "default_currency" in data
    assert "timezone" in data


def test_update_org_profile(client, auth_headers):
    resp = client.put("/api/v1/settings/organization/profile", json={
        "tagline": "Powering the future",
        "default_currency": "EUR",
        "timezone": "Europe/Berlin",
        "fiscal_year_start": 4,
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["default_currency"] == "EUR"
    assert data["timezone"] == "Europe/Berlin"


def test_get_user_settings(client, auth_headers):
    resp = client.get("/api/v1/settings/user", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "theme" in data
    assert "language" in data
    assert "notifications_email" in data


def test_update_user_settings(client, auth_headers):
    resp = client.put("/api/v1/settings/user", json={
        "theme": "dark",
        "language": "fr",
        "notifications_email": False,
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["theme"] == "dark"
    assert data["language"] == "fr"
    assert data["notifications_email"] is False


def test_list_countries(client):
    resp = client.get("/api/v1/settings/countries")
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["data"], list)


def test_settings_require_auth(client):
    resp = client.get("/api/v1/settings/organization")
    assert resp.status_code == 401
