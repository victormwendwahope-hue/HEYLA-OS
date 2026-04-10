from flask import jsonify, request
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.extensions import db


def success_response(data=None, message="Success", status_code=200, meta=None):
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    if meta is not None:
        response["meta"] = meta
    return jsonify(response), status_code


def error_response(message="Error", status_code=400, errors=None):
    response = {"success": False, "message": message}
    if errors:
        response["errors"] = errors
    return jsonify(response), status_code


def paginate_query(query, schema, page=1, per_page=20):
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        "items": schema.dump(pagination.items),
        "meta": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev,
        },
    }


def get_pagination_params():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    return page, per_page


def get_current_user():
    from app.models.user import User
    user_id = get_jwt_identity()
    return User.query.get(user_id)


def require_roles(*role_names):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()
            if not user:
                return error_response("User not found", 404)
            if not any(user.has_role(r) for r in role_names):
                return error_response("Insufficient permissions", 403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator
