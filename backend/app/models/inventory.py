from app.extensions import db
from datetime import datetime


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    sku = db.Column(db.String(100))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    unit = db.Column(db.String(50))
    unit_price = db.Column(db.Numeric(12, 2), default=0)
    cost_price = db.Column(db.Numeric(12, 2), default=0)
    quantity = db.Column(db.Integer, default=0)
    reorder_level = db.Column(db.Integer, default=0)
    location = db.Column(db.String(200))
    image_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.Index("ix_products_org", "organization_id"),
    )


class Equipment(db.Model):
    __tablename__ = "equipment"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    serial_number = db.Column(db.String(100))
    category = db.Column(db.String(100))
    brand = db.Column(db.String(100))
    model = db.Column(db.String(100))
    purchase_date = db.Column(db.Date)
    purchase_price = db.Column(db.Numeric(12, 2))
    condition = db.Column(db.String(50), default="good")  # excellent, good, fair, poor
    status = db.Column(db.String(50), default="available")  # available, in_use, maintenance, retired
    assigned_to = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=True)
    location = db.Column(db.String(200))
    notes = db.Column(db.Text)
    next_maintenance_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    maintenance_logs = db.relationship("MaintenanceLog", back_populates="equipment", cascade="all, delete-orphan")


class MaintenanceLog(db.Model):
    __tablename__ = "maintenance_logs"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    equipment_id = db.Column(db.Integer, db.ForeignKey("equipment.id"), nullable=False)
    maintenance_date = db.Column(db.Date, nullable=False)
    maintenance_type = db.Column(db.String(100))  # routine, repair, inspection
    description = db.Column(db.Text)
    cost = db.Column(db.Numeric(12, 2), default=0)
    performed_by = db.Column(db.String(200))
    next_maintenance_date = db.Column(db.Date)
    status = db.Column(db.String(30), default="completed")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    equipment = db.relationship("Equipment", back_populates="maintenance_logs")
