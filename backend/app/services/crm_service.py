"""
CRM service — conversion analytics and pipeline helpers.
"""
from app.extensions import db
from app.models.crm import Lead, Deal
from sqlalchemy import func


def conversion_stats(org_id: int) -> dict:
    """
    Return lead-to-deal conversion rate and won/lost ratio.
    """
    total_leads = Lead.query.filter_by(organization_id=org_id).count()
    qualified = Lead.query.filter_by(organization_id=org_id, status="qualified").count()
    total_deals = Deal.query.filter_by(organization_id=org_id).count()

    won = Deal.query.filter_by(organization_id=org_id, stage="closed_won").count()
    lost = Deal.query.filter_by(organization_id=org_id, stage="closed_lost").count()

    won_value = db.session.query(func.sum(Deal.value)).filter_by(
        organization_id=org_id, stage="closed_won"
    ).scalar() or 0

    pipeline_value = db.session.query(func.sum(Deal.value)).filter(
        Deal.organization_id == org_id,
        Deal.stage.notin_(["closed_won", "closed_lost"]),
    ).scalar() or 0

    return {
        "total_leads": total_leads,
        "qualified_leads": qualified,
        "lead_qualification_rate": round(qualified / total_leads * 100, 1) if total_leads else 0,
        "total_deals": total_deals,
        "deals_won": won,
        "deals_lost": lost,
        "win_rate": round(won / (won + lost) * 100, 1) if (won + lost) else 0,
        "total_won_value": float(won_value),
        "pipeline_value": float(pipeline_value),
    }


def get_pipeline_summary(org_id: int) -> list:
    """
    Return deal counts and values grouped by stage in pipeline order.
    """
    stage_order = [
        "prospecting", "qualification", "proposal",
        "negotiation", "closed_won", "closed_lost",
    ]
    rows = db.session.query(
        Deal.stage,
        func.count(Deal.id).label("count"),
        func.sum(Deal.value).label("total_value"),
        func.avg(Deal.probability).label("avg_probability"),
    ).filter_by(organization_id=org_id).group_by(Deal.stage).all()

    stage_map = {r.stage: r for r in rows}

    return [
        {
            "stage": stage,
            "count": stage_map[stage].count if stage in stage_map else 0,
            "total_value": float(stage_map[stage].total_value or 0) if stage in stage_map else 0.0,
            "avg_probability": round(float(stage_map[stage].avg_probability or 0), 1) if stage in stage_map else 0.0,
        }
        for stage in stage_order
    ]
