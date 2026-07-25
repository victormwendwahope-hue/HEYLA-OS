from odoo import models, fields, api


class HeylaEngineeringVariation(models.Model):
    _name = 'heyla.engineering.variation'
    _description = 'HEYLA Engineering Variation'
    _inherit = ['mail.thread']
    _rec_name = 'description'
    _order = 'id desc'

    contract_id = fields.Many2one('heyla.engineering.contract', string='Contract', required=True)
    description = fields.Text(string='Description', required=True)
    cost_impact = fields.Float(string='Cost Impact', default=0.0)
    time_impact = fields.Integer(string='Time Impact (days)', default=0)
    status = fields.Selection([
        ('Requested', 'Requested'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ], string='Status', default='Requested', tracking=True)
    request_date = fields.Date(string='Request Date', default=fields.Date.today)
