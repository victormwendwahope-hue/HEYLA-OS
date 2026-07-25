from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class EngineeringController(http.Controller):

    def _project_to_json(self, p):
        return {
            'id': str(p.id), 'name': p.name or '', 'client': p.client or '',
            'status': p.status or 'Planning', 'progress': p.progress,
            'budget': p.budget, 'spent': p.spent,
            'startDate': p.start_date.isoformat() if p.start_date else '',
            'endDate': p.end_date.isoformat() if p.end_date else '',
            'manager': p.manager or '',
        }

    def _contract_to_json(self, c):
        return {
            'id': str(c.id), 'projectId': str(c.project_id.id) if c.project_id else '',
            'name': c.name or '', 'type': c.contract_type or 'Red Book',
            'employer': c.employer or '', 'contractor': c.contractor or '',
            'engineer': c.engineer or '', 'price': c.price,
            'status': c.status or 'Draft',
            'startDate': c.start_date.isoformat() if c.start_date else '',
            'endDate': c.end_date.isoformat() if c.end_date else '',
            'currency': c.currency or 'KES',
        }

    def _claim_to_json(self, c):
        return {
            'id': str(c.id), 'contractId': str(c.contract_id.id) if c.contract_id else '',
            'title': c.title or '', 'type': c.claim_type or 'EOT',
            'dateOfEvent': c.date_of_event.isoformat() if c.date_of_event else '',
            'description': c.description or '', 'amount': c.amount,
            'daysRequested': c.days_requested or 0,
            'status': c.status or 'Notice Sent', 'timeBarDays': c.time_bar_days or 28,
            'noticeDate': c.notice_date.isoformat() if c.notice_date else '',
            'documents': c.documents or '',
        }

    def _variation_to_json(self, v):
        return {
            'id': str(v.id), 'contractId': str(v.contract_id.id) if v.contract_id else '',
            'description': v.description or '', 'costImpact': v.cost_impact,
            'timeImpact': v.time_impact or 0,
            'status': v.status or 'Requested',
            'requestDate': v.request_date.isoformat() if v.request_date else '',
        }

    def _payment_to_json(self, p):
        return {
            'id': str(p.id), 'contractId': str(p.contract_id.id) if p.contract_id else '',
            'certNumber': p.cert_number or 0, 'amountDue': p.amount_due,
            'retentionDeducted': p.retention_deducted, 'netPayment': p.net_payment,
            'dueDate': p.due_date.isoformat() if p.due_date else '',
            'status': p.status or 'Draft',
        }

    def _dispute_to_json(self, d):
        return {
            'id': str(d.id), 'contractId': str(d.contract_id.id) if d.contract_id else '',
            'title': d.title or '', 'type': d.dispute_type or 'NOD',
            'status': d.status or 'Filed',
            'filedDate': d.filed_date.isoformat() if d.filed_date else '',
            'description': d.description or '',
        }

    def _warning_to_json(self, w):
        return {
            'id': str(w.id), 'projectId': str(w.project_id.id) if w.project_id else '',
            'description': w.description or '', 'riskLevel': w.risk_level or 'Medium',
            'mitigationPlan': w.mitigation_plan or '', 'status': w.status or 'Open',
            'date': w.date.isoformat() if w.date else '',
        }

    @http.route('/api/engineering-projects', type='http', auth='none', methods=['GET'], csrf=False)
    def get_projects(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._project_to_json(p) for p in request.env['heyla.engineering.project'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/engineering-contracts', type='http', auth='none', methods=['GET'], csrf=False)
    def get_contracts(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._contract_to_json(c) for c in request.env['heyla.engineering.contract'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/engineering-claims', type='http', auth='none', methods=['GET'], csrf=False)
    def get_claims(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._claim_to_json(c) for c in request.env['heyla.engineering.claim'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/engineering-variations', type='http', auth='none', methods=['GET'], csrf=False)
    def get_variations(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._variation_to_json(v) for v in request.env['heyla.engineering.variation'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/engineering-payments', type='http', auth='none', methods=['GET'], csrf=False)
    def get_payments(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._payment_to_json(p) for p in request.env['heyla.engineering.payment'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/engineering-disputes', type='http', auth='none', methods=['GET'], csrf=False)
    def get_disputes(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._dispute_to_json(d) for d in request.env['heyla.engineering.dispute'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/engineering-early-warnings', type='http', auth='none', methods=['GET'], csrf=False)
    def get_warnings(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._warning_to_json(w) for w in request.env['heyla.engineering.early.warning'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()
