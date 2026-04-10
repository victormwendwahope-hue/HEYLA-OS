import pytest
from app import create_app
from app.extensions import db as _db
from app.models.country import Country
from app.models.organization import Organization
from app.models.user import User, Role, UserRole
from app.extensions import bcrypt


@pytest.fixture(scope="session")
def app():
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        _seed_roles()
        yield app
        _db.drop_all()


def _seed_roles():
    for name in ("admin", "manager", "employee"):
        if not Role.query.filter_by(name=name).first():
            _db.session.add(Role(name=name, description=name.capitalize()))
    _db.session.commit()


@pytest.fixture(scope="function")
def db(app):
    with app.app_context():
        yield _db
        _db.session.rollback()


@pytest.fixture(scope="function")
def client(app):
    return app.test_client()


@pytest.fixture(scope="function")
def org(db):
    organization = Organization(name="Test Org", slug="test-org")
    db.session.add(organization)
    db.session.flush()
    return organization


@pytest.fixture(scope="function")
def admin_user(db, org):
    pw = bcrypt.generate_password_hash("TestPass123!").decode("utf-8")
    user = User(
        organization_id=org.id,
        email="admin@test.com",
        password_hash=pw,
        first_name="Test",
        last_name="Admin",
        is_active=True,
        is_owner=True,
    )
    db.session.add(user)
    db.session.flush()
    role = Role.query.filter_by(name="admin").first()
    db.session.add(UserRole(user_id=user.id, role_id=role.id))
    db.session.commit()
    return user


@pytest.fixture(scope="function")
def auth_headers(client, admin_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com",
        "password": "TestPass123!",
    })
    data = resp.get_json()
    token = data["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
