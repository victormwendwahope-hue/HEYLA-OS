from app.extensions import db
from datetime import datetime


class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    invoice_number = db.Column(db.String(50), nullable=False)
    client_name = db.Column(db.String(200), nullable=False)
    client_email = db.Column(db.String(150))
    client_address = db.Column(db.Text)
    issue_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="draft")  # draft, sent, paid, overdue, cancelled
    subtotal = db.Column(db.Numeric(12, 2), default=0)
    tax_rate = db.Column(db.Numeric(5, 2), default=0)
    tax_amount = db.Column(db.Numeric(12, 2), default=0)
    discount = db.Column(db.Numeric(12, 2), default=0)
    total = db.Column(db.Numeric(12, 2), default=0)
    currency = db.Column(db.String(10), default="USD")
    notes = db.Column(db.Text)
    items = db.Column(db.JSON, default=list)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("organization_id", "invoice_number", name="uq_org_invoice_number"),
        db.Index("ix_invoices_org", "organization_id"),
    )

    payments = db.relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Invoice {self.invoice_number}>"


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"), nullable=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    currency = db.Column(db.String(10), default="USD")
    payment_date = db.Column(db.Date, nullable=False)
    method = db.Column(db.String(50))  # bank_transfer, cash, card, cheque
    reference = db.Column(db.String(200))
    notes = db.Column(db.Text)
    recorded_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    invoice = db.relationship("Invoice", back_populates="payments")


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    currency = db.Column(db.String(10), default="USD")
    expense_date = db.Column(db.Date, nullable=False)
    vendor = db.Column(db.String(200))
    receipt_url = db.Column(db.String(500))
    status = db.Column(db.String(20), default="pending")  # pending, approved, rejected
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    submitted_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Payroll(db.Model):
    __tablename__ = "payrolls"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employees.id"), nullable=False)
    period_start = db.Column(db.Date, nullable=False)
    period_end = db.Column(db.Date, nullable=False)
    basic_salary = db.Column(db.Numeric(12, 2), nullable=False)
    allowances = db.Column(db.Numeric(12, 2), default=0)
    overtime = db.Column(db.Numeric(12, 2), default=0)
    deductions = db.Column(db.Numeric(12, 2), default=0)
    tax = db.Column(db.Numeric(12, 2), default=0)
    net_pay = db.Column(db.Numeric(12, 2), nullable=False)
    currency = db.Column(db.String(10), default="USD")
    status = db.Column(db.String(20), default="draft")  # draft, processed, paid
    payment_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    processed_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    employee = db.relationship("Employee", back_populates="payrolls")
