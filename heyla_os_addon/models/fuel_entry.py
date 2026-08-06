from odoo import models, fields, api


class HeylaFuelEntry(models.Model):
    _name = 'heyla.fuel.entry'
    _description = 'HEYLA Fuel Entry'
    _inherit = ['mail.thread']
    _order = 'date desc, id desc'

    vehicle_id = fields.Char(string='Vehicle ID')
    vehicle_name = fields.Char(string='Vehicle Name')
    vehicle_model = fields.Char(string='Vehicle Model')
    vehicle_type = fields.Char(string='Vehicle Type', default='Truck')
    plate = fields.Char(string='Plate')
    driver = fields.Char(string='Driver')
    date = fields.Date(string='Date', required=True)
    liters = fields.Float(string='Liters', required=True)
    cost_per_liter = fields.Float(string='Cost per Liter', default=0.0)
    total_cost = fields.Float(string='Total Cost', compute='_compute_total', store=True)
    mileage = fields.Float(string='Odometer (km)', default=0.0)
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
    tank_capacity = fields.Float(string='Tank Capacity (L)', default=0.0)
    cost_per_km = fields.Float(string='Cost per km', compute='_compute_costs', store=True)
    notes = fields.Char(string='Notes')

    @api.depends('liters', 'cost_per_liter')
    def _compute_total(self):
        for rec in self:
            rec.total_cost = rec.liters * rec.cost_per_liter

    def _previous_entry(self):
        """Previous fill for the same vehicle (by plate) with a lower odometer reading."""
        self.ensure_one()
        if not self.plate or not self.mileage:
            return False
        return self.env['heyla.fuel.entry'].sudo().search([
            ('plate', '=', self.plate),
            ('mileage', '>', 0),
            ('mileage', '<', self.mileage),
            ('id', '!=', self.id),
        ], order='date desc, mileage desc, id desc', limit=1)

    def _odometer_distance(self):
        """Fill-to-fill distance driven since the previous refuel of the same vehicle."""
        self.ensure_one()
        prev = self._previous_entry()
        if prev and self.mileage > prev.mileage:
            return self.mileage - prev.mileage
        return 0.0

    def _distance(self):
        """Best available distance: odometer-based fill-to-fill, else recorded trip distance."""
        return self._odometer_distance() or self.trip_distance or 0.0

    @api.depends('liters', 'trip_distance', 'mileage', 'plate')
    def _compute_efficiency(self):
        for rec in self:
            distance = rec._distance()
            rec.km_per_liter = distance / rec.liters if rec.liters else 0.0

    @api.depends('total_cost', 'trip_distance', 'mileage', 'plate')
    def _compute_costs(self):
        for rec in self:
            distance = rec._distance()
            rec.cost_per_km = rec.total_cost / distance if distance else 0.0
