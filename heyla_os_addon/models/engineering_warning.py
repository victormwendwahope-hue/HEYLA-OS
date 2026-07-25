from odoo import models, fields, api


class HeylaEngineeringEarlyWarning(models.Model):
    _name = 'heyla.engineering.early.warning'
    _description = 'HEYLA Engineering Early Warning'
    _inherit = ['mail.thread']
    _rec_name = 'description'
    _order = 'id desc'

    project_id = fields.Many2one('heyla.engineering.project', string='Project', required=True)
    description = fields.Text(string='Description', required=True)
    risk_level = fields.Selection([
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ], string='Risk Level', default='Medium')
    mitigation_plan = fields.Text(string='Mitigation Plan')
    status = fields.Selection([
        ('Open', 'Open'),
        ('Mitigated', 'Mitigated'),
        ('Closed', 'Closed'),
    ], string='Status', default='Open', tracking=True)
    date = fields.Date(string='Date', default=fields.Date.today)
