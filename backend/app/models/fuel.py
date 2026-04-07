from app.extensions import db
from datetime import datetime


class FuelLog(db.Model):
    __tablename__ = "fuel_logs"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey("drivers.id"), nullable=True)
    date = db.Column(db.Date, nullable=False)
    liters = db.Column(db.Numeric(8, 2), nullable=False)
    cost_per_liter = db.Column(db.Numeric(8, 4))
    total_cost = db.Column(db.Numeric(10, 2))
    currency = db.Column(db.String(10), default="USD")
    odometer = db.Column(db.Integer)
    station = db.Column(db.String(200))
    fuel_type = db.Column(db.String(30))  # petrol, diesel, electric, lpg
    notes = db.Column(db.Text)
    recorded_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index("ix_fuel_logs_org_date", "organization_id", "date"),
    )

    vehicle = db.relationship("Vehicle", back_populates="fuel_logs")
