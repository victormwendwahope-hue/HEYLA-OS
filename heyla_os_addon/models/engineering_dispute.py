from odoo import models, fields, api


class HeylaEngineeringDispute(models.Model):
    _name = 'heyla.engineering.dispute'
    _description = 'HEYLA Engineering Dispute'
    _inherit = ['mail.thread']
    _rec_name = 'title'
    _order = 'id desc'

    contract_id = fields.Many2one('heyla.engineering.contract', string='Contract', required=True)
    title = fields.Char(string='Title', required=True)
    dispute_type = fields.Selection([
        ('NOD', 'NOD'),
        ('DAB Referral', 'DAB Referral'),
        ('Arbitration', 'Arbitration'),
    ], string='Type', required=True)
    status = fields.Selection([
        ('Filed', 'Filed'),
        ('Under Review', 'Under Review'),
        ('Hearing', 'Hearing'),
        ('Resolved', 'Resolved'),
    ], string='Status', default='Filed', tracking=True)
    filed_date = fields.Date(string='Filed Date', default=fields.Date.today)
    description = fields.Text(string='Description')
