from flask import jsonify


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"success": False, "message": "Bad request", "error": str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"success": False, "message": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(409)
    def conflict(e):
        return jsonify({"success": False, "message": "Conflict", "error": str(e)}), 409

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"success": False, "message": "Unprocessable entity", "error": str(e)}), 422

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({"success": False, "message": "Too many requests. Please slow down."}), 429

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    @app.errorhandler(503)
    def service_unavailable(e):
        return jsonify({"success": False, "message": "Service temporarily unavailable"}), 503
