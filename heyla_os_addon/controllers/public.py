from odoo import http, fields
from odoo.http import request
import json
from datetime import datetime


class PublicController(http.Controller):

    @http.route('/api/public/jobs', type='http', auth='none', methods=['GET'], csrf=False)
    def public_jobs(self):
        try:
            country = request.params.get('country', '')
            domain = [('status', '=', 'Open')]
            if country:
                domain.append(('country', '=', country.upper()))
            jobs = request.env['heyla.job'].sudo().search(domain, order='posted_date desc')
            result = []
            for j in jobs:
                result.append(self._job_public_json(j))
            return http.Response(json.dumps(result), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)

    def _job_public_json(self, j):
        return {
            'id': str(j.id),
            'title': j.title or '',
            'company': j.company_name or '',
            'location': j.location or '',
            'type': j.job_type or 'Full-time',
            'salary': j.salary or '',
            'description': j.description or '',
            'postedDate': j.posted_date.isoformat() if j.posted_date else '',
            'requirements': j.requirements.split('\n') if j.requirements else [],
            'roles': j.roles.split('\n') if j.roles else [],
            'benefits': j.benefits.split('\n') if j.benefits else [],
            'banner': j.banner or '',
            'photo': j.photo or '',
            'companyName': j.company_name or '',
            'customFormFields': json.loads(j.custom_form_fields or '[]'),
            'interviewInstructions': j.interview_instructions or '',
            'videoCallLink': j.video_call_link or '',
        }

    @http.route('/api/public/vacancies', type='http', auth='none', methods=['GET'], csrf=False)
    def public_vacancies(self):
        try:
            search = request.params.get('search', '').strip()
            job_type = request.params.get('type', '')
            country = request.params.get('country', '')
            limit = min(int(request.params.get('limit', 50)), 200)
            offset = int(request.params.get('offset', 0))

            result = []
            job_domain = [('status', '=', 'Open')]
            if search:
                job_domain.append('|')
                job_domain.append('|')
                job_domain.append(('title', 'ilike', search))
                job_domain.append(('company_name', 'ilike', search))
                job_domain.append(('description', 'ilike', search))
            if country:
                job_domain.append(('country', '=', country.upper()))
            if job_type:
                job_domain.append(('job_type', '=', job_type))

            jobs = request.env['heyla.job'].sudo().search(job_domain, order='posted_date desc', limit=limit, offset=offset)
            for j in jobs:
                r = self._job_public_json(j)
                r['id'] = 'job_' + str(j.id)
                r['source'] = 'company'
                r['skills'] = j.requirements.split('\n') if j.requirements else []
                result.append(r)

            net_domain = []
            if search:
                net_domain.append('|')
                net_domain.append('|')
                net_domain.append(('title', 'ilike', search))
                net_domain.append(('company', 'ilike', search))
                net_domain.append(('description', 'ilike', search))
            if job_type:
                net_domain.append(('job_type', '=', job_type))

            net_jobs = request.env['heyla.network.job'].sudo().search(net_domain, order='id desc', limit=limit, offset=offset)
            for j in net_jobs:
                result.append({
                    'id': 'net_' + str(j.id),
                    'source': 'network',
                    'title': j.title or '',
                    'company': j.company or '',
                    'location': j.location or '',
                    'type': j.job_type or 'Full-time',
                    'salary': j.salary or '',
                    'description': j.description or '',
                    'skills': j.skills.split('\n') if j.skills else [],
                    'postedDate': j.posted or '',
                    'requirements': [],
                    'roles': [],
                    'benefits': [],
                    'banner': '',
                    'photo': '',
                    'companyName': j.company or '',
                    'customFormFields': [],
                })

            result.sort(key=lambda x: x.get('postedDate', ''), reverse=True)
            return http.Response(json.dumps(result), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)

    @http.route('/api/public/jobs/<int:job_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def public_job_detail(self, job_id):
        try:
            j = request.env['heyla.job'].sudo().browse(job_id)
            if not j.exists() or j.status != 'Open':
                return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
            return http.Response(json.dumps(self._job_public_json(j)), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)

    @http.route('/api/public/linkedin/import', type='http', auth='none', methods=['POST'], csrf=False)
    def linkedin_job_import(self):
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)
        vals = {
            'title': data.get('title', ''),
            'company_name': data.get('company', data.get('companyName', '')),
            'location': data.get('location', ''),
            'job_type': data.get('type', 'Full-time'),
            'salary': data.get('salary', ''),
            'description': data.get('description', ''),
            'linkedin_job_id': data.get('linkedinJobId', ''),
            'status': 'Open',
            'posted_date': fields.Date.today(),
        }
        j = request.env['heyla.job'].sudo().create(vals)
        return http.Response(json.dumps({'id': str(j.id), 'title': j.title}), content_type='application/json', status=201)
