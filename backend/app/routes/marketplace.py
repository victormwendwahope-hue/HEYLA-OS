from flask import Blueprint, request
from marshmallow import ValidationError
from app.extensions import db
from app.models.marketplace import Job, Application, Proposal
from app.schemas.marketplace_schema import JobSchema, ApplicationSchema, ProposalSchema
from app.utils.helpers import success_response, error_response, paginate_query, get_pagination_params
from app.middleware.tenant import tenant_required

marketplace_bp = Blueprint("marketplace", __name__)
job_schema = JobSchema()
jobs_schema = JobSchema(many=True)
app_schema = ApplicationSchema()
apps_schema = ApplicationSchema(many=True)
proposal_schema = ProposalSchema()
proposals_schema = ProposalSchema(many=True)


# ─── JOBS ─────────────────────────────────────────────────────────────────────

@marketplace_bp.route("/jobs", methods=["GET"])
@tenant_required
def list_jobs(org_id, current_user):
    page, per_page = get_pagination_params()
    status = request.args.get("status")
    job_type = request.args.get("job_type")
    q = request.args.get("q", "")

    query = Job.query.filter_by(organization_id=org_id)
    if status:
        query = query.filter_by(status=status)
    if job_type:
        query = query.filter_by(job_type=job_type)
    if q:
        query = query.filter(
            db.or_(Job.title.ilike(f"%{q}%"), Job.description.ilike(f"%{q}%"))
        )
    query = query.order_by(Job.created_at.desc())
    result = paginate_query(query, jobs_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@marketplace_bp.route("/jobs/<int:job_id>", methods=["GET"])
@tenant_required
def get_job(job_id, org_id, current_user):
    job = Job.query.filter_by(id=job_id, organization_id=org_id).first_or_404()
    return success_response(job_schema.dump(job))


@marketplace_bp.route("/jobs", methods=["POST"])
@tenant_required
def create_job(org_id, current_user):
    try:
        data = job_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    data["posted_by"] = current_user.id
    job = Job(organization_id=org_id, **{k: v for k, v in data.items() if k != "organization_id"})
    db.session.add(job)
    db.session.commit()
    return success_response(job_schema.dump(job), "Job posted", 201)


@marketplace_bp.route("/jobs/<int:job_id>", methods=["PUT"])
@tenant_required
def update_job(job_id, org_id, current_user):
    job = Job.query.filter_by(id=job_id, organization_id=org_id).first_or_404()
    try:
        data = job_schema.load(request.json or {}, partial=True)
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    for k, v in data.items():
        if k not in ("organization_id", "posted_by"):
            setattr(job, k, v)
    db.session.commit()
    return success_response(job_schema.dump(job), "Job updated")


@marketplace_bp.route("/jobs/<int:job_id>", methods=["DELETE"])
@tenant_required
def delete_job(job_id, org_id, current_user):
    job = Job.query.filter_by(id=job_id, organization_id=org_id).first_or_404()
    db.session.delete(job)
    db.session.commit()
    return success_response(message="Job deleted")


@marketplace_bp.route("/jobs/<int:job_id>/close", methods=["PUT"])
@tenant_required
def close_job(job_id, org_id, current_user):
    job = Job.query.filter_by(id=job_id, organization_id=org_id).first_or_404()
    job.status = "closed"
    db.session.commit()
    return success_response(job_schema.dump(job), "Job closed")


# ─── APPLICATIONS ─────────────────────────────────────────────────────────────

@marketplace_bp.route("/jobs/<int:job_id>/applications", methods=["GET"])
@tenant_required
def list_applications(job_id, org_id, current_user):
    page, per_page = get_pagination_params()
    job = Job.query.filter_by(id=job_id, organization_id=org_id).first_or_404()
    status = request.args.get("status")
    query = Application.query.filter_by(job_id=job_id)
    if status:
        query = query.filter_by(status=status)
    query = query.order_by(Application.applied_at.desc())
    result = paginate_query(query, apps_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@marketplace_bp.route("/jobs/<int:job_id>/apply", methods=["POST"])
@tenant_required
def apply_to_job(job_id, org_id, current_user):
    job = Job.query.filter_by(id=job_id, organization_id=org_id).first_or_404()
    if job.status != "open":
        return error_response("Job is not accepting applications", 400)
    try:
        data = app_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    application = Application(job_id=job_id, **{k: v for k, v in data.items() if k != "job_id"})
    db.session.add(application)
    db.session.commit()
    return success_response(app_schema.dump(application), "Application submitted", 201)


@marketplace_bp.route("/applications/<int:app_id>/status", methods=["PUT"])
@tenant_required
def update_application_status(app_id, org_id, current_user):
    application = Application.query.get_or_404(app_id)
    # Verify ownership
    job = Job.query.filter_by(id=application.job_id, organization_id=org_id).first_or_404()
    new_status = request.json.get("status")
    valid = ["submitted", "reviewing", "shortlisted", "rejected", "hired"]
    if new_status not in valid:
        return error_response(f"Status must be one of: {valid}", 400)
    application.status = new_status
    db.session.commit()
    return success_response(app_schema.dump(application), "Status updated")


# ─── PROPOSALS ────────────────────────────────────────────────────────────────

@marketplace_bp.route("/jobs/<int:job_id>/proposals", methods=["GET"])
@tenant_required
def list_proposals(job_id, org_id, current_user):
    page, per_page = get_pagination_params()
    job = Job.query.filter_by(id=job_id, organization_id=org_id).first_or_404()
    query = Proposal.query.filter_by(job_id=job_id).order_by(Proposal.created_at.desc())
    result = paginate_query(query, proposals_schema, page, per_page)
    return success_response(result["items"], meta=result["meta"])


@marketplace_bp.route("/jobs/<int:job_id>/proposals", methods=["POST"])
@tenant_required
def create_proposal(job_id, org_id, current_user):
    job = Job.query.filter_by(id=job_id, organization_id=org_id).first_or_404()
    try:
        data = proposal_schema.load(request.json or {})
    except ValidationError as e:
        return error_response("Validation failed", 422, e.messages)
    proposal = Proposal(
        organization_id=org_id,
        job_id=job_id,
        **{k: v for k, v in data.items() if k not in ("organization_id", "job_id")},
    )
    db.session.add(proposal)
    db.session.commit()
    return success_response(proposal_schema.dump(proposal), "Proposal submitted", 201)


@marketplace_bp.route("/proposals/<int:prop_id>/accept", methods=["PUT"])
@tenant_required
def accept_proposal(prop_id, org_id, current_user):
    proposal = Proposal.query.filter_by(id=prop_id, organization_id=org_id).first_or_404()
    proposal.status = "accepted"
    db.session.commit()
    return success_response(proposal_schema.dump(proposal), "Proposal accepted")


@marketplace_bp.route("/proposals/<int:prop_id>/reject", methods=["PUT"])
@tenant_required
def reject_proposal(prop_id, org_id, current_user):
    proposal = Proposal.query.filter_by(id=prop_id, organization_id=org_id).first_or_404()
    proposal.status = "rejected"
    db.session.commit()
    return success_response(proposal_schema.dump(proposal), "Proposal rejected")
