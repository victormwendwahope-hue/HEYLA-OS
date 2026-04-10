from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.utils.helpers import error_response


def tenant_required(fn):
    """Decorator that injects org_id from JWT and enforces tenancy."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        from app.models.user import User
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return error_response("Unauthorized", 401)
        if not user.organization_id:
            return error_response("No organization linked to this account", 403)
        kwargs["org_id"] = user.organization_id
        kwargs["current_user"] = user
        return fn(*args, **kwargs)
    return wrapper
