from flask import jsonify
from app.extensions import jwt

# In-memory blocklist (replace with Redis in production)
_blocklist = set()


def add_token_to_blocklist(jti: str):
    _blocklist.add(jti)


def register_jwt_callbacks(app):
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token has expired", "error": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"success": False, "message": "Token verification failed", "error": "invalid_token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"success": False, "message": "Authorization token required", "error": "authorization_required"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token has been revoked", "error": "token_revoked"}), 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Fresh token required", "error": "fresh_token_required"}), 401

    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        return jwt_payload["jti"] in _blocklist
