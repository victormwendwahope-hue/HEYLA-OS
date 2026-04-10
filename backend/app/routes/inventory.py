from flask import Blueprint, request
from marshmallow import ValidationError
from app.extensions import db
from app.models.inventory import Product, Equipment, MaintenanceLog
from app.schemas.inventory_schema import ProductSchema, EquipmentSchema, MaintenanceLogSchema
from app.utils.helpers import success_response, error_response, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

inventory_bp = Blueprint("inventory", __name__)
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)
equipment_schema = EquipmentSchema()
equipments_schema = EquipmentSchema(many=True)
log_schema = MaintenanceLogSchema()
logs_schema = MaintenanceLogSchema(many=True)


def _crud_list(Model, schema_many, org_id, filters=None):
    page, per_page = get_pagination_params()
    query = Model.query.filter_by(organization_id=org_id)
    if filters:
        for k, v in filters.items():
            if v:
                query = query.filter(getattr(Model, k) == v)
    query = query.order_by(Model.created_at.desc())
    result = paginate_query(query, schema_many, page, per_page)
    return success_response(result["items"], meta=result["meta"])


# ─── PRODUCTS ─────────────────────────────────────────────────────────────────

@inventory_bp.route("/products", methods=["GET"])
@tenant_required
def list_products(org_id, current_user):
    q = request.args.get("q", "")
    category = request.args.get("category")
    page, per_page = get_pagination_params()
    query = Product.query.filter_by(organization_id=org_id)
    if q:
        query = query.filter(db.or_(Product.name.ilike(f"%{q}%"), Product.sku.ilike(f"%{q}%")))
    if category:
        query = query.filter_by(category=category)
    query = query.order_by(Product.name)
    result = paginate_query(query, products_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@inventory_bp.route("/products/<int:prod_id>", methods=["GET"])
@tenant_required
def get_product(prod_id, org_id, current_user):
    prod = Product.query.filter_by(id=prod_id, organization_id=org_id).first_or_404()
    return success_response(product_schema.dump(prod))


@inventory_bp.route("/products", methods=["POST"])
@tenant_required
def create_product(org_id, current_user):
    try:
        data = product_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    prod = Product(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(prod)
    db.session.commit()
    return success_response(product_schema.dump(prod), "Product created", 201)


@inventory_bp.route("/products/<int:prod_id>", methods=["PUT"])
@tenant_required
def update_product(prod_id, org_id, current_user):
    prod = Product.query.filter_by(id=prod_id, organization_id=org_id).first_or_404()
    try:
        data = product_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id",):
            setattr(prod, k, v)
    db.session.commit()
    return success_response(product_schema.dump(prod), "Product updated")


@inventory_bp.route("/products/<int:prod_id>", methods=["DELETE"])
@tenant_required
def delete_product(prod_id, org_id, current_user):
    prod = Product.query.filter_by(id=prod_id, organization_id=org_id).first_or_404()
    db.session.delete(prod)
    db.session.commit()
    return success_response(message="Product deleted")


# ─── EQUIPMENT ────────────────────────────────────────────────────────────────

@inventory_bp.route("/equipment", methods=["GET"])
@tenant_required
def list_equipment(org_id, current_user):
    return _crud_list(Equipment, equipments_schema, org_id, {
        "status": request.args.get("status"),
        "category": request.args.get("category"),
    })


@inventory_bp.route("/equipment/<int:eq_id>", methods=["GET"])
@tenant_required
def get_equipment(eq_id, org_id, current_user):
    eq = Equipment.query.filter_by(id=eq_id, organization_id=org_id).first_or_404()
    return success_response(equipment_schema.dump(eq))


@inventory_bp.route("/equipment", methods=["POST"])
@tenant_required
def create_equipment(org_id, current_user):
    try:
        data = equipment_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    eq = Equipment(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(eq)
    db.session.commit()
    return success_response(equipment_schema.dump(eq), "Equipment created", 201)


@inventory_bp.route("/equipment/<int:eq_id>", methods=["PUT"])
@tenant_required
def update_equipment(eq_id, org_id, current_user):
    eq = Equipment.query.filter_by(id=eq_id, organization_id=org_id).first_or_404()
    try:
        data = equipment_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id",):
            setattr(eq, k, v)
    db.session.commit()
    return success_response(equipment_schema.dump(eq), "Equipment updated")


@inventory_bp.route("/equipment/<int:eq_id>", methods=["DELETE"])
@tenant_required
def delete_equipment(eq_id, org_id, current_user):
    eq = Equipment.query.filter_by(id=eq_id, organization_id=org_id).first_or_404()
    db.session.delete(eq)
    db.session.commit()
    return success_response(message="Equipment deleted")


# ─── MAINTENANCE LOGS ─────────────────────────────────────────────────────────

@inventory_bp.route("/maintenance", methods=["GET"])
@tenant_required
def list_maintenance(org_id, current_user):
    equipment_id = request.args.get("equipment_id", type=int)
    return _crud_list(MaintenanceLog, logs_schema, org_id, {"equipment_id": equipment_id})


@inventory_bp.route("/maintenance", methods=["POST"])
@tenant_required
def create_maintenance(org_id, current_user):
    try:
        data = log_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    log = MaintenanceLog(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(log)
    if data.get("next_maintenance_date"):
        eq = Equipment.query.get(data["equipment_id"])
        if eq:
            eq.next_maintenance_date = data["next_maintenance_date"]
    db.session.commit()
    return success_response(log_schema.dump(log), "Maintenance log created", 201)
