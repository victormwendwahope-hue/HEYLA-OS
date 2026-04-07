from app.extensions import db
from datetime import datetime


class Vehicle(db.Model):
    __tablename__ = "vehicles"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    registration_number = db.Column(db.String(50), nullable=False)
    make = db.Column(db.String(100))
    model = db.Column(db.String(100))
    year = db.Column(db.Integer)
    type = db.Column(db.String(50))  # truck, van, car, motorcycle
    capacity = db.Column(db.String(50))
    fuel_type = db.Column(db.String(30))
    status = db.Column(db.String(30), default="active")  # active, maintenance, retired
    mileage = db.Column(db.Integer, default=0)
    insurance_expiry = db.Column(db.Date)
    inspection_expiry = db.Column(db.Date)
    assigned_driver_id = db.Column(db.Integer, db.ForeignKey("drivers.id"), nullable=True)
    color = db.Column(db.String(50))
    vin = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fuel_logs = db.relationship("FuelLog", back_populates="vehicle", cascade="all, delete-orphan")
    trips = db.relationship("Trip", back_populates="vehicle", cascade="all, delete-orphan")


class Driver(db.Model):
    __tablename__ = "drivers"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(30))
    license_number = db.Column(db.String(100), nullable=False)
    license_expiry = db.Column(db.Date)
    license_class = db.Column(db.String(20))
    status = db.Column(db.String(30), default="available")  # available, on_trip, off_duty
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    trips = db.relationship("Trip", back_populates="driver", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Trip(db.Model):
    __tablename__ = "trips"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey("drivers.id"), nullable=False)
    origin = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    departure_time = db.Column(db.DateTime)
    arrival_time = db.Column(db.DateTime)
    distance_km = db.Column(db.Numeric(10, 2))
    status = db.Column(db.String(30), default="scheduled")  # scheduled, in_progress, completed, cancelled
    cargo_description = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicle = db.relationship("Vehicle", back_populates="trips")
    driver = db.relationship("Driver", back_populates="trips")
