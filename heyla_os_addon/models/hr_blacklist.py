from odoo import models, fields, api


class HeylaBlacklist(models.Model):
    _name = 'heyla.blacklist'
    _description = 'HEYLA Employee Blacklist'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'id desc'

    name = fields.Char(string='Name', required=True)
    email = fields.Char(string='Email')
    reason = fields.Text(string='Reason', required=True)
    added_date = fields.Date(string='Added Date', default=fields.Date.today)
    added_by = fields.Char(string='Added By')
    severity = fields.Selection([
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ], string='Severity', default='Medium')
