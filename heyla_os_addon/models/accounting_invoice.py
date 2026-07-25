from odoo import models, fields, api


class HeylaInvoiceLine(models.Model):
    _name = 'heyla.invoice.line'
    _description = 'HEYLA Invoice Line'

    invoice_id = fields.Many2one('heyla.invoice', string='Invoice', required=True, ondelete='cascade')
    description = fields.Char(string='Description', required=True)
    quantity = fields.Float(string='Quantity', default=1.0)
    unit_price = fields.Float(string='Unit Price', default=0.0)
    subtotal = fields.Float(string='Subtotal', compute='_compute_subtotal', store=True)

    @api.depends('quantity', 'unit_price')
    def _compute_subtotal(self):
        for rec in self:
            rec.subtotal = rec.quantity * rec.unit_price


class HeylaInvoice(models.Model):
    _name = 'heyla.invoice'
    _description = 'HEYLA Invoice'
    _inherit = ['mail.thread']
    _rec_name = 'invoice_number'
    _order = 'id desc'

    invoice_number = fields.Char(string='Invoice Number', readonly=True, copy=False)
    client_name = fields.Char(string='Client Name', required=True)
    client_email = fields.Char(string='Client Email')
    line_ids = fields.One2many('heyla.invoice.line', 'invoice_id', string='Invoice Lines')
    subtotal = fields.Float(string='Subtotal', compute='_compute_totals', store=True)
    tax = fields.Float(string='Tax', default=0.0)
    total = fields.Float(string='Total', compute='_compute_totals', store=True)
    status = fields.Selection([
        ('Draft', 'Draft'),
        ('Sent', 'Sent'),
        ('Paid', 'Paid'),
        ('Overdue', 'Overdue'),
    ], string='Status', default='Draft', tracking=True)
    due_date = fields.Date(string='Due Date')
    currency = fields.Char(string='Currency', default='KES')

    @api.depends('line_ids.subtotal', 'tax')
    def _compute_totals(self):
        for rec in self:
            total_sub = sum(line.subtotal for line in rec.line_ids)
            rec.subtotal = total_sub
            rec.total = total_sub + rec.tax
