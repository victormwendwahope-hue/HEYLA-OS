from odoo import models, fields, api
from datetime import datetime


class NtvUserProfile(models.Model):
    _name = 'ntv.user.profile'
    _description = 'Network Tap Venture - User Profile'
    _rec_name = 'display_name'

    user_id = fields.Many2one('heyla.user', string='User', required=True, ondelete='cascade')
    display_name = fields.Char(string='Display Name', compute='_compute_display_name', store=True)

    headline = fields.Char(string='Professional Headline', help='e.g. Software Engineering Student | React & FastAPI Developer')
    about = fields.Text(string='About Me')
    photo = fields.Char(string='Profile Photo URL')
    cover_image = fields.Char(string='Cover Banner URL')
    location = fields.Char(string='County & Location')
    phone = fields.Char(string='Phone')
    website = fields.Char(string='Website')
    github_url = fields.Char(string='GitHub URL')
    linkedin_url = fields.Char(string='LinkedIn URL')
    portfolio_url = fields.Char(string='Portfolio URL')

    institution = fields.Char(string='University / TVET Institution')
    course = fields.Char(string='Course / Program')
    graduation_year = fields.Char(string='Graduation Year')
    cv_url = fields.Char(string='CV / Resume URL')

    availability = fields.Selection([
        ('internship', 'Looking for Internship'),
        ('attachment', 'Looking for Attachment'),
        ('open_to_work', 'Open to Work'),
        ('freelance', 'Freelance Available'),
        ('employed', 'Employed'),
    ], string='Availability', default='internship')

    connection_count = fields.Integer(string='Connections', default=0)
    follower_count = fields.Integer(string='Followers', default=0)
    following_count = fields.Integer(string='Following', default=0)
    post_count = fields.Integer(string='Posts', default=0)
    profile_views = fields.Integer(string='Profile Views', default=0)

    is_verified = fields.Boolean(string='Verified', default=False)
    verified_type = fields.Selection([
        ('university', 'University'),
        ('tvet', 'TVET Institution'),
        ('company', 'Company'),
        ('government', 'Government Agency'),
        ('professional', 'Certified Professional'),
        ('student', 'Top Student Contributor'),
    ], string='Verification Type')

    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    updated_at = fields.Datetime(string='Updated At', default=fields.Datetime.now)

    skill_ids = fields.One2many('ntv.profile.skill', 'profile_id', string='Skills')
    experience_ids = fields.One2many('ntv.profile.experience', 'profile_id', string='Experience')
    education_ids = fields.One2many('ntv.profile.education', 'profile_id', string='Education')
    certification_ids = fields.One2many('ntv.profile.certification', 'profile_id', string='Certifications')
    project_ids = fields.One2many('ntv.project', 'author_profile_id', string='Projects')

    @api.depends('user_id.name')
    def _compute_display_name(self):
        for rec in self:
            rec.display_name = rec.user_id.name if rec.user_id else ''


class NtvProfileSkill(models.Model):
    _name = 'ntv.profile.skill'
    _description = 'Profile Skill'

    profile_id = fields.Many2one('ntv.user.profile', string='Profile', required=True, ondelete='cascade')
    name = fields.Char(string='Skill', required=True)
    endorsements = fields.Integer(string='Endorsements', default=0)


class NtvProfileExperience(models.Model):
    _name = 'ntv.profile.experience'
    _description = 'Profile Experience'

    profile_id = fields.Many2one('ntv.user.profile', string='Profile', required=True, ondelete='cascade')
    title = fields.Char(string='Title', required=True)
    company = fields.Char(string='Company')
    location = fields.Char(string='Location')
    start_date = fields.Char(string='Start Date')
    end_date = fields.Char(string='End Date')
    current = fields.Boolean(string='Currently Working', default=False)
    description = fields.Text(string='Description')


class NtvProfileEducation(models.Model):
    _name = 'ntv.profile.education'
    _description = 'Profile Education'

    profile_id = fields.Many2one('ntv.user.profile', string='Profile', required=True, ondelete='cascade')
    school = fields.Char(string='School', required=True)
    degree = fields.Char(string='Degree / Certificate')
    field = fields.Char(string='Field of Study')
    start_date = fields.Char(string='Start Date')
    end_date = fields.Char(string='End Date')
    grade = fields.Char(string='Grade')
    description = fields.Text(string='Description')


class NtvProfileCertification(models.Model):
    _name = 'ntv.profile.certification'
    _description = 'Profile Certification'

    profile_id = fields.Many2one('ntv.user.profile', string='Profile', required=True, ondelete='cascade')
    name = fields.Char(string='Certification Name', required=True)
    issuer = fields.Char(string='Issuing Organization')
    issue_date = fields.Char(string='Issue Date')
    expiry_date = fields.Char(string='Expiry Date')
    credential_url = fields.Char(string='Credential URL')


class NtvCompany(models.Model):
    _name = 'ntv.company'
    _description = 'Network Tap Venture - Company'
    _rec_name = 'name'

    user_id = fields.Many2one('heyla.user', string='Account Owner', required=True, ondelete='cascade')
    name = fields.Char(string='Company Name', required=True)
    logo = fields.Char(string='Company Logo URL')
    cover_image = fields.Char(string='Cover Image URL')
    industry = fields.Char(string='Industry')
    description = fields.Text(string='Description')
    website = fields.Char(string='Website')
    location = fields.Char(string='Location')
    email = fields.Char(string='Contact Email')
    phone = fields.Char(string='Contact Phone')
    employee_count = fields.Char(string='Number of Employees')
    followers_count = fields.Integer(string='Followers', default=0)
    is_verified = fields.Boolean(string='Verified', default=False)

    job_ids = fields.One2many('ntv.job', 'company_id', string='Job Listings')
    post_ids = fields.One2many('ntv.post', 'company_id', string='Company Posts')

    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)


class NtvJob(models.Model):
    _name = 'ntv.job'
    _description = 'Network Tap Venture - Job / Internship / Attachment'
    _order = 'id desc'
    _rec_name = 'title'

    company_id = fields.Many2one('ntv.company', string='Company', required=True)
    company_name = fields.Char(string='Company Name', related='company_id.name', store=True)
    company_logo = fields.Char(string='Company Logo', related='company_id.logo')

    title = fields.Char(string='Job Title', required=True)
    employment_type = fields.Selection([
        ('internship', 'Internship'),
        ('attachment', 'Industrial Attachment'),
        ('graduate_trainee', 'Graduate Trainee'),
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('freelance', 'Freelance'),
    ], string='Employment Type', default='full_time', required=True)

    location = fields.Char(string='Location')
    is_remote = fields.Boolean(string='Remote', default=False)
    county = fields.Char(string='County')
    industry = fields.Char(string='Industry')

    salary_range = fields.Char(string='Salary Range')
    is_paid = fields.Boolean(string='Paid', default=True)
    duration = fields.Char(string='Duration', help='e.g. 3 Months')

    experience_level = fields.Selection([
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('graduate', 'Graduate'),
        ('student', 'Student'),
    ], string='Experience Level', default='entry')

    required_skills = fields.Text(string='Required Skills')
    description = fields.Text(string='Description')
    responsibilities = fields.Text(string='Responsibilities')
    requirements = fields.Text(string='Requirements')

    deadline = fields.Date(string='Application Deadline')
    application_method = fields.Char(string='Application Method', default='Apply via Network Tap')

    posted_by_id = fields.Many2one('heyla.user', string='Posted By')
    posted_date = fields.Date(string='Posted Date', default=fields.Date.today)
    is_active = fields.Boolean(string='Active', default=True)

    applicant_count = fields.Integer(string='Applicants', compute='_compute_applicant_count', store=True)
    applicant_ids = fields.One2many('ntv.job.applicant', 'job_id', string='Applicants')
    saves_count = fields.Integer(string='Saves', default=0)

    @api.depends('applicant_ids')
    def _compute_applicant_count(self):
        for rec in self:
            rec.applicant_count = len(rec.applicant_ids)


class NtvJobApplicant(models.Model):
    _name = 'ntv.job.applicant'
    _description = 'Job Applicant'
    _order = 'id desc'

    job_id = fields.Many2one('ntv.job', string='Job', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='Applicant', required=True)
    profile_id = fields.Many2one('ntv.user.profile', string='Profile')
    name = fields.Char(string='Name', related='user_id.name', store=True)
    email = fields.Char(string='Email', related='user_id.email', store=True)
    phone = fields.Char(string='Phone')
    cv_url = fields.Char(string='CV URL')
    cover_note = fields.Text(string='Cover Note')

    status = fields.Selection([
        ('applied', 'Applied'),
        ('screening', 'Screening'),
        ('shortlisted', 'Shortlisted'),
        ('interview', 'Interview'),
        ('offered', 'Offered'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
    ], string='Status', default='applied')

    applied_date = fields.Date(string='Applied Date', default=fields.Date.today)
    notes = fields.Text(string='Review Notes')
    saved = fields.Boolean(string='Saved by Company', default=False)


class NtvPost(models.Model):
    _name = 'ntv.post'
    _description = 'Network Tap Venture - Post'
    _order = 'id desc'
    _rec_name = 'content'

    author_profile_id = fields.Many2one('ntv.user.profile', string='Author Profile')
    author_user_id = fields.Many2one('heyla.user', string='Author User')
    author_name = fields.Char(string='Author Name', compute='_compute_author', store=True)
    author_headline = fields.Char(string='Author Headline', compute='_compute_author', store=True)
    author_photo = fields.Char(string='Author Photo', compute='_compute_author', store=True)

    company_id = fields.Many2one('ntv.company', string='Company')
    company_name = fields.Char(string='Company Name', related='company_id.name', store=True)
    company_logo = fields.Char(string='Company Logo', related='company_id.logo')

    post_type = fields.Selection([
        ('status', 'Status Update'),
        ('project', 'Project Showcase'),
        ('article', 'Article'),
        ('achievement', 'Achievement'),
        ('opportunity', 'Opportunity'),
        ('media', 'Media'),
    ], string='Post Type', default='status')

    content = fields.Text(string='Content', required=True)
    media_url = fields.Char(string='Media URL')
    media_type = fields.Selection([
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('link', 'Link'),
    ], string='Media Type')

    project_id = fields.Many2one('ntv.project', string='Linked Project')
    link_url = fields.Char(string='Link URL')
    link_title = fields.Char(string='Link Title')

    likes_count = fields.Integer(string='Likes', default=0, compute='_compute_counts', store=True)
    comments_count = fields.Integer(string='Comments', default=0, compute='_compute_counts', store=True)
    shares_count = fields.Integer(string='Shares', default=0)
    saves_count = fields.Integer(string='Saves', default=0)

    is_edited = fields.Boolean(string='Edited', default=False)
    is_pinned = fields.Boolean(string='Pinned', default=False)

    like_ids = fields.One2many('ntv.post.like', 'post_id', string='Likes')
    comment_ids = fields.One2many('ntv.post.comment', 'post_id', string='Comments')
    save_ids = fields.One2many('ntv.post.save', 'post_id', string='Saves')
    share_ids = fields.One2many('ntv.post.share', 'post_id', string='Shares')

    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)

    @api.depends('author_profile_id', 'author_user_id')
    def _compute_author(self):
        for rec in self:
            if rec.author_profile_id:
                rec.author_name = rec.author_profile_id.display_name or rec.author_profile_id.user_id.name
                rec.author_headline = rec.author_profile_id.headline
                rec.author_photo = rec.author_profile_id.photo
            elif rec.author_user_id:
                rec.author_name = rec.author_user_id.name
                rec.author_photo = rec.author_user_id.avatar

    @api.depends('like_ids', 'comment_ids')
    def _compute_counts(self):
        for rec in self:
            rec.likes_count = len(rec.like_ids)
            rec.comments_count = len(rec.comment_ids)


class NtvPostLike(models.Model):
    _name = 'ntv.post.like'
    _description = 'Post Like'

    post_id = fields.Many2one('ntv.post', string='Post', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', required=True, ondelete='cascade')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    _sql_constraints = [('ntv_unique_like', 'unique(post_id, user_id)', 'Already liked!')]


class NtvPostComment(models.Model):
    _name = 'ntv.post.comment'
    _description = 'Post Comment'
    _order = 'id asc'

    post_id = fields.Many2one('ntv.post', string='Post', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', required=True)
    parent_id = fields.Many2one('ntv.post.comment', string='Parent Comment', ondelete='cascade')
    content = fields.Text(string='Content', required=True)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)


class NtvPostSave(models.Model):
    _name = 'ntv.post.save'
    _description = 'Post Save / Bookmark'

    post_id = fields.Many2one('ntv.post', string='Post', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', required=True, ondelete='cascade')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    _sql_constraints = [('ntv_unique_save', 'unique(post_id, user_id)', 'Already saved!')]


class NtvPostShare(models.Model):
    _name = 'ntv.post.share'
    _description = 'Post Share'

    post_id = fields.Many2one('ntv.post', string='Post', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', required=True, ondelete='cascade')
    content = fields.Text(string='Share Message')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)


class NtvProject(models.Model):
    _name = 'ntv.project'
    _description = 'Student Project Showcase'
    _order = 'id desc'
    _rec_name = 'title'

    author_profile_id = fields.Many2one('ntv.user.profile', string='Author', required=True, ondelete='cascade')
    author_user_id = fields.Many2one(related='author_profile_id.user_id', store=True)
    author_name = fields.Char(string='Author Name', related='author_profile_id.display_name', store=True)

    title = fields.Char(string='Project Title', required=True)
    description = fields.Text(string='Description')
    thumbnail = fields.Char(string='Thumbnail URL')
    technologies = fields.Text(string='Technologies Used')
    github_url = fields.Char(string='GitHub URL')
    live_url = fields.Char(string='Live Demo URL')
    is_featured = fields.Boolean(string='Featured', default=False)

    likes_count = fields.Integer(string='Likes', default=0)
    comments_count = fields.Integer(string='Comments', default=0)

    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)


class NtvConnection(models.Model):
    _name = 'ntv.connection'
    _description = 'Network Connection'
    _rec_name = 'requester_id'

    requester_id = fields.Many2one('heyla.user', string='Requester', required=True, ondelete='cascade')
    target_id = fields.Many2one('heyla.user', string='Target', required=True, ondelete='cascade')
    status = fields.Selection([
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('ignored', 'Ignored'),
    ], string='Status', default='pending', required=True)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    updated_at = fields.Datetime(string='Updated At')
    _sql_constraints = [('ntv_unique_connection', 'unique(requester_id, target_id)', 'Connection request already exists!')]


class NtvFollow(models.Model):
    _name = 'ntv.follow'
    _description = 'Follow (unidirectional)'

    follower_id = fields.Many2one('heyla.user', string='Follower', required=True, ondelete='cascade')
    following_id = fields.Many2one('heyla.user', string='Following', required=True, ondelete='cascade')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    _sql_constraints = [('ntv_unique_follow', 'unique(follower_id, following_id)', 'Already following!')]


class NtvMessage(models.Model):
    _name = 'ntv.message'
    _description = 'Private Message'
    _order = 'timestamp asc'

    sender_id = fields.Many2one('heyla.user', string='Sender', required=True)
    receiver_id = fields.Many2one('heyla.user', string='Receiver', required=True)
    content = fields.Text(string='Content', required=True)
    is_read = fields.Boolean(string='Read', default=False)
    read_at = fields.Datetime(string='Read At')
    timestamp = fields.Datetime(string='Sent At', default=fields.Datetime.now)


class NtvConversation(models.Model):
    _name = 'ntv.conversation'
    _description = 'Conversation Thread'
    _order = 'last_message_at desc'

    user_a_id = fields.Many2one('heyla.user', string='User A', required=True)
    user_b_id = fields.Many2one('heyla.user', string='User B', required=True)
    last_message = fields.Text(string='Last Message')
    last_message_at = fields.Datetime(string='Last Message At')
    user_a_unread = fields.Integer(string='User A Unread', default=0)
    user_b_unread = fields.Integer(string='User B Unread', default=0)
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)
    _sql_constraints = [('ntv_unique_conversation', 'unique(user_a_id, user_b_id)', 'Conversation already exists!')]


class NtvNotification(models.Model):
    _name = 'ntv.notification'
    _description = 'Network Notification'
    _order = 'timestamp desc'

    user_id = fields.Many2one('heyla.user', string='User', required=True)
    actor_id = fields.Many2one('heyla.user', string='Actor')
    notification_type = fields.Selection([
        ('connection_request', 'Connection Request'),
        ('connection_accepted', 'Connection Accepted'),
        ('new_follower', 'New Follower'),
        ('post_like', 'Post Like'),
        ('post_comment', 'Post Comment'),
        ('post_share', 'Post Share'),
        ('job_application', 'Job Application'),
        ('application_update', 'Application Update'),
        ('new_message', 'New Message'),
        ('profile_view', 'Profile View'),
        ('job_deadline', 'Job Deadline Reminder'),
    ], string='Type', required=True)

    title = fields.Char(string='Title')
    message = fields.Text(string='Message')
    link = fields.Char(string='Link')
    related_model = fields.Char(string='Related Model')
    related_id = fields.Integer(string='Related ID')
    is_read = fields.Boolean(string='Read', default=False)
    read_at = fields.Datetime(string='Read At')
    timestamp = fields.Datetime(string='Timestamp', default=fields.Datetime.now)
