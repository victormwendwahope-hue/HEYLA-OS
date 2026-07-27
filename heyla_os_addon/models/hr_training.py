from odoo import api, fields, models


class TrainingCourse(models.Model):
    _name = 'heyla.training.course'
    _description = 'HEYLA Training Course'
    _inherit = 'mail.thread'
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    code = fields.Char()
    category = fields.Selection([
        ('technical', 'Technical Skills'),
        ('soft_skills', 'Soft Skills'),
        ('compliance', 'Compliance/Regulatory'),
        ('safety', 'Health & Safety'),
        ('leadership', 'Leadership'),
        ('it', 'IT/Systems'),
        ('professional', 'Professional Development'),
        ('onboarding', 'Onboarding'),
        ('other', 'Other'),
    ], default='technical', tracking=True)
    description = fields.Text()
    duration_hours = fields.Float(default=0.0)
    duration_days = fields.Float(default=0.0)
    delivery_method = fields.Selection([
        ('in_person', 'In-Person'),
        ('virtual', 'Virtual'),
        ('hybrid', 'Hybrid'),
        ('self_paced', 'Self-Paced'),
    ], default='in_person')
    provider = fields.Char()
    cost_per_participant = fields.Float(default=0.0)
    currency = fields.Char(default='KES')
    certification_offered = fields.Boolean(default=False)
    certification_name = fields.Char()
    validity_period_months = fields.Integer(default=0, help='0 = no expiry')
    is_mandatory = fields.Boolean(default=False)
    is_active = fields.Boolean(default=True)
    notes = fields.Text()


class TrainingSession(models.Model):
    _name = 'heyla.training.session'
    _description = 'HEYLA Training Session'
    _inherit = 'mail.thread'
    _rec_name = 'name'
    _order = 'start_date desc'

    name = fields.Char(required=True)
    course_id = fields.Many2one('heyla.training.course', string='Course', required=True)
    trainer = fields.Char()
    start_date = fields.Date(required=True)
    end_date = fields.Date()
    start_time = fields.Float()
    end_time = fields.Float()
    location = fields.Char()
    max_participants = fields.Integer(default=0)
    status = fields.Selection([
        ('planned', 'Planned'),
        ('open', 'Open for Enrollment'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ], default='planned', tracking=True)
    notes = fields.Text()


class EmployeeTraining(models.Model):
    _name = 'heyla.employee.training'
    _description = 'HEYLA Employee Training Record'
    _inherit = 'mail.thread'
    _rec_name = 'employee_name'
    _order = 'id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    course_id = fields.Many2one('heyla.training.course', string='Course', required=True)
    course_name = fields.Char(related='course_id.name', store=True)
    session_id = fields.Many2one('heyla.training.session', string='Session')
    enrollment_date = fields.Date(default=fields.Date.today)
    completion_date = fields.Date()
    status = fields.Selection([
        ('enrolled', 'Enrolled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ], default='enrolled', required=True, tracking=True)
    score = fields.Float(default=0.0)
    grade = fields.Char()
    certificate_number = fields.Char()
    certificate_url = fields.Char()
    certificate_expiry = fields.Date()
    cost = fields.Float(default=0.0)
    currency = fields.Char(default='KES')
    feedback = fields.Text()
    notes = fields.Text()


class EmployeeCertification(models.Model):
    _name = 'heyla.employee.certification'
    _description = 'HEYLA Employee Certification'
    _inherit = 'mail.thread'
    _rec_name = 'name'
    _order = 'id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True, tracking=True)
    employee_name = fields.Char(related='employee_id.name', store=True)
    name = fields.Char(required=True)
    issuing_body = fields.Char()
    certificate_number = fields.Char()
    issue_date = fields.Date()
    expiry_date = fields.Date()
    never_expires = fields.Boolean(default=False)
    credential_url = fields.Char()
    skills = fields.Text()
    notes = fields.Text()
