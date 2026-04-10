from marshmallow import Schema, fields, validate


class JobSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    posted_by = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(required=True)
    requirements = fields.Str(load_default=None)
    job_type = fields.Str(load_default="full_time")
    location = fields.Str(load_default=None)
    is_remote = fields.Bool(load_default=False)
    salary_min = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    salary_max = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    currency = fields.Str(load_default="USD")
    department = fields.Str(load_default=None)
    status = fields.Str(load_default="open")
    deadline = fields.Date(load_default=None, allow_none=True)
    skills = fields.List(fields.Str(), load_default=list)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ApplicationSchema(Schema):
    id = fields.Int(dump_only=True)
    job_id = fields.Int(required=True)
    applicant_name = fields.Str(required=True)
    applicant_email = fields.Email(required=True)
    applicant_phone = fields.Str(load_default=None)
    resume_url = fields.Str(load_default=None)
    cover_letter = fields.Str(load_default=None)
    status = fields.Str(dump_only=True)
    notes = fields.Str(load_default=None)
    applied_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ProposalSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    job_id = fields.Int(required=True)
    freelancer_name = fields.Str(required=True)
    freelancer_email = fields.Email(required=True)
    bid_amount = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    currency = fields.Str(load_default="USD")
    delivery_days = fields.Int(load_default=None, allow_none=True)
    description = fields.Str(load_default=None)
    portfolio_url = fields.Str(load_default=None)
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
