from app.extensions import db
from datetime import datetime


class Organization(db.Model):
    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    industry = db.Column(db.String(100))
    email = db.Column(db.String(150))
    phone = db.Column(db.String(30))
    address = db.Column(db.Text)
    logo_url = db.Column(db.String(500))
    website = db.Column(db.String(300))
    country_id = db.Column(db.Integer, db.ForeignKey("countries.id"), nullable=True)
    plan = db.Column(db.String(50), default="free")  # free, pro, enterprise
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    country = db.relationship("Country", back_populates="organizations")
    users = db.relationship("User", back_populates="organization", cascade="all, delete-orphan")
    profile = db.relationship("OrganizationProfile", back_populates="organization", uselist=False)

    def __repr__(self):
        return f"<Organization {self.name}>"
