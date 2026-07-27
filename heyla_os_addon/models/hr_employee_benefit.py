from odoo import api, fields, models


class BenefitPlan(models.Model):
    _name = 'heyla.benefit.plan'
    _description = 'HEYLA Benefit Plan'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    category = fields.Selection([
        ('health_insurance', 'Health Insurance'),
        ('life_insurance', 'Life Insurance'),
        ('disability_insurance', 'Disability Insurance'),
        ('dental', 'Dental Cover'),
        ('vision', 'Vision Cover'),
        ('gym', 'Gym Membership'),
        ('transport', 'Transport Benefit'),
        ('meal', 'Meal Allowance'),
        ('phone', 'Phone/Internet Allowance'),
        ('stock', 'Stock Options'),
        ('pension', 'Pension/Retirement'),
        ('education', 'Education Assistance'),
        ('other', 'Other'),
    ], default='health_insurance', required=True, tracking=True)
    provider = fields.Char()
    provider_contact = fields.Char()
    policy_number = fields.Char()
    cost_per_employee = fields.Float(default=0.0)
    employer_contribution = fields.Float(default=100.0, help='Employer contribution % (0-100)')
    employee_contribution = fields.Float(default=0.0, help='Employee contribution %')
    currency = fields.Char(default='KES')
    coverage_description = fields.Text()
    is_active = fields.Boolean(default=True)
    requires_opt_in = fields.Boolean(default=True)
    enrollment_deadline = fields.Date()
    notes = fields.Text()


class EmployeeBenefit(models.Model):
    _name = 'heyla.employee.benefit'
    _description = 'HEYLA Employee Benefit'
    _inherit = 'mail.thread'
    _rec_name = 'employee_name'
    _order = 'id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    plan_id = fields.Many2one('heyla.benefit.plan', string='Benefit Plan', required=True, tracking=True)
    plan_name = fields.Char(related='plan_id.name', store=True)
    category = fields.Selection(related='plan_id.category', store=True)
    enrollment_date = fields.Date(default=fields.Date.today)
    opt_in = fields.Boolean(default=True)
    employee_cost = fields.Float(compute='_compute_costs', store=True)
    employer_cost = fields.Float(compute='_compute_costs', store=True)
    total_cost = fields.Float(compute='_compute_costs', store=True)
    currency = fields.Char(related='plan_id.currency')
    coverage_start = fields.Date()
    coverage_end = fields.Date()
    status = fields.Selection([
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ], default='pending', tracking=True)
    notes = fields.Text()

    @api.depends('plan_id.cost_per_employee', 'plan_id.employer_contribution')
    def _compute_costs(self):
        for b in self:
            cost = b.plan_id.cost_per_employee or 0
            emp_contrib_pct = 100 - (b.plan_id.employer_contribution or 0)
            b.employer_cost = round(cost * (b.plan_id.employer_contribution / 100), 2)
            b.employee_cost = round(cost * (emp_contrib_pct / 100), 2)
            b.total_cost = cost


class EmployeeDependent(models.Model):
    _name = 'heyla.employee.dependent'
    _description = 'HEYLA Employee Dependent'
    _rec_name = 'name'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    name = fields.Char(required=True)
    relationship = fields.Selection([
        ('spouse', 'Spouse'),
        ('child', 'Child'),
        ('parent', 'Parent'),
        ('sibling', 'Sibling'),
        ('other', 'Other'),
    ], required=True)
    date_of_birth = fields.Date()
    national_id = fields.Char()
    gender = fields.Selection([('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    is_student = fields.Boolean(default=False)
    is_disabled = fields.Boolean(default=False)
    benefit_ids = fields.Many2many('heyla.benefit.plan', string='Covered Under')
