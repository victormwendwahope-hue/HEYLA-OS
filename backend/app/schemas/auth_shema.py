from marshmallow import Schema, fields, validate, validates, ValidationError


class RegisterSchema(Schema):
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8), load_only=True)
    organization_name = fields.Str(required=True, validate=validate.Length(min=2, max=200))
    country_id = fields.Int(load_default=None)
    phone = fields.Str(load_default=None)


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class ChangePasswordSchema(Schema):
    current_password = fields.Str(required=True, load_only=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8), load_only=True)


class UserOutputSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(dump_only=True)
    first_name = fields.Str(dump_only=True)
    last_name = fields.Str(dump_only=True)
    full_name = fields.Str(dump_only=True)
    phone = fields.Str(dump_only=True)
    avatar_url = fields.Str(dump_only=True)
    is_active = fields.Bool(dump_only=True)
    is_owner = fields.Bool(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    last_login = fields.DateTime(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    roles = fields.Method("get_roles", dump_only=True)

    def get_roles(self, obj):
        return [r.name for r in obj.roles]


class InviteUserSchema(Schema):
    email = fields.Email(required=True)
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    role = fields.Str(required=True, validate=validate.OneOf(["admin", "manager", "employee"]))
    phone = fields.Str(load_default=None)
