#!/usr/bin/env python3
"""Safe superadmin creator for HEYLA OS production.
Run: cd backend && FLASK_APP=run.py flask shell < create_superadmin.py
OR: cd backend && python create_superadmin.py
Does NOT drop tables. Idempotent.
"""

import os
import sys
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))
config_name = os.getenv("FLASK_ENV", "production")

from app import create_app
from app.extensions import db, bcrypt
from app.models.organization import Organization
from app.models.user import User, Role, UserRole
from app.models.country import Country

app = create_app(config_name)

with app.app_context():
    print("🔍 Checking existing superadmin/org...")
    
    # Find US country (safe if tables missing)
    try:
        country = Country.query.filter_by(code="US").first()
    except Exception as e:
        if "relation \"countries\" does not exist" in str(e):
            print("⚠️ Countries table not ready, skipping superadmin (run seed.py later)")
            sys.exit(0)
        raise
    if not country:
        print("⚠️ US country not found. Run python seed.py to populate data.")
        sys.exit(0)
    
    superadmin = User.query.filter_by(email="heyla@gmail.com").first()
    if superadmin:
        print("✅ Superadmin already exists: heyla@gmail.com")
        sys.exit(0)
    
    # Find or create Heyla OS org
    heyla_org = Organization.query.filter_by(slug="heyla-os").first()
    if not heyla_org:
        print("Creating Heyla OS organization...")
        heyla_org = Organization(
            name="Heyla OS",
            slug="heyla-os",
            industry="SaaS",
            email="admin@heylaos.com",
            phone="+1-555-HEyla0",
            address="Global HQ",
            country_id=country.id,
            plan="enterprise",
        )
        db.session.add(heyla_org)
        db.session.flush()
        print(f"Org created: ID={heyla_org.id}, slug=heyla-os")
    else:
        print(f"✅ Heyla OS org exists: ID={heyla_org.id}")
    
    # Create admin role if missing
    admin_role = Role.query.filter_by(name="admin").first()
    if not admin_role:
        admin_role = Role(name="admin", description="Full system administrator")
        db.session.add(admin_role)
        db.session.flush()
        print("✅ Admin role created")
    
    # Create superadmin
    password = "Heyla@123"
    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    superadmin = User(
        organization_id=heyla_org.id,
        email="heyla@gmail.com",
        password_hash=pw_hash,
        first_name="Heyla",
        last_name="Superadmin",
        phone="+1-555-123-4567",
        is_owner=True,
        is_active=True,
    )
    db.session.add(superadmin)
    db.session.flush()
    
    # Assign admin role
    user_role = UserRole(user_id=superadmin.id, role_id=admin_role.id)
    db.session.add(user_role)
    
    db.session.commit()
    
    print("\n🎉 SUPERADMIN CREATED SUCCESSFULLY!")
    print("\n📋 Login Credentials:")
    print(f"  Email:    {superadmin.email}")
    print(f"  Password: {password}")
    print(f"  Org:      Heyla OS ({heyla_org.slug})")
    print("\n🚀 Backend URL: https://your-backend.onrender.com/api/v1/auth/login")
    print("\nNext: Test login via frontend or curl!")
