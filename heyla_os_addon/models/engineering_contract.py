from odoo import models, fields, api


class HeylaEngineeringContract(models.Model):
    _name = 'heyla.engineering.contract'
    _description = 'HEYLA Engineering Contract'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'id desc'

    project_id = fields.Many2one('heyla.engineering.project', string='Project')
    name = fields.Char(string='Contract Name', required=True)
    contract_type = fields.Selection([
        ('Red Book', 'Red Book'),
        ('Yellow Book', 'Yellow Book'),
        ('Silver Book', 'Silver Book'),
        ('Gold Book', 'Gold Book'),
    ], string='FIDIC Type', required=True)
    employer = fields.Char(string='Employer')
    contractor = fields.Char(string='Contractor')
    engineer = fields.Char(string='Engineer')
    price = fields.Float(string='Price', default=0.0)
    status = fields.Selection([
        ('Draft', 'Draft'),
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Terminated', 'Terminated'),
    ], string='Status', default='Draft', tracking=True)
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')
    currency = fields.Char(string='Currency', default='KES')
