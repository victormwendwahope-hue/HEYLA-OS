from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class CRMController(http.Controller):

    def _lead_to_json(self, l):
        return {
            'id': str(l.id),
            'name': l.name or '',
            'email': l.email or '',
            'phone': l.phone or '',
            'company': l.company or '',
            'status': l.status or 'New',
            'value': l.value,
            'source': l.source or '',
            'assignedTo': l.assigned_to or '',
            'notes': l.notes or '',
            'createdAt': l.created_at.isoformat() if l.created_at else '',
        }

    @http.route('/api/leads', type='http', auth='none', methods=['GET'], csrf=False)
    def get_leads(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._lead_to_json(l) for l in request.env['heyla.lead'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/leads', type='http', auth='none', methods=['POST'], csrf=False)
    def create_lead(self):
        return _auth_required(lambda: self._create_lead())()

    def _create_lead(self):
        try:
            data = json.loads(request.httprequest.data)
            vals = {
                'name': data.get('name', ''),
                'email': data.get('email', ''),
                'phone': data.get('phone', ''),
                'company': data.get('company', ''),
                'status': data.get('status', 'New'),
                'value': data.get('value', 0.0),
                'source': data.get('source', ''),
                'assigned_to': data.get('assignedTo', ''),
                'notes': data.get('notes', ''),
            }
            lead = request.env['heyla.lead'].sudo().create(vals)
            return http.Response(json.dumps(self._lead_to_json(lead)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/leads/<int:lead_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_lead(self, lead_id):
        return _auth_required(lambda: self._update_lead(lead_id))()

    def _update_lead(self, lead_id):
        lead = request.env['heyla.lead'].sudo().browse(lead_id)
        if not lead.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        data = json.loads(request.httprequest.data)
        field_map = {'name': 'name', 'email': 'email', 'phone': 'phone', 'company': 'company',
                     'status': 'status', 'value': 'value', 'source': 'source',
                     'assignedTo': 'assigned_to', 'notes': 'notes'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if vals:
            lead.sudo().write(vals)
        return http.Response(json.dumps(self._lead_to_json(lead)), content_type='application/json', status=200)

    @http.route('/api/leads/<int:lead_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_lead(self, lead_id):
        return _auth_required(lambda: self._delete_lead(lead_id))()

    def _delete_lead(self, lead_id):
        lead = request.env['heyla.lead'].sudo().browse(lead_id)
        if not lead.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        lead.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
