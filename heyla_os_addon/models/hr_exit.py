from odoo import api, fields, models


class ExitType(models.Model):
    _name = 'heyla.exit.type'
    _description = 'HEYLA Exit Type'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    notice_period_days = fields.Integer(default=30)
    requires_clearance = fields.Boolean(default=True)
    requires_exit_interview = fields.Boolean(default=True)
    is_active = fields.Boolean(default=True)


class EmployeeExit(models.Model):
    _name = 'heyla.employee.exit'
    _description = 'HEYLA Employee Exit Process'
    _inherit = 'mail.thread'
    _rec_name = 'exit_number'
    _order = 'id desc'

    exit_number = fields.Char(readonly=True, copy=False, default='New')
    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    department = fields.Char(related='employee_id.department', store=True)
    position = fields.Char(related='employee_id.position', store=True)
    start_date = fields.Date(related='employee_id.start_date')
    exit_type_id = fields.Many2one('heyla.exit.type', string='Exit Type', tracking=True)
    reason = fields.Selection([
        ('resignation', 'Resignation'),
        ('retirement', 'Retirement'),
        ('redundancy', 'Redundancy'),
        ('dismissal', 'Dismissal'),
        ('mutual', 'Mutual Agreement'),
        ('end_of_contract', 'End of Contract'),
        ('medical', 'Medical'),
        ('death', 'Death'),
        ('other', 'Other'),
    ], default='resignation', required=True, tracking=True)
    reason_details = fields.Text()
    notice_date = fields.Date(required=True, default=fields.Date.today)
    last_working_date = fields.Date()
    notice_period_days = fields.Integer(default=30)
    exit_date = fields.Date()
    status = fields.Selection([
        ('noticed', 'Notice Given'),
        ('clearance', 'In Clearance'),
        ('approved', 'Approved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='noticed', required=True, tracking=True)
    is_eligible_for_rehire = fields.Boolean(default=True)
    final_settlement_amount = fields.Float(default=0.0)
    settlement_currency = fields.Char(default='KES')
    settlement_paid = fields.Boolean(default=False)
    settlement_paid_date = fields.Date()
    certificate_url = fields.Char('Certificate of Service URL')
    notes = fields.Text()

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('exit_number', 'New') == 'New':
                vals['exit_number'] = self.env['ir.sequence'].next_by_code('heyla.employee.exit') or 'EXT-0001'
        return super().create(vals_list)


class ExitChecklist(models.Model):
    _name = 'heyla.exit.checklist'
    _description = 'HEYLA Exit Checklist'
    _rec_name = 'task_name'
    _order = 'sequence'

    exit_id = fields.Many2one('heyla.employee.exit', string='Exit', required=True, ondelete='cascade')
    task_name = fields.Char(required=True)
    category = fields.Selection([
        ('hr', 'HR'),
        ('it', 'IT'),
        ('finance', 'Finance'),
        ('operations', 'Operations'),
        ('admin', 'Admin'),
    ], default='hr', required=True)
    assigned_to = fields.Char()
    sequence = fields.Integer(default=10)
    completed = fields.Boolean(default=False)
    completed_by = fields.Char()
    completed_date = fields.Date()
    notes = fields.Text()


class ExitInterview(models.Model):
    _name = 'heyla.exit.interview'
    _description = 'HEYLA Exit Interview'
    _rec_name = 'employee_name'
    _order = 'id desc'

    exit_id = fields.Many2one('heyla.employee.exit', string='Exit', required=True, ondelete='cascade')
    employee_id = fields.Many2one('heyla.employee', string='Employee', related='exit_id.employee_id', store=True)
    employee_name = fields.Char(related='exit_id.employee_name', store=True)
    interview_date = fields.Date(default=fields.Date.today)
    interviewer = fields.Char()
    reason_for_leaving = fields.Text()
    feedback_on_company = fields.Text()
    feedback_on_management = fields.Text()
    feedback_on_coworkers = fields.Text()
    would_recommend = fields.Selection([
        ('yes', 'Yes'),
        ('no', 'No'),
        ('maybe', 'Maybe'),
    ])
    improvements_suggested = fields.Text()
    overall_satisfaction = fields.Selection([
        ('very_satisfied', 'Very Satisfied'),
        ('satisfied', 'Satisfied'),
        ('neutral', 'Neutral'),
        ('dissatisfied', 'Dissatisfied'),
        ('very_dissatisfied', 'Very Dissatisfied'),
    ])
    notes = fields.Text()
