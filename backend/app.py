from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, bcrypt, User, Lead, Deal, Employee, Invoice, Post, Connection, Message
from config import Config
from datetime import datetime, timedelta
import uuid
import json
from functools import wraps

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=Config.CORS_ORIGINS)
jwt = JWTManager(app)

db.init_app(app)
bcrypt.init_app(app)

# API Key Authentication
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key != Config.API_KEY:
            return jsonify({'error': 'Invalid API Key'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Create tables
with app.app_context():
    db.create_all()

# ============================================
# AUTHENTICATION ROUTES
# ============================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        uuid=str(uuid.uuid4()),
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone', ''),
        role=data.get('role', 'freelancer')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'success': True,
        'token': access_token,
        'user': user.to_dict()
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'success': True,
        'token': access_token,
        'user': user.to_dict()
    })

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({'user': user.to_dict()})

# ============================================
# CRM ROUTES (Leads & Deals)
# ============================================

@app.route('/api/crm/leads', methods=['GET'])
@jwt_required()
def get_leads():
    user_id = get_jwt_identity()
    leads = Lead.query.filter_by(user_id=user_id).all()
    return jsonify({'leads': [lead.to_dict() for lead in leads]})

@app.route('/api/crm/leads', methods=['POST'])
@jwt_required()
def create_lead():
    user_id = get_jwt_identity()
    data = request.json
    
    lead = Lead(
        user_id=user_id,
        name=data['name'],
        email=data['email'],
        phone=data.get('phone'),
        company=data.get('company'),
        industry=data.get('industry'),
        expected_value=data.get('expected_value', 0),
        probability=data.get('probability', 0)
    )
    
    db.session.add(lead)
    db.session.commit()
    
    return jsonify({'success': True, 'lead': lead.to_dict()}), 201

@app.route('/api/crm/leads/<int:lead_id>', methods=['PUT'])
@jwt_required()
def update_lead(lead_id):
    lead = Lead.query.get_or_404(lead_id)
    data = request.json
    
    for key, value in data.items():
        if hasattr(lead, key):
            setattr(lead, key, value)
    
    db.session.commit()
    return jsonify({'success': True, 'lead': lead.to_dict()})

@app.route('/api/crm/leads/<int:lead_id>', methods=['DELETE'])
@jwt_required()
def delete_lead(lead_id):
    lead = Lead.query.get_or_404(lead_id)
    db.session.delete(lead)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/crm/deals', methods=['GET'])
@jwt_required()
def get_deals():
    user_id = get_jwt_identity()
    deals = Deal.query.filter_by(user_id=user_id).all()
    return jsonify({'deals': [deal.to_dict() for deal in deals]})

@app.route('/api/crm/deals', methods=['POST'])
@jwt_required()
def create_deal():
    user_id = get_jwt_identity()
    data = request.json
    
    deal = Deal(
        lead_id=data['lead_id'],
        user_id=user_id,
        name=data['name'],
        value=data.get('value', 0),
        probability=data.get('probability', 0),
        stage=data.get('stage', 'prospecting')
    )
    
    db.session.add(deal)
    db.session.commit()
    
    return jsonify({'success': True, 'deal': deal.to_dict()}), 201

# ============================================
# HR ROUTES (Employees)
# ============================================

@app.route('/api/hr/employees', methods=['GET'])
@jwt_required()
def get_employees():
    user_id = get_jwt_identity()
    employees = Employee.query.filter_by(user_id=user_id).all()
    return jsonify({'employees': [emp.to_dict() for emp in employees]})

@app.route('/api/hr/employees', methods=['POST'])
@jwt_required()
def create_employee():
    user_id = get_jwt_identity()
    data = request.json
    
    employee = Employee(
        user_id=user_id,
        employee_number=data['employee_number'],
        national_id=data['national_id'],
        kra_pin=data.get('kra_pin'),
        nssf_number=data.get('nssf_number'),
        position=data.get('position'),
        department=data.get('department'),
        basic_salary=data.get('basic_salary', 0),
        housing_allowance=data.get('housing_allowance', 0),
        transport_allowance=data.get('transport_allowance', 0),
        employment_date=datetime.strptime(data['employment_date'], '%Y-%m-%d') if data.get('employment_date') else None
    )
    
    db.session.add(employee)
    db.session.commit()
    
    return jsonify({'success': True, 'employee': employee.to_dict()}), 201

@app.route('/api/hr/employees/<int:emp_id>', methods=['PUT'])
@jwt_required()
def update_employee(emp_id):
    employee = Employee.query.get_or_404(emp_id)
    data = request.json
    
    for key, value in data.items():
        if hasattr(employee, key):
            setattr(employee, key, value)
    
    db.session.commit()
    return jsonify({'success': True, 'employee': employee.to_dict()})

@app.route('/api/hr/employees/<int:emp_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(emp_id):
    employee = Employee.query.get_or_404(emp_id)
    db.session.delete(employee)
    db.session.commit()
    return jsonify({'success': True})

# ============================================
# ACCOUNTING ROUTES (Invoices)
# ============================================

@app.route('/api/accounting/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    user_id = get_jwt_identity()
    invoices = Invoice.query.filter_by(user_id=user_id).all()
    return jsonify({'invoices': [inv.to_dict() for inv in invoices]})

@app.route('/api/accounting/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    user_id = get_jwt_identity()
    data = request.json
    
    # Generate invoice number
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    invoice = Invoice(
        user_id=user_id,
        invoice_number=invoice_number,
        amount=data['amount'],
        tax=data.get('tax', 0),
        total=data['amount'] + data.get('tax', 0),
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d') if data.get('due_date') else None
    )
    
    db.session.add(invoice)
    db.session.commit()
    
    return jsonify({'success': True, 'invoice': invoice.to_dict()}), 201

@app.route('/api/accounting/invoices/<int:invoice_id>/pay', methods=['POST'])
@jwt_required()
def pay_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    invoice.status = 'paid'
    invoice.paid_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'success': True, 'invoice': invoice.to_dict()})

# ============================================
# NETWORKING ROUTES (Posts, Connections, Messages)
# ============================================

@app.route('/api/networking/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).limit(50).all()
    return jsonify({'posts': [post.to_dict() for post in posts]})

@app.route('/api/networking/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    data = request.json
    
    post = Post(
        user_id=user_id,
        content=data['content'],
        media_url=data.get('media_url')
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({'success': True, 'post': post.to_dict()}), 201

@app.route('/api/networking/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    post = Post.query.get_or_404(post_id)
    post.likes += 1
    db.session.commit()
    return jsonify({'success': True, 'likes': post.likes})

@app.route('/api/networking/connections', methods=['GET'])
@jwt_required()
def get_connections():
    user_id = get_jwt_identity()
    connections = Connection.query.filter_by(user_id=user_id).all()
    return jsonify({'connections': [conn.to_dict() for conn in connections]})

@app.route('/api/networking/connections', methods=['POST'])
@jwt_required()
def create_connection():
    user_id = get_jwt_identity()
    data = request.json
    
    connection = Connection(
        user_id=user_id,
        connected_user_id=data['connected_user_id']
    )
    
    db.session.add(connection)
    db.session.commit()
    
    return jsonify({'success': True, 'connection': connection.to_dict()}), 201

@app.route('/api/networking/messages', methods=['GET'])
@jwt_required()
def get_messages():
    user_id = get_jwt_identity()
    messages = Message.query.filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.created_at.desc()).limit(100).all()
    
    return jsonify({'messages': [msg.to_dict() for msg in messages]})

@app.route('/api/networking/messages', methods=['POST'])
@jwt_required()
def send_message():
    user_id = get_jwt_identity()
    data = request.json
    
    message = Message(
        sender_id=user_id,
        receiver_id=data['receiver_id'],
        content=data['content']
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({'success': True, 'message': message.to_dict()}), 201

# ============================================
# DASHBOARD STATS
# ============================================

@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user_id = get_jwt_identity()
    
    stats = {
        'leads': Lead.query.filter_by(user_id=user_id).count(),
        'deals': Deal.query.filter_by(user_id=user_id).count(),
        'employees': Employee.query.filter_by(user_id=user_id).count(),
        'invoices': Invoice.query.filter_by(user_id=user_id).count(),
        'posts': Post.query.count(),
        'connections': Connection.query.filter_by(user_id=user_id).count(),
        'messages': Message.query.filter(
            (Message.sender_id == user_id) | (Message.receiver_id == user_id)
        ).count(),
        'revenue': db.session.query(db.func.sum(Invoice.amount)).filter_by(user_id=user_id, status='paid').scalar() or 0
    }
    
    return jsonify({'stats': stats})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
