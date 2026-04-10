from flask import Blueprint, request
from marshmallow import ValidationError
from sqlalchemy import func
from app.extensions import db
from app.models.accounting import Invoice, Payment, Expense, Payroll
from app.schemas.accounting_schema import InvoiceSchema, PaymentSchema, ExpenseSchema, PayrollSchema
from app.utils.helpers import success_response, error_response, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

accounting_bp = Blueprint("accounting", __name__)
invoice_schema = InvoiceSchema()
invoices_schema = InvoiceSchema(many=True)
payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)
expense_schema = ExpenseSchema()
expenses_schema = ExpenseSchema(many=True)
payroll_schema = PayrollSchema()
payrolls_schema = PayrollSchema(many=True)


def next_invoice_number(org_id):
    count = Invoice.query.filter_by(organization_id=org_id).count()
    return f"INV-{count + 1:05d}"


# ─── INVOICES ─────────────────────────────────────────────────────────────────

@accounting_bp.route("/invoices", methods=["GET"])
@tenant_required
def list_invoices(org_id, current_user):
    page, per_page = get_pagination_params()
    status = request.args.get("status")
    query = Invoice.query.filter_by(organization_id=org_id)
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(Invoice.created_at.desc())
    result = paginate_query(query, invoices_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@accounting_bp.route("/invoices/<int:inv_id>", methods=["GET"])
@tenant_required
def get_invoice(inv_id, org_id, current_user):
    inv = Invoice.query.filter_by(id=inv_id, organization_id=org_id).first_or_404()
    return success_response(invoice_schema.dump(inv))


@accounting_bp.route("/invoices", methods=["POST"])
@tenant_required
def create_invoice(org_id, current_user):
    try:
        data = invoice_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["invoice_number"] = data.get("invoice_number") or next_invoice_number(org_id)
    data["created_by"] = current_user.id
    # Compute totals
    subtotal = float(data.get("subtotal", 0))
    tax_rate = float(data.get("tax_rate", 0))
    discount = float(data.get("discount", 0))
    tax_amount = round(subtotal * tax_rate / 100, 2)
    total = round(subtotal + tax_amount - discount, 2)
    data["tax_amount"] = tax_amount
    data["total"] = total
    inv = Invoice(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(inv)
    db.session.commit()
    return success_response(invoice_schema.dump(inv), "Invoice created", 201)


@accounting_bp.route("/invoices/<int:inv_id>", methods=["PUT"])
@tenant_required
def update_invoice(inv_id, org_id, current_user):
    inv = Invoice.query.filter_by(id=inv_id, organization_id=org_id).first_or_404()
    try:
        data = invoice_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id", "created_by"):
            setattr(inv, k, v)
    db.session.commit()
    return success_response(invoice_schema.dump(inv), "Invoice updated")


@accounting_bp.route("/invoices/<int:inv_id>", methods=["DELETE"])
@tenant_required
def delete_invoice(inv_id, org_id, current_user):
    inv = Invoice.query.filter_by(id=inv_id, organization_id=org_id).first_or_404()
    db.session.delete(inv)
    db.session.commit()
    return success_response(message="Invoice deleted")


# ─── PAYMENTS ─────────────────────────────────────────────────────────────────

@accounting_bp.route("/payments", methods=["GET"])
@tenant_required
def list_payments(org_id, current_user):
    page, per_page = get_pagination_params()
    query = Payment.query.filter_by(organization_id=org_id).order_by(Payment.payment_date.desc())
    result = paginate_query(query, payments_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@accounting_bp.route("/payments", methods=["POST"])
@tenant_required
def create_payment(org_id, current_user):
    try:
        data = payment_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["recorded_by"] = current_user.id
    payment = Payment(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(payment)
    # Mark invoice as paid if fully paid
    if payment.invoice_id:
        inv = Invoice.query.get(payment.invoice_id)
        if inv:
            paid = db.session.query(func.sum(Payment.amount)).filter_by(invoice_id=inv.id).scalar() or 0
            if float(paid) + float(data["amount"]) >= float(inv.total):
                inv.status = "paid"
    db.session.commit()
    return success_response(payment_schema.dump(payment), "Payment recorded", 201)


# ─── EXPENSES ─────────────────────────────────────────────────────────────────

@accounting_bp.route("/expenses", methods=["GET"])
@tenant_required
def list_expenses(org_id, current_user):
    page, per_page = get_pagination_params()
    status = request.args.get("status")
    category = request.args.get("category")
    query = Expense.query.filter_by(organization_id=org_id)
    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)
    query = query.order_by(Expense.expense_date.desc())
    result = paginate_query(query, expenses_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@accounting_bp.route("/expenses", methods=["POST"])
@tenant_required
def create_expense(org_id, current_user):
    try:
        data = expense_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["submitted_by"] = current_user.id
    expense = Expense(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(expense)
    db.session.commit()
    return success_response(expense_schema.dump(expense), "Expense submitted", 201)


@accounting_bp.route("/expenses/<int:exp_id>", methods=["PUT"])
@tenant_required
def update_expense(exp_id, org_id, current_user):
    expense = Expense.query.filter_by(id=exp_id, organization_id=org_id).first_or_404()
    try:
        data = expense_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id", "submitted_by"):
            setattr(expense, k, v)
    db.session.commit()
    return success_response(expense_schema.dump(expense), "Expense updated")


@accounting_bp.route("/expenses/<int:exp_id>/approve", methods=["PUT"])
@tenant_required
def approve_expense(exp_id, org_id, current_user):
    expense = Expense.query.filter_by(id=exp_id, organization_id=org_id).first_or_404()
    expense.status = "approved"
    expense.approved_by = current_user.id
    db.session.commit()
    return success_response(expense_schema.dump(expense), "Expense approved")


# ─── PAYROLL ──────────────────────────────────────────────────────────────────

@accounting_bp.route("/payroll", methods=["GET"])
@tenant_required
def list_payroll(org_id, current_user):
    page, per_page = get_pagination_params()
    employee_id = request.args.get("employee_id", type=int)
    query = Payroll.query.filter_by(organization_id=org_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    query = query.order_by(Payroll.period_start.desc())
    result = paginate_query(query, payrolls_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@accounting_bp.route("/payroll", methods=["POST"])
@tenant_required
def create_payroll(org_id, current_user):
    try:
        data = payroll_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    basic = float(data.get("basic_salary", 0))
    allowances = float(data.get("allowances", 0))
    overtime = float(data.get("overtime", 0))
    deductions = float(data.get("deductions", 0))
    tax = float(data.get("tax", 0))
    net_pay = round(basic + allowances + overtime - deductions - tax, 2)
    data["net_pay"] = net_pay
    data["processed_by"] = current_user.id
    payroll = Payroll(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(payroll)
    db.session.commit()
    return success_response(payroll_schema.dump(payroll), "Payroll processed", 201)


@accounting_bp.route("/payroll/<int:pay_id>", methods=["PUT"])
@tenant_required
def update_payroll(pay_id, org_id, current_user):
    payroll = Payroll.query.filter_by(id=pay_id, organization_id=org_id).first_or_404()
    try:
        data = payroll_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id", "processed_by"):
            setattr(payroll, k, v)
    # Recalculate net pay
    payroll.net_pay = round(
        float(payroll.basic_salary or 0) +
        float(payroll.allowances or 0) +
        float(payroll.overtime or 0) -
        float(payroll.deductions or 0) -
        float(payroll.tax or 0), 2
    )
    db.session.commit()
    return success_response(payroll_schema.dump(payroll), "Payroll updated")


# ─── FINANCIAL SUMMARY ────────────────────────────────────────────────────────

@accounting_bp.route("/summary", methods=["GET"])
@tenant_required
def financial_summary(org_id, current_user):
    total_invoiced = db.session.query(func.sum(Invoice.total)).filter_by(organization_id=org_id).scalar() or 0
    total_paid = db.session.query(func.sum(Invoice.total)).filter_by(organization_id=org_id, status="paid").scalar() or 0
    total_overdue = db.session.query(func.sum(Invoice.total)).filter_by(organization_id=org_id, status="overdue").scalar() or 0
    total_expenses = db.session.query(func.sum(Expense.amount)).filter_by(organization_id=org_id, status="approved").scalar() or 0
    total_payroll = db.session.query(func.sum(Payroll.net_pay)).filter_by(organization_id=org_id, status="paid").scalar() or 0

    return success_response({
        "total_invoiced": float(total_invoiced),
        "total_paid": float(total_paid),
        "total_overdue": float(total_overdue),
        "outstanding": float(total_invoiced) - float(total_paid),
        "total_expenses": float(total_expenses),
        "total_payroll_paid": float(total_payroll),
    })
