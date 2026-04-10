from marshmallow import Schema, fields


class OrganizationProfileSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    tagline = fields.Str(load_default=None)
    description = fields.Str(load_default=None)
    founded_year = fields.Int(load_default=None, allow_none=True)
    employee_count = fields.Int(load_default=None, allow_none=True)
    registration_number = fields.Str(load_default=None)
    tax_number = fields.Str(load_default=None)
    fiscal_year_start = fields.Int(load_default=1)
    default_currency = fields.Str(load_default="USD")
    timezone = fields.Str(load_default="UTC")
    date_format = fields.Str(load_default="YYYY-MM-DD")
    social_links = fields.Dict(load_default=dict)
    branding = fields.Dict(load_default=dict)
    updated_at = fields.DateTime(dump_only=True)


class UserSettingsSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    theme = fields.Str(load_default="light")
    language = fields.Str(load_default="en")
    timezone = fields.Str(load_default="UTC")
    notifications_email = fields.Bool(load_default=True)
    notifications_push = fields.Bool(load_default=True)
    dashboard_layout = fields.Dict(load_default=dict)
    updated_at = fields.DateTime(dump_only=True)


class OrganizationSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    slug = fields.Str(dump_only=True)
    industry = fields.Str(load_default=None)
    email = fields.Email(load_default=None, allow_none=True)
    phone = fields.Str(load_default=None)
    address = fields.Str(load_default=None)
    logo_url = fields.Str(load_default=None)
    website = fields.Str(load_default=None)
    country_id = fields.Int(load_default=None, allow_none=True)
    plan = fields.Str(dump_only=True)
    is_active = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
