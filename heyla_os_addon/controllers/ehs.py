from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class EHSController(http.Controller):

    def _incident_to_json(self, i):
        return {
            'id': str(i.id),
            'type': i.incident_type or 'Accident',
            'location': i.location or '',
            'description': i.description or '',
            'severity': i.severity or 'Medium',
            'status': i.status or 'Reported',
            'reportedBy': i.reported_by or '',
            'reportedDate': i.reported_date.isoformat() if i.reported_date else '',
            'assignedTo': i.assigned_to or '',
            'attachments': i.attachments or '',
        }

    def _compliance_to_json(self, c):
        return {
            'id': str(c.id),
            'category': c.category or 'DOSH',
            'item': c.item or '',
            'status': c.status or 'Compliant',
            'dueDate': c.due_date.isoformat() if c.due_date else '',
            'lastChecked': c.last_checked.isoformat() if c.last_checked else '',
            'certNumber': c.cert_number or '',
            'expiryDate': c.expiry_date.isoformat() if c.expiry_date else '',
        }

    def _inspection_to_json(self, i):
        return {
            'id': str(i.id),
            'title': i.title or '',
            'location': i.location or '',
            'inspector': i.inspector or '',
            'date': i.date.isoformat() if i.date else '',
            'status': i.status or 'Scheduled',
            'result': i.result or None,
            'checklist': [{'item': c.item, 'checked': c.checked, 'notes': c.notes} for c in i.checklist_ids],
        }

    def _alert_to_json(self, a):
        return {
            'id': str(a.id),
            'type': a.alert_type or 'Overdue Check',
            'message': a.message or '',
            'severity': a.severity or 'Warning',
            'date': a.date.isoformat() if a.date else '',
            'read': a.read or False,
        }

    @http.route('/api/ehs-incidents', type='http', auth='none', methods=['GET'], csrf=False)
    def get_incidents(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._incident_to_json(i) for i in request.env['heyla.ehs.incident'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/ehs-compliance', type='http', auth='none', methods=['GET'], csrf=False)
    def get_compliance(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._compliance_to_json(c) for c in request.env['heyla.ehs.compliance'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/ehs-inspections', type='http', auth='none', methods=['GET'], csrf=False)
    def get_inspections(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._inspection_to_json(i) for i in request.env['heyla.ehs.inspection'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/ehs-alerts', type='http', auth='none', methods=['GET'], csrf=False)
    def get_alerts(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._alert_to_json(a) for a in request.env['heyla.ehs.alert'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()
