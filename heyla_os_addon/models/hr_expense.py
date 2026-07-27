from odoo import api, fields, models
from datetime import date


class ExpenseClaim(models.Model):
    _name = 'heyla.expense.claim'
    _description = 'HEYLA Expense Claim'
    _inherit = 'mail.thread'
    _rec_name = 'claim_number'
    _order = 'id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    claim_number = fields.Char(readonly=True, copy=False, default='New')
    category = fields.Selection([
        ('travel', 'Travel'),
        ('meals', 'Meals & Entertainment'),
        ('office', 'Office Supplies'),
        ('transport', 'Transport'),
        ('accommodation', 'Accommodation'),
        ('communication', 'Communication'),
        ('training', 'Training'),
        ('equipment', 'Equipment'),
        ('other', 'Other'),
    ], required=True, tracking=True)
    description = fields.Text(required=True)
    amount = fields.Float(required=True, tracking=True)
    currency = fields.Char(default='KES')
    expense_date = fields.Date(required=True)
    receipt_url = fields.Char()
    status = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('reimbursed', 'Reimbursed'),
    ], default='draft', required=True, tracking=True)
    submitted_at = fields.Datetime(default=fields.Datetime.now)
    approved_by = fields.Char()
    approved_at = fields.Datetime()
    rejected_by = fields.Char()
    rejection_reason = fields.Text()
    reimbursed_in_payroll = fields.Boolean(default=False)
    payroll_period = fields.Char()
    notes = fields.Text()

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('claim_number', 'New') == 'New':
                vals['claim_number'] = self.env['ir.sequence'].next_by_code('heyla.expense') or 'EXP-0001'
        return super().create(vals_list)
