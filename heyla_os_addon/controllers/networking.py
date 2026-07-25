from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class NetworkingController(http.Controller):

    def _post_to_json(self, p):
        return {
            'id': str(p.id), 'author': p.author or '', 'role': p.role or '',
            'avatar': p.avatar or '', 'content': p.content or '',
            'image': p.image or '', 'time': p.time or '',
            'likes': p.likes, 'comments': p.comments, 'liked': p.liked or False,
        }

    def _job_to_json(self, j):
        return {
            'id': str(j.id), 'title': j.title or '', 'company': j.company or '',
            'location': j.location or '', 'type': j.job_type or 'Full-time',
            'salary': j.salary or '', 'posted': j.posted or '',
            'skills': j.skills.split('\n') if j.skills else [],
            'description': j.description or '',
            'applicants': [self._applicant_to_json(a) for a in j.applicant_ids],
        }

    def _applicant_to_json(self, a):
        return {
            'id': str(a.id), 'name': a.name or '', 'email': a.email or '',
            'avatar': a.avatar or '', 'status': a.status or 'Applied',
            'appliedDate': a.applied_date.isoformat() if a.applied_date else '',
            'notes': a.notes or '',
        }

    # ---- Posts ----
    @http.route('/api/network-posts', type='http', auth='none', methods=['GET'], csrf=False)
    def get_posts(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._post_to_json(p) for p in request.env['heyla.network.post'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/network-posts', type='http', auth='none', methods=['POST'], csrf=False)
    def create_post(self):
        return _auth_required(lambda: self._create_post())()

    def _create_post(self):
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
        p = request.env['heyla.network.post'].sudo().create({
            'author': data.get('author', ''),
            'role': data.get('role', ''),
            'avatar': data.get('avatar', ''),
            'content': data.get('content', ''),
            'image': data.get('image', ''),
            'time': data.get('time', ''),
            'likes': data.get('likes', 0),
            'comments': data.get('comments', 0),
            'liked': data.get('liked', False),
        })
        return http.Response(json.dumps(self._post_to_json(p)), content_type='application/json', status=201)

    @http.route('/api/network-posts/<int:post_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_post(self, post_id):
        return _auth_required(lambda: self._delete_post(post_id))()

    def _delete_post(self, post_id):
        rec = request.env['heyla.network.post'].sudo().browse(post_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ---- Network Jobs ----
    @http.route('/api/network-jobs', type='http', auth='none', methods=['GET'], csrf=False)
    def get_jobs(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._job_to_json(j) for j in request.env['heyla.network.job'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/network-jobs', type='http', auth='none', methods=['POST'], csrf=False)
    def create_job(self):
        return _auth_required(lambda: self._create_job())()

    def _create_job(self):
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
        j = request.env['heyla.network.job'].sudo().create({
            'title': data.get('title', ''),
            'company': data.get('company', ''),
            'location': data.get('location', ''),
            'job_type': data.get('type', 'Full-time'),
            'salary': data.get('salary', ''),
            'posted': data.get('posted', ''),
            'skills': '\n'.join(data.get('skills', [])) if isinstance(data.get('skills'), list) else data.get('skills', ''),
            'description': data.get('description', ''),
        })
        return http.Response(json.dumps(self._job_to_json(j)), content_type='application/json', status=201)

    @http.route('/api/network-jobs/<int:job_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_job(self, job_id):
        return _auth_required(lambda: self._delete_job(job_id))()

    def _delete_job(self, job_id):
        rec = request.env['heyla.network.job'].sudo().browse(job_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
