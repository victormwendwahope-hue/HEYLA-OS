from odoo import models, fields, api


class HeylaEngineeringPayment(models.Model):
    _name = 'heyla.engineering.payment'
    _description = 'HEYLA Engineering Payment Certificate'
    _inherit = ['mail.thread']
    _rec_name = 'cert_number'
    _order = 'cert_number desc'

    contract_id = fields.Many2one('heyla.engineering.contract', string='Contract', required=True)
    cert_number = fields.Integer(string='Certificate Number', required=True)
    amount_due = fields.Float(string='Amount Due', default=0.0)
    retention_deducted = fields.Float(string='Retention Deducted', default=0.0)
    net_payment = fields.Float(string='Net Payment', compute='_compute_net', store=True)
    due_date = fields.Date(string='Due Date')
    status = fields.Selection([
        ('Draft', 'Draft'),
        ('Submitted', 'Submitted'),
        ('Approved', 'Approved'),
        ('Paid', 'Paid'),
    ], string='Status', default='Draft', tracking=True)

    @api.depends('amount_due', 'retention_deducted')
    def _compute_net(self):
        for rec in self:
            rec.net_payment = rec.amount_due - rec.retention_deducted
