from odoo import api, fields, models


class JobRequisition(models.Model):
    _name = 'heyla.job.requisition'
    _description = 'HEYLA Job Requisition'
    _inherit = 'mail.thread'
    _rec_name = 'requisition_number'
    _order = 'id desc'

    requisition_number = fields.Char(readonly=True, copy=False, default='New')
    title = fields.Char(required=True, tracking=True)
    department = fields.Char(tracking=True)
    reporting_to = fields.Char()
    employment_type = fields.Selection([
        ('full_time', 'Full-Time'),
        ('part_time', 'Part-Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('temporary', 'Temporary'),
    ], default='full_time', required=True)
    contract_type = fields.Selection([
        ('permanent', 'Permanent'),
        ('fixed_term', 'Fixed Term'),
        ('probation', 'Probation'),
        ('casual', 'Casual'),
    ], default='permanent')
    vacancies_count = fields.Integer(default=1, required=True)
    location = fields.Char()
    min_salary = fields.Float(default=0.0)
    max_salary = fields.Float(default=0.0)
    currency = fields.Char(default='KES')
    urgency = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], default='medium')
    justification = fields.Text(required=True)
    qualifications = fields.Text()
    responsibilities = fields.Text()
    skills_required = fields.Text()
    budgeted = fields.Boolean(default=False)
    budget_amount = fields.Float(default=0.0)
    requested_by = fields.Char()
    request_date = fields.Date(default=fields.Date.today)
    approved_by = fields.Char()
    approval_date = fields.Date()
    status = fields.Selection([
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewing', 'Under Review'),
        ('approved', 'Approved'),
        ('filled', 'Filled'),
        ('cancelled', 'Cancelled'),
    ], default='draft', required=True, tracking=True)
    rejection_reason = fields.Text()
    notes = fields.Text()

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('requisition_number', 'New') == 'New':
                vals['requisition_number'] = self.env['ir.sequence'].next_by_code('heyla.job.requisition') or 'REQ-0001'
        return super().create(vals_list)
