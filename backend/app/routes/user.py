from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app.extensions import db, bcrypt
from app.models.user import User, Role, UserRole
from app.schemas.auth_schema import UserOutputSchema
from app.utils.helpers import success_response, error_response, get_current_user, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

users_bp = Blueprint("users", __name__)
user_schema = UserOutputSchema()
users_schema = UserOutputSchema(many=True)


@users_bp.route("/", methods=["GET"])
@tenant_required
def list_users(org_id, current_user):
    page, per_page = get_pagination_params()
    query = User.query.filter_by(organization_id=org_id)
    result = paginate_query(query, users_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@users_bp.route("/<int:user_id>", methods=["GET"])
@tenant_required
def get_user(user_id, org_id, current_user):
    user = User.query.filter_by(id=user_id, organization_id=org_id).first_or_404()
    return success_response(user_schema.dump(user))


@users_bp.route("/<int:user_id>", methods=["PUT"])
@tenant_required
def update_user(user_id, org_id, current_user):
    user = User.query.filter_by(id=user_id, organization_id=org_id).first_or_404()
    if current_user.id != user_id and not current_user.has_role("admin"):
        return error_response("Insufficient permissions", 403)

    data = request.json or {}
    allowed = ["first_name", "last_name", "phone", "avatar_url"]
    for field in allowed:
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return success_response(user_schema.dump(user), "User updated")


@users_bp.route("/<int:user_id>/deactivate", methods=["PUT"])
@tenant_required
def deactivate_user(user_id, org_id, current_user):
    if not current_user.has_role("admin"):
        return error_response("Insufficient permissions", 403)
    user = User.query.filter_by(id=user_id, organization_id=org_id).first_or_404()
    user.is_active = False
    db.session.commit()
    return success_response(message="User deactivated")


@users_bp.route("/<int:user_id>/roles", methods=["PUT"])
@tenant_required
def update_user_roles(user_id, org_id, current_user):
    if not current_user.has_role("admin"):
        return error_response("Insufficient permissions", 403)
    user = User.query.filter_by(id=user_id, organization_id=org_id).first_or_404()
    roles = request.json.get("roles", [])

    UserRole.query.filter_by(user_id=user_id).delete()
    for role_name in roles:
        role = Role.query.filter_by(name=role_name).first()
        if role:
            db.session.add(UserRole(user_id=user_id, role_id=role.id))
    db.session.commit()
    return success_response(user_schema.dump(user), "Roles updated")
