from odoo import models, fields, api


class HeylaLeave(models.Model):
    _name = 'heyla.leave'
    _description = 'HEYLA Leave Request'
    _inherit = ['mail.thread']
    _rec_name = 'employee_id'
    _order = 'id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    leave_type = fields.Selection([
        ('Annual', 'Annual'),
        ('Sick', 'Sick'),
        ('Maternity', 'Maternity'),
        ('Paternity', 'Paternity'),
        ('Compassionate', 'Compassionate'),
        ('Study', 'Study'),
    ], string='Leave Type', required=True)
    start_date = fields.Date(string='Start Date', required=True)
    end_date = fields.Date(string='End Date', required=True)
    reason = fields.Text(string='Reason')
    status = fields.Selection([
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ], string='Status', default='Pending', tracking=True)
    days = fields.Float(string='Days', compute='_compute_days', store=True)

    @api.depends('start_date', 'end_date')
    def _compute_days(self):
        for rec in self:
            if rec.start_date and rec.end_date:
                diff = (rec.end_date - rec.start_date).days + 1
                rec.days = max(diff, 0)
            else:
                rec.days = 0
