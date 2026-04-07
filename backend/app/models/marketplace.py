from app.extensions import db
from datetime import datetime


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    posted_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    job_type = db.Column(db.String(50), default="full_time")  # full_time, part_time, contract, freelance
    location = db.Column(db.String(200))
    is_remote = db.Column(db.Boolean, default=False)
    salary_min = db.Column(db.Numeric(12, 2))
    salary_max = db.Column(db.Numeric(12, 2))
    currency = db.Column(db.String(10), default="USD")
    department = db.Column(db.String(100))
    status = db.Column(db.String(30), default="open")  # open, closed, draft
    deadline = db.Column(db.Date)
    skills = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = db.relationship("Application", back_populates="job", cascade="all, delete-orphan")


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    applicant_name = db.Column(db.String(200), nullable=False)
    applicant_email = db.Column(db.String(150), nullable=False)
    applicant_phone = db.Column(db.String(30))
    resume_url = db.Column(db.String(500))
    cover_letter = db.Column(db.Text)
    status = db.Column(db.String(30), default="submitted")  # submitted, reviewing, shortlisted, rejected, hired
    notes = db.Column(db.Text)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = db.relationship("Job", back_populates="applications")


class Proposal(db.Model):
    __tablename__ = "proposals"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    freelancer_name = db.Column(db.String(200), nullable=False)
    freelancer_email = db.Column(db.String(150), nullable=False)
    bid_amount = db.Column(db.Numeric(12, 2))
    currency = db.Column(db.String(10), default="USD")
    delivery_days = db.Column(db.Integer)
    description = db.Column(db.Text)
    portfolio_url = db.Column(db.String(500))
    status = db.Column(db.String(30), default="pending")  # pending, accepted, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
