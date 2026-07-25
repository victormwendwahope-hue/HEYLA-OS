from odoo import models, fields, api


class HeylaPerformanceReview(models.Model):
    _name = 'heyla.performance.review'
    _description = 'HEYLA Performance Review'
    _inherit = ['mail.thread']
    _rec_name = 'employee_id'
    _order = 'quarter desc, id desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    quarter = fields.Char(string='Quarter', required=True, help='e.g. Q1 2025')
    rating = fields.Float(string='Rating', default=0.0)
    feedback = fields.Text(string='Feedback')
    goal_ids = fields.One2many('heyla.performance.goal', 'review_id', string='Goals')


class HeylaPerformanceGoal(models.Model):
    _name = 'heyla.performance.goal'
    _description = 'HEYLA Performance Goal'

    review_id = fields.Many2one('heyla.performance.review', string='Review', required=True, ondelete='cascade')
    title = fields.Char(string='Goal Title', required=True)
    progress = fields.Float(string='Progress (%)', default=0.0)
