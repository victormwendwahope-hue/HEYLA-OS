from marshmallow import Schema, fields, validate


class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    sku = fields.Str(load_default=None)
    name = fields.Str(required=True)
    description = fields.Str(load_default=None)
    category = fields.Str(load_default=None)
    unit = fields.Str(load_default=None)
    unit_price = fields.Decimal(load_default=0, as_string=True)
    cost_price = fields.Decimal(load_default=0, as_string=True)
    quantity = fields.Int(load_default=0)
    reorder_level = fields.Int(load_default=0)
    location = fields.Str(load_default=None)
    image_url = fields.Str(load_default=None)
    is_active = fields.Bool(load_default=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class EquipmentSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    serial_number = fields.Str(load_default=None)
    category = fields.Str(load_default=None)
    brand = fields.Str(load_default=None)
    model = fields.Str(load_default=None)
    purchase_date = fields.Date(load_default=None, allow_none=True)
    purchase_price = fields.Decimal(load_default=None, allow_none=True, as_string=True)
    condition = fields.Str(load_default="good")
    status = fields.Str(load_default="available")
    assigned_to = fields.Int(load_default=None, allow_none=True)
    location = fields.Str(load_default=None)
    notes = fields.Str(load_default=None)
    next_maintenance_date = fields.Date(load_default=None, allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class MaintenanceLogSchema(Schema):
    id = fields.Int(dump_only=True)
    organization_id = fields.Int(dump_only=True)
    equipment_id = fields.Int(required=True)
    maintenance_date = fields.Date(required=True)
    maintenance_type = fields.Str(load_default=None)
    description = fields.Str(load_default=None)
    cost = fields.Decimal(load_default=0, as_string=True)
    performed_by = fields.Str(load_default=None)
    next_maintenance_date = fields.Date(load_default=None, allow_none=True)
    status = fields.Str(load_default="completed")
    created_at = fields.DateTime(dump_only=True)
