from odoo import models, fields, api


class HeylaEmployee(models.Model):
    _name = 'heyla.employee'
    _description = 'HEYLA Employee'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'id desc'

    payroll_number = fields.Char(string='Payroll Number', readonly=True, copy=False, default=lambda self: self._generate_payroll_number())
    first_name = fields.Char(string='First Name', required=True, tracking=True)
    last_name = fields.Char(string='Last Name', required=True, tracking=True)
    name = fields.Char(string='Full Name', compute='_compute_name', store=True)
    email = fields.Char(string='Email', required=True, index=True)
    phone = fields.Char(string='Phone')
    national_id = fields.Char(string='National ID', tracking=True)
    kra_pin = fields.Char(string='KRA PIN', tracking=True)
    nssf_no = fields.Char(string='NSSF No', tracking=True)
    nhif_no = fields.Char(string='NHIF No', tracking=True)
    department = fields.Char(string='Department', tracking=True)
    position = fields.Char(string='Position', tracking=True)
    employment_type = fields.Selection([
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Intern', 'Intern'),
    ], string='Employment Type', default='Full-time', tracking=True)
    pay_type = fields.Selection([
        ('Hourly', 'Hourly'),
        ('Salary', 'Salary'),
        ('Basic', 'Basic'),
    ], string='Pay Type', default='Salary', tracking=True)
    status = fields.Selection([
        ('Active', 'Active'),
        ('On Leave', 'On Leave'),
        ('Terminated', 'Terminated'),
    ], string='Status', default='Active', tracking=True)
    start_date = fields.Date(string='Start Date')
    base_salary = fields.Float(string='Base Salary', default=0.0)
    hourly_rate = fields.Float(string='Hourly Rate', default=0.0)
    housing_allowance = fields.Float(string='Housing Allowance', default=0.0)
    transport_allowance = fields.Float(string='Transport Allowance', default=0.0)
    medical_allowance = fields.Float(string='Medical Allowance', default=0.0)
    other_allowances = fields.Float(string='Other Allowances', default=0.0)
    avatar = fields.Char(string='Avatar URL')
    address = fields.Text(string='Address')
    city = fields.Char(string='City')
    country = fields.Char(string='Country')
    emergency_contact = fields.Char(string='Emergency Contact')
    emergency_phone = fields.Char(string='Emergency Phone')
    bank_name = fields.Char(string='Bank Name')
    bank_account = fields.Char(string='Bank Account')
    paid_leave_days = fields.Float(string='Paid Leave Days', default=0.0)
    unpaid_leave_days = fields.Float(string='Unpaid Leave Days', default=0.0)
    sick_leave_days = fields.Float(string='Sick Leave Days', default=0.0)
    active = fields.Boolean(string='Active', default=True)

    _sql_constraints = [
        ('email_unique', 'unique(email)', 'Email must be unique!'),
    ]

    @api.depends('first_name', 'last_name')
    def _compute_name(self):
        for rec in self:
            rec.name = f'{rec.first_name or ""} {rec.last_name or ""}'.strip()

    @api.model
    def _generate_payroll_number(self):
        last = self.search([], order='id desc', limit=1)
        num = 1
        if last and last.payroll_number:
            try:
                num = int(last.payroll_number.split('-')[-1]) + 1
            except (ValueError, IndexError):
                num = len(self.search([])) + 1
        return f'PAY-{num:05d}'

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('payroll_number'):
                vals['payroll_number'] = self._generate_payroll_number()
        return super().create(vals_list)
