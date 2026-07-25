from odoo import models, fields, api


class HeylaEHSInspection(models.Model):
    _name = 'heyla.ehs.inspection'
    _description = 'HEYLA EHS Inspection'
    _inherit = ['mail.thread']
    _rec_name = 'title'
    _order = 'id desc'

    title = fields.Char(string='Title', required=True)
    location = fields.Char(string='Location')
    inspector = fields.Char(string='Inspector')
    date = fields.Date(string='Date')
    status = fields.Selection([
        ('Scheduled', 'Scheduled'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ], string='Status', default='Scheduled', tracking=True)
    result = fields.Selection([
        ('Pass', 'Pass'),
        ('Fail', 'Fail'),
        ('Conditional', 'Conditional'),
    ], string='Result')
    checklist_ids = fields.One2many('heyla.ehs.inspection.checklist', 'inspection_id', string='Checklist')


class HeylaEHSInspectionChecklist(models.Model):
    _name = 'heyla.ehs.inspection.checklist'
    _description = 'HEYLA EHS Inspection Checklist Item'

    inspection_id = fields.Many2one('heyla.ehs.inspection', string='Inspection', required=True, ondelete='cascade')
    item = fields.Char(string='Checklist Item', required=True)
    checked = fields.Boolean(string='Checked', default=False)
    notes = fields.Text(string='Notes')
