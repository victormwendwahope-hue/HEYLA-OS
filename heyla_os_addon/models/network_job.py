from odoo import models, fields, api


class HeylaNetworkJob(models.Model):
    _name = 'heyla.network.job'
    _description = 'HEYLA Network Job Post'
    _inherit = ['mail.thread']
    _rec_name = 'title'
    _order = 'id desc'

    title = fields.Char(string='Job Title', required=True)
    company = fields.Char(string='Company')
    location = fields.Char(string='Location')
    job_type = fields.Selection([
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Freelance', 'Freelance'),
    ], string='Type', default='Full-time')
    salary = fields.Char(string='Salary')
    posted = fields.Char(string='Posted')
    skills = fields.Text(string='Skills')
    description = fields.Text(string='Description')
    applicant_ids = fields.One2many('heyla.network.applicant', 'job_id', string='Applicants')


class HeylaNetworkApplicant(models.Model):
    _name = 'heyla.network.applicant'
    _description = 'HEYLA Network Job Applicant'

    job_id = fields.Many2one('heyla.network.job', string='Job', required=True, ondelete='cascade')
    name = fields.Char(string='Name', required=True)
    email = fields.Char(string='Email')
    avatar = fields.Char(string='Avatar URL')
    status = fields.Selection([
        ('Applied', 'Applied'),
        ('Screening', 'Screening'),
        ('Interview', 'Interview'),
        ('Offered', 'Offered'),
        ('Hired', 'Hired'),
        ('Rejected', 'Rejected'),
    ], string='Status', default='Applied')
    applied_date = fields.Date(string='Applied Date', default=fields.Date.today)
    notes = fields.Text(string='Notes')
