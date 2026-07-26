from odoo import models, fields, api
from odoo.exceptions import ValidationError
import re


class HeylaUser(models.Model):
    _name = 'heyla.user'
    _description = 'HEYLA User'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(string='Full Name', required=True, tracking=True)
    email = fields.Char(string='Email', required=True, index=True, tracking=True)
    password = fields.Char(string='Password', required=True)
    company = fields.Char(string='Company', tracking=True)
    role = fields.Selection([
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('individual', 'Individual'),
    ], string='Role', default='employee', required=True, tracking=True)
    avatar = fields.Char(string='Avatar URL')
    refresh_token = fields.Char(string='Refresh Token')
    active = fields.Boolean(string='Active', default=True)
    last_login = fields.Datetime(string='Last Login')
    facility_name = fields.Char(string='Facility Name', tracking=True)
    facility_logo = fields.Char(string='Facility Logo URL')

    _sql_constraints = [
        ('email_unique', 'unique(email)', 'Email must be unique!'),
    ]

    @api.constrains('email')
    def _check_email(self):
        for rec in self:
            if rec.email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', rec.email):
                raise ValidationError('Invalid email format!')
