from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class AccountingController(http.Controller):

    def _invoice_to_json(self, inv):
        return {
            'id': str(inv.id),
            'invoiceNumber': inv.invoice_number or f'INV-{inv.id:05d}',
            'clientName': inv.client_name or '',
            'clientEmail': inv.client_email or '',
            'items': [{'description': l.description, 'quantity': l.quantity, 'unitPrice': l.unit_price} for l in inv.line_ids],
            'subtotal': inv.subtotal,
            'tax': inv.tax,
            'total': inv.total,
            'status': inv.status or 'Draft',
            'dueDate': inv.due_date.isoformat() if inv.due_date else '',
            'createdAt': inv.create_date.isoformat() if inv.create_date else '',
            'currency': inv.currency or 'KES',
        }

    @http.route('/api/invoices', type='http', auth='none', methods=['GET'], csrf=False)
    def get_invoices(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._invoice_to_json(inv) for inv in request.env['heyla.invoice'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/invoices', type='http', auth='none', methods=['POST'], csrf=False)
    def create_invoice(self):
        return _auth_required(lambda: self._create_invoice())()

    def _create_invoice(self):
        try:
            data = json.loads(request.httprequest.data)
            inv = request.env['heyla.invoice'].sudo().create({
                'client_name': data.get('clientName', ''),
                'client_email': data.get('clientEmail', ''),
                'tax': data.get('tax', 0.0),
                'status': data.get('status', 'Draft'),
                'due_date': data.get('dueDate') or False,
                'currency': data.get('currency', 'KES'),
            })
            for item in data.get('items', []):
                request.env['heyla.invoice.line'].sudo().create({
                    'invoice_id': inv.id,
                    'description': item.get('description', ''),
                    'quantity': item.get('quantity', 1),
                    'unit_price': item.get('unitPrice', 0.0),
                })
            return http.Response(json.dumps(self._invoice_to_json(inv)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)

    @http.route('/api/invoices/<int:inv_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_invoice(self, inv_id):
        return _auth_required(lambda: self._update_invoice(inv_id))()

    def _update_invoice(self, inv_id):
        inv = request.env['heyla.invoice'].sudo().browse(inv_id)
        if not inv.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        data = json.loads(request.httprequest.data)
        field_map = {'clientName': 'client_name', 'clientEmail': 'client_email',
                     'tax': 'tax', 'status': 'status', 'currency': 'currency'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if 'dueDate' in data:
            vals['due_date'] = data['dueDate'] or False
        if vals:
            inv.sudo().write(vals)
        if 'items' in data:
            inv.line_ids.sudo().unlink()
            for item in data['items']:
                request.env['heyla.invoice.line'].sudo().create({
                    'invoice_id': inv.id,
                    'description': item.get('description', ''),
                    'quantity': item.get('quantity', 1),
                    'unit_price': item.get('unitPrice', 0.0),
                })
        return http.Response(json.dumps(self._invoice_to_json(inv)), content_type='application/json', status=200)

    @http.route('/api/invoices/<int:inv_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_invoice(self, inv_id):
        return _auth_required(lambda: self._delete_invoice(inv_id))()

    def _delete_invoice(self, inv_id):
        inv = request.env['heyla.invoice'].sudo().browse(inv_id)
        if not inv.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        inv.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
