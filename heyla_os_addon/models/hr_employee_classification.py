from odoo import api, fields, models


class EmployeeClassification(models.Model):
    _name = 'heyla.employee.classification'
    _description = 'HEYLA Employee Classification'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    tax_category = fields.Selection([
        ('resident', 'Resident'),
        ('non_resident', 'Non-Resident'),
        ('tax_exempt', 'Tax Exempt'),
        ('special', 'Special Rate'),
    ], default='resident', required=True, tracking=True)
    nssf_applicable = fields.Boolean(default=True)
    nhif_applicable = fields.Boolean(default=True)
    housing_levy_applicable = fields.Boolean(default=True)
    paye_applicable = fields.Boolean(default=True)
    tax_rate_override = fields.Float(default=0.0, help='Override tax rate % if special')
    statutory_notes = fields.Text()
    is_active = fields.Boolean(default=True)


class EmploymentTerm(models.Model):
    _name = 'heyla.employment.term'
    _description = 'HEYLA Employment Term'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    contract_type = fields.Selection([
        ('permanent', 'Permanent'),
        ('fixed_term', 'Fixed Term'),
        ('probation', 'Probation'),
        ('casual', 'Casual'),
        ('internship', 'Internship'),
        ('temporary', 'Temporary'),
        ('consultant', 'Consultant'),
    ], default='permanent', required=True)
    probation_months = fields.Integer(default=3)
    notice_period_days = fields.Integer(default=30)
    leave_entitlement_days = fields.Float(default=21)
    is_pensionable = fields.Boolean(default=True)
    is_active = fields.Boolean(default=True)
    notes = fields.Text()
