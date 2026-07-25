from odoo import models, fields, api


class HeylaEngineeringClaim(models.Model):
    _name = 'heyla.engineering.claim'
    _description = 'HEYLA Engineering Claim'
    _inherit = ['mail.thread']
    _rec_name = 'title'
    _order = 'id desc'

    contract_id = fields.Many2one('heyla.engineering.contract', string='Contract', required=True)
    title = fields.Char(string='Title', required=True)
    claim_type = fields.Selection([
        ('EOT', 'EOT'),
        ('Payment', 'Payment'),
        ('Both', 'Both'),
    ], string='Type', required=True)
    date_of_event = fields.Date(string='Date of Event')
    description = fields.Text(string='Description')
    amount = fields.Float(string='Amount')
    days_requested = fields.Integer(string='Days Requested')
    status = fields.Selection([
        ('Notice Sent', 'Notice Sent'),
        ('Submitted', 'Submitted'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ], string='Status', default='Notice Sent', tracking=True)
    time_bar_days = fields.Integer(string='Time Bar Days', default=28)
    notice_date = fields.Date(string='Notice Date')
    documents = fields.Text(string='Documents')
