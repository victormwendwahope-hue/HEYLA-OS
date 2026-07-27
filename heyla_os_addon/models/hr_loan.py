from odoo import api, fields, models
from datetime import date


class Loan(models.Model):
    _name = 'heyla.loan'
    _description = 'HEYLA Loan'
    _inherit = 'mail.thread'
    _rec_name = 'loan_number'
    _order = 'id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    loan_number = fields.Char(readonly=True, copy=False, default='New')
    loan_type = fields.Selection([
        ('internal', 'Internal'),
        ('external', 'External'),
    ], default='internal', required=True, tracking=True)
    loan_category = fields.Selection([
        ('emergency', 'Emergency'),
        ('salary_advance', 'Salary Advance'),
        ('equipment', 'Equipment'),
        ('education', 'Education'),
        ('medical', 'Medical'),
        ('housing', 'Housing'),
        ('personal', 'Personal'),
        ('other', 'Other'),
    ], default='personal', required=True, tracking=True)
    principal_amount = fields.Float(required=True, tracking=True)
    currency = fields.Char(default='KES')
    interest_rate = fields.Float(default=0.0, help='Annual interest rate (%)')
    interest_type = fields.Selection([
        ('fixed', 'Fixed'),
        ('reducing', 'Reducing Balance'),
    ], default='reducing')
    repayment_method = fields.Selection([
        ('amortizing', 'Amortizing'),
        ('interest_only', 'Interest Only'),
        ('balloon', 'Balloon Payment'),
    ], default='amortizing')
    term_months = fields.Integer(required=True, default=1)
    payment_frequency = fields.Selection([
        ('monthly', 'Monthly'),
        ('bi_weekly', 'Bi-Weekly'),
        ('weekly', 'Weekly'),
    ], default='monthly')
    grace_period_months = fields.Integer(default=0)
    monthly_payment = fields.Float(compute='_compute_schedule', store=True)
    total_interest = fields.Float(compute='_compute_schedule', store=True)
    total_amount = fields.Float(compute='_compute_schedule', store=True)
    outstanding_balance = fields.Float(default=0.0, tracking=True)
    next_payment_date = fields.Date()
    last_payment_date = fields.Date()
    deduct_from_salary = fields.Boolean(default=True)
    max_deduction_percentage = fields.Float(default=50.0, help='Max % of basic salary per deduction')
    lender_name = fields.Char()
    lender_contact = fields.Char()
    account_number = fields.Char()
    status = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('defaulted', 'Defaulted'),
        ('cancelled', 'Cancelled'),
    ], default='draft', required=True, tracking=True)
    application_date = fields.Date(default=fields.Date.today)
    approval_date = fields.Date()
    disbursement_date = fields.Date()
    maturity_date = fields.Date()
    applied_by = fields.Char()
    approved_by = fields.Char()
    approval_notes = fields.Text()
    notes = fields.Text()
    payment_history = fields.Text()
    is_overdue = fields.Boolean(default=False)
    days_past_due = fields.Integer(default=0)
    payments_remaining = fields.Integer(default=0)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('loan_number', 'New') == 'New':
                vals['loan_number'] = self.env['ir.sequence'].next_by_code('heyla.loan') or 'LN-0001'
        return super().create(vals_list)

    @api.depends('principal_amount', 'interest_rate', 'term_months', 'repayment_method')
    def _compute_schedule(self):
        for loan in self:
            if loan.principal_amount <= 0 or loan.term_months <= 0:
                loan.monthly_payment = 0
                loan.total_interest = 0
                loan.total_amount = 0
                continue

            principal = loan.principal_amount
            rate = loan.interest_rate / 100 / 12
            term = loan.term_months

            if loan.interest_rate <= 0:
                loan.monthly_payment = principal / term
                loan.total_interest = 0
                loan.total_amount = principal
            elif loan.interest_type == 'fixed':
                total_interest = principal * (loan.interest_rate / 100) * (term / 12)
                loan.total_interest = total_interest
                loan.total_amount = principal + total_interest
                loan.monthly_payment = loan.total_amount / term if term else 0
            else:
                monthly = principal * (rate * (1 + rate) ** term) / ((1 + rate) ** term - 1) if rate > 0 else principal / term
                loan.monthly_payment = round(monthly, 2)
                loan.total_amount = round(monthly * term, 2)
                loan.total_interest = round(loan.total_amount - principal, 2)


class LoanPayment(models.Model):
    _name = 'heyla.loan.payment'
    _description = 'HEYLA Loan Payment Schedule'
    _order = 'due_date'

    loan_id = fields.Many2one('heyla.loan', string='Loan', required=True, ondelete='cascade')
    installment = fields.Integer(required=True)
    due_date = fields.Date(required=True)
    principal = fields.Float(default=0.0)
    interest = fields.Float(default=0.0)
    total = fields.Float(default=0.0)
    paid = fields.Boolean(default=False)
    paid_date = fields.Date()
    payment_method = fields.Char()
