"""
Inventory service — stock alerts and valuation helpers.
"""
from app.models.inventory import Product, Equipment
from app.extensions import db
from sqlalchemy import func


def get_low_stock_products(org_id: int) -> list:
    """Return products at or below their reorder level."""
    products = Product.query.filter(
        Product.organization_id == org_id,
        Product.quantity <= Product.reorder_level,
        Product.is_active == True,
    ).order_by(Product.quantity.asc()).all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category,
            "quantity": p.quantity,
            "reorder_level": p.reorder_level,
            "shortage": p.reorder_level - p.quantity,
            "unit_price": float(p.unit_price or 0),
        }
        for p in products
    ]


def get_inventory_valuation(org_id: int) -> dict:
    """Compute total stock value at cost and at selling price."""
    result = db.session.query(
        func.sum(Product.quantity * Product.cost_price).label("cost_value"),
        func.sum(Product.quantity * Product.unit_price).label("selling_value"),
        func.count(Product.id).label("total_products"),
        func.sum(Product.quantity).label("total_units"),
    ).filter(
        Product.organization_id == org_id,
        Product.is_active == True,
    ).first()

    return {
        "total_products": result.total_products or 0,
        "total_units": int(result.total_units or 0),
        "cost_value": float(result.cost_value or 0),
        "selling_value": float(result.selling_value or 0),
        "potential_margin": float((result.selling_value or 0) - (result.cost_value or 0)),
    }


def get_equipment_due_maintenance(org_id: int) -> list:
    """Return equipment where next maintenance date is overdue or today."""
    from datetime import date
    equipment = Equipment.query.filter(
        Equipment.organization_id == org_id,
        Equipment.next_maintenance_date != None,
        Equipment.next_maintenance_date <= date.today(),
        Equipment.status != "retired",
    ).order_by(Equipment.next_maintenance_date.asc()).all()

    return [
        {
            "id": e.id,
            "name": e.name,
            "serial_number": e.serial_number,
            "category": e.category,
            "status": e.status,
            "next_maintenance_date": e.next_maintenance_date.isoformat(),
            "days_overdue": (date.today() - e.next_maintenance_date).days,
        }
        for e in equipment
    ]
