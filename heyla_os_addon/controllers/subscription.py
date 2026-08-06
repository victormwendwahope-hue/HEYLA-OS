from odoo import http
from odoo.http import request
import json
from datetime import datetime
from .auth import _auth_required, _admin_required


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
    @_auth_required
    def subscribe(self):
        try:
            user = request.heyla_user
            data = json.loads(request.httprequest.data)
            plan = data.get('plan', 'starter')
            billing_cycle = data.get('billingCycle', 'monthly')
            if plan not in [p['id'] for p in PLANS]:
                return http.Response(json.dumps({'error': 'Invalid plan'}), content_type='application/json', status=400)
            if billing_cycle not in ('monthly', 'yearly'):
                return http.Response(json.dumps({'error': 'Invalid billing cycle'}), content_type='application/json', status=400)

            completed_tx = request.env['heyla.payment.transaction'].sudo().search([
                ('user_id', '=', user.id),
                ('plan', '=', plan),
                ('billing_cycle', '=', billing_cycle),
                ('status', '=', 'completed'),
            ], limit=1)

            if not completed_tx:
                return http.Response(json.dumps({'error': 'Completed payment required before activating subscription'}), content_type='application/json', status=402)

            if user.subscription_status != 'active':
                user._activate_subscription(plan, billing_cycle)

            return http.Response(
                json.dumps({'ok': True, 'subscription': user._subscription_info()}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Subscription failed'}), content_type='application/json', status=400)

    @http.route('/api/subscription/cancel', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def cancel(self):
        try:
            user = request.heyla_user
            user.subscription_status = 'cancelled'
            return http.Response(json.dumps({'ok': True, 'subscription': user._subscription_info()}), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'error': 'Cancel failed'}), content_type='application/json', status=400)
