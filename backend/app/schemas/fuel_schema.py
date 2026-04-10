from marshmallow import Schema, fields


class FuelLogSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    vehicle_id = fields.Int(required=True)
    driver_id = fields.Int(load_default=None, allow_none=True)
    date = fields.Date(required=True)
    liters = fields.Decimal(required=True, as_string=True)
    cost_per_liter = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    total_cost = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    currency = fields.Str(load_default="USD")
    odometer = fields.Int(load_default=None, allow_none=True)
    station = fields.Str(load_default=None)
    fuel_type = fields.Str(load_default=None)
    notes = fields.Str(load_default=None)
    created_at = fields.DateTime(dump_only=True)
