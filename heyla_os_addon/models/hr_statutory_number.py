from odoo import fields, models


class EmployeeStatutoryNumber(models.Model):
    _name = 'heyla.employee.statutory.number'
    _description = 'HEYLA Employee Statutory Number'
    _rec_name = 'employee_id'
    _order = 'employee_id'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    statutory_type = fields.Selection([
        ('nssf', 'NSSF Number'),
        ('nhif', 'NHIF Number'),
        ('kra_pin', 'KRA PIN'),
        ('social_security', 'Social Security Number'),
        ('tax_id', 'Tax ID'),
        ('pension', 'Pension Number'),
        ('other', 'Other'),
    ], required=True)
    number = fields.Char(required=True)
    is_active = fields.Boolean(default=True)
    notes = fields.Text()

    _sql_constraints = [
        ('unique_employee_statutory', 'unique(employee_id, statutory_type)',
         'This statutory type is already registered for this employee.')
    ]
