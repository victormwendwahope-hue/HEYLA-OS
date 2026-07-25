from odoo import models, fields, api


class HeylaEHSCompliance(models.Model):
    _name = 'heyla.ehs.compliance'
    _description = 'HEYLA EHS Compliance'
    _inherit = ['mail.thread']
    _rec_name = 'item'
    _order = 'id desc'

    category = fields.Selection([
        ('DOSH', 'DOSH'),
        ('WIBA', 'WIBA'),
    ], string='Category', required=True)
    item = fields.Char(string='Item', required=True)
    status = fields.Selection([
        ('Compliant', 'Compliant'),
        ('Warning', 'Warning'),
        ('Overdue', 'Overdue'),
    ], string='Status', default='Compliant', tracking=True)
    due_date = fields.Date(string='Due Date')
    last_checked = fields.Date(string='Last Checked')
    cert_number = fields.Char(string='Certificate Number')
    expiry_date = fields.Date(string='Expiry Date')
