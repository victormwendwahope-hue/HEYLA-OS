from odoo import models, fields, api


class HeylaEmployeeDocument(models.Model):
    _name = 'heyla.employee.document'
    _description = 'HEYLA Employee Document'
    _inherit = ['mail.thread']
    _rec_name = 'original_name'
    _order = 'uploaded_at desc'

    employee_id = fields.Many2one('heyla.employee', string='Employee', required=True)
    original_name = fields.Char(string='Original Name', required=True)
    filename = fields.Char(string='Stored Filename', required=True)
    mime = fields.Char(string='MIME Type')
    size = fields.Integer(string='Size (bytes)')
    category = fields.Selection([
        ('Contract', 'Contract'),
        ('Policy', 'Policy'),
        ('ID Document', 'ID Document'),
        ('Certificate', 'Certificate'),
        ('Payslip', 'Payslip'),
        ('Other', 'Other'),
    ], string='Category', default='Other')
    description = fields.Text(string='Description')
    uploaded_by = fields.Char(string='Uploaded By')
    uploaded_at = fields.Datetime(string='Uploaded At', default=fields.Datetime.now)
    file_data = fields.Binary(string='File', attachment=True)
