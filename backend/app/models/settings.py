from app.extensions import db
from datetime import datetime


class OrganizationProfile(db.Model):
    __tablename__ = "organization_profiles"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False, unique=True)
    tagline = db.Column(db.String(300))
    description = db.Column(db.Text)
    founded_year = db.Column(db.Integer)
    employee_count = db.Column(db.Integer)
    registration_number = db.Column(db.String(100))
    tax_number = db.Column(db.String(100))
    fiscal_year_start = db.Column(db.Integer, default=1)  # month number
    default_currency = db.Column(db.String(10), default="USD")
    timezone = db.Column(db.String(100), default="UTC")
    date_format = db.Column(db.String(30), default="YYYY-MM-DD")
    social_links = db.Column(db.JSON, default=dict)
    branding = db.Column(db.JSON, default=dict)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = db.relationship("Organization", back_populates="profile")


class UserSettings(db.Model):
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    theme = db.Column(db.String(20), default="light")
    language = db.Column(db.String(10), default="en")
    timezone = db.Column(db.String(100), default="UTC")
    notifications_email = db.Column(db.Boolean, default=True)
    notifications_push = db.Column(db.Boolean, default=True)
    dashboard_layout = db.Column(db.JSON, default=dict)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", back_populates="settings")
