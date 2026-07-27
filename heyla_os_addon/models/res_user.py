from odoo import models, fields, api
from odoo.exceptions import ValidationError
import re
import secrets
import hashlib
import json
from datetime import datetime, timedelta


TRIAL_DAYS = 15


def _hash_token(token):
    return hashlib.sha256(token.encode()).hexdigest()


def _generate_token():
    return secrets.token_hex(32)


class HeylaUser(models.Model):
    _name = 'heyla.user'
    _description = 'HEYLA User'
    _inherit = ['mail.thread']
    _rec_name = 'name'
    _order = 'name'

    name = fields.Char(string='Full Name', required=True, tracking=True)
    email = fields.Char(string='Email', required=True, index=True, tracking=True)
    password = fields.Char(string='Password', required=True)
    password_hash = fields.Char(string='Password Hash')
    token = fields.Char(string='Auth Token')
    token_expires_at = fields.Datetime(string='Token Expires At')
    company = fields.Char(string='Company', tracking=True)
    role = fields.Selection([
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('individual', 'Individual'),
    ], string='Role', default='employee', required=True, tracking=True)
    avatar = fields.Char(string='Avatar URL')
    refresh_token = fields.Char(string='Refresh Token')
    active = fields.Boolean(string='Active', default=True)
    last_login = fields.Datetime(string='Last Login')
    facility_name = fields.Char(string='Facility Name', tracking=True)
    facility_logo = fields.Char(string='Facility Logo URL')

    linkedin_id = fields.Char(string='LinkedIn ID')
    linkedin_profile = fields.Char(string='LinkedIn Profile URL')
    talent_pool = fields.Boolean(string='Talent Pool', default=False)
    headline = fields.Char(string='Headline')
    skills = fields.Text(string='Skills')
    photo_url = fields.Char(string='Photo URL')

    plan = fields.Selection([
        ('starter', 'Starter'),
        ('growth', 'Growth'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    ], string='Plan', default='starter')
    subscription_status = fields.Selection([
        ('trial', 'Trial'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ], string='Subscription Status', default='trial')
    trial_started_at = fields.Datetime(string='Trial Started At')
    trial_end_at = fields.Datetime(string='Trial Ends At')
    subscription_started_at = fields.Datetime(string='Subscription Started At')
    subscription_end_at = fields.Datetime(string='Subscription Ends At')
    billing_cycle = fields.Selection([
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ], string='Billing Cycle', default='monthly')
    max_users = fields.Integer(string='Max Users', default=3)
    max_branches = fields.Integer(string='Max Branches', default=1)
    modules_enabled = fields.Text(string='Enabled Modules', default='[]')

    _sql_constraints = [
        ('email_unique', 'unique(email)', 'Email must be unique!'),
    ]

    @api.constrains('email')
    def _check_email(self):
        for rec in self:
            if rec.email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', rec.email):
                raise ValidationError('Invalid email format!')

    def _rotate_token(self):
        raw = _generate_token()
        self.token = _hash_token(raw)
        self.token_expires_at = datetime.now() + timedelta(hours=24)
        return raw

    def _rotate_refresh_token(self):
        raw = _generate_token()
        self.refresh_token = _hash_token(raw)
        return raw

    def _start_trial(self):
        now = datetime.now()
        self.trial_started_at = now
        self.trial_end_at = now + timedelta(days=TRIAL_DAYS)
        self.subscription_status = 'trial'
        self.plan = 'starter'
        self.max_users = 3
        self.max_branches = 1
        self.modules_enabled = '[]'

    def _activate_subscription(self, plan, billing_cycle='monthly'):
        self.plan = plan
        self.subscription_status = 'active'
        self.subscription_started_at = datetime.now()
        months = 12 if billing_cycle == 'yearly' else 1
        self.subscription_end_at = datetime.now() + timedelta(days=30 * months)
        self.billing_cycle = billing_cycle
        limits = {'starter': (3, 1), 'growth': (10, 3), 'professional': (30, 5), 'enterprise': (999, 999)}
        self.max_users, self.max_branches = limits.get(plan, (3, 1))
        self.trial_end_at = False

    def _is_subscription_valid(self):
        if self.subscription_status == 'active' and self.subscription_end_at:
            return datetime.now() < self.subscription_end_at
        if self.subscription_status == 'trial' and self.trial_end_at:
            return datetime.now() < self.trial_end_at
        return False

    def _check_expiry(self):
        if self.subscription_status == 'trial' and self.trial_end_at and datetime.now() > self.trial_end_at:
            self.subscription_status = 'expired'
        if self.subscription_status == 'active' and self.subscription_end_at and datetime.now() > self.subscription_end_at:
            self.subscription_status = 'expired'

    def _get_modules(self):
        try:
            return json.loads(self.modules_enabled or '[]')
        except (json.JSONDecodeError, TypeError):
            return []

    def _set_modules(self, modules):
        self.modules_enabled = json.dumps(modules)

    def _subscription_info(self):
        self._check_expiry()
        now = datetime.now()
        trial_remaining = 0
        trial_total = 0
        if self.subscription_status == 'trial' and self.trial_end_at:
            remaining = (self.trial_end_at - now).total_seconds()
            trial_remaining = max(0, int(remaining / 86400))
            trial_total = TRIAL_DAYS
        return {
            'plan': self.plan,
            'status': self.subscription_status,
            'trialStartedAt': self.trial_started_at.isoformat() if self.trial_started_at else None,
            'trialEndAt': self.trial_end_at.isoformat() if self.trial_end_at else None,
            'trialRemainingDays': trial_remaining,
            'trialTotalDays': trial_total,
            'subscriptionStartedAt': self.subscription_started_at.isoformat() if self.subscription_started_at else None,
            'subscriptionEndAt': self.subscription_end_at.isoformat() if self.subscription_end_at else None,
            'billingCycle': self.billing_cycle,
            'maxUsers': self.max_users,
            'maxBranches': self.max_branches,
            'modulesEnabled': self._get_modules(),
        }
