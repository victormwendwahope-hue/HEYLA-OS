from flask import Blueprint, request
from marshmallow import ValidationError
from app.extensions import db
from app.models.hr import Employee, Attendance, LeaveRequest, PerformanceReview, Injury, EmployeeDocument
from app.schemas.hr_schema import (
    EmployeeSchema, AttendanceSchema, LeaveRequestSchema,
    PerformanceReviewSchema, InjurySchema, EmployeeDocumentSchema
)
from app.utils.helpers import success_response, error_response, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

hr_bp = Blueprint("hr", __name__)

employee_schema = EmployeeSchema()
employees_schema = EmployeeSchema(many=True)
attendance_schema = AttendanceSchema()
attendances_schema = AttendanceSchema(many=True)
leave_schema = LeaveRequestSchema()
leaves_schema = LeaveRequestSchema(many=True)
review_schema = PerformanceReviewSchema()
reviews_schema = PerformanceReviewSchema(many=True)
injury_schema = InjurySchema()
injuries_schema = InjurySchema(many=True)
doc_schema = EmployeeDocumentSchema()
docs_schema = EmployeeDocumentSchema(many=True)


# ─── EMPLOYEES ───────────────────────────────────────────────────────────────

@hr_bp.route("/employees", methods=["GET"])
@tenant_required
def list_employees(org_id, current_user):
    page, per_page = get_pagination_params()
    q = request.args.get("q", "")
    department = request.args.get("department")
    status = request.args.get("status")

    query = Employee.query.filter_by(organization_id=org_id)
    if q:
        query = query.filter(
            db.or_(
                Employee.first_name.ilike(f"%{q}%"),
                Employee.last_name.ilike(f"%{q}%"),
                Employee.email.ilike(f"%{q}%"),
                Employee.employee_number.ilike(f"%{q}%"),
            )
        )
    if department:
        query = query.filter_by(department=department)
    if status:
        query = query.filter_by(status=status)

    query = query.order_by(Employee.created_at.desc())
    result = paginate_query(query, employees_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@hr_bp.route("/employees/<int:emp_id>", methods=["GET"])
@tenant_required
def get_employee(emp_id, org_id, current_user):
    emp = Employee.query.filter_by(id=emp_id, organization_id=org_id).first_or_404()
    return success_response(employee_schema.dump(emp))


@hr_bp.route("/employees", methods=["POST"])
@tenant_required
def create_employee(org_id, current_user):
    try:
        data = employee_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)

    # Auto-generate employee number
    count = Employee.query.filter_by(organization_id=org_id).count()
    data["employee_number"] = data.get("employee_number") or f"EMP{count + 1:04d}"
    emp = Employee(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(emp)
    db.session.commit()
    return success_response(employee_schema.dump(emp), "Employee created", 201)


@hr_bp.route("/employees/<int:emp_id>", methods=["PUT"])
@tenant_required
def update_employee(emp_id, org_id, current_user):
    emp = Employee.query.filter_by(id=emp_id, organization_id=org_id).first_or_404()
    try:
        data = employee_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id",):
            setattr(emp, k, v)
    db.session.commit()
    return success_response(employee_schema.dump(emp), "Employee updated")


@hr_bp.route("/employees/<int:emp_id>", methods=["DELETE"])
@tenant_required
def delete_employee(emp_id, org_id, current_user):
    emp = Employee.query.filter_by(id=emp_id, organization_id=org_id).first_or_404()
    db.session.delete(emp)
    db.session.commit()
    return success_response(message="Employee deleted")


# ─── ATTENDANCE ───────────────────────────────────────────────────────────────

@hr_bp.route("/attendance", methods=["GET"])
@tenant_required
def list_attendance(org_id, current_user):
    page, per_page = get_pagination_params()
    employee_id = request.args.get("employee_id", type=int)
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    query = Attendance.query.filter_by(organization_id=org_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    query = query.order_by(Attendance.date.desc())
    result = paginate_query(query, attendances_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@hr_bp.route("/attendance", methods=["POST"])
@tenant_required
def create_attendance(org_id, current_user):
    try:
        data = attendance_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    existing = Attendance.query.filter_by(
        employee_id=data["employee_id"], date=data["date"]
    ).first()
    if existing:
        return error_response("Attendance record already exists for this date", 409)
    record = Attendance(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(record)
    db.session.commit()
    return success_response(attendance_schema.dump(record), "Attendance recorded", 201)


@hr_bp.route("/attendance/<int:att_id>", methods=["PUT"])
@tenant_required
def update_attendance(att_id, org_id, current_user):
    record = Attendance.query.filter_by(id=att_id, organization_id=org_id).first_or_404()
    try:
        data = attendance_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id",):
            setattr(record, k, v)
    db.session.commit()
    return success_response(attendance_schema.dump(record), "Attendance updated")


# ─── LEAVES ───────────────────────────────────────────────────────────────────

@hr_bp.route("/leaves", methods=["GET"])
@tenant_required
def list_leaves(org_id, current_user):
    page, per_page = get_pagination_params()
    employee_id = request.args.get("employee_id", type=int)
    status = request.args.get("status")

    query = LeaveRequest.query.filter_by(organization_id=org_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(LeaveRequest.created_at.desc())
    result = paginate_query(query, leaves_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@hr_bp.route("/leaves", methods=["POST"])
@tenant_required
def create_leave(org_id, current_user):
    try:
        data = leave_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    from datetime import date
    if not data.get("days"):
        delta = (data["end_date"] - data["start_date"]).days + 1
        data["days"] = delta
    leave = LeaveRequest(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(leave)
    db.session.commit()
    return success_response(leave_schema.dump(leave), "Leave request submitted", 201)


@hr_bp.route("/leaves/<int:leave_id>/approve", methods=["PUT"])
@tenant_required
def approve_leave(leave_id, org_id, current_user):
    leave = LeaveRequest.query.filter_by(id=leave_id, organization_id=org_id).first_or_404()
    from datetime import datetime
    leave.status = "approved"
    leave.approved_by = current_user.id
    leave.approved_at = datetime.utcnow()
    db.session.commit()
    return success_response(leave_schema.dump(leave), "Leave approved")


@hr_bp.route("/leaves/<int:leave_id>/reject", methods=["PUT"])
@tenant_required
def reject_leave(leave_id, org_id, current_user):
    leave = LeaveRequest.query.filter_by(id=leave_id, organization_id=org_id).first_or_404()
    leave.status = "rejected"
    db.session.commit()
    return success_response(leave_schema.dump(leave), "Leave rejected")


# ─── PERFORMANCE REVIEWS ─────────────────────────────────────────────────────

@hr_bp.route("/reviews", methods=["GET"])
@tenant_required
def list_reviews(org_id, current_user):
    page, per_page = get_pagination_params()
    employee_id = request.args.get("employee_id", type=int)
    query = PerformanceReview.query.filter_by(organization_id=org_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    query = query.order_by(PerformanceReview.review_date.desc())
    result = paginate_query(query, reviews_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@hr_bp.route("/reviews", methods=["POST"])
@tenant_required
def create_review(org_id, current_user):
    try:
        data = review_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["reviewer_id"] = current_user.id
    review = PerformanceReview(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(review)
    db.session.commit()
    return success_response(review_schema.dump(review), "Review created", 201)


@hr_bp.route("/reviews/<int:review_id>", methods=["PUT"])
@tenant_required
def update_review(review_id, org_id, current_user):
    review = PerformanceReview.query.filter_by(id=review_id, organization_id=org_id).first_or_404()
    try:
        data = review_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id",):
            setattr(review, k, v)
    db.session.commit()
    return success_response(review_schema.dump(review), "Review updated")


# ─── INJURIES ─────────────────────────────────────────────────────────────────

@hr_bp.route("/injuries", methods=["GET"])
@tenant_required
def list_injuries(org_id, current_user):
    page, per_page = get_pagination_params()
    query = Injury.query.filter_by(organization_id=org_id).order_by(Injury.incident_date.desc())
    result = paginate_query(query, injuries_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@hr_bp.route("/injuries", methods=["POST"])
@tenant_required
def create_injury(org_id, current_user):
    try:
        data = injury_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["reported_by"] = current_user.id
    inj = Injury(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(inj)
    db.session.commit()
    return success_response(injury_schema.dump(inj), "Injury reported", 201)


@hr_bp.route("/injuries/<int:inj_id>", methods=["PUT"])
@tenant_required
def update_injury(inj_id, org_id, current_user):
    inj = Injury.query.filter_by(id=inj_id, organization_id=org_id).first_or_404()
    try:
        data = injury_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id",):
            setattr(inj, k, v)
    db.session.commit()
    return success_response(injury_schema.dump(inj), "Injury updated")


# ─── DOCUMENTS ────────────────────────────────────────────────────────────────

@hr_bp.route("/documents", methods=["GET"])
@tenant_required
def list_documents(org_id, current_user):
    page, per_page = get_pagination_params()
    employee_id = request.args.get("employee_id", type=int)
    query = EmployeeDocument.query.filter_by(organization_id=org_id)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    result = paginate_query(query, docs_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@hr_bp.route("/documents", methods=["POST"])
@tenant_required
def create_document(org_id, current_user):
    try:
        data = doc_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["uploaded_by"] = current_user.id
    doc = EmployeeDocument(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(doc)
    db.session.commit()
    return success_response(doc_schema.dump(doc), "Document added", 201)


@hr_bp.route("/documents/<int:doc_id>", methods=["DELETE"])
@tenant_required
def delete_document(doc_id, org_id, current_user):
    doc = EmployeeDocument.query.filter_by(id=doc_id, organization_id=org_id).first_or_404()
    db.session.delete(doc)
    db.session.commit()
    return success_response(message="Document deleted")
