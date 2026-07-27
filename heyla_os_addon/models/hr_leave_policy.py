from odoo import api, fields, models
from datetime import date


class LeavePolicy(models.Model):
    _name = 'heyla.leave.policy'
    _description = 'HEYLA Leave Policy'
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(required=True)
    leave_type = fields.Selection([
        ('annual', 'Annual Leave'),
        ('sick', 'Sick Leave'),
        ('maternity', 'Maternity Leave'),
        ('paternity', 'Paternity Leave'),
        ('unpaid', 'Unpaid Leave'),
        ('compassionate', 'Compassionate Leave'),
        ('study', 'Study Leave'),
        ('custom', 'Custom'),
    ], required=True)
    is_paid = fields.Boolean(default=True)
    annual_allocation = fields.Float(default=21.0, help='Days per year')
    carry_forward_enabled = fields.Boolean(default=True)
    max_carry_forward = fields.Float(default=10.0)
    carry_forward_expiry = fields.Integer(default=90, help='Days into new year')
    accrual_enabled = fields.Boolean(default=False)
    accrual_rate = fields.Float(default=1.75, help='Days accrued per period')
    accrual_frequency = fields.Selection([
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ], default='monthly')
    min_service_months = fields.Integer(default=0)
    max_consecutive_days = fields.Integer(default=30)
    min_notice_days = fields.Integer(default=0)
    requires_documentation = fields.Boolean(default=False)
    documentation_threshold = fields.Integer(default=3, help='Days after which docs required')
    allow_negative_balance = fields.Boolean(default=False)
    max_negative_balance = fields.Float(default=0.0)
    pro_rata_enabled = fields.Boolean(default=True)
    is_active = fields.Boolean(default=True)
    description = fields.Text()


class LeaveBalance(models.Model):
    _name = 'heyla.leave.balance'
    _description = 'HEYLA Leave Balance'
    _rec_name = 'employee_id'
    _order = 'employee_id'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    policy_id = fields.Many2one('heyla.leave.policy', string='Leave Policy', required=True)
    year = fields.Integer(required=True, default=lambda self: date.today().year)
    total_allocated = fields.Float(default=0.0)
    total_taken = fields.Float(default=0.0)
    total_pending = fields.Float(default=0.0)
    total_carried_forward = fields.Float(default=0.0)
    balance = fields.Float(compute='_compute_balance', store=True)

    @api.depends('total_allocated', 'total_taken', 'total_pending', 'total_carried_forward')
    def _compute_balance(self):
        for b in self:
            b.balance = b.total_allocated + b.total_carried_forward - b.total_taken - b.total_pending
