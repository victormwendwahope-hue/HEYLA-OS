from odoo import api, fields, models


class CasualWorker(models.Model):
    _name = 'heyla.casual.worker'
    _description = 'HEYLA Casual/Daily Worker'
    _inherit = 'mail.thread'
    _rec_name = 'name'
    _order = 'id desc'

    worker_number = fields.Char(readonly=True, copy=False, default='New')
    first_name = fields.Char(required=True, tracking=True)
    last_name = fields.Char(required=True, tracking=True)
    name = fields.Char(compute='_compute_name', store=True)
    phone = fields.Char(required=True)
    email = fields.Char()
    national_id = fields.Char(tracking=True)
    address = fields.Text()
    daily_rate = fields.Float(required=True, default=0.0, tracking=True)
    currency = fields.Char(default='KES')
    payment_frequency = fields.Selection([
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('bi_weekly', 'Bi-Weekly'),
        ('monthly', 'Monthly'),
    ], default='daily', required=True)
    department = fields.Char()
    supervisor = fields.Char()
    engagement_type = fields.Selection([
        ('casual', 'Casual'),
        ('temporary', 'Temporary'),
        ('seasonal', 'Seasonal'),
        ('intern', 'Intern'),
    ], default='casual', tracking=True)
    start_date = fields.Date()
    end_date = fields.Date()
    is_active = fields.Boolean(default=True)
    bank_name = fields.Char()
    bank_account = fields.Char()
    emergency_contact = fields.Char()
    emergency_phone = fields.Char()
    notes = fields.Text()
    total_days_worked = fields.Integer(default=0)
    total_paid = fields.Float(default=0.0)
    last_engagement_date = fields.Date()
    avatar = fields.Char()
    active = fields.Boolean(default=True)

    @api.depends('first_name', 'last_name')
    def _compute_name(self):
        for r in self:
            r.name = f'{r.first_name or ""} {r.last_name or ""}'.strip()

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('worker_number', 'New') == 'New':
                vals['worker_number'] = self.env['ir.sequence'].next_by_code('heyla.casual.worker') or 'CW-0001'
        return super().create(vals_list)


class CasualAttendance(models.Model):
    _name = 'heyla.casual.attendance'
    _description = 'HEYLA Casual Worker Attendance'
    _order = 'date desc'

    worker_id = fields.Many2one('heyla.casual.worker', string='Worker', required=True)
    worker_name = fields.Char(related='worker_id.name', store=True)
    date = fields.Date(required=True, default=fields.Date.today)
    clock_in = fields.Datetime()
    clock_out = fields.Datetime()
    hours_worked = fields.Float(compute='_compute_hours', store=True)
    daily_rate = fields.Float(related='worker_id.daily_rate')
    amount_earned = fields.Float(compute='_compute_amount', store=True)
    currency = fields.Char(related='worker_id.currency')
    overtime_hours = fields.Float(default=0.0)
    overtime_amount = fields.Float(default=0.0)
    notes = fields.Text()

    @api.depends('clock_in', 'clock_out')
    def _compute_hours(self):
        for a in self:
            if a.clock_in and a.clock_out:
                delta = a.clock_out - a.clock_in
                a.hours_worked = max(0, delta.total_seconds() / 3600)
            else:
                a.hours_worked = 0.0

    @api.depends('hours_worked', 'daily_rate')
    def _compute_amount(self):
        for a in self:
            standard_hours = 8.0
            if a.hours_worked and a.daily_rate:
                a.amount_earned = round((a.hours_worked / standard_hours) * a.daily_rate, 2)
            else:
                a.amount_earned = 0.0


class CasualPayment(models.Model):
    _name = 'heyla.casual.payment'
    _description = 'HEYLA Casual Worker Payment'
    _order = 'id desc'

    payment_number = fields.Char(readonly=True, copy=False, default='New')
    worker_id = fields.Many2one('heyla.casual.worker', string='Worker', required=True)
    worker_name = fields.Char(related='worker_id.name', store=True)
    period_start = fields.Date(required=True)
    period_end = fields.Date(required=True)
    days_worked = fields.Integer(default=0)
    total_hours = fields.Float(default=0.0)
    gross_amount = fields.Float(default=0.0)
    deductions = fields.Float(default=0.0)
    net_amount = fields.Float(default=0.0)
    currency = fields.Char(related='worker_id.currency')
    payment_method = fields.Selection([
        ('cash', 'Cash'),
        ('bank', 'Bank Transfer'),
        ('mobile', 'Mobile Money'),
        ('cheque', 'Cheque'),
    ], default='cash')
    paid = fields.Boolean(default=False)
    paid_date = fields.Date()
    paid_by = fields.Char()
    notes = fields.Text()
    status = fields.Selection([
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ], default='draft', tracking=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('payment_number', 'New') == 'New':
                vals['payment_number'] = self.env['ir.sequence'].next_by_code('heyla.casual.payment') or 'CP-0001'
        return super().create(vals_list)
