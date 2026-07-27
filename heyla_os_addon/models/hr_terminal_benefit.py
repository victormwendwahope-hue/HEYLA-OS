from odoo import api, fields, models


class TerminalBenefitType(models.Model):
    _name = 'heyla.terminal.benefit.type'
    _description = 'HEYLA Terminal Benefit Type'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    category = fields.Selection([
        ('severance', 'Severance Pay'),
        ('gratuity', 'Gratuity'),
        ('final_settlement', 'Final Settlement'),
        ('notice_pay', 'Pay in Lieu of Notice'),
        ('accrued_leave', 'Accrued Leave Pay'),
        ('terminal_dues', 'Terminal Dues'),
        ('other', 'Other'),
    ], default='severance', required=True, tracking=True)
    calculation_method = fields.Selection([
        ('days_per_year', 'X Days per Year of Service'),
        ('percentage_salary', 'Percentage of Monthly Salary'),
        ('weeks_per_year', 'X Weeks per Year of Service'),
        ('fixed_amount', 'Fixed Amount'),
        ('statutory', 'Statutory Formula'),
    ], default='days_per_year', required=True)
    days_per_year = fields.Float(default=15.0, help='Days of pay per year of service')
    weeks_per_year = fields.Float(default=0.0)
    percentage_per_year = fields.Float(default=0.0)
    max_months = fields.Float(default=0.0, help='Maximum months of salary payable')
    min_service_months = fields.Integer(default=6, help='Minimum service months to qualify')
    taxable = fields.Boolean(default=True)
    subject_to_nssf = fields.Boolean(default=False)
    subject_to_nhif = fields.Boolean(default=False)
    is_active = fields.Boolean(default=True)
    notes = fields.Text()


class EmployeeTerminalBenefit(models.Model):
    _name = 'heyla.employee.terminal.benefit'
    _description = 'HEYLA Employee Terminal Benefit'
    _inherit = 'mail.thread'
    _rec_name = 'benefit_number'
    _order = 'id desc'

    benefit_number = fields.Char(readonly=True, copy=False, default='New')
    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    department = fields.Char(related='employee_id.department', store=True)
    benefit_type_id = fields.Many2one('heyla.terminal.benefit.type', string='Benefit Type', required=True, tracking=True)
    category = fields.Selection(related='benefit_type_id.category', store=True)
    termination_date = fields.Date(required=True, tracking=True)
    last_working_date = fields.Date()
    reason_for_exit = fields.Selection([
        ('resignation', 'Resignation'),
        ('retirement', 'Retirement'),
        ('redundancy', 'Redundancy/Layoff'),
        ('dismissal', 'Dismissal'),
        ('mutual', 'Mutual Agreement'),
        ('end_of_contract', 'End of Contract'),
        ('medical', 'Medical Grounds'),
        ('death', 'Death'),
        ('other', 'Other'),
    ], default='resignation', tracking=True)
    service_years = fields.Float(compute='_compute_service_years', store=True)
    service_months = fields.Integer(compute='_compute_service_years', store=True)
    start_date = fields.Date()
    monthly_salary = fields.Float(default=0.0)
    calculated_amount = fields.Float(compute='_compute_amount', store=True)
    currency = fields.Char(default='KES')
    adjustments = fields.Float(default=0.0)
    total_amount = fields.Float(compute='_compute_total', store=True)
    paid = fields.Boolean(default=False)
    paid_date = fields.Date()
    paid_in_payroll = fields.Boolean(default=False)
    payroll_period = fields.Char()
    status = fields.Selection([
        ('draft', 'Draft'),
        ('calculated', 'Calculated'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ], default='draft', required=True, tracking=True)
    approved_by = fields.Char()
    approval_date = fields.Date()
    notes = fields.Text()

    @api.depends('start_date', 'termination_date')
    def _compute_service_years(self):
        for b in self:
            if b.start_date and b.termination_date:
                delta = b.termination_date - b.start_date
                b.service_months = max(0, delta.days // 30)
                b.service_years = round(b.service_months / 12.0, 2)
            else:
                b.service_months = 0
                b.service_years = 0.0

    @api.depends('service_years', 'monthly_salary', 'benefit_type_id')
    def _compute_amount(self):
        for b in self:
            if b.service_years <= 0 or b.monthly_salary <= 0:
                b.calculated_amount = 0.0
                continue
            bt = b.benefit_type_id
            if bt.calculation_method == 'days_per_year' and bt.days_per_year:
                daily_rate = b.monthly_salary / 30
                b.calculated_amount = daily_rate * bt.days_per_year * b.service_years
            elif bt.calculation_method == 'weeks_per_year' and bt.weeks_per_year:
                weekly_rate = b.monthly_salary / 4
                b.calculated_amount = weekly_rate * bt.weeks_per_year * b.service_years
            elif bt.calculation_method == 'percentage_salary' and bt.percentage_per_year:
                b.calculated_amount = b.monthly_salary * (bt.percentage_per_year / 100) * b.service_years
            elif bt.calculation_method == 'fixed_amount':
                b.calculated_amount = b.monthly_salary * min(b.service_years, bt.max_months / 12) if bt.max_months else b.monthly_salary * b.service_years
            else:
                b.calculated_amount = b.monthly_salary * b.service_years / 12 * 15
            if bt.max_months > 0:
                b.calculated_amount = min(b.calculated_amount, b.monthly_salary * bt.max_months)

    @api.depends('calculated_amount', 'adjustments')
    def _compute_total(self):
        for b in self:
            b.total_amount = b.calculated_amount + b.adjustments

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('benefit_number', 'New') == 'New':
                vals['benefit_number'] = self.env['ir.sequence'].next_by_code('heyla.employee.terminal.benefit') or 'TB-0001'
        return super().create(vals_list)
