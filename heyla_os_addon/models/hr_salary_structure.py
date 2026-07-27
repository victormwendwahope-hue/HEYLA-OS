from odoo import api, fields, models


class PayGrade(models.Model):
    _name = 'heyla.pay.grade'
    _description = 'HEYLA Pay Grade'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char(tracking=True)
    level = fields.Integer(default=1, tracking=True)
    min_salary = fields.Float(required=True)
    max_salary = fields.Float(required=True)
    currency = fields.Char(default='KES')
    annual_increment = fields.Float(default=0.0, help='Expected annual increment (%)')
    promotion_threshold = fields.Float(default=0.0, help='Years before promotion eligibility')
    department = fields.Char()
    description = fields.Text()
    is_active = fields.Boolean(default=True)


class SalaryComponent(models.Model):
    _name = 'heyla.salary.component'
    _description = 'HEYLA Salary Component'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    category = fields.Selection([
        ('earning', 'Earning'),
        ('deduction', 'Deduction'),
        ('employer_contribution', 'Employer Contribution'),
    ], default='earning', required=True, tracking=True)
    type = fields.Selection([
        ('fixed', 'Fixed Amount'),
        ('percentage_basic', 'Percentage of Basic'),
        ('percentage_gross', 'Percentage of Gross'),
    ], default='fixed', required=True)
    default_amount = fields.Float(default=0.0)
    default_percentage = fields.Float(default=0.0)
    taxable = fields.Boolean(default=True)
    is_mandatory = fields.Boolean(default=False)
    is_active = fields.Boolean(default=True)
    prorated = fields.Boolean(default=True, help='Prorated for mid-month hires/leavers')
    notes = fields.Text()


class EmployeeSalaryStructure(models.Model):
    _name = 'heyla.employee.salary.structure'
    _description = 'HEYLA Employee Salary Structure'
    _inherit = 'mail.thread'
    _rec_name = 'employee_name'
    _order = 'id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    pay_grade_id = fields.Many2one('heyla.pay.grade', string='Pay Grade', tracking=True)
    effective_date = fields.Date(required=True, default=fields.Date.today)
    base_salary = fields.Float(required=True, tracking=True)
    currency = fields.Char(default='KES')
    component_ids = fields.One2many('heyla.employee.salary.component', 'structure_id', string='Components')
    total_earnings = fields.Float(compute='_compute_totals', store=True)
    total_deductions = fields.Float(compute='_compute_totals', store=True)
    net_salary = fields.Float(compute='_compute_totals', store=True)
    is_active = fields.Boolean(default=True)
    approved_by = fields.Char()
    approval_date = fields.Date()
    notes = fields.Text()

    @api.depends('component_ids')
    def _compute_totals(self):
        for s in self:
            earnings = sum(c.amount for c in s.component_ids if c.category == 'earning')
            deductions = sum(c.amount for c in s.component_ids if c.category == 'deduction')
            s.total_earnings = earnings
            s.total_deductions = deductions
            s.net_salary = s.base_salary + earnings - deductions


class EmployeeSalaryComponent(models.Model):
    _name = 'heyla.employee.salary.component'
    _description = 'HEYLA Employee Salary Component'
    _order = 'category, id'

    structure_id = fields.Many2one('heyla.employee.salary.structure', string='Structure', required=True, ondelete='cascade')
    component_id = fields.Many2one('heyla.salary.component', string='Component', required=True)
    component_name = fields.Char(related='component_id.name', store=True)
    category = fields.Selection(related='component_id.category', store=True)
    amount = fields.Float(required=True, default=0.0)
    type = fields.Selection(related='component_id.type')
    percentage = fields.Float(default=0.0)
    currency = fields.Char(default='KES')
