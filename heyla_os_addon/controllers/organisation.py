import json
from odoo import fields, http
from odoo.http import request
from .auth import _auth_required


class OrganisationController(http.Controller):

    @http.route('/api/departments', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_departments(self):
        depts = request.env['heyla.department'].sudo().search([])
        return http.Response(json.dumps([{
            'id': d.id, 'name': d.name, 'code': d.code,
            'head': d.head_of_department, 'description': d.description,
            'budget': d.budget, 'cost_center': d.cost_center,
            'is_active': d.is_active,
            'division_count': len(d.division_ids),
        } for d in depts]), content_type='application/json')

    @http.route('/api/departments', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_department(self):
        data = json.loads(request.httprequest.data)
        dept = request.env['heyla.department'].sudo().create({
            'name': data.get('name'),
            'code': data.get('code', ''),
            'description': data.get('description', ''),
            'head_of_department': data.get('head', ''),
            'budget': data.get('budget', 0),
            'cost_center': data.get('cost_center', ''),
        })
        return http.Response(json.dumps({'id': dept.id, 'name': dept.name}), content_type='application/json', status=201)

    @http.route('/api/departments/<int:dept_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_department(self, dept_id):
        data = json.loads(request.httprequest.data)
        dept = request.env['heyla.department'].sudo().browse(dept_id)
        if not dept.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        dept.write({
            'name': data.get('name', dept.name),
            'code': data.get('code', dept.code),
            'description': data.get('description', dept.description),
            'head_of_department': data.get('head', dept.head_of_department),
            'budget': data.get('budget', dept.budget),
            'cost_center': data.get('cost_center', dept.cost_center),
        })
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/departments/<int:dept_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    @_auth_required
    def delete_department(self, dept_id):
        dept = request.env['heyla.department'].sudo().browse(dept_id)
        if not dept.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        dept.unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json')


class LoanController(http.Controller):

    @http.route('/api/loans', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_loans(self):
        loans = request.env['heyla.loan'].sudo().search([])
        return http.Response(json.dumps([{
            'id': l.id, 'loan_number': l.loan_number,
            'employee_name': l.employee_name,
            'employee_id': l.employee_id.id,
            'loan_type': l.loan_type, 'loan_category': l.loan_category,
            'principal_amount': l.principal_amount, 'interest_rate': l.interest_rate,
            'term_months': l.term_months, 'monthly_payment': l.monthly_payment,
            'total_interest': l.total_interest, 'total_amount': l.total_amount,
            'outstanding_balance': l.outstanding_balance,
            'status': l.status, 'currency': l.currency,
            'application_date': str(l.application_date) if l.application_date else '',
            'deduct_from_salary': l.deduct_from_salary,
        } for l in loans]), content_type='application/json')

    @http.route('/api/loans', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_loan(self):
        data = json.loads(request.httprequest.data)
        loan = request.env['heyla.loan'].sudo().create({
            'employee_id': data.get('employee_id'),
            'loan_type': data.get('loan_type', 'internal'),
            'loan_category': data.get('loan_category', 'personal'),
            'principal_amount': data.get('principal_amount', 0),
            'interest_rate': data.get('interest_rate', 0),
            'interest_type': data.get('interest_type', 'reducing'),
            'repayment_method': data.get('repayment_method', 'amortizing'),
            'term_months': data.get('term_months', 1),
            'currency': data.get('currency', 'KES'),
            'deduct_from_salary': data.get('deduct_from_salary', True),
            'lender_name': data.get('lender_name', ''),
            'notes': data.get('notes', ''),
        })
        return http.Response(json.dumps({'id': loan.id, 'loan_number': loan.loan_number}), content_type='application/json', status=201)

    @http.route('/api/loans/<int:loan_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_loan(self, loan_id):
        data = json.loads(request.httprequest.data)
        loan = request.env['heyla.loan'].sudo().browse(loan_id)
        if not loan.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'outstanding_balance', 'next_payment_date', 'approval_notes', 'notes']:
            if f in data:
                writable[f] = data[f]
        if data.get('status') == 'approved':
            writable['approval_date'] = fields.Date.today()
        loan.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/loans/<int:loan_id>/schedule', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_loan_schedule(self, loan_id):
        payments = request.env['heyla.loan.payment'].sudo().search([('loan_id', '=', loan_id)])
        return http.Response(json.dumps([{
            'installment': p.installment, 'due_date': str(p.due_date),
            'principal': p.principal, 'interest': p.interest,
            'total': p.total, 'paid': p.paid, 'paid_date': str(p.paid_date) if p.paid_date else '',
        } for p in payments]), content_type='application/json')


class ExpenseController(http.Controller):

    @http.route('/api/expenses', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_expenses(self):
        claims = request.env['heyla.expense.claim'].sudo().search([])
        return http.Response(json.dumps([{
            'id': c.id, 'claim_number': c.claim_number,
            'employee_name': c.employee_name,
            'category': c.category, 'description': c.description,
            'amount': c.amount, 'currency': c.currency,
            'expense_date': str(c.expense_date) if c.expense_date else '',
            'status': c.status, 'submitted_at': str(c.submitted_at) if c.submitted_at else '',
        } for c in claims]), content_type='application/json')

    @http.route('/api/expenses', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_expense(self):
        data = json.loads(request.httprequest.data)
        claim = request.env['heyla.expense.claim'].sudo().create({
            'employee_id': data.get('employee_id'),
            'category': data.get('category'),
            'description': data.get('description'),
            'amount': data.get('amount', 0),
            'currency': data.get('currency', 'KES'),
            'expense_date': data.get('expense_date'),
            'notes': data.get('notes', ''),
        })
        return http.Response(json.dumps({'id': claim.id, 'claim_number': claim.claim_number}), content_type='application/json', status=201)

    @http.route('/api/expenses/<int:claim_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_expense(self, claim_id):
        data = json.loads(request.httprequest.data)
        claim = request.env['heyla.expense.claim'].sudo().browse(claim_id)
        if not claim.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'rejection_reason', 'notes', 'receipt_url', 'reimbursed_in_payroll', 'payroll_period']:
            if f in data:
                writable[f] = data[f]
        if data.get('status') == 'approved':
            writable['approved_by'] = getattr(request, 'heyla_user', None) and request.heyla_user.name or ''
            writable['approved_at'] = fields.Datetime.now()
        claim.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')


class HolidayController(http.Controller):

    @http.route('/api/holidays', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_holidays(self):
        holidays = request.env['heyla.holiday'].sudo().search([])
        return http.Response(json.dumps([{
            'id': h.id, 'name': h.name, 'date': str(h.date) if h.date else '',
            'holiday_type': h.holiday_type, 'country': h.country,
            'is_recurring': h.is_recurring, 'notes': h.notes,
        } for h in holidays]), content_type='application/json')

    @http.route('/api/holidays', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_holiday(self):
        data = json.loads(request.httprequest.data)
        holiday = request.env['heyla.holiday'].sudo().create({
            'name': data.get('name'),
            'date': data.get('date'),
            'holiday_type': data.get('holiday_type', 'public'),
            'country': data.get('country', ''),
            'is_recurring': data.get('is_recurring', False),
            'notes': data.get('notes', ''),
        })
        return http.Response(json.dumps({'id': holiday.id}), content_type='application/json', status=201)

    @http.route('/api/holidays/<int:holiday_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    @_auth_required
    def delete_holiday(self, holiday_id):
        holiday = request.env['heyla.holiday'].sudo().browse(holiday_id)
        if not holiday.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        holiday.unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json')


class LeavePolicyController(http.Controller):

    @http.route('/api/leave-policies', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_leave_policies(self):
        policies = request.env['heyla.leave.policy'].sudo().search([])
        return http.Response(json.dumps([{
            'id': p.id, 'name': p.name, 'leave_type': p.leave_type,
            'is_paid': p.is_paid, 'annual_allocation': p.annual_allocation,
            'carry_forward_enabled': p.carry_forward_enabled,
            'max_carry_forward': p.max_carry_forward,
            'accrual_enabled': p.accrual_enabled,
            'min_service_months': p.min_service_months,
            'max_consecutive_days': p.max_consecutive_days,
            'is_active': p.is_active,
        } for p in policies]), content_type='application/json')

    @http.route('/api/leave-policies', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_leave_policy(self):
        data = json.loads(request.httprequest.data)
        policy = request.env['heyla.leave.policy'].sudo().create({
            'name': data.get('name'),
            'leave_type': data.get('leave_type'),
            'is_paid': data.get('is_paid', True),
            'annual_allocation': data.get('annual_allocation', 21),
            'carry_forward_enabled': data.get('carry_forward_enabled', True),
            'max_carry_forward': data.get('max_carry_forward', 10),
            'accrual_enabled': data.get('accrual_enabled', False),
            'min_service_months': data.get('min_service_months', 0),
            'max_consecutive_days': data.get('max_consecutive_days', 30),
        })
        return http.Response(json.dumps({'id': policy.id}), content_type='application/json', status=201)


class ExchangeRateController(http.Controller):

    @http.route('/api/exchange-rates', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_exchange_rates(self):
        rates = request.env['heyla.exchange.rate'].sudo().search([])
        return http.Response(json.dumps([{
            'id': r.id, 'month': r.month, 'year': r.year,
            'from_currency': r.from_currency, 'to_currency': r.to_currency,
            'rate': r.rate, 'source': r.source, 'locked': r.locked,
        } for r in rates]), content_type='application/json')

    @http.route('/api/exchange-rates', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_exchange_rate(self):
        data = json.loads(request.httprequest.data)
        rate = request.env['heyla.exchange.rate'].sudo().create({
            'month': data.get('month'),
            'year': data.get('year'),
            'from_currency': data.get('from_currency'),
            'to_currency': data.get('to_currency', 'KES'),
            'rate': data.get('rate'),
            'source': data.get('source', 'manual'),
            'set_by': data.get('set_by', ''),
        })
        return http.Response(json.dumps({'id': rate.id}), content_type='application/json', status=201)


class NotificationController(http.Controller):

    @http.route('/api/notifications', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_notifications(self):
        user = getattr(request, 'heyla_user', None)
        if not user:
            return http.Response(json.dumps([]), content_type='application/json')
        notifs = request.env['heyla.notification'].sudo().search(
            [('user_id', '=', str(user.id))], order='timestamp desc', limit=50
        )
        return http.Response(json.dumps([{
            'id': n.id, 'type': n.notification_type, 'header': n.header,
            'message': n.message, 'severity': n.severity,
            'read': n.read, 'timestamp': str(n.timestamp) if n.timestamp else '',
        } for n in notifs]), content_type='application/json')

    @http.route('/api/notifications/<int:notif_id>/read', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def mark_notification_read(self, notif_id):
        notif = request.env['heyla.notification'].sudo().browse(notif_id)
        if notif.exists():
            notif.mark_read()
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/audit-logs', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_audit_logs(self):
        logs = request.env['heyla.audit.log'].sudo().search([], order='timestamp desc', limit=100)
        return http.Response(json.dumps([{
            'id': l.id, 'user_name': l.user_name, 'action': l.action,
            'entity': l.entity, 'entity_name': l.entity_name,
            'timestamp': str(l.timestamp) if l.timestamp else '',
        } for l in logs]), content_type='application/json')
