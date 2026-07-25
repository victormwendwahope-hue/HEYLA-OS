from odoo import models, fields, api


class HeylaJobApplicant(models.Model):
    _name = 'heyla.job.applicant'
    _description = 'HEYLA Job Applicant'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'id desc'

    job_id = fields.Many2one('heyla.job', string='Job', required=True)
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
