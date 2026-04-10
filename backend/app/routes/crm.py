from flask import Blueprint, request
from marshmallow import ValidationError
from datetime import datetime
from app.extensions import db
from app.models.crm import Lead, Deal, Activity
from app.schemas.crm_schema import LeadSchema, DealSchema, ActivitySchema
from app.utils.helpers import success_response, error_response, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

crm_bp = Blueprint("crm", __name__)
lead_schema = LeadSchema()
leads_schema = LeadSchema(many=True)
deal_schema = DealSchema()
deals_schema = DealSchema(many=True)
activity_schema = ActivitySchema()
activities_schema = ActivitySchema(many=True)


# ─── LEADS ────────────────────────────────────────────────────────────────────

@crm_bp.route("/leads", methods=["GET"])
@tenant_required
def list_leads(org_id, current_user):
    page, per_page = get_pagination_params()
    q = request.args.get("q", "")
    status = request.args.get("status")
    source = request.args.get("source")

    query = Lead.query.filter_by(organization_id=org_id)
    if q:
        query = query.filter(
            db.or_(
                Lead.first_name.ilike(f"%{q}%"),
                Lead.last_name.ilike(f"%{q}%"),
                Lead.email.ilike(f"%{q}%"),
                Lead.company.ilike(f"%{q}%"),
            )
        )
    if status:
        query = query.filter_by(status=status)
    if source:
        query = query.filter_by(source=source)
    query = query.order_by(Lead.created_at.desc())
    result = paginate_query(query, leads_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@crm_bp.route("/leads/<int:lead_id>", methods=["GET"])
@tenant_required
def get_lead(lead_id, org_id, current_user):
    lead = Lead.query.filter_by(id=lead_id, organization_id=org_id).first_or_404()
    return success_response(lead_schema.dump(lead))


@crm_bp.route("/leads", methods=["POST"])
@tenant_required
def create_lead(org_id, current_user):
    try:
        data = lead_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["created_by"] = current_user.id
    lead = Lead(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(lead)
    db.session.commit()
    return success_response(lead_schema.dump(lead), "Lead created", 201)


@crm_bp.route("/leads/<int:lead_id>", methods=["PUT"])
@tenant_required
def update_lead(lead_id, org_id, current_user):
    lead = Lead.query.filter_by(id=lead_id, organization_id=org_id).first_or_404()
    try:
        data = lead_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id", "created_by"):
            setattr(lead, k, v)
    db.session.commit()
    return success_response(lead_schema.dump(lead), "Lead updated")


@crm_bp.route("/leads/<int:lead_id>", methods=["DELETE"])
@tenant_required
def delete_lead(lead_id, org_id, current_user):
    lead = Lead.query.filter_by(id=lead_id, organization_id=org_id).first_or_404()
    db.session.delete(lead)
    db.session.commit()
    return success_response(message="Lead deleted")


# ─── DEALS ────────────────────────────────────────────────────────────────────

@crm_bp.route("/deals", methods=["GET"])
@tenant_required
def list_deals(org_id, current_user):
    page, per_page = get_pagination_params()
    stage = request.args.get("stage")
    query = Deal.query.filter_by(organization_id=org_id)
    if stage:
        query = query.filter_by(stage=stage)
    query = query.order_by(Deal.created_at.desc())
    result = paginate_query(query, deals_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@crm_bp.route("/deals/<int:deal_id>", methods=["GET"])
@tenant_required
def get_deal(deal_id, org_id, current_user):
    deal = Deal.query.filter_by(id=deal_id, organization_id=org_id).first_or_404()
    return success_response(deal_schema.dump(deal))


@crm_bp.route("/deals", methods=["POST"])
@tenant_required
def create_deal(org_id, current_user):
    try:
        data = deal_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    deal = Deal(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(deal)
    db.session.commit()
    return success_response(deal_schema.dump(deal), "Deal created", 201)


@crm_bp.route("/deals/<int:deal_id>", methods=["PUT"])
@tenant_required
def update_deal(deal_id, org_id, current_user):
    deal = Deal.query.filter_by(id=deal_id, organization_id=org_id).first_or_404()
    try:
        data = deal_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    if data.get("stage") in ("closed_won", "closed_lost") and not deal.actual_close_date:
        deal.actual_close_date = datetime.utcnow().date()
    for k, v in data.items():
        if k not in ("organization_id",):
            setattr(deal, k, v)
    db.session.commit()
    return success_response(deal_schema.dump(deal), "Deal updated")


@crm_bp.route("/deals/<int:deal_id>", methods=["DELETE"])
@tenant_required
def delete_deal(deal_id, org_id, current_user):
    deal = Deal.query.filter_by(id=deal_id, organization_id=org_id).first_or_404()
    db.session.delete(deal)
    db.session.commit()
    return success_response(message="Deal deleted")


# ─── PIPELINE ─────────────────────────────────────────────────────────────────

@crm_bp.route("/pipeline", methods=["GET"])
@tenant_required
def pipeline(org_id, current_user):
    stages = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]
    result = {}
    for stage in stages:
        deals = Deal.query.filter_by(organization_id=org_id, stage=stage).all()
        result[stage] = {
            "count": len(deals),
            "total_value": float(sum(d.value or 0 for d in deals)),
            "deals": deals_schema.dump(deals),
        }
    return success_response(result)


# ─── ACTIVITIES ───────────────────────────────────────────────────────────────

@crm_bp.route("/activities", methods=["GET"])
@tenant_required
def list_activities(org_id, current_user):
    page, per_page = get_pagination_params()
    lead_id = request.args.get("lead_id", type=int)
    deal_id = request.args.get("deal_id", type=int)
    status = request.args.get("status")

    query = Activity.query.filter_by(organization_id=org_id)
    if lead_id:
        query = query.filter_by(lead_id=lead_id)
    if deal_id:
        query = query.filter_by(deal_id=deal_id)
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(Activity.created_at.desc())
    result = paginate_query(query, activities_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@crm_bp.route("/activities", methods=["POST"])
@tenant_required
def create_activity(org_id, current_user):
    try:
        data = activity_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["created_by"] = current_user.id
    activity = Activity(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(activity)
    db.session.commit()
    return success_response(activity_schema.dump(activity), "Activity created", 201)


@crm_bp.route("/activities/<int:act_id>/complete", methods=["PUT"])
@tenant_required
def complete_activity(act_id, org_id, current_user):
    activity = Activity.query.filter_by(id=act_id, organization_id=org_id).first_or_404()
    activity.status = "completed"
    activity.completed_at = datetime.utcnow()
    db.session.commit()
    return success_response(activity_schema.dump(activity), "Activity completed")


# ─── ANALYTICS ────────────────────────────────────────────────────────────────

@crm_bp.route("/analytics/conversion", methods=["GET"])
@tenant_required
def conversion_analytics(org_id, current_user):
    from app.services.crm_service import conversion_stats
    return success_response(conversion_stats(org_id))


@crm_bp.route("/analytics/pipeline", methods=["GET"])
@tenant_required
def pipeline_analytics(org_id, current_user):
    from app.services.crm_service import get_pipeline_summary
    return success_response(get_pipeline_summary(org_id))
