from odoo import models, fields, api
import json


class HeylaJob(models.Model):
    _name = 'heyla.job'
    _description = 'HEYLA Job Posting'
    _inherit = ['mail.thread']
    _rec_name = 'title'
    _order = 'id desc'

    title = fields.Char(string='Job Title', required=True)
    department = fields.Char(string='Department')
    location = fields.Char(string='Location')
    job_type = fields.Selection([
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Remote', 'Remote'),
    ], string='Type', default='Full-time')
    status = fields.Selection([
        ('Open', 'Open'),
        ('Closed', 'Closed'),
        ('Draft', 'Draft'),
    ], string='Status', default='Draft', tracking=True)
    salary = fields.Char(string='Salary')
    description = fields.Text(string='Description')
    requirements = fields.Text(string='Requirements')
    posted_date = fields.Date(string='Posted Date', default=fields.Date.today)
    applicants = fields.Integer(string='Applicants Count', default=0)
    country = fields.Char(string='Country')
    company_name = fields.Char(string='Company Name')

    banner = fields.Char(string='Banner Image URL')
    photo = fields.Char(string='Company Photo URL')
    roles = fields.Text(string='Roles & Responsibilities')
    benefits = fields.Text(string='Benefits')

    custom_form_fields = fields.Text(string='Custom Form Fields (JSON)', default='[]')
    linkedin_job_id = fields.Char(string='LinkedIn Job ID')

    interview_instructions = fields.Text(string='Interview Instructions')
    video_call_link = fields.Char(string='Video Call Link')

    def _get_custom_fields(self):
        try:
            return json.loads(self.custom_form_fields or '[]')
        except (json.JSONDecodeError, TypeError):
            return []
