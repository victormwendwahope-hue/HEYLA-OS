from datetime import date, timedelta


def test_create_product(client, auth_headers):
    resp = client.post("/api/v1/inventory/products", json={
        "name": "Test Widget",
        "sku": "TW-001",
        "category": "Electronics",
        "unit_price": "99.99",
        "cost_price": "55.00",
        "quantity": 100,
        "reorder_level": 10,
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert data["name"] == "Test Widget"
    assert data["sku"] == "TW-001"
    return data["id"]


def test_list_products(client, auth_headers):
    resp = client.get("/api/v1/inventory/products", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["data"], list)


def test_get_product(client, auth_headers):
    create = client.post("/api/v1/inventory/products", json={
        "name": "Get Product",
        "quantity": 10,
    }, headers=auth_headers)
    pid = create.get_json()["data"]["id"]
    resp = client.get(f"/api/v1/inventory/products/{pid}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["id"] == pid


def test_update_product(client, auth_headers):
    create = client.post("/api/v1/inventory/products", json={
        "name": "Update Me",
        "quantity": 50,
    }, headers=auth_headers)
    pid = create.get_json()["data"]["id"]
    resp = client.put(f"/api/v1/inventory/products/{pid}", json={
        "quantity": 75,
        "category": "Updated",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["quantity"] == 75


def test_delete_product(client, auth_headers):
    create = client.post("/api/v1/inventory/products", json={
        "name": "Delete Me",
    }, headers=auth_headers)
    pid = create.get_json()["data"]["id"]
    resp = client.delete(f"/api/v1/inventory/products/{pid}", headers=auth_headers)
    assert resp.status_code == 200
    gone = client.get(f"/api/v1/inventory/products/{pid}", headers=auth_headers)
    assert gone.status_code == 404


def test_create_equipment(client, auth_headers):
    resp = client.post("/api/v1/inventory/equipment", json={
        "name": "Test Printer",
        "serial_number": "SN-0001",
        "category": "Office",
        "brand": "HP",
        "model": "LaserJet",
        "purchase_price": "1200.00",
        "condition": "excellent",
        "status": "available",
    }, headers=auth_headers)
    assert resp.status_code == 201
    return resp.get_json()["data"]["id"]


def test_create_maintenance_log(client, auth_headers):
    eq_resp = client.post("/api/v1/inventory/equipment", json={
        "name": "Maintain Me",
    }, headers=auth_headers)
    eq_id = eq_resp.get_json()["data"]["id"]

    resp = client.post("/api/v1/inventory/maintenance", json={
        "equipment_id": eq_id,
        "maintenance_date": str(date.today()),
        "maintenance_type": "routine",
        "description": "Regular service",
        "cost": "200.00",
        "performed_by": "Tech Team",
        "next_maintenance_date": str(date.today() + timedelta(days=90)),
    }, headers=auth_headers)
    assert resp.status_code == 201


def test_inventory_requires_auth(client):
    resp = client.get("/api/v1/inventory/products")
    assert resp.status_code == 401
