from odoo import http
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
                result.append({
                    'id': str(j.id),
                    'title': j.title or '',
                    'company': j.company_name or '',
                    'location': j.location or '',
                    'type': j.job_type or 'Full-time',
                    'salary': j.salary or '',
                    'description': j.description or '',
                    'postedDate': j.posted_date.isoformat() if j.posted_date else '',
                })
            return http.Response(
                json.dumps(result),
                content_type='application/json', status=200,
            )
        except Exception as e:
            return http.Response(
                json.dumps({'error': 'Request failed'}),
                content_type='application/json', status=400,
            )

    @http.route('/api/public/vacancies', type='http', auth='none', methods=['GET'], csrf=False)
    def public_vacancies(self):
        try:
            search = request.params.get('search', '').strip()
            job_type = request.params.get('type', '')
            country = request.params.get('country', '')
            limit = min(int(request.params.get('limit', 50)), 200)
            offset = int(request.params.get('offset', 0))

            result = []

            # Fetch from heyla.job (Open positions)
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
                result.append({
                    'id': 'job_' + str(j.id),
                    'source': 'company',
                    'title': j.title or '',
                    'company': j.company_name or '',
                    'location': j.location or '',
                    'type': j.job_type or 'Full-time',
                    'salary': j.salary or '',
                    'description': j.description or '',
                    'skills': j.requirements.split('\n') if j.requirements else [],
                    'postedDate': j.posted_date.isoformat() if j.posted_date else '',
                })

            # Fetch from heyla.network.job (network posts)
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
                })

            # Sort by newest first
            result.sort(key=lambda x: x.get('postedDate', ''), reverse=True)

            return http.Response(
                json.dumps(result),
                content_type='application/json', status=200,
            )
        except Exception as e:
            return http.Response(
                json.dumps({'error': 'Request failed'}),
                content_type='application/json', status=400,
            )
