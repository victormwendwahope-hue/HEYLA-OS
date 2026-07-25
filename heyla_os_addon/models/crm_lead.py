from odoo import models, fields, api


class HeylaLead(models.Model):
    _name = 'heyla.lead'
    _description = 'HEYLA CRM Lead'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'id desc'

    name = fields.Char(string='Lead Name', required=True)
    email = fields.Char(string='Email')
    phone = fields.Char(string='Phone')
    company = fields.Char(string='Company')
    status = fields.Selection([
        ('New', 'New'),
        ('Contacted', 'Contacted'),
        ('Qualified', 'Qualified'),
        ('Proposal', 'Proposal'),
        ('Won', 'Won'),
        ('Lost', 'Lost'),
    ], string='Status', default='New', tracking=True)
    value = fields.Float(string='Value', default=0.0)
    source = fields.Char(string='Source')
    assigned_to = fields.Char(string='Assigned To')
    notes = fields.Text(string='Notes')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
