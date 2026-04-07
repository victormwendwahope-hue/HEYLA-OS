from app.extensions import db
from datetime import datetime


class Employee(db.Model):
    __tablename__ = "employees"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    employee_number = db.Column(db.String(50))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150))
    phone = db.Column(db.String(30))
    department = db.Column(db.String(100))
    position = db.Column(db.String(100))
    hire_date = db.Column(db.Date)
    termination_date = db.Column(db.Date)
    status = db.Column(db.String(20), default="active")  # active, inactive, terminated
    employment_type = db.Column(db.String(30), default="full_time")  # full_time, part_time, contract
    salary = db.Column(db.Numeric(12, 2))
    salary_currency = db.Column(db.String(10), default="USD")
    national_id = db.Column(db.String(100))
    nationality = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    address = db.Column(db.Text)
    emergency_contact_name = db.Column(db.String(150))
    emergency_contact_phone = db.Column(db.String(30))
    # Compliance fields
    work_permit_number = db.Column(db.String(100))
    work_permit_expiry = db.Column(db.Date)
    tax_id = db.Column(db.String(100))
    social_security_number = db.Column(db.String(100))
    bank_account = db.Column(db.String(100))
    bank_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.Index("ix_employees_org", "organization_id"),
    )

    attendance_records = db.relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = db.relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")
    performance_reviews = db.relationship("PerformanceReview", back_populates="employee", cascade="all, delete-orphan")
    injuries = db.relationship("Injury", back_populates="employee", cascade="all, delete-orphan")
    documents = db.relationship("EmployeeDocument", back_populates="employee", cascade="all, delete-orphan")
    payrolls = db.relationship("Payroll", back_populates="employee", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<Employee {self.full_name}>"


class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    clock_in = db.Column(db.DateTime)
    clock_out = db.Column(db.DateTime)
    status = db.Column(db.String(20), default="present")  # present, absent, late, half_day
    hours_worked = db.Column(db.Numeric(5, 2))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("employee_id", "date", name="uq_attendance_employee_date"),
        db.Index("ix_attendance_org_date", "organization_id", "date"),
    )

    employee = db.relationship("Employee", back_populates="attendance_records")


class LeaveRequest(db.Model):
    __tablename__ = "leaves"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)
    leave_type = db.Column(db.String(50), nullable=False)  # annual, sick, maternity, unpaid
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    days = db.Column(db.Integer)
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default="pending")  # pending, approved, rejected
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    approved_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = db.relationship("Employee", back_populates="leave_requests")


class PerformanceReview(db.Model):
    __tablename__ = "performance_reviews"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    review_period = db.Column(db.String(50))
    review_date = db.Column(db.Date, nullable=False)
    rating = db.Column(db.Numeric(3, 1))  # e.g. 4.5 / 5.0
    goals = db.Column(db.Text)
    achievements = db.Column(db.Text)
    areas_of_improvement = db.Column(db.Text)
    comments = db.Column(db.Text)
    status = db.Column(db.String(20), default="draft")  # draft, submitted, acknowledged
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    employee = db.relationship("Employee", back_populates="performance_reviews")


class Injury(db.Model):
    __tablename__ = "injuries"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)
    incident_date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default="minor")  # minor, moderate, severe
    location = db.Column(db.String(200))
    treatment = db.Column(db.Text)
    reported_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    days_lost = db.Column(db.Integer, default=0)
    status = db.Column(db.String(30), default="reported")  # reported, under_review, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    employee = db.relationship("Employee", back_populates="injuries")


class EmployeeDocument(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)
    document_type = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    file_url = db.Column(db.String(500))
    expiry_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    employee = db.relationship("Employee", back_populates="documents")
