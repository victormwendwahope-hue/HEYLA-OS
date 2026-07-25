from odoo import models, fields, api


class HeylaProduct(models.Model):
    _name = 'heyla.product'
    _description = 'HEYLA Product/Inventory'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(string='Product Name', required=True)
    sku = fields.Char(string='SKU', required=True)
    category = fields.Char(string='Category')
    price = fields.Float(string='Price', default=0.0)
    cost = fields.Float(string='Cost', default=0.0)
    stock = fields.Float(string='Stock', default=0.0)
    min_stock = fields.Float(string='Min Stock', default=0.0)
    status = fields.Selection([
        ('In Stock', 'In Stock'),
        ('Low Stock', 'Low Stock'),
        ('Out of Stock', 'Out of Stock'),
    ], string='Status', compute='_compute_status', store=True)
    image = fields.Char(string='Image URL')

    @api.depends('stock', 'min_stock')
    def _compute_status(self):
        for rec in self:
            if rec.stock <= 0:
                rec.status = 'Out of Stock'
            elif rec.min_stock and rec.stock <= rec.min_stock:
                rec.status = 'Low Stock'
            else:
                rec.status = 'In Stock'
