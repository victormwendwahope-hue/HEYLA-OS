from odoo import api, fields, models


class DisciplinaryType(models.Model):
    _name = 'heyla.disciplinary.type'
    _description = 'HEYLA Disciplinary Type'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    severity = fields.Selection([
        ('minor', 'Minor'),
        ('moderate', 'Moderate'),
        ('major', 'Major'),
        ('critical', 'Critical'),
    ], default='moderate', required=True)
    category = fields.Selection([
        ('attendance', 'Attendance/Punctuality'),
        ('performance', 'Performance'),
        ('conduct', 'Misconduct'),
        ('policy', 'Policy Violation'),
        ('harassment', 'Harassment'),
        ('fraud', 'Fraud/Dishonesty'),
        ('safety', 'Safety Violation'),
        ('insubordination', 'Insubordination'),
        ('other', 'Other'),
    ], default='conduct', tracking=True)
    typical_action = fields.Selection([
        ('verbal_warning', 'Verbal Warning'),
        ('written_warning', 'Written Warning'),
        ('final_warning', 'Final Written Warning'),
        ('suspension', 'Suspension'),
        ('demotion', 'Demotion'),
        ('salary_cut', 'Salary Cut'),
        ('termination', 'Termination'),
        ('legal_action', 'Legal Action'),
    ], default='written_warning')
    max_occurrences_before_escalation = fields.Integer(default=3)
    is_active = fields.Boolean(default=True)
    notes = fields.Text()


class DisciplinaryCase(models.Model):
    _name = 'heyla.disciplinary.case'
    _description = 'HEYLA Disciplinary Case'
    _inherit = 'mail.thread'
    _rec_name = 'case_number'
    _order = 'id desc'

    case_number = fields.Char(readonly=True, copy=False, default='New')
    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    department = fields.Char(related='employee_id.department', store=True)
    disciplinary_type_id = fields.Many2one('heyla.disciplinary.type', string='Type', required=True, tracking=True)
    category = fields.Selection(related='disciplinary_type_id.category', store=True)
    severity = fields.Selection(related='disciplinary_type_id.severity', store=True)
    incident_date = fields.Date(required=True)
    reported_by = fields.Char()
    description = fields.Text(required=True)
    action_taken = fields.Selection([
        ('verbal_warning', 'Verbal Warning'),
        ('written_warning', 'Written Warning'),
        ('final_warning', 'Final Written Warning'),
        ('suspension', 'Suspension'),
        ('demotion', 'Demotion'),
        ('salary_cut', 'Salary Cut'),
        ('termination', 'Termination'),
        ('legal_action', 'Legal Action'),
        ('dismissed', 'Dismissed (No Action)'),
        ('other', 'Other'),
    ], tracking=True)
    suspension_start = fields.Date()
    suspension_end = fields.Date()
    suspension_days = fields.Integer(compute='_compute_suspension_days', store=True)
    evidence_urls = fields.Text(help='Comma-separated URLs of evidence documents')
    witness_ids = fields.Text(help='Names of witnesses')
    outcome = fields.Text()
    action_date = fields.Date()
    approved_by = fields.Char()
    status = fields.Selection([
        ('reported', 'Reported'),
        ('investigating', 'Under Investigation'),
        ('hearing', 'Hearing Scheduled'),
        ('resolved', 'Resolved'),
        ('appealed', 'Appealed'),
        ('closed', 'Closed'),
    ], default='reported', required=True, tracking=True)
    appeal_date = fields.Date()
    appeal_outcome = fields.Text()
    notes = fields.Text()

    @api.depends('suspension_start', 'suspension_end')
    def _compute_suspension_days(self):
        for c in self:
            if c.suspension_start and c.suspension_end:
                delta = c.suspension_end - c.suspension_start
                c.suspension_days = max(0, delta.days)
            else:
                c.suspension_days = 0

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('case_number', 'New') == 'New':
                vals['case_number'] = self.env['ir.sequence'].next_by_code('heyla.disciplinary.case') or 'DC-0001'
        return super().create(vals_list)


class Grievance(models.Model):
    _name = 'heyla.grievance'
    _description = 'HEYLA Grievance'
    _inherit = 'mail.thread'
    _rec_name = 'grievance_number'
    _order = 'id desc'

    grievance_number = fields.Char(readonly=True, copy=False, default='New')
    employee_id = fields.Many2one('heyla.employee', string='Raised By', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    grievance_type = fields.Selection([
        ('harassment', 'Harassment'),
        ('discrimination', 'Discrimination'),
        ('working_conditions', 'Working Conditions'),
        ('compensation', 'Compensation/Pay'),
        ('supervisor', 'Supervisor/Management'),
        ('colleague', 'Colleague Conflict'),
        ('policy', 'Policy/Procedure'),
        ('other', 'Other'),
    ], default='other', required=True, tracking=True)
    subject = fields.Char(required=True)
    description = fields.Text(required=True)
    incident_date = fields.Date()
    against_employee = fields.Char()
    is_confidential = fields.Boolean(default=False)
    status = fields.Selection([
        ('submitted', 'Submitted'),
        ('reviewing', 'Under Review'),
        ('investigating', 'Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ], default='submitted', required=True, tracking=True)
    resolution = fields.Text()
    resolved_by = fields.Char()
    resolved_date = fields.Date()
    notes = fields.Text()

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('grievance_number', 'New') == 'New':
                vals['grievance_number'] = self.env['ir.sequence'].next_by_code('heyla.grievance') or 'GRV-0001'
        return super().create(vals_list)
