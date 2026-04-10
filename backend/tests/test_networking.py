def test_create_post(client, auth_headers):
    resp = client.post("/api/v1/networking/posts", json={
        "content": "Hello team! This is a test post.",
        "visibility": "organization",
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert data["content"] == "Hello team! This is a test post."
    assert data["likes_count"] == 0
    return data["id"]


def test_get_feed(client, auth_headers):
    # Create a post first
    client.post("/api/v1/networking/posts", json={
        "content": "Feed post content",
    }, headers=auth_headers)
    resp = client.get("/api/v1/networking/feed", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["data"], list)


def test_update_post(client, auth_headers):
    create = client.post("/api/v1/networking/posts", json={
        "content": "Original content",
    }, headers=auth_headers)
    pid = create.get_json()["data"]["id"]

    resp = client.put(f"/api/v1/networking/posts/{pid}", json={
        "content": "Updated content",
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["content"] == "Updated content"


def test_like_post(client, auth_headers):
    create = client.post("/api/v1/networking/posts", json={
        "content": "Like me!",
    }, headers=auth_headers)
    pid = create.get_json()["data"]["id"]

    resp = client.post(f"/api/v1/networking/posts/{pid}/like", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["data"]["likes_count"] == 1


def test_add_comment(client, auth_headers):
    create = client.post("/api/v1/networking/posts", json={
        "content": "Comment on me",
    }, headers=auth_headers)
    pid = create.get_json()["data"]["id"]

    resp = client.post(f"/api/v1/networking/posts/{pid}/comments", json={
        "content": "Great post!",
        "post_id": pid,
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.get_json()["data"]["content"] == "Great post!"


def test_list_comments(client, auth_headers):
    create = client.post("/api/v1/networking/posts", json={
        "content": "Has comments",
    }, headers=auth_headers)
    pid = create.get_json()["data"]["id"]
    client.post(f"/api/v1/networking/posts/{pid}/comments", json={
        "content": "Comment 1", "post_id": pid,
    }, headers=auth_headers)

    resp = client.get(f"/api/v1/networking/posts/{pid}/comments", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.get_json()["data"]) >= 1


def test_send_message(client, auth_headers, admin_user):
    resp = client.post("/api/v1/networking/messages", json={
        "recipient_id": admin_user.id,
        "content": "Hello there!",
    }, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.get_json()["data"]["content"] == "Hello there!"


def test_list_messages(client, auth_headers):
    resp = client.get("/api/v1/networking/messages", headers=auth_headers)
    assert resp.status_code == 200


def test_delete_post(client, auth_headers):
    create = client.post("/api/v1/networking/posts", json={
        "content": "Delete me",
    }, headers=auth_headers)
    pid = create.get_json()["data"]["id"]
    resp = client.delete(f"/api/v1/networking/posts/{pid}", headers=auth_headers)
    assert resp.status_code == 200


def test_networking_requires_auth(client):
    resp = client.get("/api/v1/networking/feed")
    assert resp.status_code == 401
