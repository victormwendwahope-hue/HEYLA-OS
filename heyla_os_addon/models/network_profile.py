from odoo import models, fields


class NetworkProfile(models.Model):
    _name = 'heyla.network.profile'
    _description = 'Network Profile'

    user_id = fields.Many2one('heyla.user', string='User', required=True, ondelete='cascade')
    headline = fields.Char(string='Headline', help='e.g. Full Stack Developer at XYZ')
    about = fields.Text(string='About')
    location = fields.Char(string='Location')
    website = fields.Char(string='Website')
    phone = fields.Char(string='Phone')
    photo = fields.Char(string='Photo URL')
    connection_count = fields.Integer(string='Connections', default=0)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    updated_at = fields.Datetime(string='Updated At', default=fields.Datetime.now)

    skill_ids = fields.One2many('heyla.network.profile.skill', 'profile_id', string='Skills')
    experience_ids = fields.One2many('heyla.network.profile.experience', 'profile_id', string='Experience')
    education_ids = fields.One2many('heyla.network.profile.education', 'profile_id', string='Education')

    _sql_constraints = [
        ('user_id_unique', 'unique(user_id)', 'Each user can only have one profile!'),
    ]


class ProfileSkill(models.Model):
    _name = 'heyla.network.profile.skill'
    _description = 'Profile Skill'

    profile_id = fields.Many2one('heyla.network.profile', string='Profile', required=True, ondelete='cascade')
    name = fields.Char(string='Skill', required=True)
    endorsements = fields.Integer(string='Endorsements', default=0)
    endorsed_by_ids = fields.Many2many('heyla.user', string='Endorsed By')


class ProfileExperience(models.Model):
    _name = 'heyla.network.profile.experience'
    _description = 'Profile Experience'

    profile_id = fields.Many2one('heyla.network.profile', string='Profile', required=True, ondelete='cascade')
    title = fields.Char(string='Title', required=True)
    company = fields.Char(string='Company')
    location = fields.Char(string='Location')
    start_date = fields.Char(string='Start Date')
    end_date = fields.Char(string='End Date')
    current = fields.Boolean(string='Current', default=False)
    description = fields.Text(string='Description')


class ProfileEducation(models.Model):
    _name = 'heyla.network.profile.education'
    _description = 'Profile Education'

    profile_id = fields.Many2one('heyla.network.profile', string='Profile', required=True, ondelete='cascade')
    school = fields.Char(string='School', required=True)
    degree = fields.Char(string='Degree')
    field = fields.Char(string='Field of Study')
    start_date = fields.Char(string='Start Date')
    end_date = fields.Char(string='End Date')
    description = fields.Text(string='Description')


class NetworkConnection(models.Model):
    _name = 'heyla.network.connection'
    _description = 'Network Connection'

    follower_id = fields.Many2one('heyla.user', string='Follower', required=True, ondelete='cascade')
    following_id = fields.Many2one('heyla.user', string='Following', required=True, ondelete='cascade')
    status = fields.Selection([
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
    ], string='Status', default='pending', required=True)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)

    _sql_constraints = [
        ('unique_connection', 'unique(follower_id, following_id)', 'Connection already exists!'),
    ]


class NetworkLike(models.Model):
    _name = 'heyla.network.like'
    _description = 'Network Like'

    post_id = fields.Many2one('heyla.network.post', string='Post', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', required=True, ondelete='cascade')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)

    _sql_constraints = [
        ('unique_like', 'unique(post_id, user_id)', 'Already liked!'),
    ]


class NetworkComment(models.Model):
    _name = 'heyla.network.comment'
    _description = 'Network Comment'

    post_id = fields.Many2one('heyla.network.post', string='Post', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', required=True, ondelete='cascade')
    content = fields.Text(string='Content', required=True)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
