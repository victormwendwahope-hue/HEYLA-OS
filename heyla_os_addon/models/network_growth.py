from odoo import models, fields, api
from datetime import datetime


class NetworkProfile(models.Model):
    _inherit = 'heyla.network.profile'

    project_ids = fields.One2many('heyla.network.project', 'profile_id', string='Trade Portfolio')
    machine_ids = fields.One2many('heyla.network.machine', 'profile_id', string='Machine Experience')
    mentor_available = fields.Boolean(string='Available as Mentor', default=False)
    mentor_bio = fields.Text(string='Mentor Bio')
    mentor_areas = fields.Char(string='Mentorship Areas')


class ProfileSkill(models.Model):
    _inherit = 'heyla.network.profile.skill'

    level = fields.Selection([
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ], string='Skill Level', default='intermediate')
    years_experience = fields.Float(string='Years Experience', default=0)


class NetworkProject(models.Model):
    _name = 'heyla.network.project'
    _description = 'HEYLA Trade Portfolio Project'
    _order = 'id desc'

    profile_id = fields.Many2one('heyla.network.profile', string='Profile', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', related='profile_id.user_id', store=True, index=True)
    title = fields.Char(string='Project Title', required=True)
    description = fields.Text(string='Description')
    category = fields.Char(string='Category')
    client_name = fields.Char(string='Client')
    location = fields.Char(string='Location')
    gps_lat = fields.Float(string='GPS Latitude', digits=(9, 6))
    gps_lon = fields.Float(string='GPS Longitude', digits=(9, 6))
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')
    outcome = fields.Char(string='Outcome')
    media = fields.Text(string='Media URLs (JSON)')
    before_photo = fields.Char(string='Before Photo URL')
    after_photo = fields.Char(string='After Photo URL')
    testimonial = fields.Text(string='Customer Testimonial')
    rating = fields.Integer(string='Customer Rating', default=0)
    verified = fields.Boolean(string='Verified', default=False)
    verified_by = fields.Many2one('heyla.user', string='Verified By')
    verified_at = fields.Datetime(string='Verified At')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)


class NetworkMachine(models.Model):
    _name = 'heyla.network.machine'
    _description = 'HEYLA Machine Experience Record'
    _order = 'id desc'

    profile_id = fields.Many2one('heyla.network.profile', string='Profile', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', related='profile_id.user_id', store=True, index=True)
    machine_type = fields.Selection([
        ('excavator', 'Excavator'),
        ('crane', 'Crane'),
        ('bulldozer', 'Bulldozer'),
        ('loader', 'Wheel Loader'),
        ('grader', 'Motor Grader'),
        ('forklift', 'Forklift'),
        ('tipper', 'Tipper Truck'),
        ('tractor', 'Tractor'),
        ('harvester', 'Harvester'),
        ('drill_rig', 'Drill Rig'),
        ('compactor', 'Compactor'),
        ('backhoe', 'Backhoe Loader'),
        ('dump_truck', 'Dump Truck'),
        ('pipeline', 'Pipe Layer'),
        ('other', 'Other'),
    ], string='Machine Type', required=True)
    manufacturer = fields.Char(string='Manufacturer', help='e.g. CAT, Komatsu, Volvo, JCB, Hitachi, Hyundai, Liebherr, Doosan, John Deere, Bobcat')
    model = fields.Char(string='Model')
    years_experience = fields.Float(string='Years of Experience', default=0)
    operating_hours = fields.Float(string='Operating Hours', default=0)
    fuel_efficiency = fields.Char(string='Fuel Efficiency')
    maintenance_knowledge = fields.Boolean(string='Maintenance Knowledge', default=False)
    safety_record = fields.Char(string='Safety Record')
    incidents = fields.Integer(string='Incidents', default=0)
    training = fields.Text(string='Training')
    verified = fields.Boolean(string='Verified', default=False)
    verified_by = fields.Many2one('heyla.user', string='Verified By')
    verified_at = fields.Datetime(string='Verified At')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)


class NetworkCommunity(models.Model):
    _name = 'heyla.network.community'
    _description = 'HEYLA Community'
    _order = 'name'
    _rec_name = 'name'

    name = fields.Char(string='Name', required=True)
    description = fields.Text(string='Description')
    community_type = fields.Selection([
        ('industry', 'Industry'),
        ('trade', 'Trade'),
        ('county', 'County'),
        ('country', 'Country'),
        ('special', 'Special Interest'),
    ], string='Type', default='trade')
    category = fields.Char(string='Category')
    icon = fields.Char(string='Icon URL')
    cover_image = fields.Char(string='Cover Image URL')
    is_private = fields.Boolean(string='Private', default=False)
    created_by = fields.Many2one('heyla.user', string='Created By')
    admin_ids = fields.Many2many('heyla.user', 'heyla_community_admin_rel', string='Admins')
    member_ids = fields.Many2many('heyla.user', 'heyla_community_member_rel', string='Members')
    member_count = fields.Integer(string='Members', compute='_compute_counts', store=True)
    post_count = fields.Integer(string='Posts', compute='_compute_counts', store=True)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)

    post_ids = fields.One2many('heyla.network.community.post', 'community_id', string='Posts')

    @api.depends('member_ids', 'post_ids')
    def _compute_counts(self):
        for rec in self:
            rec.member_count = len(rec.member_ids)
            rec.post_count = len(rec.post_ids)


class NetworkCommunityPost(models.Model):
    _name = 'heyla.network.community.post'
    _description = 'HEYLA Community Post'
    _order = 'id desc'
    _rec_name = 'content'

    community_id = fields.Many2one('heyla.network.community', string='Community', required=True, ondelete='cascade')
    author_id = fields.Many2one('heyla.user', string='Author', required=True)
    author_name = fields.Char(string='Author Name', related='author_id.name', store=True)
    content = fields.Text(string='Content', required=True)
    image = fields.Char(string='Image URL')
    link_url = fields.Char(string='Link URL')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    like_count = fields.Integer(string='Likes', compute='_compute_likes', store=True)
    like_ids = fields.One2many('heyla.network.community.post.like', 'post_id', string='Likes')

    @api.depends('like_ids')
    def _compute_likes(self):
        for rec in self:
            rec.like_count = len(rec.like_ids)


class NetworkCommunityPostLike(models.Model):
    _name = 'heyla.network.community.post.like'
    _description = 'Community Post Like'

    post_id = fields.Many2one('heyla.network.community.post', string='Post', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', required=True, ondelete='cascade')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    _sql_constraints = [('unique_community_like', 'unique(post_id, user_id)', 'Already liked!')]


class NetworkEvent(models.Model):
    _name = 'heyla.network.event'
    _description = 'HEYLA Network Event'
    _order = 'start_time asc'
    _rec_name = 'name'

    name = fields.Char(string='Event Name', required=True)
    description = fields.Text(string='Description')
    event_type = fields.Selection([
        ('career_fair', 'Career Fair'),
        ('trade_show', 'Trade Show'),
        ('training', 'Training'),
        ('webinar', 'Webinar'),
        ('networking', 'Networking'),
        ('hackathon', 'Hackathon'),
        ('competition', 'Competition'),
        ('recruitment_day', 'Recruitment Day'),
    ], string='Event Type', default='networking')
    organizer_id = fields.Many2one('heyla.user', string='Organizer')
    organizer_name = fields.Char(string='Organizer Name')
    community_id = fields.Many2one('heyla.network.community', string='Community', ondelete='set null')
    location = fields.Char(string='Venue / Location')
    is_virtual = fields.Boolean(string='Virtual Event', default=False)
    online_link = fields.Char(string='Online Link')
    start_time = fields.Datetime(string='Start Time', required=True)
    end_time = fields.Datetime(string='End Time')
    capacity = fields.Integer(string='Capacity', default=0)
    cover_image = fields.Char(string='Cover Image URL')
    certificate_issued = fields.Boolean(string='Certificate Issued', default=False)
    attendee_ids = fields.One2many('heyla.network.event.attendee', 'event_id', string='Attendees')
    attendee_count = fields.Integer(string='Attendees', compute='_compute_attendees', store=True)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)

    @api.depends('attendee_ids')
    def _compute_attendees(self):
        for rec in self:
            rec.attendee_count = len(rec.attendee_ids)


class NetworkEventAttendee(models.Model):
    _name = 'heyla.network.event.attendee'
    _description = 'Event Attendee'
    _rec_name = 'user_id'

    event_id = fields.Many2one('heyla.network.event', string='Event', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='Attendee', required=True, ondelete='cascade')
    status = fields.Selection([
        ('registered', 'Registered'),
        ('attended', 'Attended'),
        ('checked_in', 'Checked In'),
        ('cancelled', 'Cancelled'),
    ], string='Status', default='registered')
    qr_code = fields.Char(string='QR Code')
    checked_in_at = fields.Datetime(string='Checked In At')
    certificate_url = fields.Char(string='Certificate URL')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    _sql_constraints = [('unique_attendee', 'unique(event_id, user_id)', 'Already registered!')]


class NetworkMentorship(models.Model):
    _name = 'heyla.network.mentorship'
    _description = 'HEYLA Mentorship Relationship'
    _order = 'id desc'

    mentor_id = fields.Many2one('heyla.user', string='Mentor', required=True)
    mentee_id = fields.Many2one('heyla.user', string='Mentee', required=True)
    status = fields.Selection([
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('declined', 'Declined'),
    ], string='Status', default='pending', required=True)
    focus_area = fields.Char(string='Focus Area')
    goal = fields.Text(string='Goal')
    progress = fields.Integer(string='Progress %', default=0)
    progress_notes = fields.Text(string='Progress Notes')
    started_at = fields.Datetime(string='Started At')
    completed_at = fields.Datetime(string='Completed At')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    _sql_constraints = [('unique_mentorship', 'unique(mentor_id, mentee_id)', 'Mentorship already exists!')]
