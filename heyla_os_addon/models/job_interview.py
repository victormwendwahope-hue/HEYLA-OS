from odoo import models, fields, api


class HeylaJobInterview(models.Model):
    _name = 'heyla.job.interview'
    _description = 'HEYLA Job Interview'
    _inherit = ['mail.thread']
    _rec_name = 'applicant_name'
    _order = 'date desc, time desc'

    applicant_id = fields.Many2one('heyla.job.applicant', string='Applicant')
    applicant_name = fields.Char(string='Applicant Name', required=True)
    job_title = fields.Char(string='Job Title')
    date = fields.Date(string='Date', required=True)
    time = fields.Char(string='Time')
    interview_type = fields.Selection([
        ('Phone', 'Phone'),
        ('Video', 'Video'),
        ('In-Person', 'In-Person'),
    ], string='Type', default='Video')
    interviewer = fields.Char(string='Interviewer')
    status = fields.Selection([
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ], string='Status', default='Scheduled', tracking=True)
    notes = fields.Text(string='Notes')
