from app.extensions import db
from datetime import datetime


class Country(db.Model):
    __tablename__ = "countries"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(db.String(3), nullable=False, unique=True)
    currency = db.Column(db.String(10), nullable=False, default="USD")
    currency_symbol = db.Column(db.String(5), default="$")
    tax_rate = db.Column(db.Numeric(5, 2), default=0.0)
    payroll_rules = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    organizations = db.relationship("Organization", back_populates="country")

    def __repr__(self):
        return f"<Country {self.name}>"
