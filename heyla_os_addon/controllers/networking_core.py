from odoo import http
from odoo.http import request
from .auth import _auth_required
from .networking import _get_user
import json
from datetime import datetime, date


def _json_error(msg, status=400):
    return http.Response(json.dumps({'error': msg}), content_type='application/json', status=status)


def _load_json():
    try:
        return json.loads(request.httprequest.data)
    except (json.JSONDecodeError, Exception):
        return None


class NetworkingCoreController(http.Controller):

    # ==================== Helpers ====================

    def _get_or_create_profile(self, user):
        return request.env['heyla.network.profile'].sudo()._get_or_create(user)

    def _verification_to_json(self, v):
        return {
            'id': str(v.id),
            'type': v.verification_type,
            'status': v.status,
            'issuerName': v.issuer_name or '',
            'documentRef': v.document_ref or '',
            'verifiedBy': v.verified_by.name if v.verified_by else '',
            'verifiedAt': v.verified_at.isoformat() if v.verified_at else '',
            'expiresAt': v.expires_at.isoformat() if v.expires_at else '',
            'note': v.note or '',
        }

    def _reference_to_json(self, r):
        return {
            'id': str(r.id),
            'profileId': str(r.profile_id.id),
            'userId': str(r.user_id.id) if r.user_id else '',
            'userName': r.user_id.name if r.user_id else '',
            'reviewerId': str(r.reviewer_id.id) if r.reviewer_id else '',
            'reviewerName': r.reviewer_name or '',
            'reviewerRole': r.reviewer_role or '',
            'reviewerEmail': r.reviewer_email or '',
            'company': r.company or '',
            'relationship': r.relationship or '',
            'status': r.status,
            'rating': r.rating or '',
            'workEthic': r.work_ethic,
            'attendance': r.attendance,
            'performance': r.performance,
            'leadership': r.leadership,
            'safety': r.safety,
            'integrity': r.integrity,
            'communication': r.communication,
            'skills': r.skills,
            'comment': r.comment or '',
            'verifiedBy': r.verified_by.name if r.verified_by else '',
            'verifiedAt': r.verified_at.isoformat() if r.verified_at else '',
            'averageRating': round(r._avg_rating(), 1),
        }

    def _worklog_to_json(self, w):
        return {
            'id': str(w.id),
            'employer': w.employer or '',
            'projectName': w.project_name or '',
            'location': w.location or '',
            'role': w.role or '',
            'startDate': w.start_date.isoformat() if w.start_date else '',
            'endDate': w.end_date.isoformat() if w.end_date else '',
            'hoursWorked': w.hours_worked or 0,
            'equipmentUsed': w.equipment_used or '',
            'output': w.output or '',
            'attendanceRating': w.attendance_rating or 0,
            'safetyIncidents': w.safety_incidents or 0,
            'supervisorReview': w.supervisor_review or '',
            'verified': w.verified,
            'verifiedBy': w.verified_by.name if w.verified_by else '',
        }

    def _passport_to_json(self, p):
        return {
            'tradeCategory': p.trade_category or '',
            'yearsOfExperience': p.years_of_experience or 0,
            'availability': p.availability or '',
            'expectedSalary': p.expected_salary or '',
            'noticePeriod': p.notice_period or '',
            'languages': p.languages or '',
            'nationality': p.nationality or '',
            'willingToRelocate': p.willing_to_relocate or False,
            'relocationCountries': p.relocation_countries or '',
            'passportStatus': p.passport_status or '',
            'visaStatus': p.visa_status or '',
            'idVerified': bool(p.id_number),
        }

    def _parse_date(self, value):
        if not value:
            return False
        try:
            return date.fromisoformat(str(value)[:10])
        except (ValueError, TypeError):
            return False

    def _recompute(self, profile):
        profile.recompute_reputation()
        return profile

    # ==================== Verification (Verified Identity) ====================

    @http.route('/api/network/verifications', type='http', auth='none', methods=['GET'], csrf=False)
    def get_my_verifications(self):
        return _auth_required(lambda: self._get_my_verifications())()

    def _get_my_verifications(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        records = request.env['heyla.network.verification'].sudo().search([('profile_id', '=', profile.id)], order='id desc')
        return http.Response(json.dumps({
            'verifiedCount': sum(1 for r in records if r.status == 'verified'),
            'verifications': [self._verification_to_json(r) for r in records],
        }), content_type='application/json', status=200)

    @http.route('/api/network/verifications', type='http', auth='none', methods=['POST'], csrf=False)
    def create_verification(self):
        return _auth_required(lambda: self._create_verification())()

    def _create_verification(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        vtype = data.get('verificationType', '')
        valid_types = [t[0] for t in request.env['heyla.network.verification'].sudo()._fields['verification_type'].selection]
        if vtype not in valid_types:
            return _json_error('Invalid verification type')
        profile = self._get_or_create_profile(user)
        existing = request.env['heyla.network.verification'].sudo().search([
            ('profile_id', '=', profile.id),
            ('verification_type', '=', vtype),
        ], limit=1)
        if existing:
            return _json_error('This verification already exists', 400)
        record = request.env['heyla.network.verification'].sudo().create({
            'profile_id': profile.id,
            'verification_type': vtype,
            'issuer_name': data.get('issuerName', ''),
            'document_ref': data.get('documentRef', ''),
            'expires_at': self._parse_date(data.get('expiresAt')),
            'note': data.get('note', ''),
        })
        self._recompute(profile)
        return http.Response(json.dumps(self._verification_to_json(record)), content_type='application/json', status=201)

    @http.route('/api/network/verifications/<int:verification_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_verification(self, verification_id):
        return _auth_required(lambda: self._update_verification(verification_id))()

    def _update_verification(self, verification_id):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        record = request.env['heyla.network.verification'].sudo().browse(verification_id)
        if not record.exists():
            return _json_error('Not found', 404)
        profile = record.profile_id
        is_owner = profile.user_id.id == user.id
        is_admin = user.role == 'admin'
        if not is_owner and not is_admin:
            return _json_error('Forbidden', 403)
        vals = {}
        if 'note' in data:
            vals['note'] = data['note']
        if 'issuerName' in data:
            vals['issuer_name'] = data['issuerName']
        if 'documentRef' in data:
            vals['document_ref'] = data['documentRef']
        if 'status' in data:
            status = data['status']
            if status not in ('pending', 'verified', 'rejected', 'expired'):
                return _json_error('Invalid status')
            # Only admins can mark a record verified/rejected (trust semantics)
            if status in ('verified', 'rejected') and not is_admin:
                return _json_error('Only an admin can verify identity records', 403)
            vals['status'] = status
            if status == 'verified':
                vals['verified_by'] = user.id
                vals['verified_at'] = datetime.now()
        if vals:
            record.sudo().write(vals)
        self._recompute(profile)
        return http.Response(json.dumps(self._verification_to_json(record)), content_type='application/json', status=200)

    @http.route('/api/network/verifications/<int:verification_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_verification(self, verification_id):
        return _auth_required(lambda: self._delete_verification(verification_id))()

    def _delete_verification(self, verification_id):
        user = _get_user()
        record = request.env['heyla.network.verification'].sudo().browse(verification_id)
        if not record.exists():
            return _json_error('Not found', 404)
        if record.profile_id.user_id.id != user.id and user.role != 'admin':
            return _json_error('Forbidden', 403)
        profile = record.profile_id
        record.sudo().unlink()
        self._recompute(profile)
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/network/verifications/<int:user_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def get_user_verifications(self, user_id):
        return _auth_required(lambda: self._get_user_verifications(user_id))()

    def _get_user_verifications(self, user_id):
        profile = request.env['heyla.network.profile'].sudo().search([('user_id', '=', user_id)], limit=1)
        if not profile:
            return _json_error('Profile not found', 404)
        records = request.env['heyla.network.verification'].sudo().search([
            ('profile_id', '=', profile.id),
            ('status', '=', 'verified'),
        ], order='id desc')
        return http.Response(json.dumps({
            'verifiedCount': len(records),
            'verifications': [self._verification_to_json(r) for r in records],
        }), content_type='application/json', status=200)

    # ==================== Verified References ====================

    @http.route('/api/network/references', type='http', auth='none', methods=['GET'], csrf=False)
    def get_references(self):
        return _auth_required(lambda: self._get_references())()

    def _get_references(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        mine = request.env['heyla.network.reference'].sudo().search([('profile_id', '=', profile.id)], order='id desc')
        to_review = request.env['heyla.network.reference'].sudo().search([
            '|',
            ('reviewer_id', '=', user.id),
            ('reviewer_email', '=', user.email),
            ('status', '=', 'requested'),
        ], order='id desc')
        return http.Response(json.dumps({
            'mine': [self._reference_to_json(r) for r in mine],
            'toReview': [self._reference_to_json(r) for r in to_review],
        }), content_type='application/json', status=200)

    @http.route('/api/network/references/request', type='http', auth='none', methods=['POST'], csrf=False)
    def request_reference(self):
        return _auth_required(lambda: self._request_reference())()

    def _request_reference(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        reviewer_name = (data.get('reviewerName') or '').strip()
        reviewer_email = (data.get('reviewerEmail') or '').strip().lower()
        if not reviewer_name or not reviewer_email:
            return _json_error('Reviewer name and email required')
        profile = self._get_or_create_profile(user)
        reviewer = request.env['heyla.user'].sudo().search([('email', '=', reviewer_email)], limit=1)
        record = request.env['heyla.network.reference'].sudo().create({
            'profile_id': profile.id,
            'reviewer_id': reviewer.id if reviewer else False,
            'reviewer_name': reviewer_name,
            'reviewer_role': data.get('reviewerRole', ''),
            'reviewer_email': reviewer_email,
            'company': data.get('company', ''),
            'relationship': data.get('relationship', ''),
        })
        return http.Response(json.dumps(self._reference_to_json(record)), content_type='application/json', status=201)

    @http.route('/api/network/references/<int:reference_id>/submit', type='http', auth='none', methods=['POST'], csrf=False)
    def submit_reference(self, reference_id):
        return _auth_required(lambda: self._submit_reference(reference_id))()

    def _submit_reference(self, reference_id):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        record = request.env['heyla.network.reference'].sudo().browse(reference_id)
        if not record.exists():
            return _json_error('Not found', 404)
        is_reviewer = record.reviewer_id.id == user.id or (record.reviewer_email or '').lower() == (user.email or '').lower()
        if not is_reviewer:
            return _json_error('Only the requested reviewer can submit this reference', 403)
        if record.status != 'requested':
            return _json_error('Reference is no longer pending', 400)

        def _rating(key):
            try:
                value = int(data.get(key, 0) or 0)
            except (ValueError, TypeError):
                value = 0
            return min(5, max(0, value))

        vals = {
            'reviewer_name': data.get('reviewerName', record.reviewer_name or ''),
            'reviewer_role': data.get('reviewerRole', record.reviewer_role or ''),
            'company': data.get('company', record.company or ''),
            'relationship': data.get('relationship', record.relationship or ''),
            'rating': str(min(5, max(1, _rating('rating')))) if _rating('rating') else False,
            'work_ethic': _rating('workEthic'),
            'attendance': _rating('attendance'),
            'performance': _rating('performance'),
            'leadership': _rating('leadership'),
            'safety': _rating('safety'),
            'integrity': _rating('integrity'),
            'communication': _rating('communication'),
            'skills': _rating('skills'),
            'comment': data.get('comment', ''),
            'status': 'submitted',
        }
        if data.get('decline'):
            vals['status'] = 'declined'
            vals['comment'] = data.get('comment', '')
        record.sudo().write(vals)
        self._recompute(record.profile_id)
        return http.Response(json.dumps(self._reference_to_json(record)), content_type='application/json', status=200)

    @http.route('/api/network/references/<int:reference_id>/verify', type='http', auth='none', methods=['POST'], csrf=False)
    def verify_reference(self, reference_id):
        return _auth_required(lambda: self._verify_reference(reference_id))()

    def _verify_reference(self, reference_id):
        user = _get_user()
        record = request.env['heyla.network.reference'].sudo().browse(reference_id)
        if not record.exists():
            return _json_error('Not found', 404)
        is_owner = record.profile_id.user_id.id == user.id
        if not is_owner and user.role != 'admin':
            return _json_error('Forbidden', 403)
        if record.status != 'submitted':
            return _json_error('Only submitted references can be verified', 400)
        record.sudo().write({
            'status': 'verified',
            'verified_by': user.id,
            'verified_at': datetime.now(),
        })
        self._recompute(record.profile_id)
        return http.Response(json.dumps(self._reference_to_json(record)), content_type='application/json', status=200)

    # ==================== Digital Work Logbook ====================

    @http.route('/api/network/worklog', type='http', auth='none', methods=['GET'], csrf=False)
    def get_worklog(self):
        return _auth_required(lambda: self._get_worklog())()

    def _get_worklog(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        entries = request.env['heyla.network.worklog'].sudo().search([('profile_id', '=', profile.id)], order='id desc')
        return http.Response(json.dumps({
            'entries': [self._worklog_to_json(w) for w in entries],
            'totalHours': round(sum(w.hours_worked or 0 for w in entries), 1),
        }), content_type='application/json', status=200)

    @http.route('/api/network/worklog', type='http', auth='none', methods=['POST'], csrf=False)
    def create_worklog(self):
        return _auth_required(lambda: self._create_worklog())()

    def _create_worklog(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        employer = (data.get('employer') or '').strip()
        if not employer:
            return _json_error('Employer required')
        profile = self._get_or_create_profile(user)
        try:
            hours = float(data.get('hoursWorked') or 0)
        except (ValueError, TypeError):
            hours = 0
        try:
            attendance_rating = int(data.get('attendanceRating') or 0)
        except (ValueError, TypeError):
            attendance_rating = 0
        try:
            safety_incidents = int(data.get('safetyIncidents') or 0)
        except (ValueError, TypeError):
            safety_incidents = 0
        entry = request.env['heyla.network.worklog'].sudo().create({
            'profile_id': profile.id,
            'employer': employer,
            'project_name': data.get('projectName', ''),
            'location': data.get('location', ''),
            'role': data.get('role', ''),
            'start_date': self._parse_date(data.get('startDate')),
            'end_date': self._parse_date(data.get('endDate')),
            'hours_worked': hours,
            'equipment_used': data.get('equipmentUsed', ''),
            'output': data.get('output', ''),
            'attendance_rating': min(5, max(0, attendance_rating)),
            'safety_incidents': max(0, safety_incidents),
            'supervisor_review': data.get('supervisorReview', ''),
        })
        self._recompute(profile)
        return http.Response(json.dumps(self._worklog_to_json(entry)), content_type='application/json', status=201)

    @http.route('/api/network/worklog/<int:worklog_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_worklog(self, worklog_id):
        return _auth_required(lambda: self._delete_worklog(worklog_id))()

    def _delete_worklog(self, worklog_id):
        user = _get_user()
        entry = request.env['heyla.network.worklog'].sudo().browse(worklog_id)
        if not entry.exists():
            return _json_error('Not found', 404)
        if entry.profile_id.user_id.id != user.id and user.role != 'admin':
            return _json_error('Forbidden', 403)
        profile = entry.profile_id
        entry.sudo().unlink()
        self._recompute(profile)
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ==================== Reputation Engine ====================

    @http.route('/api/network/reputation', type='http', auth='none', methods=['GET'], csrf=False)
    def get_reputation(self):
        return _auth_required(lambda: self._get_reputation())()

    def _get_reputation(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        profile = self._recompute(profile)
        try:
            breakdown = json.loads(profile.reputation_breakdown or '{}')
        except (json.JSONDecodeError, TypeError):
            breakdown = {}
        return http.Response(json.dumps({
            'score': profile.reputation_score,
            'breakdown': breakdown,
            'updatedAt': profile.reputation_updated_at.isoformat() if profile.reputation_updated_at else '',
        }), content_type='application/json', status=200)

    @http.route('/api/network/reputation/<int:user_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def get_user_reputation(self, user_id):
        return _auth_required(lambda: self._get_user_reputation(user_id))()

    def _get_user_reputation(self, user_id):
        profile = request.env['heyla.network.profile'].sudo().search([('user_id', '=', user_id)], limit=1)
        if not profile:
            return _json_error('Profile not found', 404)
        return http.Response(json.dumps({
            'score': profile.reputation_score,
            'verifiedCount': profile._verified_count(),
            'connectionCount': profile.connection_count or 0,
            'yearsOfExperience': profile.years_of_experience or 0,
        }), content_type='application/json', status=200)

    # ==================== Skills Passport ====================

    @http.route('/api/network/passport', type='http', auth='none', methods=['GET'], csrf=False)
    def get_passport(self):
        return _auth_required(lambda: self._get_passport())()

    def _get_passport(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        return http.Response(json.dumps(self._passport_to_json(profile)), content_type='application/json', status=200)

    @http.route('/api/network/passport', type='http', auth='none', methods=['POST'], csrf=False)
    def save_passport(self):
        return _auth_required(lambda: self._save_passport())()

    def _save_passport(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        profile = self._get_or_create_profile(user)
        valid_trades = [t[0] for t in request.env['heyla.network.profile'].sudo()._fields['trade_category'].selection]
        valid_avail = [a[0] for a in request.env['heyla.network.profile'].sudo()._fields['availability'].selection]
        vals = {}
        if 'tradeCategory' in data:
            trade = data.get('tradeCategory') or ''
            if trade and trade not in valid_trades:
                return _json_error('Invalid trade category')
            vals['trade_category'] = trade
        if 'yearsOfExperience' in data:
            try:
                vals['years_of_experience'] = float(data.get('yearsOfExperience') or 0)
            except (ValueError, TypeError):
                return _json_error('Invalid years of experience')
        if 'availability' in data:
            availability = data.get('availability') or ''
            if availability and availability not in valid_avail:
                return _json_error('Invalid availability')
            vals['availability'] = availability
        if 'expectedSalary' in data:
            vals['expected_salary'] = data.get('expectedSalary', '')
        if 'noticePeriod' in data:
            vals['notice_period'] = data.get('noticePeriod', '')
        if 'languages' in data:
            vals['languages'] = data.get('languages', '')
        if 'nationality' in data:
            vals['nationality'] = data.get('nationality', '')
        if 'willingToRelocate' in data:
            vals['willing_to_relocate'] = bool(data.get('willingToRelocate'))
        if 'relocationCountries' in data:
            vals['relocation_countries'] = data.get('relocationCountries', '')
        if 'passportStatus' in data:
            vals['passport_status'] = data.get('passportStatus', '')
        if 'visaStatus' in data:
            vals['visa_status'] = data.get('visaStatus', '')
        if 'idNumber' in data:
            vals['id_number'] = data.get('idNumber', '')
        if 'dateOfBirth' in data:
            dob = self._parse_date(data.get('dateOfBirth'))
            vals['date_of_birth'] = dob or False
        if vals:
            profile.sudo().write(vals)
            profile = self._recompute(profile)
        return http.Response(json.dumps(self._passport_to_json(profile)), content_type='application/json', status=200)

    # ==================== AI Recruiter ====================

    @http.route('/api/network/jobs/<int:job_id>/candidates', type='http', auth='none', methods=['GET'], csrf=False)
    def job_candidates(self, job_id):
        return _auth_required(lambda: self._job_candidates(job_id))()

    def _job_candidates(self, job_id):
        from odoo.addons.heyla_os_addon.models.network_core import _rank_candidates
        job = request.env['heyla.network.job'].sudo().browse(job_id)
        if not job.exists():
            return _json_error('Job not found', 404)
        required = [s.strip() for s in (job.skills or '').split('\n') if s.strip()]
        profiles = request.env['heyla.network.profile'].sudo().search([])
        candidates = _rank_candidates(profiles, required, job.location)
        limit = int(request.httprequest.args.get('limit', 25) or 25)
        return http.Response(json.dumps({
            'jobId': str(job.id),
            'title': job.title,
            'requiredSkills': required,
            'candidates': candidates[:limit],
            'totalCandidates': len(candidates),
        }), content_type='application/json', status=200)

    @http.route('/api/network/recruiter/search', type='http', auth='none', methods=['POST'], csrf=False)
    def recruiter_search(self):
        return _auth_required(lambda: self._recruiter_search())()

    def _recruiter_search(self):
        from odoo.addons.heyla_os_addon.models.network_core import _extract_skills_from_query, _rank_candidates
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        query = data.get('query', '')
        if not query or not query.strip():
            return _json_error('Query required')
        skills = _extract_skills_from_query(request.env, query)
        location = data.get('location', '')
        profiles = request.env['heyla.network.profile'].sudo().search([])
        candidates = _rank_candidates(profiles, skills, location)
        limit = int(data.get('limit', 25) or 25)
        return http.Response(json.dumps({
            'query': query,
            'detectedSkills': skills,
            'candidates': candidates[:limit],
            'totalCandidates': len(candidates),
        }), content_type='application/json', status=200)
