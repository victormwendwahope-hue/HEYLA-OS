from odoo import api, fields, models


class ExchangeRate(models.Model):
    _name = 'heyla.exchange.rate'
    _description = 'HEYLA Exchange Rate'
    _rec_name = 'from_currency'
    _order = 'year desc, month desc'

    month = fields.Integer(required=True)
    year = fields.Integer(required=True)
    from_currency = fields.Char(required=True)
    to_currency = fields.Char(required=True, default='KES')
    rate = fields.Float(required=True)
    source = fields.Selection([
        ('api', 'API'),
        ('manual', 'Manual'),
    ], default='manual')
    locked = fields.Boolean(default=False)
    locked_by = fields.Char()
    locked_at = fields.Datetime()
    set_by = fields.Char()

    _sql_constraints = [
        ('unique_rate', 'unique(month, year, from_currency, to_currency)',
         'Exchange rate already exists for this period and currency pair.')
    ]
