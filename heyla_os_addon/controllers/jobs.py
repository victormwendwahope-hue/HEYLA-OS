from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class JobsController(http.Controller):

    def _job_to_json(self, j):
        return {
            'id': str(j.id), 'title': j.title or '', 'department': j.department or '',
            'location': j.location or '', 'type': j.job_type or 'Full-time',
            'status': j.status or 'Draft', 'salary': j.salary or '',
            'description': j.description or '',
            'requirements': j.requirements.split('\n') if j.requirements else [],
            'postedDate': j.posted_date.isoformat() if j.posted_date else '',
            'applicants': j.applicants or 0,
            'country': j.country or '',
            'company': j.company_name or '',
            'banner': j.banner or '',
            'photo': j.photo or '',
            'roles': j.roles.split('\n') if j.roles else [],
            'benefits': j.benefits.split('\n') if j.benefits else [],
            'customFormFields': j._get_custom_fields(),
            'linkedinJobId': j.linkedin_job_id or '',
            'interviewInstructions': j.interview_instructions or '',
            'videoCallLink': j.video_call_link or '',
        }

    def _applicant_to_json(self, a):
        return {
            'id': str(a.id), 'jobId': str(a.job_id.id) if a.job_id else '',
            'userId': str(a.user_id.id) if a.user_id else '',
            'name': a.name or '', 'email': a.email or '', 'phone': a.phone or '',
            'stage': a.stage or 'Applied',
            'appliedDate': a.applied_date.isoformat() if a.applied_date else '',
            'resumeUrl': a.resume_url or '', 'rating': a.rating, 'notes': a.notes or '',
            'coverLetter': a.cover_letter or '',
            'linkedinProfile': a.linkedin_profile or '',
            'formAnswers': a._get_form_answers(),
            'interviewDate': a.interview_date.isoformat() if a.interview_date else '',
            'interviewType': a.interview_type or 'Video',
            'interviewLink': a.interview_link or '',
            'interviewNotes': a.interview_notes or '',
        }

    def _interview_to_json(self, i):
        return {
            'id': str(i.id), 'applicantId': str(i.applicant_id.id) if i.applicant_id else '',
            'applicantName': i.applicant_name or '', 'jobTitle': i.job_title or '',
            'date': i.date.isoformat() if i.date else '', 'time': i.time or '',
            'type': i.interview_type or 'Video', 'interviewer': i.interviewer or '',
            'status': i.status or 'Scheduled', 'notes': i.notes or '',
        }

    # ---- Jobs ----
    @http.route('/api/jobs', type='http', auth='none', methods=['GET'], csrf=False)
    def get_jobs(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._job_to_json(j) for j in request.env['heyla.job'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/jobs', type='http', auth='none', methods=['POST'], csrf=False)
    def create_job(self):
        return _auth_required(lambda: self._create_job())()

    def _create_job(self):
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)
        vals = {
            'title': data.get('title', ''), 'department': data.get('department', ''),
            'location': data.get('location', ''), 'job_type': data.get('type', 'Full-time'),
            'status': data.get('status', 'Open'), 'salary': data.get('salary', ''),
            'description': data.get('description', ''),
            'country': data.get('country', ''),
            'company_name': data.get('company', ''),
            'banner': data.get('banner', ''),
            'photo': data.get('photo', ''),
            'linkedin_job_id': data.get('linkedinJobId', ''),
            'interview_instructions': data.get('interviewInstructions', ''),
            'video_call_link': data.get('videoCallLink', ''),
        }
        if 'requirements' in data:
            vals['requirements'] = '\n'.join(data['requirements']) if isinstance(data['requirements'], list) else data['requirements']
        if 'roles' in data:
            vals['roles'] = '\n'.join(data['roles']) if isinstance(data['roles'], list) else data['roles']
        if 'benefits' in data:
            vals['benefits'] = '\n'.join(data['benefits']) if isinstance(data['benefits'], list) else data['benefits']
        if 'customFormFields' in data:
            vals['custom_form_fields'] = json.dumps(data['customFormFields'])
        j = request.env['heyla.job'].sudo().create(vals)
        return http.Response(json.dumps(self._job_to_json(j)), content_type='application/json', status=201)

    @http.route('/api/jobs/<int:job_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_job(self, job_id):
        return _auth_required(lambda: self._update_job(job_id))()

    def _update_job(self, job_id):
        rec = request.env['heyla.job'].sudo().browse(job_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)
        field_map = {'title': 'title', 'department': 'department', 'location': 'location',
                     'type': 'job_type', 'status': 'status', 'salary': 'salary',
                     'description': 'description', 'country': 'country',
                     'company': 'company_name', 'banner': 'banner', 'photo': 'photo',
                     'linkedinJobId': 'linkedin_job_id',
                     'interviewInstructions': 'interview_instructions',
                     'videoCallLink': 'video_call_link'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if 'requirements' in data:
            vals['requirements'] = '\n'.join(data['requirements']) if isinstance(data['requirements'], list) else data['requirements']
        if 'roles' in data:
            vals['roles'] = '\n'.join(data['roles']) if isinstance(data['roles'], list) else data['roles']
        if 'benefits' in data:
            vals['benefits'] = '\n'.join(data['benefits']) if isinstance(data['benefits'], list) else data['benefits']
        if 'customFormFields' in data:
            vals['custom_form_fields'] = json.dumps(data['customFormFields'])
        if vals:
            rec.sudo().write(vals)
        return http.Response(json.dumps(self._job_to_json(rec)), content_type='application/json', status=200)

    @http.route('/api/jobs/<int:job_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_job(self, job_id):
        return _auth_required(lambda: self._delete_job(job_id))()

    def _delete_job(self, job_id):
        rec = request.env['heyla.job'].sudo().browse(job_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ---- Public Apply ----
    @http.route('/api/jobs/<int:job_id>/apply', type='http', auth='none', methods=['POST'], csrf=False)
    def public_apply(self, job_id):
        job = request.env['heyla.job'].sudo().browse(job_id)
        if not job.exists():
            return http.Response(json.dumps({'error': 'Job not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)

        user = None
        auth_header = request.httprequest.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
        if token:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token
            token_hash = _hash_token(token)
            user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)

        vals = {
            'job_id': job_id,
            'name': data.get('name', ''),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'stage': 'Applied',
            'resume_url': data.get('resumeUrl', ''),
            'notes': data.get('notes', ''),
            'cover_letter': data.get('coverLetter', ''),
            'linkedin_profile': data.get('linkedinProfile', ''),
            'form_answers': json.dumps(data.get('formAnswers', {})),
        }
        if user:
            vals['user_id'] = user.id
        a = request.env['heyla.job.applicant'].sudo().create(vals)
        job.sudo().write({'applicants': job.applicants + 1})
        return http.Response(json.dumps(self._applicant_to_json(a)), content_type='application/json', status=201)

    # ---- My Applications (for authenticated users) ----
    @http.route('/api/my-applications', type='http', auth='none', methods=['GET'], csrf=False)
    def my_applications(self):
        return _auth_required(lambda: self._my_applications())()

    def _my_applications(self):
        user = request.heyla_user
        apps = request.env['heyla.job.applicant'].sudo().search([('user_id', '=', user.id)], order='id desc')
        return http.Response(json.dumps([self._applicant_to_json(a) for a in apps]), content_type='application/json', status=200)

    # ---- Applicants (internal management) ----
    @http.route('/api/applicants', type='http', auth='none', methods=['GET'], csrf=False)
    def get_applicants(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._applicant_to_json(a) for a in request.env['heyla.job.applicant'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/applicants/<int:app_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_applicant(self, app_id):
        return _auth_required(lambda: self._update_applicant(app_id))()

    def _update_applicant(self, app_id):
        rec = request.env['heyla.job.applicant'].sudo().browse(app_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)
        field_map = {'name': 'name', 'email': 'email', 'phone': 'phone',
                     'stage': 'stage', 'resumeUrl': 'resume_url', 'rating': 'rating',
                     'notes': 'notes', 'coverLetter': 'cover_letter',
                     'interviewDate': 'interview_date', 'interviewType': 'interview_type',
                     'interviewLink': 'interview_link', 'interviewNotes': 'interview_notes'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if 'formAnswers' in data:
            vals['form_answers'] = json.dumps(data['formAnswers'])
        if vals:
            rec.sudo().write(vals)
        if rec.stage == 'Hired' and rec.user_id:
            rec.user_id.sudo().write({'role': 'employee'})
        return http.Response(json.dumps(self._applicant_to_json(rec)), content_type='application/json', status=200)

    # ---- Interviews (internal management) ----
    @http.route('/api/interviews', type='http', auth='none', methods=['GET'], csrf=False)
    def get_interviews(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._interview_to_json(i) for i in request.env['heyla.job.interview'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/interviews', type='http', auth='none', methods=['POST'], csrf=False)
    def create_interview(self):
        return _auth_required(lambda: self._create_interview())()

    def _create_interview(self):
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)
        i = request.env['heyla.job.interview'].sudo().create({
            'applicant_id': int(data.get('applicantId', 0)) if data.get('applicantId') else False,
            'applicant_name': data.get('applicantName', ''),
            'job_title': data.get('jobTitle', ''),
            'date': data.get('date') or False,
            'time': data.get('time', ''),
            'interview_type': data.get('type', 'Video'),
            'interviewer': data.get('interviewer', ''),
            'status': data.get('status', 'Scheduled'),
            'notes': data.get('notes', ''),
        })
        return http.Response(json.dumps(self._interview_to_json(i)), content_type='application/json', status=201)

    @http.route('/api/interviews/<int:int_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_interview(self, int_id):
        return _auth_required(lambda: self._update_interview(int_id))()

    def _update_interview(self, int_id):
        rec = request.env['heyla.job.interview'].sudo().browse(int_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)
        field_map = {'applicantName': 'applicant_name', 'jobTitle': 'job_title',
                     'time': 'time', 'type': 'interview_type',
                     'interviewer': 'interviewer', 'status': 'status', 'notes': 'notes'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if 'date' in data:
            vals['date'] = data['date'] or False
        if vals:
            rec.sudo().write(vals)
        return http.Response(json.dumps(self._interview_to_json(rec)), content_type='application/json', status=200)

    # ---- LinkedIn job import ----
    @http.route('/api/jobs/linkedin-import', type='http', auth='none', methods=['POST'], csrf=False)
    def linkedin_import(self):
        return _auth_required(lambda: self._linkedin_import())()

    def _linkedin_import(self):
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)
        vals = {
            'title': data.get('title', ''),
            'company_name': data.get('company', ''),
            'location': data.get('location', ''),
            'job_type': data.get('type', 'Full-time'),
            'salary': data.get('salary', ''),
            'description': data.get('description', ''),
            'requirements': '\n'.join(data.get('requirements', [])) if isinstance(data.get('requirements'), list) else data.get('requirements', ''),
            'linkedin_job_id': data.get('linkedinJobId', ''),
            'status': 'Open',
            'posted_date': fields.Date.today(),
        }
        j = request.env['heyla.job'].sudo().create(vals)
        return http.Response(json.dumps(self._job_to_json(j)), content_type='application/json', status=201)
