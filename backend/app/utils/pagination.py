from flask import request


def apply_filters(query, model, allowed_filters: list):
    """Apply query string filters to a SQLAlchemy query for allowed fields."""
    for field in allowed_filters:
        val = request.args.get(field)
        if val is not None:
            query = query.filter(getattr(model, field) == val)
    return query


def apply_search(query, model, fields: list, term: str):
    """Apply ILIKE search across multiple text columns."""
    from app.extensions import db
    if not term:
        return query
    conditions = [getattr(model, f).ilike(f"%{term}%") for f in fields if hasattr(model, f)]
    if conditions:
        query = query.filter(db.or_(*conditions))
    return query


def apply_date_range(query, model, field: str, from_key="date_from", to_key="date_to"):
    """Filter by date range from request args."""
    date_from = request.args.get(from_key)
    date_to = request.args.get(to_key)
    col = getattr(model, field)
    if date_from:
        query = query.filter(col >= date_from)
    if date_to:
        query = query.filter(col <= date_to)
    return query


def apply_sort(query, model, default_col="created_at", default_dir="desc"):
    """Apply sorting from request args: ?sort=created_at&dir=asc"""
    sort_col = request.args.get("sort", default_col)
    sort_dir = request.args.get("dir", default_dir).lower()
    if hasattr(model, sort_col):
        col = getattr(model, sort_col)
        query = query.order_by(col.desc() if sort_dir == "desc" else col.asc())
    return query
