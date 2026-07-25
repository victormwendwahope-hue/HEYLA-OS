from odoo import models, fields, api


class HeylaInjury(models.Model):
    _name = 'heyla.injury'
    _description = 'HEYLA Injury Report'
    _inherit = ['mail.thread']
    _rec_name = 'employee'
    _order = 'id desc'

    employee = fields.Char(string='Employee Name', required=True)
    department = fields.Char(string='Department')
    injury_type = fields.Selection([
        ('Minor', 'Minor'),
        ('Moderate', 'Moderate'),
        ('Severe', 'Severe'),
        ('Critical', 'Critical'),
    ], string='Injury Type', required=True)
    body_part = fields.Char(string='Body Part')
    cause = fields.Text(string='Cause')
    location = fields.Char(string='Location')
    date = fields.Date(string='Date', required=True)
    days_lost = fields.Integer(string='Days Lost', default=0)
    status = fields.Selection([
        ('Reported', 'Reported'),
        ('Investigating', 'Investigating'),
        ('Approved', 'Approved'),
        ('Resolved', 'Resolved'),
    ], string='Status', default='Reported', tracking=True)
    reported_by = fields.Char(string='Reported By')
    corrective_action = fields.Text(string='Corrective Action')
