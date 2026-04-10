from flask import Blueprint, request
from marshmallow import ValidationError
from app.extensions import db
from app.models.settings import OrganizationProfile, UserSettings
from app.models.organization import Organization
from app.models.country import Country
from app.schemas.settings_schema import OrganizationProfileSchema, UserSettingsSchema, OrganizationSchema
from app.utils.helpers import success_response, error_response
from app.middleware.tenant import tenant_required

settings_bp = Blueprint("settings", __name__)
org_profile_schema = OrganizationProfileSchema()
user_settings_schema = UserSettingsSchema()
org_schema = OrganizationSchema()


# ─── ORGANIZATION ─────────────────────────────────────────────────────────────

@settings_bp.route("/organization", methods=["GET"])
@tenant_required
def get_organization(org_id, current_user):
    org = Organization.query.get_or_404(org_id)
    return success_response(org_schema.dump(org))


@settings_bp.route("/organization", methods=["PUT"])
@tenant_required
def update_organization(org_id, current_user):
    if not current_user.has_role("admin"):
        return error_response("Insufficient permissions", 403)
    org = Organization.query.get_or_404(org_id)
    try:
        data = org_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    allowed = ["name", "industry", "email", "phone", "address", "logo_url", "website", "country_id"]
    for k in allowed:
        if k in data:
            setattr(org, k, data[k])
    db.session.commit()
    return success_response(org_schema.dump(org), "Organization updated")


# ─── ORGANIZATION PROFILE ─────────────────────────────────────────────────────

@settings_bp.route("/organization/profile", methods=["GET"])
@tenant_required
def get_org_profile(org_id, current_user):
    profile = OrganizationProfile.query.filter_by(organization_id=org_id).first()
    if not profile:
        profile = OrganizationProfile(organization_id=org_id)
        db.session.add(profile)
        db.session.commit()
    return success_response(org_profile_schema.dump(profile))


@settings_bp.route("/organization/profile", methods=["PUT"])
@tenant_required
def update_org_profile(org_id, current_user):
    if not current_user.has_role("admin"):
        return error_response("Insufficient permissions", 403)
    profile = OrganizationProfile.query.filter_by(organization_id=org_id).first()
    if not profile:
        profile = OrganizationProfile(organization_id=org_id)
        db.session.add(profile)

    try:
        data = org_profile_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    for k, v in data.items():
        if k not in ("organization_id",):
            setattr(profile, k, v)
    db.session.commit()
    return success_response(org_profile_schema.dump(profile), "Profile updated")


# ─── USER SETTINGS ────────────────────────────────────────────────────────────

@settings_bp.route("/user", methods=["GET"])
@tenant_required
def get_user_settings(org_id, current_user):
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.session.add(settings)
        db.session.commit()
    return success_response(user_settings_schema.dump(settings))


@settings_bp.route("/user", methods=["PUT"])
@tenant_required
def update_user_settings(org_id, current_user):
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.session.add(settings)

    try:
        data = user_settings_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    for k, v in data.items():
        if k not in ("user_id",):
            setattr(settings, k, v)
    db.session.commit()
    return success_response(user_settings_schema.dump(settings), "Settings updated")


# ─── COUNTRIES ────────────────────────────────────────────────────────────────

@settings_bp.route("/countries", methods=["GET"])
def list_countries():
    countries = Country.query.order_by(Country.name).all()
    return success_response([
        {
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "currency": c.currency,
            "currency_symbol": c.currency_symbol,
            "tax_rate": float(c.tax_rate or 0),
        }
        for c in countries
    ])
