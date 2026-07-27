from odoo import api, fields, models


class OvertimePolicy(models.Model):
    _name = 'heyla.overtime.policy'
    _description = 'HEYLA Overtime Policy'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    rate_multiplier = fields.Float(string='Rate Multiplier', default=1.5, required=True, help='e.g. 1.5 = time and a half')
    applicable_days = fields.Selection([
        ('weekday', 'Weekdays'),
        ('weekend', 'Weekends'),
        ('holiday', 'Public Holidays'),
        ('all', 'All Days'),
    ], default='weekday', required=True)
    after_hours = fields.Float(default=8.0, help='After X hours per day')
    after_days = fields.Integer(default=5, help='After X days per week')
    min_overtime_minutes = fields.Integer(default=30, help='Minimum minutes to qualify as overtime')
    requires_approval = fields.Boolean(default=True)
    double_time_after = fields.Float(default=12.0, help='Double time after X hours')
    double_time_multiplier = fields.Float(default=2.0)
    night_shift_multiplier = fields.Float(default=1.25, help='Multiplier for night shift (e.g. 10pm-6am)')
    is_active = fields.Boolean(default=True)
    notes = fields.Text()


class EmployeeOvertime(models.Model):
    _name = 'heyla.employee.overtime'
    _description = 'HEYLA Employee Overtime'
    _inherit = 'mail.thread'
    _order = 'id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    date = fields.Date(required=True, default=fields.Date.today)
    start_time = fields.Datetime(required=True)
    end_time = fields.Datetime(required=True)
    total_hours = fields.Float(compute='_compute_hours', store=True)
    overtime_type = fields.Selection([
        ('weekday', 'Weekday Overtime'),
        ('weekend', 'Weekend Overtime'),
        ('holiday', 'Public Holiday'),
        ('night', 'Night Shift'),
    ], default='weekday', required=True)
    policy_id = fields.Many2one('heyla.overtime.policy', string='Overtime Policy')
    multiplier = fields.Float(default=1.5)
    hourly_rate = fields.Float(compute='_compute_rate', store=True)
    amount = fields.Float(compute='_compute_amount', store=True)
    currency = fields.Char(default='KES')
    approved_by = fields.Char()
    approved = fields.Boolean(default=False)
    paid_in_payroll = fields.Boolean(default=False)
    payroll_period = fields.Char()
    reason = fields.Text()
    notes = fields.Text()

    @api.depends('start_time', 'end_time')
    def _compute_hours(self):
        for o in self:
            if o.start_time and o.end_time:
                delta = o.end_time - o.start_time
                o.total_hours = max(0, round(delta.total_seconds() / 3600, 2))
            else:
                o.total_hours = 0.0

    @api.depends('employee_id.hourly_rate', 'multiplier')
    def _compute_rate(self):
        for o in self:
            base = o.employee_id.hourly_rate or 0
            o.hourly_rate = base * o.multiplier

    @api.depends('total_hours', 'hourly_rate')
    def _compute_amount(self):
        for o in self:
            o.amount = round(o.total_hours * o.hourly_rate, 2)
