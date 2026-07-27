from odoo import models, fields, api
import json


class HeylaJobApplicant(models.Model):
    _name = 'heyla.job.applicant'
    _description = 'HEYLA Job Applicant'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'id desc'

    job_id = fields.Many2one('heyla.job', string='Job', required=True)
    user_id = fields.Many2one('heyla.user', string='User')
    name = fields.Char(string='Applicant Name', required=True)
    email = fields.Char(string='Email', required=True)
    phone = fields.Char(string='Phone')
    stage = fields.Selection([
        ('Applied', 'Applied'),
        ('Screening', 'Screening'),
        ('Interview', 'Interview'),
        ('Offer', 'Offer'),
        ('Hired', 'Hired'),
        ('Rejected', 'Rejected'),
    ], string='Stage', default='Applied', tracking=True)
    applied_date = fields.Date(string='Applied Date', default=fields.Date.today)
    resume_url = fields.Char(string='Resume URL')
    rating = fields.Float(string='Rating', default=0.0)
    notes = fields.Text(string='Notes')

    form_answers = fields.Text(string='Form Answers (JSON)', default='{}')

    interview_date = fields.Datetime(string='Interview Date')
    interview_type = fields.Selection([
        ('Phone', 'Phone'),
        ('Video', 'Video'),
        ('In-Person', 'In-Person'),
    ], string='Interview Type', default='Video')
    interview_link = fields.Char(string='Interview Link')
    interview_notes = fields.Text(string='Interview Notes')

    cover_letter = fields.Text(string='Cover Letter')
    linkedin_profile = fields.Char(string='LinkedIn Profile URL')

    def _get_form_answers(self):
        try:
            return json.loads(self.form_answers or '{}')
        except (json.JSONDecodeError, TypeError):
            return {}
