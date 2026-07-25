from odoo import models, fields, api


class HeylaAttendance(models.Model):
    _name = 'heyla.attendance'
    _description = 'HEYLA Attendance Record'
    _inherit = ['mail.thread']
    _order = 'date desc, id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    date = fields.Date(string='Date', required=True)
    check_in = fields.Char(string='Check In Time')
    check_out = fields.Char(string='Check Out Time')
    status = fields.Selection([
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Half Day', 'Half Day'),
        ('On Leave', 'On Leave'),
    ], string='Status', default='Present', required=True)

    _sql_constraints = [
        ('employee_date_unique', 'unique(employee_id, date)', 'Attendance record for this date already exists!'),
    ]
