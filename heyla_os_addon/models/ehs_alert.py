from odoo import models, fields, api


class HeylaEHSAlert(models.Model):
    _name = 'heyla.ehs.alert'
    _description = 'HEYLA EHS Safety Alert'
    _inherit = ['mail.thread']
    _rec_name = 'message'
    _order = 'date desc'

    alert_type = fields.Selection([
        ('Overdue Check', 'Overdue Check'),
        ('Expired Certification', 'Expired Certification'),
        ('High Risk Incident', 'High Risk Incident'),
    ], string='Alert Type', required=True)
    message = fields.Text(string='Message', required=True)
    severity = fields.Selection([
        ('Info', 'Info'),
        ('Warning', 'Warning'),
        ('Critical', 'Critical'),
    ], string='Severity', default='Warning')
    date = fields.Datetime(string='Date', default=fields.Datetime.now)
    read = fields.Boolean(string='Read', default=False)
