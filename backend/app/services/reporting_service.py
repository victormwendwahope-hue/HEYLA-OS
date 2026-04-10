"""
Reporting service — provides reusable aggregation helpers used by dashboard
and module-level summary endpoints.
"""
from sqlalchemy import func
from app.extensions import db
from datetime import date, timedelta


def monthly_series(model, amount_col: str, date_col: str, org_id: int, months: int = 6) -> list:
    """
    Return a list of {month, total} dicts for the last N months.
    """
    result = []
    for i in range(months - 1, -1, -1):
        ref = date.today().replace(day=1) - timedelta(days=i * 30)
        month_start = ref.replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1) - timedelta(days=1)

        total = db.session.query(func.sum(getattr(model, amount_col))).filter(
            model.organization_id == org_id,
            getattr(model, date_col) >= month_start,
            getattr(model, date_col) <= month_end,
        ).scalar() or 0

        result.append({
            "month": month_start.strftime("%b %Y"),
            "total": float(total),
        })
    return result


def group_by_field(model, group_col: str, count_col: str, org_id: int, filters: dict = None) -> list:
    """
    Return [{field_value, count}] grouped by a column.
    """
    query = db.session.query(
        getattr(model, group_col),
        func.count(getattr(model, count_col)).label("count"),
    ).filter(model.organization_id == org_id)

    if filters:
        for k, v in filters.items():
            query = query.filter(getattr(model, k) == v)

    rows = query.group_by(getattr(model, group_col)).all()
    return [{"value": row[0] or "Unknown", "count": row[1]} for row in rows]


def sum_by_field(model, group_col: str, sum_col: str, org_id: int, filters: dict = None) -> list:
    """
    Return [{field_value, total}] summed by a column.
    """
    query = db.session.query(
        getattr(model, group_col),
        func.sum(getattr(model, sum_col)).label("total"),
    ).filter(model.organization_id == org_id)

    if filters:
        for k, v in filters.items():
            query = query.filter(getattr(model, k) == v)

    rows = query.group_by(getattr(model, group_col)).all()
    return [{"value": row[0] or "Unknown", "total": float(row[1] or 0)} for row in rows]
