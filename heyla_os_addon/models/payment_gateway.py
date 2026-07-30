from odoo import models, fields, api
from odoo.exceptions import ValidationError
import json


class PaymentGateway(models.Model):
    _name = 'heyla.payment.gateway'
    _description = 'Payment Gateway Configuration'
    _rec_name = 'display_name'

    gateway_type = fields.Selection([
        ('mpesa', 'M-Pesa (Daraja API)'),
        ('stripe', 'Stripe'),
        ('paystack', 'Paystack'),
    ], string='Gateway Type', required=True)
    display_name = fields.Char(string='Name', compute='_compute_display_name', store=True)
    active = fields.Boolean(string='Active', default=True)

    consumer_key = fields.Char(string='Consumer Key')
    consumer_secret = fields.Char(string='Consumer Secret')
    passkey = fields.Char(string='Passkey')
    shortcode = fields.Char(string='Shortcode / Business Code')
    initiator_name = fields.Char(string='Initiator Name')
    security_credential = fields.Char(string='Security Credential')

    stripe_secret_key = fields.Char(string='Secret Key')
    stripe_publishable_key = fields.Char(string='Publishable Key')
    stripe_webhook_secret = fields.Char(string='Webhook Secret')

    paystack_secret_key = fields.Char(string='Secret Key')
    paystack_public_key = fields.Char(string='Public Key')
    paystack_webhook_secret = fields.Char(string='Webhook Secret')

    callback_base_url = fields.Char(string='Callback Base URL', default='https://heyla-backend.onrender.com',
                                     help='Base URL for payment callbacks/webhooks')

    transaction_ids = fields.One2many('heyla.payment.transaction', 'gateway_id', string='Transactions')

    _sql_constraints = [
        ('gateway_type_unique', 'unique(gateway_type)', 'Only one configuration per gateway type allowed!'),
    ]

    @api.depends('gateway_type')
    def _compute_display_name(self):
        for rec in self:
            rec.display_name = dict(self._fields['gateway_type'].selection).get(rec.gateway_type, rec.gateway_type)


class PaymentTransaction(models.Model):
    _name = 'heyla.payment.transaction'
    _description = 'Payment Transaction'
    _order = 'create_date desc'
    _rec_name = 'reference'

    reference = fields.Char(string='Reference', required=True, index=True, readonly=True)
    gateway_id = fields.Many2one('heyla.payment.gateway', string='Gateway', required=True, readonly=True)
    gateway_type = fields.Selection(related='gateway_id.gateway_type', string='Gateway Type', store=True, readonly=True)
    user_id = fields.Many2one('heyla.user', string='User', required=True, readonly=True)
    user_email = fields.Char(string='User Email', related='user_id.email', store=True, readonly=True)

    amount = fields.Float(string='Amount (KES)', required=True, readonly=True)
    currency = fields.Char(string='Currency', default='KES', readonly=True)
    plan = fields.Char(string='Plan', readonly=True)
    billing_cycle = fields.Char(string='Billing Cycle', readonly=True)

    status = fields.Selection([
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ], string='Status', default='pending', readonly=True, tracking=True)

    gateway_transaction_id = fields.Char(string='Gateway Transaction ID', readonly=True)
    gateway_response = fields.Text(string='Gateway Response', readonly=True)
    failure_reason = fields.Text(string='Failure Reason', readonly=True)

    phone_number = fields.Char(string='Phone Number (M-Pesa)')
    mpesa_receipt = fields.Char(string='M-Pesa Receipt Number', readonly=True)
    stripe_payment_intent_id = fields.Char(string='Stripe Payment Intent ID', readonly=True)
    paystack_authorization_url = fields.Char(string='Paystack Authorization URL', readonly=True)
    paystack_access_code = fields.Char(string='Paystack Access Code', readonly=True)

    settlement_ids = fields.One2many('heyla.settlement.transfer', 'transaction_id', string='Settlements')
    settled = fields.Boolean(string='Settled', compute='_compute_settled', store=True)

    @api.depends('settlement_ids.status')
    def _compute_settled(self):
        for rec in self:
            completed = rec.settlement_ids.filtered(lambda s: s.status == 'completed')
            rec.settled = len(completed) > 0

    def _generate_reference(self):
        import secrets
        return 'PAY-' + secrets.token_hex(8).upper()[:12]

    @api.model
    def create(self, vals):
        if not vals.get('reference'):
            vals['reference'] = self._generate_reference()
        return super().create(vals)
