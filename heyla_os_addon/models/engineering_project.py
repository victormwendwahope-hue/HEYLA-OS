from odoo import models, fields, api


class HeylaEngineeringProject(models.Model):
    _name = 'heyla.engineering.project'
    _description = 'HEYLA Engineering Project'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'id desc'

    name = fields.Char(string='Project Name', required=True)
    client = fields.Char(string='Client')
    status = fields.Selection([
        ('Planning', 'Planning'),
        ('In Progress', 'In Progress'),
        ('On Hold', 'On Hold'),
        ('Completed', 'Completed'),
    ], string='Status', default='Planning', tracking=True)
    progress = fields.Float(string='Progress (%)', default=0.0)
    budget = fields.Float(string='Budget', default=0.0)
    spent = fields.Float(string='Spent', default=0.0)
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')
    manager = fields.Char(string='Manager')
