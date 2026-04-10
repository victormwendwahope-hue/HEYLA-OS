from datetime import date, timedelta


def _make_vehicle(client, headers, reg="KAA-TEST-01"):
    resp = client.post("/api/v1/transport/vehicles", json={
        "registration_number": reg,
        "make": "Toyota",
        "model": "Hilux",
        "year": 2021,
        "type": "truck",
        "fuel_type": "diesel",
        "status": "active",
        "mileage": 25000,
        "insurance_expiry": str(date.today() + timedelta(days=180)),
    }, headers=headers)
    assert resp.status_code == 201
    return resp.get_json()["data"]["id"]


def _make_driver(client, headers, lic="DL-TEST-001"):
    resp = client.post("/api/v1/transport/drivers", json={
        "first_name": "Test",
        "last_name": "Driver",
        "license_number": lic,
        "license_expiry": str(date.today() + timedelta(days=365)),
        "license_class": "B",
        "status": "available",
    }, headers=headers)
    assert resp.status_code == 201
    return resp.get_json()["data"]["id"]


def test_create_vehicle(client, auth_headers):
    vid = _make_vehicle(client, auth_headers, "KAA-V-001")
    assert vid is not None


def test_list_vehicles(client, auth_headers):
    resp = client.get("/api/v1/transport/vehicles", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["data"], list)


def test_update_vehicle(client, auth_headers):
    vid = _make_vehicle(client, auth_headers, "KBB-V-001")
    resp = client.put(f"/api/v1/transport/vehicles/{vid}", json={
        "status": "maintenance",
        "mileage": 30000,
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["status"] == "maintenance"


def test_create_driver(client, auth_headers):
    did = _make_driver(client, auth_headers, "DL-D-001")
    assert did is not None


def test_list_drivers(client, auth_headers):
    resp = client.get("/api/v1/transport/drivers", headers=auth_headers)
    assert resp.status_code == 200


def test_create_trip(client, auth_headers):
    vid = _make_vehicle(client, auth_headers, "KCC-T-001")
    did = _make_driver(client, auth_headers, "DL-T-001")

    resp = client.post("/api/v1/transport/trips", json={
        "vehicle_id": vid,
        "driver_id": did,
        "origin": "Nairobi",
        "destination": "Mombasa",
        "distance_km": "480",
        "status": "scheduled",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert data["origin"] == "Nairobi"
    return data["id"]


def test_update_trip_to_completed(client, auth_headers):
    vid = _make_vehicle(client, auth_headers, "KDD-C-001")
    did = _make_driver(client, auth_headers, "DL-C-001")

    trip_resp = client.post("/api/v1/transport/trips", json={
        "vehicle_id": vid,
        "driver_id": did,
        "origin": "Kisumu",
        "destination": "Eldoret",
        "status": "in_progress",
    }, headers=auth_headers)
    tid = trip_resp.get_json()["data"]["id"]

    resp = client.put(f"/api/v1/transport/trips/{tid}", json={
        "status": "completed",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["status"] == "completed"


def test_transport_requires_auth(client):
    resp = client.get("/api/v1/transport/vehicles")
    assert resp.status_code == 401
