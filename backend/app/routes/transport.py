from flask import Blueprint, request
from marshmallow import ValidationError
from app.extensions import db
from app.models.transport import Vehicle, Driver, Trip
from app.schemas.transport_schema import VehicleSchema, DriverSchema, TripSchema
from app.utils.helpers import success_response, error_response, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

transport_bp = Blueprint("transport", __name__)
vehicle_schema = VehicleSchema()
vehicles_schema = VehicleSchema(many=True)
driver_schema = DriverSchema()
drivers_schema = DriverSchema(many=True)
trip_schema = TripSchema()
trips_schema = TripSchema(many=True)


# ─── VEHICLES ─────────────────────────────────────────────────────────────────

@transport_bp.route("/vehicles", methods=["GET"])
@tenant_required
def list_vehicles(org_id, current_user):
    page, per_page = get_pagination_params()
    status = request.args.get("status")
    query = Vehicle.query.filter_by(organization_id=org_id)
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(Vehicle.created_at.desc())
    result = paginate_query(query, vehicles_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@transport_bp.route("/vehicles/<int:v_id>", methods=["GET"])
@tenant_required
def get_vehicle(v_id, org_id, current_user):
    v = Vehicle.query.filter_by(id=v_id, organization_id=org_id).first_or_404()
    return success_response(vehicle_schema.dump(v))


@transport_bp.route("/vehicles", methods=["POST"])
@tenant_required
def create_vehicle(org_id, current_user):
    try:
        data = vehicle_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    v = Vehicle(organization_id=org_id, **{k: val for k, val in data.items() if k != "organization_id"})
    db.session.add(v)
    db.session.commit()
    return success_response(vehicle_schema.dump(v), "Vehicle created", 201)


@transport_bp.route("/vehicles/<int:v_id>", methods=["PUT"])
@tenant_required
def update_vehicle(v_id, org_id, current_user):
    v = Vehicle.query.filter_by(id=v_id, organization_id=org_id).first_or_404()
    try:
        data = vehicle_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, val in data.items():
        if k != "organization_id":
            setattr(v, k, val)
    db.session.commit()
    return success_response(vehicle_schema.dump(v), "Vehicle updated")


@transport_bp.route("/vehicles/<int:v_id>", methods=["DELETE"])
@tenant_required
def delete_vehicle(v_id, org_id, current_user):
    v = Vehicle.query.filter_by(id=v_id, organization_id=org_id).first_or_404()
    db.session.delete(v)
    db.session.commit()
    return success_response(message="Vehicle deleted")


# ─── DRIVERS ──────────────────────────────────────────────────────────────────

@transport_bp.route("/drivers", methods=["GET"])
@tenant_required
def list_drivers(org_id, current_user):
    page, per_page = get_pagination_params()
    status = request.args.get("status")
    query = Driver.query.filter_by(organization_id=org_id)
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(Driver.first_name)
    result = paginate_query(query, drivers_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@transport_bp.route("/drivers/<int:d_id>", methods=["GET"])
@tenant_required
def get_driver(d_id, org_id, current_user):
    d = Driver.query.filter_by(id=d_id, organization_id=org_id).first_or_404()
    return success_response(driver_schema.dump(d))


@transport_bp.route("/drivers", methods=["POST"])
@tenant_required
def create_driver(org_id, current_user):
    try:
        data = driver_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    d = Driver(organization_id=org_id, **{k: val for k, val in data.items() if k != "organization_id"})
    db.session.add(d)
    db.session.commit()
    return success_response(driver_schema.dump(d), "Driver created", 201)


@transport_bp.route("/drivers/<int:d_id>", methods=["PUT"])
@tenant_required
def update_driver(d_id, org_id, current_user):
    d = Driver.query.filter_by(id=d_id, organization_id=org_id).first_or_404()
    try:
        data = driver_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, val in data.items():
        if k != "organization_id":
            setattr(d, k, val)
    db.session.commit()
    return success_response(driver_schema.dump(d), "Driver updated")


@transport_bp.route("/drivers/<int:d_id>", methods=["DELETE"])
@tenant_required
def delete_driver(d_id, org_id, current_user):
    d = Driver.query.filter_by(id=d_id, organization_id=org_id).first_or_404()
    db.session.delete(d)
    db.session.commit()
    return success_response(message="Driver deleted")


# ─── TRIPS ────────────────────────────────────────────────────────────────────

@transport_bp.route("/trips", methods=["GET"])
@tenant_required
def list_trips(org_id, current_user):
    page, per_page = get_pagination_params()
    status = request.args.get("status")
    vehicle_id = request.args.get("vehicle_id", type=int)
    driver_id = request.args.get("driver_id", type=int)
    query = Trip.query.filter_by(organization_id=org_id)
    if status:
        query = query.filter_by(status=status)
    if vehicle_id:
        query = query.filter_by(vehicle_id=vehicle_id)
    if driver_id:
        query = query.filter_by(driver_id=driver_id)
    query = query.order_by(Trip.created_at.desc())
    result = paginate_query(query, trips_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@transport_bp.route("/trips/<int:t_id>", methods=["GET"])
@tenant_required
def get_trip(t_id, org_id, current_user):
    t = Trip.query.filter_by(id=t_id, organization_id=org_id).first_or_404()
    return success_response(trip_schema.dump(t))


@transport_bp.route("/trips", methods=["POST"])
@tenant_required
def create_trip(org_id, current_user):
    try:
        data = trip_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["created_by"] = current_user.id
    t = Trip(organization_id=org_id, **{k: val for k, val in data.items() if k != "organization_id"})
    db.session.add(t)
    # Mark driver as on_trip
    driver = Driver.query.get(data["driver_id"])
    if driver and data.get("status") == "in_progress":
        driver.status = "on_trip"
    db.session.commit()
    return success_response(trip_schema.dump(t), "Trip created", 201)


@transport_bp.route("/trips/<int:t_id>", methods=["PUT"])
@tenant_required
def update_trip(t_id, org_id, current_user):
    t = Trip.query.filter_by(id=t_id, organization_id=org_id).first_or_404()
    try:
        data = trip_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, val in data.items():
        if k not in ("organization_id", "created_by"):
            setattr(t, k, val)
    if data.get("status") == "completed":
        driver = Driver.query.get(t.driver_id)
        if driver:
            driver.status = "available"
    db.session.commit()
    return success_response(trip_schema.dump(t), "Trip updated")


@transport_bp.route("/trips/<int:t_id>", methods=["DELETE"])
@tenant_required
def delete_trip(t_id, org_id, current_user):
    t = Trip.query.filter_by(id=t_id, organization_id=org_id).first_or_404()
    db.session.delete(t)
    db.session.commit()
    return success_response(message="Trip deleted")
