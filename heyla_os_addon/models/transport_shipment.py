from odoo import models, fields, api


class HeylaTransportShipment(models.Model):
    _name = 'heyla.transport.shipment'
    _description = 'HEYLA Transport Shipment'
    _inherit = ['mail.thread']
    _rec_name = 'tracking_no'
    _order = 'id desc'

    tracking_no = fields.Char(string='Tracking No', required=True)
    origin = fields.Char(string='Origin')
    destination = fields.Char(string='Destination')
    status = fields.Selection([
        ('Pending', 'Pending'),
        ('Picked Up', 'Picked Up'),
        ('In Transit', 'In Transit'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ], string='Status', default='Pending', tracking=True)
    driver = fields.Char(string='Driver')
    vehicle = fields.Char(string='Vehicle')
    weight = fields.Char(string='Weight')
    estimated_delivery = fields.Date(string='Estimated Delivery')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
