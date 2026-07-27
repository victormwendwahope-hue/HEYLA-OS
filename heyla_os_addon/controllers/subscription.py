from odoo import http
from odoo.http import request
import json
from datetime import datetime


PLANS = [
    {
        'id': 'starter',
        'name': 'Starter',
        'monthlyPrice': 2500,
        'yearlyPrice': 24000,
        'maxUsers': 3,
        'maxBranches': 1,
        'features': [
            'CRM Sales & Quotations',
            'Invoicing',
            'Inventory Management',
            'Expense Management',
            'Basic Reports',
            'Maximum of 3 users',
        ],
    },
    {
        'id': 'growth',
        'name': 'Growth',
        'monthlyPrice': 5000,
        'yearlyPrice': 48000,
        'maxUsers': 10,
        'maxBranches': 3,
        'popular': True,
        'features': [
            'Everything in Starter',
            'Human Resource Management',
            'Employee Records',
            'Kenya Payroll (PAYE, SHIF, NSSF, Housing Levy)',
            'Leave Management',
            'Procurement',
            'Asset Management',
            'Customer Portal',
            'Maximum of 10 users',
        ],
    },
    {
        'id': 'professional',
        'name': 'Professional',
        'monthlyPrice': 10000,
        'yearlyPrice': 96000,
        'maxUsers': 30,
        'maxBranches': 5,
        'features': [
            'Everything in Growth',
            'Accounting',
            'Fleet Management',
            'Fuel Management',
            'Workshop & Maintenance',
            'Project Management',
            'Approval Workflows',
            'Business Intelligence Dashboard',
            'API Access',
            'Maximum of 30 users',
        ],
    },
    {
        'id': 'enterprise',
        'name': 'Enterprise',
        'monthlyPrice': 20000,
        'yearlyPrice': None,
        'maxUsers': 999,
        'maxBranches': 999,
        'custom': True,
        'features': [
            'Everything in Professional',
            'Unlimited users',
            'Multi-branch support',
            'Custom workflows',
            'Dedicated account manager',
            'Premium support',
            'Custom integrations',
            'Optional on-premise deployment',
            'SLA (Service Level Agreement)',
        ],
    },
]

OPTIONAL_MODULES = [
    {'id': 'payroll', 'name': 'Payroll', 'price': 1000},
    {'id': 'hr', 'name': 'HR Management', 'price': 1000},
    {'id': 'accounting', 'name': 'Accounting', 'price': 2000},
    {'id': 'fleet', 'name': 'Fleet Management', 'price': 2000},
    {'id': 'fuel', 'name': 'Fuel Management', 'price': 1000},
    {'id': 'workshop', 'name': 'Workshop Management', 'price': 2000},
    {'id': 'procurement', 'name': 'Procurement', 'price': 1500},
    {'id': 'project', 'name': 'Project Management', 'price': 1500},
    {'id': 'asset', 'name': 'Asset Management', 'price': 1000},
    {'id': 'crm_premium', 'name': 'CRM Premium', 'price': 1000},
]


def _auth_required(f):
    def wrapper(*args, **kwargs):
        auth_header = request.httprequest.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
        if not token:
            return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
        from odoo.addons.heyla_os_addon.models.res_user import _hash_token
        token_hash = _hash_token(token)
        user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)
        if not user:
            user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
        if not user:
            return http.Response(json.dumps({'error': 'Invalid or expired token'}), content_type='application/json', status=401)
        if user.token_expires_at and datetime.now() > user.token_expires_at:
            user.token = False
            user.token_expires_at = False
            return http.Response(json.dumps({'error': 'Token expired'}), content_type='application/json', status=401)
        request.heyla_user = user
        return f(*args, **kwargs)
    return wrapper


class SubscriptionController(http.Controller):

    @http.route('/api/subscription/plans', type='http', auth='none', methods=['GET'], csrf=False)
    def get_plans(self):
        return http.Response(json.dumps({'plans': PLANS, 'optionalModules': OPTIONAL_MODULES}), content_type='application/json', status=200)

    @http.route('/api/subscription/status', type='http', auth='none', methods=['GET'], csrf=False)
    def get_status(self):
        return _auth_required(lambda: http.Response(
            json.dumps({'subscription': request.heyla_user._subscription_info()}),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/subscription/subscribe', type='http', auth='none', methods=['POST'], csrf=False)
    def subscribe(self):
        try:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            if not token:
                return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
            token_hash = _hash_token(token)
            user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)
            if not user:
                return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
            data = json.loads(request.httprequest.data)
            plan = data.get('plan', 'starter')
            billing_cycle = data.get('billingCycle', 'monthly')
            if plan not in [p['id'] for p in PLANS]:
                return http.Response(json.dumps({'error': 'Invalid plan'}), content_type='application/json', status=400)
            if billing_cycle not in ('monthly', 'yearly'):
                return http.Response(json.dumps({'error': 'Invalid billing cycle'}), content_type='application/json', status=400)
            user._activate_subscription(plan, billing_cycle)
            return http.Response(
                json.dumps({'ok': True, 'subscription': user._subscription_info()}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Subscription failed'}), content_type='application/json', status=400)

    @http.route('/api/subscription/cancel', type='http', auth='none', methods=['POST'], csrf=False)
    def cancel(self):
        try:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            if not token:
                return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
            token_hash = _hash_token(token)
            user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)
            if not user:
                return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
            user.subscription_status = 'cancelled'
            return http.Response(json.dumps({'ok': True, 'subscription': user._subscription_info()}), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'error': 'Cancel failed'}), content_type='application/json', status=400)
