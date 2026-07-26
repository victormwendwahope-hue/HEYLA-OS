from odoo import http
from odoo.http import request
import json


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
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )
