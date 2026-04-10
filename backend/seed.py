"""
Seed script for HEYLA OS.
Run: flask shell < seed.py  OR  python seed.py
"""
import os
import sys
from datetime import date, datetime, timedelta
import random

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("FLASK_ENV", "development")

from app import create_app
from app.extensions import db, bcrypt
from app.models.country import Country
from app.models.organization import Organization
from app.models.user import User, Role, UserRole
from app.models.hr import Employee, Attendance, LeaveRequest, PerformanceReview, Injury
from app.models.accounting import Invoice, Payment, Expense, Payroll
from app.models.crm import Lead, Deal, Activity
from app.models.inventory import Product, Equipment, MaintenanceLog
from app.models.transport import Vehicle, Driver, Trip
from app.models.fuel import FuelLog
from app.models.networking import Post, Comment, Message
from app.models.marketplace import Job, Application
from app.models.settings import OrganizationProfile, UserSettings

app = create_app("development")

with app.app_context():
    print("Dropping all tables...")
    db.drop_all()
    print("Creating all tables...")
    db.create_all()

    # ── COUNTRIES ──────────────────────────────────────────────────────────────
    print("Seeding countries...")
    countries_data = [
        {"name": "United States", "code": "US", "currency": "USD", "currency_symbol": "$", "tax_rate": 8.5},
        {"name": "United Kingdom", "code": "GB", "currency": "GBP", "currency_symbol": "£", "tax_rate": 20.0},
        {"name": "Kenya", "code": "KE", "currency": "KES", "currency_symbol": "KSh", "tax_rate": 16.0},
        {"name": "Nigeria", "code": "NG", "currency": "NGN", "currency_symbol": "₦", "tax_rate": 7.5},
        {"name": "South Africa", "code": "ZA", "currency": "ZAR", "currency_symbol": "R", "tax_rate": 15.0},
        {"name": "Germany", "code": "DE", "currency": "EUR", "currency_symbol": "€", "tax_rate": 19.0},
        {"name": "Canada", "code": "CA", "currency": "CAD", "currency_symbol": "CA$", "tax_rate": 5.0},
        {"name": "India", "code": "IN", "currency": "INR", "currency_symbol": "₹", "tax_rate": 18.0},
        {"name": "Australia", "code": "AU", "currency": "AUD", "currency_symbol": "A$", "tax_rate": 10.0},
        {"name": "UAE", "code": "AE", "currency": "AED", "currency_symbol": "د.إ", "tax_rate": 5.0},
    ]
    countries = {}
    for c in countries_data:
        country = Country(**c)
        db.session.add(country)
        db.session.flush()
        countries[c["code"]] = country

    # ── ROLES ──────────────────────────────────────────────────────────────────
    print("Seeding roles...")
    roles = {}
    for role_name, desc in [("admin", "Full access"), ("manager", "Team management"), ("employee", "Standard access")]:
        role = Role(name=role_name, description=desc)
        db.session.add(role)
        db.session.flush()
        roles[role_name] = role

    # ── ORGANIZATION ───────────────────────────────────────────────────────────
    print("Seeding organization...")
    org = Organization(
        name="Heyla Demo Corp",
        slug="heyla-demo-corp",
        industry="Technology",
        email="admin@heylademo.com",
        phone="+1-555-0100",
        address="123 Innovation Drive, San Francisco, CA 94105",
        country_id=countries["US"].id,
        plan="pro",
    )
    db.session.add(org)
    db.session.flush()

    org_profile = OrganizationProfile(
        organization_id=org.id,
        tagline="Powering business operations with AI",
        description="Heyla Demo Corp is a technology company using HEYLA OS to manage its operations.",
        founded_year=2020,
        employee_count=50,
        registration_number="REG-2020-001",
        tax_number="TAX-987654",
        default_currency="USD",
        timezone="America/Los_Angeles",
    )
    db.session.add(org_profile)

    # ── USERS ──────────────────────────────────────────────────────────────────
    print("Seeding users...")
    users_data = [
        {"email": "admin@heylademo.com", "first_name": "Alex", "last_name": "Admin", "role": "admin", "is_owner": True},
        {"email": "manager@heylademo.com", "first_name": "Morgan", "last_name": "Manager", "role": "manager"},
        {"email": "employee@heylademo.com", "first_name": "Sam", "last_name": "Employee", "role": "employee"},
        {"email": "alice@heylademo.com", "first_name": "Alice", "last_name": "Chen", "role": "employee"},
        {"email": "bob@heylademo.com", "first_name": "Bob", "last_name": "Smith", "role": "manager"},
    ]
    users = {}
    for u in users_data:
        pw = bcrypt.generate_password_hash("Password123!").decode("utf-8")
        user = User(
            organization_id=org.id,
            email=u["email"],
            password_hash=pw,
            first_name=u["first_name"],
            last_name=u["last_name"],
            is_owner=u.get("is_owner", False),
            is_active=True,
        )
        db.session.add(user)
        db.session.flush()
        db.session.add(UserRole(user_id=user.id, role_id=roles[u["role"]].id))
        db.session.add(UserSettings(user_id=user.id))
        users[u["email"]] = user

    admin_user = users["admin@heylademo.com"]

    # ── EMPLOYEES ──────────────────────────────────────────────────────────────
    print("Seeding employees...")
    emp_data = [
        ("John", "Doe", "Engineering", "Senior Developer", 95000),
        ("Jane", "Smith", "Engineering", "Frontend Developer", 85000),
        ("Carlos", "Rivera", "Sales", "Sales Manager", 75000),
        ("Aisha", "Patel", "HR", "HR Manager", 70000),
        ("Liam", "Johnson", "Finance", "Financial Analyst", 72000),
        ("Sophie", "Brown", "Marketing", "Marketing Lead", 68000),
        ("David", "Kim", "Engineering", "DevOps Engineer", 90000),
        ("Emma", "Wilson", "Sales", "Sales Rep", 55000),
        ("Omar", "Hassan", "Operations", "Operations Manager", 78000),
        ("Grace", "Lee", "HR", "HR Coordinator", 52000),
    ]
    employees = []
    for i, (fn, ln, dept, pos, sal) in enumerate(emp_data, 1):
        emp = Employee(
            organization_id=org.id,
            employee_number=f"EMP{i:04d}",
            first_name=fn,
            last_name=ln,
            email=f"{fn.lower()}.{ln.lower()}@heylademo.com",
            department=dept,
            position=pos,
            salary=sal,
            salary_currency="USD",
            hire_date=date.today() - timedelta(days=random.randint(30, 1500)),
            status="active",
            employment_type="full_time",
            phone=f"+1-555-{1000 + i:04d}",
            gender=random.choice(["male", "female"]),
        )
        db.session.add(emp)
        db.session.flush()
        employees.append(emp)

    # ── ATTENDANCE ─────────────────────────────────────────────────────────────
    print("Seeding attendance...")
    for emp in employees[:5]:
        for d in range(7):
            att_date = date.today() - timedelta(days=d)
            if att_date.weekday() < 5:
                db.session.add(Attendance(
                    organization_id=org.id,
                    employee_id=emp.id,
                    date=att_date,
                    status=random.choice(["present", "present", "present", "late"]),
                    clock_in=datetime.combine(att_date, datetime.min.time()).replace(hour=9),
                    clock_out=datetime.combine(att_date, datetime.min.time()).replace(hour=17),
                    hours_worked=8,
                ))

    # ── LEAVES ─────────────────────────────────────────────────────────────────
    print("Seeding leave requests...")
    for emp in employees[:4]:
        db.session.add(LeaveRequest(
            organization_id=org.id,
            employee_id=emp.id,
            leave_type=random.choice(["annual", "sick"]),
            start_date=date.today() + timedelta(days=random.randint(5, 30)),
            end_date=date.today() + timedelta(days=random.randint(31, 40)),
            days=random.randint(3, 7),
            reason="Personal reasons",
            status=random.choice(["pending", "approved", "rejected"]),
        ))

    # ── PERFORMANCE REVIEWS ────────────────────────────────────────────────────
    print("Seeding performance reviews...")
    for emp in employees[:3]:
        db.session.add(PerformanceReview(
            organization_id=org.id,
            employee_id=emp.id,
            reviewer_id=admin_user.id,
            review_period="Q1 2025",
            review_date=date.today() - timedelta(days=30),
            rating=random.choice([3.5, 4.0, 4.5, 5.0]),
            goals="Improve code quality and team communication",
            achievements="Delivered all sprint goals on time",
            areas_of_improvement="Documentation",
            status="submitted",
        ))

    # ── INJURIES ───────────────────────────────────────────────────────────────
    db.session.add(Injury(
        organization_id=org.id,
        employee_id=employees[0].id,
        incident_date=date.today() - timedelta(days=10),
        description="Minor cut on the finger during equipment handling",
        severity="minor",
        location="Warehouse",
        treatment="First aid applied",
        days_lost=1,
        reported_by=admin_user.id,
        status="closed",
    ))

    # ── INVOICES ───────────────────────────────────────────────────────────────
    print("Seeding invoices...")
    clients = ["Acme Corp", "TechStart Inc", "GlobalTrade Ltd", "Digital Solutions", "CloudBase LLC"]
    for i, client in enumerate(clients, 1):
        subtotal = random.uniform(1000, 20000)
        tax_amount = round(subtotal * 0.085, 2)
        total = round(subtotal + tax_amount, 2)
        inv = Invoice(
            organization_id=org.id,
            invoice_number=f"INV-{i:05d}",
            client_name=client,
            client_email=f"billing@{client.lower().replace(' ', '')}.com",
            issue_date=date.today() - timedelta(days=random.randint(0, 60)),
            due_date=date.today() + timedelta(days=random.randint(-5, 30)),
            status=random.choice(["draft", "sent", "paid", "paid", "overdue"]),
            subtotal=round(subtotal, 2),
            tax_rate=8.5,
            tax_amount=tax_amount,
            total=total,
            currency="USD",
            items=[{"description": "Consulting Services", "qty": 10, "unit_price": subtotal / 10}],
            created_by=admin_user.id,
        )
        db.session.add(inv)
        db.session.flush()
        if inv.status == "paid":
            db.session.add(Payment(
                organization_id=org.id,
                invoice_id=inv.id,
                amount=total,
                payment_date=inv.issue_date + timedelta(days=5),
                method="bank_transfer",
                recorded_by=admin_user.id,
            ))

    # ── EXPENSES ───────────────────────────────────────────────────────────────
    print("Seeding expenses...")
    expense_cats = [("Office Supplies", 250), ("Travel", 1200), ("Software", 500), ("Marketing", 3000), ("Utilities", 800)]
    for cat, amount in expense_cats:
        db.session.add(Expense(
            organization_id=org.id,
            category=cat,
            description=f"{cat} expense for operations",
            amount=amount,
            expense_date=date.today() - timedelta(days=random.randint(1, 30)),
            vendor=f"{cat} Vendor",
            status=random.choice(["approved", "pending"]),
            submitted_by=admin_user.id,
        ))

    # ── PAYROLL ────────────────────────────────────────────────────────────────
    print("Seeding payroll...")
    for emp in employees[:5]:
        sal = float(emp.salary or 5000)
        monthly = sal / 12
        tax = monthly * 0.2
        net = monthly - tax
        db.session.add(Payroll(
            organization_id=org.id,
            employee_id=emp.id,
            period_start=date.today().replace(day=1) - timedelta(days=30),
            period_end=date.today().replace(day=1) - timedelta(days=1),
            basic_salary=round(monthly, 2),
            tax=round(tax, 2),
            net_pay=round(net, 2),
            status="paid",
            payment_date=date.today().replace(day=1) - timedelta(days=1),
            processed_by=admin_user.id,
        ))

    # ── CRM LEADS ──────────────────────────────────────────────────────────────
    print("Seeding CRM...")
    lead_data = [
        ("Alice", "Johnson", "alice@prospect.com", "Tech Solutions", "website", "qualified"),
        ("Brian", "Lee", "brian@startup.io", "StartupIO", "referral", "contacted"),
        ("Clara", "Davis", "clara@enterprise.com", "Enterprise Co", "cold_call", "new"),
        ("Daniel", "Moore", "daniel@retail.com", "Retail Group", "social", "qualified"),
        ("Eva", "White", "eva@finance.com", "FinanceHub", "website", "new"),
    ]
    leads = []
    for fn, ln, email, company, source, status in lead_data:
        lead = Lead(
            organization_id=org.id,
            first_name=fn,
            last_name=ln,
            email=email,
            company=company,
            source=source,
            status=status,
            score=random.randint(20, 90),
            created_by=admin_user.id,
        )
        db.session.add(lead)
        db.session.flush()
        leads.append(lead)

    stages = ["prospecting", "qualification", "proposal", "closed_won", "closed_lost"]
    for i, lead in enumerate(leads[:5]):
        db.session.add(Deal(
            organization_id=org.id,
            lead_id=lead.id,
            title=f"Deal with {lead.full_name}",
            value=random.uniform(5000, 100000),
            stage=stages[i],
            probability=random.randint(10, 90),
            expected_close_date=date.today() + timedelta(days=random.randint(10, 90)),
            assigned_to=admin_user.id,
        ))

    # ── INVENTORY ──────────────────────────────────────────────────────────────
    print("Seeding inventory...")
    product_data = [
        ("Laptop Pro 15", "Electronics", "LPRO15", 1299.99, 950.00, 25, 5),
        ("Wireless Mouse", "Electronics", "WMSE01", 29.99, 15.00, 150, 20),
        ("Office Chair", "Furniture", "OCHR01", 399.99, 200.00, 30, 5),
        ("Standing Desk", "Furniture", "SDSK01", 799.99, 450.00, 10, 3),
        ("Monitor 27in", "Electronics", "MON27", 549.99, 320.00, 40, 8),
    ]
    for name, cat, sku, price, cost, qty, reorder in product_data:
        db.session.add(Product(
            organization_id=org.id,
            sku=sku,
            name=name,
            category=cat,
            unit_price=price,
            cost_price=cost,
            quantity=qty,
            reorder_level=reorder,
            is_active=True,
        ))

    eq = Equipment(
        organization_id=org.id,
        name="Industrial Printer",
        serial_number="PRN-2024-001",
        category="Office Equipment",
        brand="HP",
        model="LaserJet Pro",
        purchase_date=date.today() - timedelta(days=365),
        purchase_price=2500,
        condition="good",
        status="in_use",
        location="Office Floor 2",
    )
    db.session.add(eq)
    db.session.flush()
    db.session.add(MaintenanceLog(
        organization_id=org.id,
        equipment_id=eq.id,
        maintenance_date=date.today() - timedelta(days=30),
        maintenance_type="routine",
        description="Annual service and toner replacement",
        cost=150,
        performed_by="HP Service Center",
        status="completed",
    ))

    # ── TRANSPORT ──────────────────────────────────────────────────────────────
    print("Seeding transport...")
    vehicle_data = [
        ("KAA 123A", "Toyota", "Hilux", 2020, "truck"),
        ("KBB 456B", "Ford", "Transit", 2021, "van"),
        ("KCC 789C", "Mercedes", "Sprinter", 2022, "van"),
    ]
    vehicles = []
    for reg, make, model, year, vtype in vehicle_data:
        v = Vehicle(
            organization_id=org.id,
            registration_number=reg,
            make=make,
            model=model,
            year=year,
            type=vtype,
            fuel_type="petrol",
            status="active",
            mileage=random.randint(10000, 80000),
            insurance_expiry=date.today() + timedelta(days=random.randint(30, 365)),
        )
        db.session.add(v)
        db.session.flush()
        vehicles.append(v)

    driver_data = [
        ("James", "Mwangi", "DL-2020-001"),
        ("Peter", "Otieno", "DL-2019-002"),
        ("Mary", "Wanjiku", "DL-2021-003"),
    ]
    drivers = []
    for fn, ln, lic in driver_data:
        d = Driver(
            organization_id=org.id,
            first_name=fn,
            last_name=ln,
            license_number=lic,
            license_expiry=date.today() + timedelta(days=365),
            license_class="B",
            status="available",
        )
        db.session.add(d)
        db.session.flush()
        drivers.append(d)

    for i, v in enumerate(vehicles[:2]):
        db.session.add(Trip(
            organization_id=org.id,
            vehicle_id=v.id,
            driver_id=drivers[i].id,
            origin="Nairobi CBD",
            destination="Mombasa Port",
            departure_time=datetime.now() - timedelta(hours=5),
            status=random.choice(["completed", "in_progress"]),
            distance_km=480,
            created_by=admin_user.id,
        ))

    # ── FUEL ───────────────────────────────────────────────────────────────────
    print("Seeding fuel logs...")
    for v in vehicles:
        for d in range(5):
            liters = round(random.uniform(20, 60), 2)
            cost_per_liter = round(random.uniform(1.2, 1.8), 4)
            db.session.add(FuelLog(
                organization_id=org.id,
                vehicle_id=v.id,
                driver_id=random.choice(drivers).id,
                date=date.today() - timedelta(days=d * 7),
                liters=liters,
                cost_per_liter=cost_per_liter,
                total_cost=round(liters * cost_per_liter, 2),
                odometer=v.mileage + (d * 500),
                fuel_type="petrol",
                station="Shell Station",
                recorded_by=admin_user.id,
            ))

    # ── NETWORKING ─────────────────────────────────────────────────────────────
    print("Seeding networking...")
    post_contents = [
        "Excited to announce we've hit 50 employees! 🎉 Thanks to the whole team.",
        "Reminder: Q2 performance reviews start next week. Please prepare your self-assessments.",
        "Welcome our new Sales Manager, Carlos Rivera! Looking forward to great results.",
        "Team lunch this Friday at 12:30 PM. All are welcome!",
    ]
    posts = []
    for content in post_contents:
        post = Post(
            organization_id=org.id,
            author_id=admin_user.id,
            content=content,
            visibility="organization",
            likes_count=random.randint(0, 15),
        )
        db.session.add(post)
        db.session.flush()
        posts.append(post)
        db.session.add(Comment(
            post_id=post.id,
            author_id=users["manager@heylademo.com"].id,
            content="Great news! Congratulations to everyone involved.",
        ))

    # ── MARKETPLACE ────────────────────────────────────────────────────────────
    print("Seeding marketplace...")
    job_data = [
        ("Senior Python Developer", "full_time", "Engineering", "Remote", 120000, 150000),
        ("Marketing Specialist", "full_time", "Marketing", "San Francisco", 65000, 85000),
        ("Data Analyst (Freelance)", "freelance", "Analytics", "Remote", 40, 80),
        ("UX/UI Designer", "contract", "Design", "New York", 90000, 110000),
    ]
    for title, jtype, dept, loc, sal_min, sal_max in job_data:
        job = Job(
            organization_id=org.id,
            posted_by=admin_user.id,
            title=title,
            description=f"We are looking for an experienced {title} to join our growing team.",
            requirements="3+ years experience, strong communication skills",
            job_type=jtype,
            location=loc,
            is_remote=(loc == "Remote"),
            salary_min=sal_min,
            salary_max=sal_max,
            currency="USD",
            department=dept,
            status="open",
            deadline=date.today() + timedelta(days=30),
            skills=["Python", "SQL", "Communication"],
        )
        db.session.add(job)
        db.session.flush()
        db.session.add(Application(
            job_id=job.id,
            applicant_name="Candidate One",
            applicant_email="candidate@example.com",
            cover_letter="I am excited to apply for this role...",
            status="submitted",
        ))

    db.session.commit()
    print("\n✅ Seed data created successfully!")
    print("\n📋 Test Credentials:")
    print("  Admin:    admin@heylademo.com    / Password123!")
    print("  Manager:  manager@heylademo.com  / Password123!")
    print("  Employee: employee@heylademo.com / Password123!")
    print("\n🏢 Organization: Heyla Demo Corp (slug: heyla-demo-corp)")
