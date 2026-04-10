from marshmallow import Schema, fields, validate


class EmployeeSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    user_id = fields.Int(load_default=None)
    employee_number = fields.Str(load_default=None)
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    full_name = fields.Method("get_full_name", dump_only=True)
    email = fields.Email(load_default=None)
    phone = fields.Str(load_default=None)
    department = fields.Str(load_default=None)
    position = fields.Str(load_default=None)
    hire_date = fields.Date(load_default=None)
    termination_date = fields.Date(load_default=None, allow_none=True)
    status = fields.Str(load_default="active", validate=validate.OneOf(["active", "inactive", "terminated"]))
    employment_type = fields.Str(load_default="full_time")
    salary = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    salary_currency = fields.Str(load_default="USD")
    national_id = fields.Str(load_default=None)
    nationality = fields.Str(load_default=None)
    date_of_birth = fields.Date(load_default=None, allow_none=True)
    gender = fields.Str(load_default=None)
    address = fields.Str(load_default=None)
    emergency_contact_name = fields.Str(load_default=None)
    emergency_contact_phone = fields.Str(load_default=None)
    work_permit_number = fields.Str(load_default=None)
    work_permit_expiry = fields.Date(load_default=None, allow_none=True)
    tax_id = fields.Str(load_default=None)
    social_security_number = fields.Str(load_default=None)
    bank_account = fields.Str(load_default=None)
    bank_name = fields.Str(load_default=None)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    def get_full_name(self, obj):
        return obj.full_name


class AttendanceSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    employee_id = fields.Int(required=True)
    date = fields.Date(required=True)
    clock_in = fields.DateTime(load_default=None, allow_none=True)
    clock_out = fields.DateTime(load_default=None, allow_none=True)
    status = fields.Str(load_default="present", validate=validate.OneOf(["present", "absent", "late", "half_day"]))
    hours_worked = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    notes = fields.Str(load_default=None)
    created_at = fields.DateTime(dump_only=True)


class LeaveRequestSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    employee_id = fields.Int(required=True)
    leave_type = fields.Str(required=True, validate=validate.OneOf(["annual", "sick", "maternity", "paternity", "unpaid", "other"]))
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)
    days = fields.Int(load_default=None, allow_none=True)
    reason = fields.Str(load_default=None)
    status = fields.Str(dump_only=True)
    approved_by = fields.Int(dump_only=True)
    approved_at = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class PerformanceReviewSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    employee_id = fields.Int(required=True)
    reviewer_id = fields.Int(dump_only=True)
    review_period = fields.Str(load_default=None)
    review_date = fields.Date(required=True)
    rating = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    goals = fields.Str(load_default=None)
    achievements = fields.Str(load_default=None)
    areas_of_improvement = fields.Str(load_default=None)
    comments = fields.Str(load_default=None)
    status = fields.Str(load_default="draft")
    created_at = fields.DateTime(dump_only=True)


class InjurySchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    employee_id = fields.Int(required=True)
    incident_date = fields.Date(required=True)
    description = fields.Str(required=True)
    severity = fields.Str(load_default="minor", validate=validate.OneOf(["minor", "moderate", "severe"]))
    location = fields.Str(load_default=None)
    treatment = fields.Str(load_default=None)
    days_lost = fields.Int(load_default=0)
    status = fields.Str(load_default="reported")
    created_at = fields.DateTime(dump_only=True)


class EmployeeDocumentSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    employee_id = fields.Int(required=True)
    document_type = fields.Str(required=True)
    title = fields.Str(required=True)
    file_url = fields.Str(load_default=None)
    expiry_date = fields.Date(load_default=None, allow_none=True)
    notes = fields.Str(load_default=None)
    created_at = fields.DateTime(dump_only=True)
