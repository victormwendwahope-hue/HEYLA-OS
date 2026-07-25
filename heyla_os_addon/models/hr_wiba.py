from odoo import models, fields, api


class HeylaWIBA(models.Model):
    _name = 'heyla.wiba.claim'
    _description = 'HEYLA WIBA Claim'
    _inherit = ['mail.thread']
    _rec_name = 'employee'
    _order = 'id desc'

    employee = fields.Char(string='Employee Name', required=True)
    department = fields.Char(string='Department')
    claim_type = fields.Selection([
        ('Medical', 'Medical'),
        ('Disability', 'Disability'),
        ('Death', 'Death'),
        ('Rehabilitation', 'Rehabilitation'),
    ], string='Claim Type', required=True)
    description = fields.Text(string='Description')
    amount = fields.Float(string='Amount', default=0.0)
    status = fields.Selection([
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ], string='Status', default='Pending', tracking=True)
    date_of_incident = fields.Date(string='Date of Incident')
    date_filed = fields.Date(string='Date Filed', default=fields.Date.today)
    insurer_ref = fields.Char(string='Insurer Reference')
