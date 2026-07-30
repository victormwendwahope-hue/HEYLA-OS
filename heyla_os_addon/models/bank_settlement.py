from odoo import models, fields, api
from datetime import datetime


class SettlementBankAccount(models.Model):
    _name = 'heyla.settlement.bank.account'
    _description = 'Settlement Bank Account'
    _rec_name = 'account_name'

    account_name = fields.Char(string='Account Name', required=True)
    bank_name = fields.Char(string='Bank Name', required=True)
    account_number = fields.Char(string='Account Number', required=True)
    branch_code = fields.Char(string='Branch Code')
    swift_code = fields.Char(string='SWIFT Code')
    currency = fields.Char(string='Currency', default='KES')
    is_active = fields.Boolean(string='Active', default=True)
    settlement_percentage = fields.Float(string='Settlement Percentage', default=100.0,
                                         help='Percentage of collected payments to settle to this account')
    auto_settle = fields.Boolean(string='Auto-Settle', default=True)
    settlement_frequency = fields.Selection([
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('manual', 'Manual'),
    ], string='Settlement Frequency', default='weekly')

    transfer_ids = fields.One2many('heyla.settlement.transfer', 'bank_account_id', string='Transfers')
    total_settled = fields.Float(string='Total Settled (KES)', compute='_compute_totals', store=True)
    total_pending = fields.Float(string='Total Pending (KES)', compute='_compute_totals', store=True)

    @api.depends('transfer_ids.amount', 'transfer_ids.status')
    def _compute_totals(self):
        for rec in self:
            rec.total_settled = sum(rec.transfer_ids.filtered(lambda t: t.status == 'completed').mapped('amount'))
            rec.total_pending = sum(rec.transfer_ids.filtered(lambda t: t.status == 'pending').mapped('amount'))


class SettlementTransfer(models.Model):
    _name = 'heyla.settlement.transfer'
    _description = 'Settlement Transfer'
    _order = 'create_date desc'
    _rec_name = 'reference'

    reference = fields.Char(string='Reference', required=True, index=True, readonly=True)
    bank_account_id = fields.Many2one('heyla.settlement.bank.account', string='Bank Account', required=True)
    transaction_id = fields.Many2one('heyla.payment.transaction', string='Source Transaction', required=True)
    user_id = fields.Many2one('heyla.user', string='Payer', related='transaction_id.user_id', store=True)

    amount = fields.Float(string='Amount (KES)', required=True)
    currency = fields.Char(string='Currency', default='KES')
    status = fields.Selection([
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], string='Status', default='pending')
    transfer_date = fields.Datetime(string='Transfer Date')
    gateway_reference = fields.Char(string='Gateway Transfer Reference')
    failure_reason = fields.Text(string='Failure Reason')
    notes = fields.Text(string='Notes')

    def _generate_reference(self):
        import secrets
        return 'STL-' + secrets.token_hex(8).upper()[:12]

    @api.model
    def create(self, vals):
        if not vals.get('reference'):
            vals['reference'] = self._generate_reference()
        return super().create(vals)

    def mark_completed(self, gateway_ref=None):
        self.status = 'completed'
        self.transfer_date = datetime.now()
        if gateway_ref:
            self.gateway_reference = gateway_ref

    def mark_failed(self, reason):
        self.status = 'failed'
        self.failure_reason = reason
