from odoo import models, fields, api


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
