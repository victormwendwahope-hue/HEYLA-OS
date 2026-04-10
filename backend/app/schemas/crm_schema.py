from marshmallow import Schema, fields, validate


class LeadSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    first_name = fields.Str(required=True)
    last_name = fields.Str(load_default=None)
    full_name = fields.Method("get_full_name", dump_only=True)
    email = fields.Email(load_default=None, allow_none=True)
    phone = fields.Str(load_default=None)
    company = fields.Str(load_default=None)
    source = fields.Str(load_default=None)
    status = fields.Str(load_default="new", validate=validate.OneOf(["new", "contacted", "qualified", "unqualified"]))
    score = fields.Int(load_default=0)
    notes = fields.Str(load_default=None)
    assigned_to = fields.Int(load_default=None, allow_none=True)
    created_by = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    def get_full_name(self, obj):
        return obj.full_name


class DealSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    lead_id = fields.Int(load_default=None, allow_none=True)
    title = fields.Str(required=True)
    value = fields.Decimal(load_default=0, as_string=True)
    currency = fields.Str(load_default="USD")
    stage = fields.Str(load_default="prospecting", validate=validate.OneOf([
        "prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"
    ]))
    probability = fields.Int(load_default=0)
    expected_close_date = fields.Date(load_default=None, allow_none=True)
    actual_close_date = fields.Date(dump_only=True)
    assigned_to = fields.Int(load_default=None, allow_none=True)
    notes = fields.Str(load_default=None)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ActivitySchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    lead_id = fields.Int(load_default=None, allow_none=True)
    deal_id = fields.Int(load_default=None, allow_none=True)
    activity_type = fields.Str(required=True, validate=validate.OneOf(["call", "email", "meeting", "note", "task"]))
    subject = fields.Str(load_default=None)
    description = fields.Str(load_default=None)
    due_date = fields.DateTime(load_default=None, allow_none=True)
    completed_at = fields.DateTime(dump_only=True)
    status = fields.Str(load_default="pending")
    created_by = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
