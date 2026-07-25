from odoo import models, fields, api


class HeylaPayrollRecord(models.Model):
    _name = 'heyla.payroll.record'
    _description = 'HEYLA Payroll Record'
    _inherit = ['mail.thread']
    _rec_name = 'id'
    _order = 'period desc, id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    period = fields.Char(string='Period', required=True, help='YYYY-MM format')
    pay_type = fields.Selection([
        ('Hourly', 'Hourly'),
        ('Salary', 'Salary'),
        ('Basic', 'Basic'),
    ], string='Pay Type', required=True)
    hourly_rate = fields.Float(string='Hourly Rate', default=0.0)
    hours_worked = fields.Float(string='Hours Worked', default=0.0)
    basic_pay = fields.Float(string='Basic Pay', default=0.0)
    housing_allowance = fields.Float(string='Housing Allowance', default=0.0)
    transport_allowance = fields.Float(string='Transport Allowance', default=0.0)
    medical_allowance = fields.Float(string='Medical Allowance', default=0.0)
    other_allowances = fields.Float(string='Other Allowances', default=0.0)
    overtime = fields.Float(string='Overtime (OT1)', default=0.0)
    overtime2 = fields.Float(string='Overtime (OT2)', default=0.0)
    gross_pay = fields.Float(string='Gross Pay', compute='_compute_gross', store=True)
    deductions = fields.Float(string='Total Deductions', default=0.0)
    net_pay = fields.Float(string='Net Pay', compute='_compute_net', store=True)
    status = fields.Selection([
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Paid', 'Paid'),
    ], string='Status', default='Draft', tracking=True)
    paid_at = fields.Datetime(string='Paid At')
    payslip_generated_at = fields.Datetime(string='Payslip Generated At')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)

    @api.depends('basic_pay', 'housing_allowance', 'transport_allowance', 'medical_allowance', 'other_allowances', 'overtime', 'overtime2')
    def _compute_gross(self):
        for rec in self:
            rec.gross_pay = rec.basic_pay + rec.housing_allowance + rec.transport_allowance + rec.medical_allowance + rec.other_allowances + rec.overtime + rec.overtime2

    @api.depends('gross_pay', 'deductions')
    def _compute_net(self):
        for rec in self:
            rec.net_pay = rec.gross_pay - rec.deductions


class HeylaPayslip(models.Model):
    _name = 'heyla.payslip'
    _description = 'HEYLA Payslip'
    _inherit = ['mail.thread']
    _rec_name = 'payslip_number'
    _order = 'period desc, id desc'

    payroll_record_id = fields.Many2one('heyla.payroll.record', string='Payroll Record', required=True)
    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    payslip_number = fields.Char(string='Payslip Number', readonly=True, copy=False)
    period = fields.Char(string='Period')
    employee_name = fields.Char(string='Employee Name')
    payroll_number = fields.Char(string='Payroll Number')
    department = fields.Char(string='Department')
    position = fields.Char(string='Position')
    basic_pay = fields.Float(string='Basic Pay', default=0.0)
    housing_allowance = fields.Float(string='Housing Allowance', default=0.0)
    transport_allowance = fields.Float(string='Transport Allowance', default=0.0)
    medical_allowance = fields.Float(string='Medical Allowance', default=0.0)
    other_allowances = fields.Float(string='Other Allowances', default=0.0)
    overtime = fields.Float(string='Overtime', default=0.0)
    overtime2 = fields.Float(string='Overtime 2', default=0.0)
    gross_pay = fields.Float(string='Gross Pay', default=0.0)
    paye = fields.Float(string='PAYE', default=0.0)
    nssf = fields.Float(string='NSSF', default=0.0)
    nhif = fields.Float(string='NHIF', default=0.0)
    total_deductions = fields.Float(string='Total Deductions', default=0.0)
    net_pay = fields.Float(string='Net Pay', default=0.0)
    paid_leave_days = fields.Float(string='Paid Leave Days', default=0.0)
    unpaid_leave_days = fields.Float(string='Unpaid Leave Days', default=0.0)
    sick_leave_days = fields.Float(string='Sick Leave Days', default=0.0)
    payment_date = fields.Date(string='Payment Date')
    company_name = fields.Char(string='Company Name', default='HEYLA OS')
    company_kra_pin = fields.Char(string='Company KRA PIN')
    generated_at = fields.Datetime(string='Generated At', default=fields.Datetime.now)
