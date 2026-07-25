from odoo import models, fields, api


class HeylaFuelEntry(models.Model):
    _name = 'heyla.fuel.entry'
    _description = 'HEYLA Fuel Entry'
    _inherit = ['mail.thread']
    _order = 'date desc, id desc'

    vehicle_id = fields.Char(string='Vehicle ID')
    vehicle_name = fields.Char(string='Vehicle Name')
    vehicle_model = fields.Char(string='Vehicle Model')
    plate = fields.Char(string='Plate')
    driver = fields.Char(string='Driver')
    date = fields.Date(string='Date', required=True)
    liters = fields.Float(string='Liters', required=True)
    cost_per_liter = fields.Float(string='Cost per Liter', default=0.0)
    total_cost = fields.Float(string='Total Cost', compute='_compute_total', store=True)
    mileage = fields.Float(string='Mileage (km)', default=0.0)
    station = fields.Char(string='Station')
    fuel_type = fields.Selection([
        ('Diesel', 'Diesel'),
        ('Petrol', 'Petrol'),
    ], string='Fuel Type', required=True)
    load_state = fields.Selection([
        ('Loaded', 'Loaded'),
        ('Unloaded', 'Unloaded'),
    ], string='Load State', default='Unloaded')
    cargo_weight = fields.Float(string='Cargo Weight (kg)', default=0.0)
    km_per_liter = fields.Float(string='km/L', compute='_compute_efficiency', store=True)
    trip_distance = fields.Float(string='Trip Distance (km)', default=0.0)

    @api.depends('liters', 'cost_per_liter')
    def _compute_total(self):
        for rec in self:
            rec.total_cost = rec.liters * rec.cost_per_liter

    @api.depends('trip_distance', 'liters')
    def _compute_efficiency(self):
        for rec in self:
            rec.km_per_liter = rec.trip_distance / rec.liters if rec.liters else 0.0
