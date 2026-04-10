from flask import Blueprint, request
from marshmallow import ValidationError
from sqlalchemy import func
from app.extensions import db
from app.models.fuel import FuelLog
from app.models.transport import Vehicle
from app.schemas.fuel_schema import FuelLogSchema
from app.utils.helpers import success_response, error_response, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

fuel_bp = Blueprint("fuel", __name__)
log_schema = FuelLogSchema()
logs_schema = FuelLogSchema(many=True)


@fuel_bp.route("/logs", methods=["GET"])
@tenant_required
def list_logs(org_id, current_user):
    page, per_page = get_pagination_params()
    vehicle_id = request.args.get("vehicle_id", type=int)
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    query = FuelLog.query.filter_by(organization_id=org_id)
    if vehicle_id:
        query = query.filter_by(vehicle_id=vehicle_id)
    if date_from:
        query = query.filter(FuelLog.date >= date_from)
    if date_to:
        query = query.filter(FuelLog.date <= date_to)
    query = query.order_by(FuelLog.date.desc())
    result = paginate_query(query, logs_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@fuel_bp.route("/logs/<int:log_id>", methods=["GET"])
@tenant_required
def get_log(log_id, org_id, current_user):
    log = FuelLog.query.filter_by(id=log_id, organization_id=org_id).first_or_404()
    return success_response(log_schema.dump(log))


@fuel_bp.route("/logs", methods=["POST"])
@tenant_required
def create_log(org_id, current_user):
    try:
        data = log_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["recorded_by"] = current_user.id
    # Auto-compute total_cost if not provided
    if not data.get("total_cost") and data.get("cost_per_liter"):
        data["total_cost"] = round(float(data["liters"]) * float(data["cost_per_liter"]), 2)
    log = FuelLog(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(log)
    # Update vehicle mileage if odometer provided
    if data.get("odometer"):
        v = Vehicle.query.filter_by(id=data["vehicle_id"], organization_id=org_id).first()
        if v and data["odometer"] > (v.mileage or 0):
            v.mileage = data["odometer"]
    db.session.commit()
    return success_response(log_schema.dump(log), "Fuel log created", 201)


@fuel_bp.route("/logs/<int:log_id>", methods=["PUT"])
@tenant_required
def update_log(log_id, org_id, current_user):
    log = FuelLog.query.filter_by(id=log_id, organization_id=org_id).first_or_404()
    try:
        data = log_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id", "recorded_by"):
            setattr(log, k, v)
    db.session.commit()
    return success_response(log_schema.dump(log), "Fuel log updated")


@fuel_bp.route("/logs/<int:log_id>", methods=["DELETE"])
@tenant_required
def delete_log(log_id, org_id, current_user):
    log = FuelLog.query.filter_by(id=log_id, organization_id=org_id).first_or_404()
    db.session.delete(log)
    db.session.commit()
    return success_response(message="Fuel log deleted")


@fuel_bp.route("/analytics", methods=["GET"])
@tenant_required
def analytics(org_id, current_user):
    vehicle_id = request.args.get("vehicle_id", type=int)
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    query = FuelLog.query.filter_by(organization_id=org_id)
    if vehicle_id:
        query = query.filter_by(vehicle_id=vehicle_id)
    if date_from:
        query = query.filter(FuelLog.date >= date_from)
    if date_to:
        query = query.filter(FuelLog.date <= date_to)

    total_liters = db.session.query(func.sum(FuelLog.liters)).filter_by(organization_id=org_id)
    total_cost = db.session.query(func.sum(FuelLog.total_cost)).filter_by(organization_id=org_id)
    total_entries = FuelLog.query.filter_by(organization_id=org_id).count()

    if vehicle_id:
        total_liters = total_liters.filter_by(vehicle_id=vehicle_id)
        total_cost = total_cost.filter_by(vehicle_id=vehicle_id)

    # Per-vehicle breakdown
    breakdown = (
        db.session.query(
            FuelLog.vehicle_id,
            func.sum(FuelLog.liters).label("total_liters"),
            func.sum(FuelLog.total_cost).label("total_cost"),
            func.count(FuelLog.id).label("entries"),
        )
        .filter_by(organization_id=org_id)
        .group_by(FuelLog.vehicle_id)
        .all()
    )

    return success_response({
        "total_liters": float(total_liters.scalar() or 0),
        "total_cost": float(total_cost.scalar() or 0),
        "total_entries": total_entries,
        "by_vehicle": [
            {
                "vehicle_id": row.vehicle_id,
                "total_liters": float(row.total_liters or 0),
                "total_cost": float(row.total_cost or 0),
                "entries": row.entries,
            }
            for row in breakdown
        ],
    })
