# ============================================
# INVENTORY MANAGEMENT ENDPOINTS
# ============================================

# Products
@app.route('/api/inventory/products', methods=['GET'])
@jwt_required()
def get_inventory_products():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 12, type=int)
    category = request.args.get('category', type=int)
    store = request.args.get('store', type=int)
    stock_status = request.args.get('stock_status')
    search = request.args.get('search')
    
    query = Product.query.filter_by(user_id=user_id)
    
    if category:
        query = query.filter_by(category_id=category)
    if store:
        query = query.filter_by(store_id=store)
    if search:
        query = query.filter(Product.product_name.ilike(f'%{search}%') | Product.product_code.ilike(f'%{search}%'))
    
    products = query.offset((page - 1) * limit).limit(limit).all()
    total = query.count()
    
    return jsonify({
        'products': [p.to_dict() for p in products],
        'pagination': {
            'current_page': page,
            'per_page': limit,
            'total': total,
            'total_pages': (total + limit - 1) // limit
        }
    })

@app.route('/api/inventory/products/all', methods=['GET'])
@jwt_required()
def get_all_products():
    user_id = get_jwt_identity()
    products = Product.query.filter_by(user_id=user_id).all()
    return jsonify({'products': [p.to_dict() for p in products]})

@app.route('/api/inventory/products', methods=['POST'])
@jwt_required()
def create_inventory_product():
    user_id = get_jwt_identity()
    data = request.json
    
    product = Product(
        user_id=user_id,
        product_code=data['product_code'],
        barcode=data.get('barcode'),
        product_name=data['product_name'],
        description=data.get('description'),
        category_id=data.get('category_id'),
        store_id=data.get('store_id'),
        supplier_id=data.get('supplier_id'),
        unit_of_measure=data.get('unit_of_measure', 'pcs'),
        cost_price=data.get('cost_price', 0),
        selling_price=data.get('selling_price', 0),
        current_stock=data.get('initial_stock', 0),
        min_stock=data.get('min_stock', 10),
        location=data.get('location')
    )
    
    db.session.add(product)
    db.session.commit()
    
    # Create initial stock transaction
    if product.current_stock > 0:
        transaction = StockTransaction(
            product_id=product.id,
            store_id=product.store_id,
            type='stock_in',
            quantity=product.current_stock,
            reference='Initial stock',
            status='completed'
        )
        db.session.add(transaction)
        db.session.commit()
    
    return jsonify({'success': True, 'product': product.to_dict()}), 201

@app.route('/api/inventory/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_inventory_product(product_id):
    user_id = get_jwt_identity()
    product = Product.query.filter_by(id=product_id, user_id=user_id).first_or_404()
    data = request.json
    
    for key, value in data.items():
        if hasattr(product, key):
            setattr(product, key, value)
    
    db.session.commit()
    return jsonify({'success': True, 'product': product.to_dict()})

@app.route('/api/inventory/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_inventory_product(product_id):
    user_id = get_jwt_identity()
    product = Product.query.filter_by(id=product_id, user_id=user_id).first_or_404()
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({'success': True})

# Stock Transactions
@app.route('/api/inventory/stock-in', methods=['POST'])
@jwt_required()
def stock_in():
    user_id = get_jwt_identity()
    data = request.json
    
    product = Product.query.filter_by(id=data['product_id'], user_id=user_id).first_or_404()
    product.current_stock += data['quantity']
    
    transaction = StockTransaction(
        product_id=product.id,
        store_id=product.store_id,
        type='stock_in',
        quantity=data['quantity'],
        reference=data.get('reference'),
        notes=data.get('notes'),
        status='completed'
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({'success': True, 'product': product.to_dict()})

@app.route('/api/inventory/stock-out', methods=['POST'])
@jwt_required()
def stock_out():
    user_id = get_jwt_identity()
    data = request.json
    
    product = Product.query.filter_by(id=data['product_id'], user_id=user_id).first_or_404()
    
    if product.current_stock < data['quantity']:
        return jsonify({'error': 'Insufficient stock'}), 400
    
    product.current_stock -= data['quantity']
    
    transaction = StockTransaction(
        product_id=product.id,
        store_id=product.store_id,
        type='stock_out',
        quantity=-data['quantity'],
        reference=data.get('customer'),
        notes=data.get('notes'),
        status='completed'
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({'success': True, 'product': product.to_dict()})

@app.route('/api/inventory/transfer', methods=['POST'])
@jwt_required()
def transfer_stock():
    user_id = get_jwt_identity()
    data = request.json
    
    product = Product.query.filter_by(id=data['product_id'], user_id=user_id).first_or_404()
    
    if product.current_stock < data['quantity']:
        return jsonify({'error': 'Insufficient stock'}), 400
    
    # Create transfer transaction
    transaction = StockTransaction(
        product_id=product.id,
        store_id=data['from_store_id'],
        type='transfer_out',
        quantity=-data['quantity'],
        reference=f"Transfer to store {data['to_store_id']}",
        notes=data.get('notes'),
        status='completed'
    )
    
    # Update product store
    product.store_id = data['to_store_id']
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify({'success': True, 'product': product.to_dict()})

# Stores CRUD
@app.route('/api/inventory/stores', methods=['GET'])
@jwt_required()
def get_stores():
    user_id = get_jwt_identity()
    stores = Store.query.filter_by(user_id=user_id).all()
    return jsonify({'stores': [s.to_dict() for s in stores]})

@app.route('/api/inventory/stores', methods=['POST'])
@jwt_required()
def create_store():
    user_id = get_jwt_identity()
    data = request.json
    
    store = Store(
        user_id=user_id,
        store_code=data['store_code'],
        store_name=data['store_name'],
        store_type=data.get('store_type'),
        location=data.get('location'),
        address=data.get('address'),
        phone=data.get('phone'),
        email=data.get('email'),
        manager_name=data.get('manager_name')
    )
    
    db.session.add(store)
    db.session.commit()
    
    return jsonify({'success': True, 'store': store.to_dict()}), 201

# Suppliers CRUD
@app.route('/api/inventory/suppliers', methods=['GET'])
@jwt_required()
def get_suppliers():
    user_id = get_jwt_identity()
    suppliers = Supplier.query.filter_by(user_id=user_id).all()
    return jsonify({'suppliers': [s.to_dict() for s in suppliers]})

@app.route('/api/inventory/suppliers', methods=['POST'])
@jwt_required()
def create_supplier():
    user_id = get_jwt_identity()
    data = request.json
    
    supplier = Supplier(
        user_id=user_id,
        supplier_code=data['supplier_code'],
        supplier_name=data['supplier_name'],
        contact_person=data.get('contact_person'),
        phone=data.get('phone'),
        email=data.get('email'),
        address=data.get('address'),
        tax_id=data.get('tax_id'),
        payment_terms=data.get('payment_terms', 30)
    )
    
    db.session.add(supplier)
    db.session.commit()
    
    return jsonify({'success': True, 'supplier': supplier.to_dict()}), 201

# Categories CRUD
@app.route('/api/inventory/categories', methods=['GET'])
@jwt_required()
def get_categories():
    user_id = get_jwt_identity()
    categories = Category.query.filter_by(user_id=user_id).all()
    return jsonify({'categories': [c.to_dict() for c in categories]})

@app.route('/api/inventory/categories', methods=['POST'])
@jwt_required()
def create_category():
    user_id = get_jwt_identity()
    data = request.json
    
    category = Category(
        user_id=user_id,
        category_code=data['category_code'],
        category_name=data['category_name'],
        parent_id=data.get('parent_id'),
        description=data.get('description')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({'success': True, 'category': category.to_dict()}), 201

# Transactions
@app.route('/api/inventory/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    type_filter = request.args.get('type')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    query = StockTransaction.query.join(Product).filter(Product.user_id == user_id)
    
    if type_filter:
        query = query.filter(StockTransaction.type == type_filter)
    if date_from:
        query = query.filter(StockTransaction.created_at >= date_from)
    if date_to:
        query = query.filter(StockTransaction.created_at <= date_to)
    
    transactions = query.order_by(StockTransaction.created_at.desc()).limit(100).all()
    
    return jsonify({'transactions': [t.to_dict() for t in transactions]})

# Stats
@app.route('/api/inventory/stats', methods=['GET'])
@jwt_required()
def get_inventory_stats():
    user_id = get_jwt_identity()
    
    total_products = Product.query.filter_by(user_id=user_id).count()
    total_stores = Store.query.filter_by(user_id=user_id).count()
    total_suppliers = Supplier.query.filter_by(user_id=user_id).count()
    total_categories = Category.query.filter_by(user_id=user_id).count()
    total_value = db.session.query(db.func.sum(Product.current_stock * Product.cost_price)).filter_by(user_id=user_id).scalar() or 0
    low_stock_items = Product.query.filter(
        Product.user_id == user_id,
        Product.current_stock <= Product.min_stock,
        Product.current_stock > 0
    ).count()
    
    return jsonify({
        'total_products': total_products,
        'total_stores': total_stores,
        'total_suppliers': total_suppliers,
        'total_categories': total_categories,
        'total_value': float(total_value),
        'low_stock_items': low_stock_items
    })
