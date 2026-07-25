from odoo import models, fields, api


class HeylaTransportDriver(models.Model):
    _name = 'heyla.transport.driver'
    _description = 'HEYLA Transport Driver'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(string='Driver Name', required=True)
    phone = fields.Char(string='Phone')
    license = fields.Char(string='License Number', required=True)
    status = fields.Selection([
        ('Available', 'Available'),
        ('On Trip', 'On Trip'),
        ('Off Duty', 'Off Duty'),
    ], string='Status', default='Available', tracking=True)
    trips = fields.Integer(string='Trips', default=0)
    rating = fields.Float(string='Rating', default=0.0)
    avatar = fields.Char(string='Avatar URL')
