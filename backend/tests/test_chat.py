def test_chat_hello(client, auth_headers):
    resp = client.post("/api/v1/chat/", json={
        "message": "Hello",
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "message" in data
    assert "bot" in data
    assert len(data["message"]) > 0


def test_chat_hr_context(client, auth_headers):
    resp = client.post("/api/v1/chat/", json={
        "message": "Show me employee attendance",
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "HR" in data["message"] or "attendance" in data["message"].lower()


def test_chat_accounting_context(client, auth_headers):
    resp = client.post("/api/v1/chat/", json={
        "message": "What are my outstanding invoices?",
    }, headers=auth_headers)
    assert resp.status_code == 200


def test_chat_with_history(client, auth_headers):
    resp = client.post("/api/v1/chat/", json={
        "message": "Hello again",
        "history": [
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello! How can I help?"},
        ],
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert len(data["history"]) == 4  # 2 old + 2 new


def test_chat_empty_message(client, auth_headers):
    resp = client.post("/api/v1/chat/", json={
        "message": "",
    }, headers=auth_headers)
    assert resp.status_code == 400


def test_chat_missing_message(client, auth_headers):
    resp = client.post("/api/v1/chat/", json={}, headers=auth_headers)
    assert resp.status_code == 400


def test_chat_history_endpoint(client, auth_headers):
    resp = client.get("/api/v1/chat/history", headers=auth_headers)
    assert resp.status_code == 200


def test_chat_requires_auth(client):
    resp = client.post("/api/v1/chat/", json={"message": "Hello"})
    assert resp.status_code == 401
