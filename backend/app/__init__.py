from flask import Flask
from app.config import config
from app.extensions import db, migrate, jwt, cors, bcrypt


def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.hr import hr_bp
    from app.routes.crm import crm_bp
    from app.routes.accounting import accounting_bp
    from app.routes.inventory import inventory_bp
    from app.routes.transport import transport_bp
    from app.routes.fuel import fuel_bp
    from app.routes.networking import networking_bp
    from app.routes.marketplace import marketplace_bp
    from app.routes.settings import settings_bp
    from app.routes.chat import chat_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(users_bp, url_prefix="/api/v1/users")
    app.register_blueprint(hr_bp, url_prefix="/api/v1/hr")
    app.register_blueprint(crm_bp, url_prefix="/api/v1/crm")
    app.register_blueprint(accounting_bp, url_prefix="/api/v1/accounting")
    app.register_blueprint(inventory_bp, url_prefix="/api/v1/inventory")
    app.register_blueprint(transport_bp, url_prefix="/api/v1/transport")
    app.register_blueprint(fuel_bp, url_prefix="/api/v1/fuel")
    app.register_blueprint(networking_bp, url_prefix="/api/v1/networking")
    app.register_blueprint(marketplace_bp, url_prefix="/api/v1/marketplace")
    app.register_blueprint(settings_bp, url_prefix="/api/v1/settings")
    app.register_blueprint(chat_bp, url_prefix="/api/v1/chat")
    app.register_blueprint(dashboard_bp, url_prefix="/api/v1/dashboard")

    # Import all models so Alembic sees them
    from app.models import (
        user, organization, country,
        hr, crm, accounting, inventory,
        transport, fuel, networking, marketplace
    )

    @app.route("/api/v1/health")
    def health():
        return {"status": "ok", "version": "1.0.0"}

    return app
