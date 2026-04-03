from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    avatar = db.Column(db.String(500))
    role = db.Column(db.String(50), default='freelancer')
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    leads = db.relationship('Lead', backref='owner', lazy=True)
    deals = db.relationship('Deal', backref='owner', lazy=True)
    employees = db.relationship('Employee', backref='company', lazy=True)
    invoices = db.relationship('Invoice', backref='client', lazy=True)
    posts = db.relationship('Post', backref='author', lazy=True)
    connections = db.relationship('Connection', foreign_keys='Connection.user_id', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'uuid': self.uuid,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'phone': self.phone,
            'avatar': self.avatar or f"https://ui-avatars.com/api/?name={self.first_name}+{self.last_name}",
            'role': self.role,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Lead(db.Model):
    __tablename__ = 'crm_leads'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    company = db.Column(db.String(255))
    industry = db.Column(db.String(100))
    status = db.Column(db.String(50), default='new')
    score = db.Column(db.Integer, default=0)
    expected_value = db.Column(db.Numeric(12, 2), default=0)
    probability = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text)
    next_followup = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'company': self.company,
            'industry': self.industry,
            'status': self.status,
            'score': self.score,
            'expected_value': float(self.expected_value) if self.expected_value else 0,
            'probability': self.probability,
            'notes': self.notes,
            'next_followup': self.next_followup.isoformat() if self.next_followup else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Deal(db.Model):
    __tablename__ = 'crm_deals'
    
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('crm_leads.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Numeric(12, 2), default=0)
    probability = db.Column(db.Integer, default=0)
    stage = db.Column(db.String(50), default='prospecting')
    expected_close = db.Column(db.Date)
    actual_close = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'lead_id': self.lead_id,
            'name': self.name,
            'value': float(self.value) if self.value else 0,
            'probability': self.probability,
            'stage': self.stage,
            'expected_close': self.expected_close.isoformat() if self.expected_close else None,
            'actual_close': self.actual_close.isoformat() if self.actual_close else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Employee(db.Model):
    __tablename__ = 'hr_employees'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    employee_number = db.Column(db.String(50), unique=True, nullable=False)
    national_id = db.Column(db.String(20), unique=True, nullable=False)
    kra_pin = db.Column(db.String(11), unique=True)
    nssf_number = db.Column(db.String(20), unique=True)
    position = db.Column(db.String(100))
    department = db.Column(db.String(100))
    basic_salary = db.Column(db.Numeric(12, 2), default=0)
    housing_allowance = db.Column(db.Numeric(12, 2), default=0)
    transport_allowance = db.Column(db.Numeric(12, 2), default=0)
    employment_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'employee_number': self.employee_number,
            'national_id': self.national_id,
            'kra_pin': self.kra_pin,
            'nssf_number': self.nssf_number,
            'position': self.position,
            'department': self.department,
            'basic_salary': float(self.basic_salary) if self.basic_salary else 0,
            'housing_allowance': float(self.housing_allowance) if self.housing_allowance else 0,
            'transport_allowance': float(self.transport_allowance) if self.transport_allowance else 0,
            'employment_date': self.employment_date.isoformat() if self.employment_date else None,
            'status': self.status
        }

class Invoice(db.Model):
    __tablename__ = 'accounting_invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    amount = db.Column(db.Numeric(12, 2), default=0)
    tax = db.Column(db.Numeric(12, 2), default=0)
    total = db.Column(db.Numeric(12, 2), default=0)
    status = db.Column(db.String(20), default='pending')
    due_date = db.Column(db.Date)
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'amount': float(self.amount) if self.amount else 0,
            'tax': float(self.tax) if self.tax else 0,
            'total': float(self.total) if self.total else 0,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Post(db.Model):
    __tablename__ = 'networking_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(500))
    likes = db.Column(db.Integer, default=0)
    comments = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'media_url': self.media_url,
            'likes': self.likes,
            'comments': self.comments,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Connection(db.Model):
    __tablename__ = 'networking_connections'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    connected_user_id = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'connected_user_id': self.connected_user_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Message(db.Model):
    __tablename__ = 'networking_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, nullable=False)
    receiver_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'content': self.content,
            'read': self.read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
# ============================================
# INVENTORY MANAGEMENT MODELS
# ============================================

class Store(db.Model):
    __tablename__ = 'inventory_stores'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    store_code = db.Column(db.String(50), unique=True, nullable=False)
    store_name = db.Column(db.String(200), nullable=False)
    store_type = db.Column(db.String(50))  # warehouse, retail, distribution
    location = db.Column(db.String(500))
    address = db.Column(db.Text)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(255))
    manager_name = db.Column(db.String(200))
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'store_code': self.store_code,
            'store_name': self.store_name,
            'store_type': self.store_type,
            'location': self.location,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'manager_name': self.manager_name,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Category(db.Model):
    __tablename__ = 'inventory_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_code = db.Column(db.String(50), unique=True, nullable=False)
    category_name = db.Column(db.String(200), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('inventory_categories.id'))
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Self-referential relationship
    children = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))
    
    def to_dict(self):
        return {
            'id': self.id,
            'category_code': self.category_code,
            'category_name': self.category_name,
            'parent_id': self.parent_id,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Supplier(db.Model):
    __tablename__ = 'inventory_suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    supplier_code = db.Column(db.String(50), unique=True, nullable=False)
    supplier_name = db.Column(db.String(200), nullable=False)
    contact_person = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(255))
    address = db.Column(db.Text)
    tax_id = db.Column(db.String(50))
    payment_terms = db.Column(db.Integer, default=30)  # days
    status = db.Column(db.String(20), default='active')
    rating = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'supplier_code': self.supplier_code,
            'supplier_name': self.supplier_name,
            'contact_person': self.contact_person,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'tax_id': self.tax_id,
            'payment_terms': self.payment_terms,
            'status': self.status,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Product(db.Model):
    __tablename__ = 'inventory_products'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    store_id = db.Column(db.Integer, db.ForeignKey('inventory_stores.id'))
    category_id = db.Column(db.Integer, db.ForeignKey('inventory_categories.id'))
    supplier_id = db.Column(db.Integer, db.ForeignKey('inventory_suppliers.id'))
    product_code = db.Column(db.String(50), unique=True, nullable=False)
    barcode = db.Column(db.String(100), unique=True)
    product_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    unit_of_measure = db.Column(db.String(20))