from app.extensions import db
from datetime import datetime


class Lead(db.Model):
    __tablename__ = "leads"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(150))
    phone = db.Column(db.String(30))
    company = db.Column(db.String(200))
    source = db.Column(db.String(100))  # website, referral, social, cold_call
    status = db.Column(db.String(50), default="new")  # new, contacted, qualified, unqualified
    score = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text)
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.Index("ix_leads_org", "organization_id"),
    )

    deals = db.relationship("Deal", back_populates="lead", cascade="all, delete-orphan")
    activities = db.relationship("Activity", back_populates="lead", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name or ''}".strip()


class Deal(db.Model):
    __tablename__ = "deals"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    lead_id = db.Column(db.Integer, db.ForeignKey("leads.id"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Numeric(12, 2), default=0)
    currency = db.Column(db.String(10), default="USD")
    stage = db.Column(db.String(50), default="prospecting")
    # prospecting, qualification, proposal, negotiation, closed_won, closed_lost
    probability = db.Column(db.Integer, default=0)
    expected_close_date = db.Column(db.Date)
    actual_close_date = db.Column(db.Date)
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id"))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lead = db.relationship("Lead", back_populates="deals")


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    lead_id = db.Column(db.Integer, db.ForeignKey("leads.id"), nullable=True)
    deal_id = db.Column(db.Integer, db.ForeignKey("deals.id"), nullable=True)
    activity_type = db.Column(db.String(50), nullable=False)  # call, email, meeting, note
    subject = db.Column(db.String(255))
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default="pending")  # pending, completed, cancelled
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    lead = db.relationship("Lead", back_populates="activities")
