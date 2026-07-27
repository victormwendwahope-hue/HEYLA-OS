from odoo import api, fields, models


class BonusType(models.Model):
    _name = 'heyla.bonus.type'
    _description = 'HEYLA Bonus Type'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char(tracking=True)
    description = fields.Text()
    category = fields.Selection([
        ('performance', 'Performance Bonus'),
        ('annual', 'Annual Bonus'),
        ('holiday', 'Holiday Bonus'),
        ('referral', 'Referral Bonus'),
        ('signing', 'Signing Bonus'),
        ('retention', 'Retention Bonus'),
        ('commission', 'Commission'),
        ('profit_sharing', 'Profit Sharing'),
        ('spot', 'Spot/On-the-spot Award'),
        ('other', 'Other'),
    ], default='performance', required=True, tracking=True)
    calculation_basis = fields.Selection([
        ('percentage_salary', 'Percentage of Salary'),
        ('percentage_gross', 'Percentage of Gross Pay'),
        ('fixed_amount', 'Fixed Amount'),
        ('formula', 'Custom Formula'),
    ], default='fixed_amount', required=True)
    default_amount = fields.Float(default=0.0)
    default_percentage = fields.Float(default=0.0, help='Percentage value (e.g. 10 for 10%)')
    taxable = fields.Boolean(default=True)
    requires_approval = fields.Boolean(default=True)
    is_recurring = fields.Boolean(default=False)
    frequency = fields.Selection([
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('semi_annual', 'Semi-Annual'),
        ('annual', 'Annual'),
        ('one_time', 'One-Time'),
    ], default='one_time')
    is_active = fields.Boolean(default=True)
    rules = fields.Text(help='Qualification rules / criteria')


class EmployeeBonus(models.Model):
    _name = 'heyla.employee.bonus'
    _description = 'HEYLA Employee Bonus'
    _inherit = 'mail.thread'
    _rec_name = 'bonus_number'
    _order = 'id desc'

    bonus_number = fields.Char(readonly=True, copy=False, default='New')
    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    bonus_type_id = fields.Many2one('heyla.bonus.type', string='Bonus Type', required=True, tracking=True)
    bonus_type_name = fields.Char(related='bonus_type_id.name', store=True)
    category = fields.Selection(related='bonus_type_id.category', store=True)
    amount = fields.Float(required=True, tracking=True)
    currency = fields.Char(default='KES')
    percentage = fields.Float(default=0.0)
    calculation_basis = fields.Selection(related='bonus_type_id.calculation_basis')
    taxable = fields.Boolean(related='bonus_type_id.taxable')
    period = fields.Char(string='Period (MM/YYYY)')
    award_date = fields.Date(default=fields.Date.today)
    reason = fields.Text()
    approved_by = fields.Char()
    approval_date = fields.Date()
    paid_in_payroll = fields.Boolean(default=False)
    payroll_period = fields.Char()
    paid_date = fields.Date()
    status = fields.Selection([
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ], default='draft', required=True, tracking=True)
    notes = fields.Text()

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('bonus_number', 'New') == 'New':
                vals['bonus_number'] = self.env['ir.sequence'].next_by_code('heyla.employee.bonus') or 'BNS-0001'
        return super().create(vals_list)
