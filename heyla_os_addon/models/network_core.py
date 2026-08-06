from odoo import models, fields, api
from datetime import datetime
import json
import re


TRADE_CATEGORIES = [
    ('welder', 'Welder'),
    ('plumber', 'Plumber'),
    ('carpenter', 'Carpenter'),
    ('electrician', 'Electrician'),
    ('mechanic', 'Mechanic'),
    ('excavator_operator', 'Excavator Operator'),
    ('crane_operator', 'Crane Operator'),
    ('driver', 'Driver'),
    ('security_guard', 'Security Guard'),
    ('machine_operator', 'Machine Operator'),
    ('mason', 'Mason'),
    ('painter', 'Painter'),
    ('steel_fixer', 'Steel Fixer'),
    ('surveyor', 'Surveyor'),
    ('foreman', 'Foreman'),
    ('site_engineer', 'Site Engineer'),
    ('nurse', 'Nurse'),
    ('caregiver', 'Caregiver'),
    ('chef', 'Chef'),
    ('hospitality_staff', 'Hospitality Staff'),
    ('cleaner', 'Cleaner'),
    ('farmer', 'Farmer'),
    ('fisherman', 'Fisherman'),
    ('miner', 'Miner'),
    ('logistics', 'Logistics Personnel'),
    ('technician', 'Technician'),
    ('hr', 'Human Resources'),
    ('finance', 'Finance'),
    ('ict', 'ICT'),
    ('lawyer', 'Lawyer'),
    ('doctor', 'Doctor'),
    ('teacher', 'Teacher'),
    ('engineer', 'Engineer'),
    ('researcher', 'Researcher'),
    ('entrepreneur', 'Entrepreneur'),
    ('consultant', 'Consultant'),
]

AVAILABILITY_OPTIONS = [
    ('open_to_work', 'Open to Work'),
    ('employed', 'Employed'),
    ('freelance', 'Freelance Available'),
    ('internship', 'Looking for Internship'),
    ('student', 'Student'),
    ('daily_labour', 'Daily Labour'),
    ('seasonal', 'Seasonal'),
]

VERIFICATION_TYPES = [
    ('government_id', 'Government ID'),
    ('passport', 'Passport'),
    ('face', 'Face Verification'),
    ('email', 'Email'),
    ('phone', 'Phone'),
    ('employer', 'Employer Verification'),
    ('company', 'Company Verification'),
    ('education', 'Educational Verification'),
    ('nita', 'NITA Verification'),
    ('trade_test', 'Trade Test Verification'),
    ('professional_membership', 'Professional Membership'),
    ('driving_licence', 'Driving Licence'),
    ('work_permit', 'Work Permit'),
    ('tax_registration', 'Tax Registration'),
    ('business_registration', 'Business Registration'),
    ('safety_certification', 'Safety Certification'),
    ('medical_fitness', 'Medical Fitness'),
    ('criminal_clearance', 'Criminal Clearance'),
    ('reference', 'Reference Verification'),
]

# Weight of each verification type towards the reputation score (verified only)
VERIFICATION_WEIGHTS = {
    'government_id': 4.0,
    'passport': 4.0,
    'face': 4.0,
    'email': 2.0,
    'phone': 2.0,
    'employer': 3.0,
    'company': 3.0,
    'education': 3.0,
    'nita': 3.0,
    'trade_test': 3.0,
    'professional_membership': 2.0,
    'driving_licence': 2.0,
    'work_permit': 3.0,
    'tax_registration': 2.0,
    'business_registration': 3.0,
    'safety_certification': 2.0,
    'medical_fitness': 2.0,
    'criminal_clearance': 2.0,
    'reference': 1.0,
}


class NetworkProfile(models.Model):
    _inherit = 'heyla.network.profile'

    # ---- Digital Skills Passport ----
    trade_category = fields.Selection(TRADE_CATEGORIES, string='Trade Category')
    years_of_experience = fields.Float(string='Years of Experience', default=0)
    availability = fields.Selection(AVAILABILITY_OPTIONS, string='Availability', default='open_to_work')
    expected_salary = fields.Char(string='Expected Salary')
    notice_period = fields.Char(string='Notice Period')
    languages = fields.Char(string='Languages')
    nationality = fields.Char(string='Nationality')
    date_of_birth = fields.Date(string='Date of Birth')
    willing_to_relocate = fields.Boolean(string='Willing to Relocate', default=False)
    relocation_countries = fields.Char(string='Countries Willing to Relocate To')
    passport_status = fields.Char(string='Passport Status')
    visa_status = fields.Char(string='Visa Status')
    id_number = fields.Char(string='National ID Number')

    # ---- Reputation ----
    reputation_score = fields.Float(string='Reputation Score', default=0)
    reputation_breakdown = fields.Text(string='Reputation Breakdown', default='{}')
    reputation_updated_at = fields.Datetime(string='Reputation Updated At')

    # ---- Verified records ----
    verification_ids = fields.One2many('heyla.network.verification', 'profile_id', string='Verifications')
    reference_ids = fields.One2many('heyla.network.reference', 'profile_id', string='References')
    worklog_ids = fields.One2many('heyla.network.worklog', 'profile_id', string='Work Logbook')

    @api.model
    def _get_or_create(self, user):
        """Get or create the network profile for a user (sudo)."""
        profile = self.search([('user_id', '=', user.id)], limit=1)
        if not profile:
            profile = self.create({'user_id': user.id})
        return profile

    def _verified_count(self):
        """Number of currently verified identity records."""
        self.ensure_one()
        return self.env['heyla.network.verification'].sudo().search_count([
            ('profile_id', '=', self.id),
            ('status', '=', 'verified'),
        ])

    def _profile_completeness(self):
        """Profile completeness ratio 0..1 used by the reputation engine."""
        self.ensure_one()
        checks = [
            self.headline, self.about, self.photo, self.location,
            self.trade_category, self.expected_salary,
            self.years_of_experience and self.years_of_experience > 0,
            bool(self.skill_ids), bool(self.experience_ids), bool(self.education_ids),
            self.languages, self.nationality, self.availability,
        ]
        filled = sum(1 for c in checks if c)
        return filled / max(len(checks), 1)

    def _connection_total(self):
        """Total accepted connections (both directions)."""
        self.ensure_one()
        accepted = self.env['heyla.network.connection'].sudo().search_count([
            '|',
            ('follower_id', '=', self.user_id.id),
            ('following_id', '=', self.user_id.id),
            ('status', '=', 'accepted'),
        ])
        return accepted

    def _endorsement_total(self):
        self.ensure_one()
        return sum(len(s.endorsed_by_ids) for s in self.skill_ids) + sum(
            s.endorsements or 0 for s in self.skill_ids)

    def recompute_reputation(self):
        """Reputation engine: 0-100 score from verified data, work history,
        community activity, references and passport completeness."""
        Reputation = self.env['heyla.network.reputation.engine']
        for rec in self:
            score, breakdown = Reputation.sudo().compute(rec)
            rec.write({
                'reputation_score': round(score, 1),
                'reputation_breakdown': json.dumps(breakdown),
                'reputation_updated_at': datetime.now(),
            })
        return self


class NetworkVerification(models.Model):
    _name = 'heyla.network.verification'
    _description = 'HEYLA Verified Identity Record'
    _order = 'id desc'

    profile_id = fields.Many2one('heyla.network.profile', string='Profile', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', related='profile_id.user_id', store=True, index=True)
    verification_type = fields.Selection(VERIFICATION_TYPES, string='Verification Type', required=True)
    status = fields.Selection([
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ], string='Status', default='pending', required=True)
    issuer_name = fields.Char(string='Issuer')
    document_ref = fields.Char(string='Document Reference')
    verified_by = fields.Many2one('heyla.user', string='Verified By')
    verified_at = fields.Datetime(string='Verified At')
    expires_at = fields.Date(string='Expires At')
    note = fields.Text(string='Note')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)

    _sql_constraints = [
        ('unique_verification', 'unique(profile_id, verification_type)',
         'This verification type already exists for the profile!'),
    ]


class NetworkReference(models.Model):
    _name = 'heyla.network.reference'
    _description = 'HEYLA Verified Reference'
    _order = 'id desc'

    profile_id = fields.Many2one('heyla.network.profile', string='Profile', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', related='profile_id.user_id', store=True, index=True)
    reviewer_id = fields.Many2one('heyla.user', string='Reviewer')
    reviewer_name = fields.Char(string='Reviewer Name')
    reviewer_role = fields.Char(string='Reviewer Role')
    reviewer_email = fields.Char(string='Reviewer Email')
    company = fields.Char(string='Company')
    relationship = fields.Char(string='Relationship')

    status = fields.Selection([
        ('requested', 'Requested'),
        ('submitted', 'Submitted'),
        ('verified', 'Verified'),
        ('declined', 'Declined'),
    ], string='Status', default='requested', required=True)

    rating = fields.Selection([(str(i), str(i)) for i in range(1, 6)], string='Overall Rating')
    work_ethic = fields.Integer(string='Work Ethic', default=0)
    attendance = fields.Integer(string='Attendance', default=0)
    performance = fields.Integer(string='Performance', default=0)
    leadership = fields.Integer(string='Leadership', default=0)
    safety = fields.Integer(string='Safety', default=0)
    integrity = fields.Integer(string='Integrity', default=0)
    communication = fields.Integer(string='Communication', default=0)
    skills = fields.Integer(string='Skills', default=0)
    comment = fields.Text(string='Recommendation')

    verified_by = fields.Many2one('heyla.user', string='Verified By')
    verified_at = fields.Datetime(string='Verified At')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)

    def _avg_rating(self):
        self.ensure_one()
        values = [self.rating and int(self.rating) or 0,
                  self.work_ethic, self.attendance, self.performance,
                  self.leadership, self.safety, self.integrity,
                  self.communication, self.skills]
        rated = [v for v in values if v > 0]
        return sum(rated) / len(rated) if rated else 0.0


class NetworkWorklog(models.Model):
    _name = 'heyla.network.worklog'
    _description = 'HEYLA Digital Work Logbook'
    _order = 'id desc'

    profile_id = fields.Many2one('heyla.network.profile', string='Profile', required=True, ondelete='cascade')
    user_id = fields.Many2one('heyla.user', string='User', related='profile_id.user_id', store=True, index=True)
    employer = fields.Char(string='Employer', required=True)
    project_name = fields.Char(string='Project')
    location = fields.Char(string='Location')
    role = fields.Char(string='Role')
    start_date = fields.Date(string='Start Date')
    end_date = fields.Date(string='End Date')
    hours_worked = fields.Float(string='Hours Worked')
    equipment_used = fields.Char(string='Equipment Used')
    output = fields.Char(string='Output')
    attendance_rating = fields.Integer(string='Attendance Rating', default=0)
    safety_incidents = fields.Integer(string='Safety Incidents', default=0)
    supervisor_review = fields.Text(string='Supervisor Review')
    verified = fields.Boolean(string='Verified', default=False)
    verified_by = fields.Many2one('heyla.user', string='Verified By')
    verified_at = fields.Datetime(string='Verified At')
    created_at = fields.Datetime(string='Created At', default=fields.Datetime.now)


class NetworkApplicant(models.Model):
    _inherit = 'heyla.network.applicant'

    user_id = fields.Many2one('heyla.user', string='Applicant User', ondelete='set null')
    profile_id = fields.Many2one('heyla.network.profile', string='Profile')
    phone = fields.Char(string='Phone')
    cv_url = fields.Char(string='CV URL')
    match_score = fields.Float(string='AI Match Score', default=0)


class HeylaNetworkJob(models.Model):
    _inherit = 'heyla.network.job'

    requirements = fields.Text(string='Requirements')
    min_experience = fields.Float(string='Minimum Years of Experience', default=0)
    county = fields.Char(string='County')
    is_remote = fields.Boolean(string='Remote', default=False)


class NetworkReputationEngine(models.Model):
    _name = 'heyla.network.reputation.engine'
    _description = 'HEYLA Reputation Engine (stateless)'

    def compute(self, profile):
        """Return (score 0..100, breakdown dict) for a profile."""
        breakdown = {}
        total = 0.0

        # 1. Verified identity (max 25)
        verified = profile.env['heyla.network.verification'].sudo().search([
            ('profile_id', '=', profile.id),
            ('status', '=', 'verified'),
        ])
        identity_score = min(25.0, sum(VERIFICATION_WEIGHTS.get(v.verification_type, 1.0) for v in verified))
        breakdown['identity'] = round(identity_score, 1)
        total += identity_score

        # 2. Profile completeness / passport (max 10)
        completeness_score = 10.0 * profile._profile_completeness()
        breakdown['passport'] = round(completeness_score, 1)
        total += completeness_score

        # 3. Community (max 10): connections + endorsements
        community_score = min(6.0, profile._connection_total() / 100.0 * 6.0)
        community_score += min(4.0, profile._endorsement_total() * 0.4)
        breakdown['community'] = round(community_score, 1)
        total += community_score

        # 4. Work history (max 20): worklog entries + years of experience
        worklog = profile.env['heyla.network.worklog'].sudo().search([('profile_id', '=', profile.id)])
        history_score = min(12.0, len(worklog) * 3.0)
        for wl in worklog:
            if wl.verified:
                history_score = min(12.0, history_score + 1.0)
        history_score += min(8.0, (profile.years_of_experience or 0) * 0.8)
        breakdown['work_history'] = round(history_score, 1)
        total += history_score

        # 5. Verified references (max 15): count + average rating
        references = profile.env['heyla.network.reference'].sudo().search([
            ('profile_id', '=', profile.id),
            ('status', 'in', ['submitted', 'verified']),
        ])
        ref_score = min(8.0, len(references) * 2.0)
        if references:
            ratings = [r._avg_rating() for r in references]
            ref_score += min(7.0, (sum(ratings) / len(ratings)) / 5.0 * 7.0)
        breakdown['references'] = round(ref_score, 1)
        total += ref_score

        # 6. Safety & integrity (max 10): no incidents, attendance rating
        safety_score = 0.0
        safety_incidents = sum((wl.safety_incidents or 0) for wl in worklog)
        if worklog:
            safety_score += 5.0 if safety_incidents == 0 else max(0.0, 5.0 - safety_incidents * 1.5)
            attendance = [wl.attendance_rating for wl in worklog if wl.attendance_rating > 0]
            if attendance:
                safety_score += (sum(attendance) / len(attendance)) / 5.0 * 5.0
        else:
            safety_score = 2.0
        breakdown['safety'] = round(safety_score, 1)
        total += safety_score

        # 7. Consistency (max 10): length of work history + profile age
        consistency_score = 0.0
        dates = [d for wl in worklog for d in (wl.start_date, wl.end_date) if d]
        if dates:
            span_days = (max(dates) - min(dates)).days
            consistency_score = min(8.0, span_days / 365.0 * 8.0)
        if profile.created_at:
            age_days = (datetime.now() - profile.created_at).total_seconds() / 86400
            consistency_score += min(2.0, age_days / 365.0 * 2.0)
        breakdown['consistency'] = round(consistency_score, 1)
        total += consistency_score

        return round(min(total, 100.0), 1), breakdown


def _normalize(text):
    return ' '.join(re.sub(r'[^a-z0-9\s]', ' ', (text or '').lower()).split())


def _extract_skills_from_query(env, query):
    """Heuristic skill extraction for the AI recruiter: match query tokens
    against all known profile skills plus a static trade dictionary."""
    known = set(env['heyla.network.profile.skill'].sudo().search([]).mapped('name'))
    known |= {
        'welding', 'mig welding', 'tig welding', 'arc welding', 'pipefitting', 'plumbing',
        'carpentry', 'electrical wiring', 'solar installation', 'solar energy', 'panel beating',
        'auto mechanics', 'diesel engines', 'hydraulics', 'excavator operation', 'crane operation',
        'forklift operation', 'heavy machinery', 'concrete works', 'formwork', 'steel fixing',
        'masonry', 'painting', 'tiling', 'roofing', 'surveying', 'quantity surveying',
        'project management', 'site supervision', 'hse', 'first aid', 'nursing', 'caregiving',
        'catering', 'hospitality', 'cleaning', 'security services', 'driving', 'class ce driving',
        'class e driving', 'logistics', 'supply chain', 'warehousing', 'mining operations',
        'drilling', 'blasting', 'farming', 'agronomy', 'fishing', 'aquaculture',
        'accounting', 'bookkeeping', 'tax compliance', 'human resources', 'recruitment',
        'payroll management', 'customer service', 'sales', 'marketing', 'software development',
        'python', 'javascript', 'react', 'node.js', 'odoo', 'sql', 'devops', 'cloud computing',
        'data analysis', 'network administration', 'graphic design', 'photography', 'videography',
        'teaching', 'legal advisory', 'medical practice', 'pharmacy', 'mechanical engineering',
        'civil engineering', 'electrical engineering', 'structural engineering', 'architecture',
        'research', 'consulting', 'business development', 'procurement', 'storekeeping',
        'machine operation', 'cnc operation', 'laser cutting', 'sheet metal work', 'fabrication',
        'glass fitting', 'aluminium fabrication', 'landscaping', 'irrigation', 'pest control',
        'air conditioning', 'refrigeration', 'boiler operation', 'compressor operation',
        'fire safety', 'confined space', 'working at heights', 'rigging', 'lifting operations',
    }
    text = _normalize(query)
    tokens = set(text.split())
    found = set()
    for skill in known:
        if skill and skill in text:
            found.add(skill)
    for token in tokens:
        if token in {s.lower() for s in known}:
            found.add(token)
    return sorted(found)


def _rank_candidates(profiles, required_skills, location=None):
    """Rank profiles for a recruiter query. Returns list of dicts sorted by score."""
    req = [_normalize(s) for s in (required_skills or [])]
    results = []
    for p in profiles:
        p_skills = {_normalize(s.name) for s in p.skill_ids}
        matched = [r for r in req if r and r in p_skills]
        if req:
            skill_score = 100.0 * len(matched) / len(req)
        else:
            skill_score = 50.0
        verified_count = p._verified_count()
        verification_score = min(100.0, 100.0 * verified_count / 5.0)
        reputation_score = min(100.0, p.reputation_score or 0)
        exp_score = min(100.0, 100.0 * (p.years_of_experience or 0) / 20.0)
        if location and location and p.location:
            loc_score = 100.0 if _normalize(location) in _normalize(p.location) else 0.0
        else:
            loc_score = 50.0

        if req:
            score = (0.40 * skill_score + 0.15 * verification_score +
                     0.20 * reputation_score + 0.15 * exp_score + 0.10 * loc_score)
        else:
            score = (0.30 * verification_score + 0.35 * reputation_score +
                     0.25 * exp_score + 0.10 * loc_score)

        results.append({
            'profileId': str(p.id),
            'userId': str(p.user_id.id),
            'name': p.user_id.name or '',
            'headline': p.headline or '',
            'location': p.location or '',
            'tradeCategory': p.trade_category or '',
            'availability': p.availability or '',
            'expectedSalary': p.expected_salary or '',
            'yearsOfExperience': p.years_of_experience or 0,
            'reputation': round(p.reputation_score or 0, 1),
            'verifiedCount': verified_count,
            'connectionCount': p.connection_count or 0,
            'skills': [s.name for s in p.skill_ids],
            'matchedSkills': matched,
            'matchScore': round(score, 1),
        })
    results.sort(key=lambda r: r['matchScore'], reverse=True)
    return results
