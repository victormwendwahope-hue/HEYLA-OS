from marshmallow import Schema, fields, validate


class VehicleSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    registration_number = fields.Str(required=True)
    make = fields.Str(load_default=None)
    model = fields.Str(load_default=None)
    year = fields.Int(load_default=None, allow_none=True)
    type = fields.Str(load_default=None)
    capacity = fields.Str(load_default=None)
    fuel_type = fields.Str(load_default=None)
    status = fields.Str(load_default="active")
    mileage = fields.Int(load_default=0)
    insurance_expiry = fields.Date(load_default=None, allow_none=True)
    inspection_expiry = fields.Date(load_default=None, allow_none=True)
    assigned_driver_id = fields.Int(load_default=None, allow_none=True)
    color = fields.Str(load_default=None)
    vin = fields.Str(load_default=None)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class DriverSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    employee_id = fields.Int(load_default=None, allow_none=True)
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    full_name = fields.Method("get_full_name", dump_only=True)
    phone = fields.Str(load_default=None)
    license_number = fields.Str(required=True)
    license_expiry = fields.Date(load_default=None, allow_none=True)
    license_class = fields.Str(load_default=None)
    status = fields.Str(load_default="available")
    created_at = fields.DateTime(dump_only=True)

    def get_full_name(self, obj):
        return obj.full_name


class TripSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    vehicle_id = fields.Int(required=True)
    driver_id = fields.Int(required=True)
    origin = fields.Str(required=True)
    destination = fields.Str(required=True)
    departure_time = fields.DateTime(load_default=None, allow_none=True)
    arrival_time = fields.DateTime(load_default=None, allow_none=True)
    distance_km = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    status = fields.Str(load_default="scheduled")
    cargo_description = fields.Str(load_default=None)
    notes = fields.Str(load_default=None)
    created_by = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
