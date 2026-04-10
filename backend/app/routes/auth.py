from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from marshmallow import ValidationError
from app.extensions import db, bcrypt
from app.models.user import User, Role, UserRole
from app.models.organization import Organization
from app.schemas.auth_schema import RegisterSchema, LoginSchema, ChangePasswordSchema, UserOutputSchema, InviteUserSchema
from app.utils.helpers import success_response, error_response, get_current_user
from app.utils.jwt_callbacks import add_token_to_blocklist
import re
from datetime import datetime

auth_bp = Blueprint("auth", __name__)
register_schema = RegisterSchema()
login_schema = LoginSchema()
change_pw_schema = ChangePasswordSchema()
user_out_schema = UserOutputSchema()
invite_schema = InviteUserSchema()


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text


def ensure_unique_slug(base_slug):
    slug = base_slug
    counter = 1
    while Organization.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def get_or_create_role(name):
    role = Role.query.filter_by(name=name).first()
    if not role:
        role = Role(name=name, description=name.capitalize())
        db.session.add(role)
        db.session.flush()
    return role


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = register_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    # Check if email already used within any org (global email uniqueness)
    existing = User.query.filter_by(email=data["email"]).first()
    if existing:
        return error_response("Email already registered", 409)

    # Create organization
    slug = ensure_unique_slug(slugify(data["organization_name"]))
    org = Organization(
        name=data["organization_name"],
        slug=slug,
        country_id=data.get("country_id"),
    )
    db.session.add(org)
    db.session.flush()

    # Create user
    pw_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(
        organization_id=org.id,
        email=data["email"],
        password_hash=pw_hash,
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone=data.get("phone"),
        is_owner=True,
    )
    db.session.add(user)
    db.session.flush()

    # Assign admin role
    admin_role = get_or_create_role("admin")
    db.session.add(UserRole(user_id=user.id, role_id=admin_role.id))
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return success_response({
        "user": user_out_schema.dump(user),
        "organization": {"id": org.id, "name": org.name, "slug": org.slug},
        "access_token": access_token,
        "refresh_token": refresh_token,
    }, "Registration successful", 201)


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = login_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, data["password"]):
        return error_response("Invalid email or password", 401)
    if not user.is_active:
        return error_response("Account is deactivated", 403)

    user.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return success_response({
        "user": user_out_schema.dump(user),
        "organization": {"id": user.organization.id, "name": user.organization.name, "slug": user.organization.slug},
        "access_token": access_token,
        "refresh_token": refresh_token,
    }, "Login successful")


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return success_response({"access_token": access_token}, "Token refreshed")


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = get_current_user()
    if not user:
        return error_response("User not found", 404)
    return success_response({"user": user_out_schema.dump(user)})


@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    try:
        data = change_pw_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    user = get_current_user()
    if not bcrypt.check_password_hash(user.password_hash, data["current_password"]):
        return error_response("Current password is incorrect", 400)

    user.password_hash = bcrypt.generate_password_hash(data["new_password"]).decode("utf-8")
    db.session.commit()
    return success_response(message="Password changed successfully")


@auth_bp.route("/invite", methods=["POST"])
@jwt_required()
def invite_user():
    try:
        data = invite_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    current_user = get_current_user()
    if not current_user.has_role("admin"):
        return error_response("Only admins can invite users", 403)

    existing = User.query.filter_by(
        organization_id=current_user.organization_id,
        email=data["email"]
    ).first()
    if existing:
        return error_response("User with this email already exists in your organization", 409)

    temp_password = "TempPass123!"
    pw_hash = bcrypt.generate_password_hash(temp_password).decode("utf-8")
    user = User(
        organization_id=current_user.organization_id,
        email=data["email"],
        password_hash=pw_hash,
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone=data.get("phone"),
    )
    db.session.add(user)
    db.session.flush()

    role = get_or_create_role(data["role"])
    db.session.add(UserRole(user_id=user.id, role_id=role.id))
    db.session.commit()

    return success_response({
        "user": user_out_schema.dump(user),
        "temp_password": temp_password,
    }, "User invited successfully", 201)


@auth_bp.route("/logout", methods=["DELETE"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    add_token_to_blocklist(jti)
    return success_response(message="Successfully logged out")


@auth_bp.route("/logout/refresh", methods=["DELETE"])
@jwt_required(refresh=True)
def logout_refresh():
    jti = get_jwt()["jti"]
    add_token_to_blocklist(jti)
    return success_response(message="Refresh token revoked")
