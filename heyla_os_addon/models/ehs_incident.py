from odoo import models, fields, api


class HeylaEHSIncident(models.Model):
    _name = 'heyla.ehs.incident'
    _description = 'HEYLA EHS Incident'
    _inherit = ['mail.thread']
    _rec_name = 'description'
    _order = 'id desc'

    incident_type = fields.Selection([
        ('Accident', 'Accident'),
        ('Near-miss', 'Near-miss'),
        ('Hazard', 'Hazard'),
    ], string='Type', required=True)
    location = fields.Char(string='Location')
    description = fields.Text(string='Description', required=True)
    severity = fields.Selection([
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ], string='Severity', default='Medium')
    status = fields.Selection([
        ('Reported', 'Reported'),
        ('Investigating', 'Investigating'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ], string='Status', default='Reported', tracking=True)
    reported_by = fields.Char(string='Reported By')
    reported_date = fields.Datetime(string='Reported Date', default=fields.Datetime.now)
    assigned_to = fields.Char(string='Assigned To')
    attachments = fields.Text(string='Attachments')
