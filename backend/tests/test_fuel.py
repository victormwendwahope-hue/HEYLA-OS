from datetime import date, timedelta


def _setup_vehicle_driver(client, headers, suffix="F01"):
    v = client.post("/api/v1/transport/vehicles", json={
        "registration_number": f"FUEL-{suffix}",
        "make": "Toyota",
        "model": "Prado",
        "fuel_type": "diesel",
        "status": "active",
        "mileage": 10000,
    }, headers=headers)
    d = client.post("/api/v1/transport/drivers", json={
        "first_name": "Fuel",
        "last_name": f"Driver{suffix}",
        "license_number": f"FL-{suffix}",
    }, headers=headers)
    return v.get_json()["data"]["id"], d.get_json()["data"]["id"]


def test_create_fuel_log(client, auth_headers):
    vid, did = _setup_vehicle_driver(client, auth_headers, "F01")
    resp = client.post("/api/v1/fuel/logs", json={
        "vehicle_id": vid,
        "driver_id": did,
        "date": str(date.today()),
        "liters": "45.5",
        "cost_per_liter": "1.35",
        "fuel_type": "diesel",
        "station": "Shell Station",
        "odometer": 10500,
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert float(data["liters"]) == 45.5
    # Auto-computed total_cost
    assert data["total_cost"] is not None


def test_list_fuel_logs(client, auth_headers):
    resp = client.get("/api/v1/fuel/logs", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["data"], list)


def test_fuel_analytics(client, auth_headers):
    resp = client.get("/api/v1/fuel/analytics", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "total_liters" in data
    assert "total_cost" in data
    assert "by_vehicle" in data
    assert isinstance(data["by_vehicle"], list)


def test_fuel_log_filter_by_vehicle(client, auth_headers):
    vid, did = _setup_vehicle_driver(client, auth_headers, "F02")
    client.post("/api/v1/fuel/logs", json={
        "vehicle_id": vid,
        "date": str(date.today()),
        "liters": "30.0",
    }, headers=auth_headers)

    resp = client.get(f"/api/v1/fuel/logs?vehicle_id={vid}", headers=auth_headers)
    assert resp.status_code == 200
    for log in resp.get_json()["data"]:
        assert log["vehicle_id"] == vid


def test_delete_fuel_log(client, auth_headers):
    vid, _ = _setup_vehicle_driver(client, auth_headers, "F03")
    create = client.post("/api/v1/fuel/logs", json={
        "vehicle_id": vid,
        "date": str(date.today()),
        "liters": "20.0",
    }, headers=auth_headers)
    log_id = create.get_json()["data"]["id"]
    resp = client.delete(f"/api/v1/fuel/logs/{log_id}", headers=auth_headers)
    assert resp.status_code == 200


def test_fuel_requires_auth(client):
    resp = client.get("/api/v1/fuel/logs")
    assert resp.status_code == 401
