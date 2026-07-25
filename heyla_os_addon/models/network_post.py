from odoo import models, fields, api


class HeylaNetworkPost(models.Model):
    _name = 'heyla.network.post'
    _description = 'HEYLA Network Post'
    _inherit = ['mail.thread']
    _rec_name = 'content'
    _order = 'id desc'

    author = fields.Char(string='Author', required=True)
    role = fields.Char(string='Role')
    avatar = fields.Char(string='Avatar URL')
    content = fields.Text(string='Content', required=True)
    image = fields.Char(string='Image URL')
    time = fields.Char(string='Time')
    likes = fields.Integer(string='Likes', default=0)
    comments = fields.Integer(string='Comments', default=0)
    liked = fields.Boolean(string='Liked', default=False)
