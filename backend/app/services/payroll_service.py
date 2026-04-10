"""
Payroll calculation service.
Handles country-aware tax computation and net pay derivation.
"""
from app.models.organization import Organization
from app.models.country import Country


def calculate_net_pay(
    basic_salary: float,
    allowances: float = 0.0,
    overtime: float = 0.0,
    deductions: float = 0.0,
    tax_rate: float = None,
    org_id: int = None,
) -> dict:
    """
    Compute gross, tax, and net pay.

    If tax_rate is not supplied, it is looked up from the organization's country.
    Returns a dict with: gross, tax_rate, tax, deductions, net_pay.
    """
    gross = basic_salary + allowances + overtime

    if tax_rate is None and org_id is not None:
        org = Organization.query.get(org_id)
        if org and org.country_id:
            country = Country.query.get(org.country_id)
            if country:
                tax_rate = float(country.tax_rate or 0)

    if tax_rate is None:
        tax_rate = 0.0

    tax = round(gross * tax_rate / 100, 2)
    net_pay = round(gross - tax - deductions, 2)

    return {
        "gross": round(gross, 2),
        "tax_rate": tax_rate,
        "tax": tax,
        "deductions": round(deductions, 2),
        "net_pay": net_pay,
    }


def bulk_process_payroll(organization_id: int, period_start, period_end, processed_by: int):
    """
    Generate payroll records for all active employees in an organization.
    Returns a list of created Payroll objects.
    """
    from app.extensions import db
    from app.models.hr import Employee
    from app.models.accounting import Payroll

    employees = Employee.query.filter_by(
        organization_id=organization_id,
        status="active",
    ).all()

    created = []
    for emp in employees:
        if not emp.salary:
            continue

        monthly = float(emp.salary) / 12
        result = calculate_net_pay(
            basic_salary=monthly,
            org_id=organization_id,
        )

        existing = Payroll.query.filter_by(
            organization_id=organization_id,
            employee_id=emp.id,
            period_start=period_start,
            period_end=period_end,
        ).first()

        if existing:
            continue

        payroll = Payroll(
            organization_id=organization_id,
            employee_id=emp.id,
            period_start=period_start,
            period_end=period_end,
            basic_salary=round(monthly, 2),
            allowances=0,
            overtime=0,
            deductions=result["deductions"],
            tax=result["tax"],
            net_pay=result["net_pay"],
            currency=emp.salary_currency or "USD",
            status="draft",
            processed_by=processed_by,
        )
        db.session.add(payroll)
        created.append(payroll)

    db.session.commit()
    return created
