from odoo import fields, models


class Holiday(models.Model):
    _name = 'heyla.holiday'
    _description = 'HEYLA Holiday'
    _order = 'date desc'

    name = fields.Char(required=True)
    date = fields.Date(required=True)
    holiday_type = fields.Selection([
        ('public', 'Public Holiday'),
        ('company', 'Company Holiday'),
        ('religious', 'Religious Holiday'),
        ('regional', 'Regional Holiday'),
    ], default='public', required=True)
    country = fields.Char()
    state = fields.Char()
    is_recurring = fields.Boolean(default=False)
    is_active = fields.Boolean(default=True)
    notes = fields.Text()
