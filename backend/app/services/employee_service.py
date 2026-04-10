"""
Employee service — business logic helpers for the HR module.
"""
from datetime import date
from app.extensions import db
from app.models.hr import Employee, Attendance, LeaveRequest


def get_employee_summary(employee_id: int, org_id: int) -> dict:
    """
    Return a rich summary dict for a single employee including
    attendance stats, leave balance, and latest review.
    """
    emp = Employee.query.filter_by(id=employee_id, organization_id=org_id).first()
    if not emp:
        return None

    today = date.today()
    month_start = today.replace(day=1)

    # Attendance this month
    present = Attendance.query.filter(
        Attendance.employee_id == employee_id,
        Attendance.date >= month_start,
        Attendance.status == "present",
    ).count()

    late = Attendance.query.filter(
        Attendance.employee_id == employee_id,
        Attendance.date >= month_start,
        Attendance.status == "late",
    ).count()

    absent = Attendance.query.filter(
        Attendance.employee_id == employee_id,
        Attendance.date >= month_start,
        Attendance.status == "absent",
    ).count()

    # Leave days taken this year
    year_start = today.replace(month=1, day=1)
    leaves_taken = db.session.query(
        db.func.sum(LeaveRequest.days)
    ).filter(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.status == "approved",
        LeaveRequest.start_date >= year_start,
    ).scalar() or 0

    # Pending leaves
    pending_leaves = LeaveRequest.query.filter_by(
        employee_id=employee_id,
        status="pending",
    ).count()

    # Latest performance review rating
    from app.models.hr import PerformanceReview
    latest_review = PerformanceReview.query.filter_by(
        employee_id=employee_id,
    ).order_by(PerformanceReview.review_date.desc()).first()

    return {
        "employee_id": employee_id,
        "full_name": emp.full_name,
        "department": emp.department,
        "position": emp.position,
        "status": emp.status,
        "attendance_this_month": {
            "present": present,
            "late": late,
            "absent": absent,
        },
        "leave": {
            "days_taken_this_year": int(leaves_taken),
            "pending_requests": pending_leaves,
        },
        "latest_review_rating": float(latest_review.rating) if latest_review and latest_review.rating else None,
    }


def check_expiring_documents(org_id: int, days_ahead: int = 30) -> list:
    """
    Return a list of employee documents expiring within `days_ahead` days.
    """
    from app.models.hr import EmployeeDocument
    from datetime import timedelta

    cutoff = date.today() + timedelta(days=days_ahead)
    docs = EmployeeDocument.query.filter(
        EmployeeDocument.organization_id == org_id,
        EmployeeDocument.expiry_date != None,
        EmployeeDocument.expiry_date <= cutoff,
        EmployeeDocument.expiry_date >= date.today(),
    ).all()

    return [
        {
            "document_id": d.id,
            "employee_id": d.employee_id,
            "title": d.title,
            "document_type": d.document_type,
            "expiry_date": d.expiry_date.isoformat(),
            "days_until_expiry": (d.expiry_date - date.today()).days,
        }
        for d in docs
    ]


def check_expiring_work_permits(org_id: int, days_ahead: int = 30) -> list:
    """
    Return a list of employees whose work permits expire within `days_ahead` days.
    """
    from datetime import timedelta

    cutoff = date.today() + timedelta(days=days_ahead)
    employees = Employee.query.filter(
        Employee.organization_id == org_id,
        Employee.work_permit_expiry != None,
        Employee.work_permit_expiry <= cutoff,
        Employee.work_permit_expiry >= date.today(),
        Employee.status == "active",
    ).all()

    return [
        {
            "employee_id": e.id,
            "full_name": e.full_name,
            "work_permit_number": e.work_permit_number,
            "expiry_date": e.work_permit_expiry.isoformat(),
            "days_until_expiry": (e.work_permit_expiry - date.today()).days,
        }
        for e in employees
    ]
