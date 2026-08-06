from odoo import models, fields, api


class HeylaTransportVehicle(models.Model):
    _name = 'heyla.transport.vehicle'
    _description = 'HEYLA Transport Vehicle'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(string='Vehicle Name', required=True)
    plate = fields.Char(string='Plate Number', required=True)
    vehicle_type = fields.Selection([
        ('Truck', 'Truck'),
        ('Van', 'Van'),
        ('Motorcycle', 'Motorcycle'),
        ('Car', 'Car'),
    ], string='Type', required=True)
    status = fields.Selection([
        ('Active', 'Active'),
        ('Maintenance', 'Maintenance'),
        ('Idle', 'Idle'),
    ], string='Status', default='Active', tracking=True)
    driver = fields.Char(string='Driver')
    mileage = fields.Float(string='Mileage (km)', default=0.0)
    fuel_type = fields.Selection([
        ('Diesel', 'Diesel'),
        ('Petrol', 'Petrol'),
        ('Electric', 'Electric'),
    ], string='Fuel Type', required=True)
    tank_capacity = fields.Float(string='Tank Capacity (L)', default=0.0)
    last_service = fields.Date(string='Last Service')
