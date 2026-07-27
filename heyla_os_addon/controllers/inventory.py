from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class InventoryController(http.Controller):

    def _product_to_json(self, p):
        return {
            'id': str(p.id),
            'name': p.name or '',
            'sku': p.sku or '',
            'category': p.category or '',
            'price': p.price,
            'cost': p.cost,
            'stock': p.stock,
            'minStock': p.min_stock,
            'status': p.status or 'In Stock',
            'image': p.image or '',
        }

    @http.route('/api/products', type='http', auth='none', methods=['GET'], csrf=False)
    def get_products(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._product_to_json(p) for p in request.env['heyla.product'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/products', type='http', auth='none', methods=['POST'], csrf=False)
    def create_product(self):
        return _auth_required(lambda: self._create_product())()

    def _create_product(self):
        try:
            data = json.loads(request.httprequest.data)
            prod = request.env['heyla.product'].sudo().create({
                'name': data.get('name', ''),
                'sku': data.get('sku', ''),
                'category': data.get('category', ''),
                'price': data.get('price', 0.0),
                'cost': data.get('cost', 0.0),
                'stock': data.get('stock', 0.0),
                'min_stock': data.get('minStock', 0.0),
                'image': data.get('image', ''),
            })
            return http.Response(json.dumps(self._product_to_json(prod)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)

    @http.route('/api/products/<int:prod_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_product(self, prod_id):
        return _auth_required(lambda: self._update_product(prod_id))()

    def _update_product(self, prod_id):
        prod = request.env['heyla.product'].sudo().browse(prod_id)
        if not prod.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        data = json.loads(request.httprequest.data)
        field_map = {'name': 'name', 'sku': 'sku', 'category': 'category',
                     'price': 'price', 'cost': 'cost', 'stock': 'stock',
                     'minStock': 'min_stock', 'image': 'image'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if vals:
            prod.sudo().write(vals)
        return http.Response(json.dumps(self._product_to_json(prod)), content_type='application/json', status=200)

    @http.route('/api/products/<int:prod_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_product(self, prod_id):
        return _auth_required(lambda: self._delete_product(prod_id))()

    def _delete_product(self, prod_id):
        prod = request.env['heyla.product'].sudo().browse(prod_id)
        if not prod.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        prod.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
