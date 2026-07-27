from odoo import http
from odoo.http import request
from .auth import _auth_required
import json
from datetime import datetime


def _get_user():
    auth_header = request.httprequest.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
    from odoo.addons.heyla_os_addon.models.res_user import _hash_token
    token_hash = _hash_token(token)
    return request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)


class NetworkingController(http.Controller):

    def _post_to_json(self, p, user=None):
        uid = user.id if user else 0
        liked = bool(request.env['heyla.network.like'].sudo().search_count([('post_id', '=', p.id), ('user_id', '=', uid)]))
        comment_list = request.env['heyla.network.comment'].sudo().search([('post_id', '=', p.id)], order='create_date asc')
        return {
            'id': str(p.id), 'author': p.author or '', 'role': p.role or '',
            'avatar': p.avatar or '', 'content': p.content or '',
            'image': p.image or '', 'time': p.time or '',
            'likes': request.env['heyla.network.like'].sudo().search_count([('post_id', '=', p.id)]),
            'comments': len(comment_list),
            'liked': liked,
            'authorId': str(p.author_id.id) if p.author_id else '',
            'commentList': [{'id': str(c.id), 'userId': str(c.user_id.id), 'userName': c.user_id.name or '', 'content': c.content, 'createdAt': c.created_at.isoformat() if c.created_at else ''} for c in comment_list],
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

    def _profile_to_json(self, p):
        return {
            'id': str(p.id),
            'userId': str(p.user_id.id),
            'name': p.user_id.name or '',
            'email': p.user_id.email or '',
            'headline': p.headline or '',
            'about': p.about or '',
            'location': p.location or '',
            'website': p.website or '',
            'phone': p.phone or '',
            'photo': p.photo or '',
            'connectionCount': p.connection_count,
            'skills': [{'id': str(s.id), 'name': s.name, 'endorsements': s.endorsements} for s in p.skill_ids],
            'experience': [{'id': str(e.id), 'title': e.title, 'company': e.company, 'location': e.location, 'startDate': e.start_date or '', 'endDate': e.end_date or '', 'current': e.current, 'description': e.description or ''} for e in p.experience_ids],
            'education': [{'id': str(e.id), 'school': e.school, 'degree': e.degree or '', 'field': e.field or '', 'startDate': e.start_date or '', 'endDate': e.end_date or '', 'description': e.description or ''} for e in p.education_ids],
        }

    # ---- Posts ----
    @http.route('/api/network-posts', type='http', auth='none', methods=['GET'], csrf=False)
    def get_posts(self):
        return _auth_required(lambda: self._get_posts())()

    def _get_posts(self):
        user = _get_user()
        posts = request.env['heyla.network.post'].sudo().search([], order='id desc')
        return http.Response(json.dumps([self._post_to_json(p, user) for p in posts]), content_type='application/json', status=200)

    @http.route('/api/network-posts', type='http', auth='none', methods=['POST'], csrf=False)
    def create_post(self):
        return _auth_required(lambda: self._create_post())()

    def _create_post(self):
        user = _get_user()
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)
        p = request.env['heyla.network.post'].sudo().create({
            'author': data.get('author', user.name or ''),
            'author_id': user.id,
            'role': data.get('role', ''),
            'avatar': data.get('avatar', ''),
            'content': data.get('content', ''),
            'image': data.get('image', ''),
            'time': data.get('time', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
        })
        return http.Response(json.dumps(self._post_to_json(p, user)), content_type='application/json', status=201)

    @http.route('/api/network-posts/<int:post_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_post(self, post_id):
        return _auth_required(lambda: self._delete_post(post_id))()

    def _delete_post(self, post_id):
        rec = request.env['heyla.network.post'].sudo().browse(post_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ---- Likes ----
    @http.route('/api/network-posts/<int:post_id>/like', type='http', auth='none', methods=['POST'], csrf=False)
    def toggle_like(self, post_id):
        return _auth_required(lambda: self._toggle_like(post_id))()

    def _toggle_like(self, post_id):
        user = _get_user()
        if not user:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=401)
        existing = request.env['heyla.network.like'].sudo().search([('post_id', '=', post_id), ('user_id', '=', user.id)], limit=1)
        if existing:
            existing.sudo().unlink()
            liked = False
        else:
            request.env['heyla.network.like'].sudo().create({'post_id': post_id, 'user_id': user.id})
            liked = True
        count = request.env['heyla.network.like'].sudo().search_count([('post_id', '=', post_id)])
        return http.Response(json.dumps({'liked': liked, 'likes': count}), content_type='application/json', status=200)

    # ---- Comments ----
    @http.route('/api/network-posts/<int:post_id>/comments', type='http', auth='none', methods=['POST'], csrf=False)
    def add_comment(self, post_id):
        return _auth_required(lambda: self._add_comment(post_id))()

    def _add_comment(self, post_id):
        user = _get_user()
        if not user:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=401)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)
        content = data.get('content', '').strip()
        if not content:
            return http.Response(json.dumps({'error': 'Content required'}), content_type='application/json', status=400)
        c = request.env['heyla.network.comment'].sudo().create({
            'post_id': post_id,
            'user_id': user.id,
            'content': content,
        })
        count = request.env['heyla.network.comment'].sudo().search_count([('post_id', '=', post_id)])
        return http.Response(json.dumps({
            'id': str(c.id), 'userId': str(user.id), 'userName': user.name or '',
            'content': c.content, 'createdAt': c.created_at.isoformat() if c.created_at else '',
            'comments': count,
        }), content_type='application/json', status=201)

    # ---- Jobs ----
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
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)
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

    # ---- Profile ----
    @http.route('/api/network/profile', type='http', auth='none', methods=['GET'], csrf=False)
    def get_my_profile(self):
        return _auth_required(lambda: self._get_my_profile())()

    def _get_my_profile(self):
        user = _get_user()
        if not user:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=401)
        profile = request.env['heyla.network.profile'].sudo().search([('user_id', '=', user.id)], limit=1)
        if not profile:
            return http.Response(json.dumps(None), content_type='application/json', status=200)
        return http.Response(json.dumps(self._profile_to_json(profile)), content_type='application/json', status=200)

    @http.route('/api/network/profile', type='http', auth='none', methods=['POST'], csrf=False)
    def save_profile(self):
        return _auth_required(lambda: self._save_profile())()

    def _save_profile(self):
        user = _get_user()
        if not user:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=401)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)
        profile = request.env['heyla.network.profile'].sudo().search([('user_id', '=', user.id)], limit=1)
        vals = {
            'headline': data.get('headline', ''),
            'about': data.get('about', ''),
            'location': data.get('location', ''),
            'website': data.get('website', ''),
            'phone': data.get('phone', ''),
            'photo': data.get('photo', ''),
            'updated_at': datetime.now(),
        }
        if profile:
            profile.sudo().write(vals)
        else:
            vals['user_id'] = user.id
            profile = request.env['heyla.network.profile'].sudo().create(vals)
        skills = data.get('skills', [])
        if skills:
            old = request.env['heyla.network.profile.skill'].sudo().search([('profile_id', '=', profile.id)])
            old.sudo().unlink()
            for s in skills:
                request.env['heyla.network.profile.skill'].sudo().create({'profile_id': profile.id, 'name': s.get('name', ''), 'endorsements': s.get('endorsements', 0)})
        experience = data.get('experience', [])
        if experience:
            old = request.env['heyla.network.profile.experience'].sudo().search([('profile_id', '=', profile.id)])
            old.sudo().unlink()
            for e in experience:
                request.env['heyla.network.profile.experience'].sudo().create({
                    'profile_id': profile.id, 'title': e.get('title', ''), 'company': e.get('company', ''),
                    'location': e.get('location', ''), 'start_date': e.get('startDate', ''),
                    'end_date': e.get('endDate', ''), 'current': e.get('current', False),
                    'description': e.get('description', ''),
                })
        education = data.get('education', [])
        if education:
            old = request.env['heyla.network.profile.education'].sudo().search([('profile_id', '=', profile.id)])
            old.sudo().unlink()
            for e in education:
                request.env['heyla.network.profile.education'].sudo().create({
                    'profile_id': profile.id, 'school': e.get('school', ''), 'degree': e.get('degree', ''),
                    'field': e.get('field', ''), 'start_date': e.get('startDate', ''),
                    'end_date': e.get('endDate', ''), 'description': e.get('description', ''),
                })
        return http.Response(json.dumps(self._profile_to_json(profile)), content_type='application/json', status=200)

    @http.route('/api/network/profiles/<int:user_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def get_user_profile(self, user_id):
        return _auth_required(lambda: self._get_user_profile(user_id))()

    def _get_user_profile(self, user_id):
        profile = request.env['heyla.network.profile'].sudo().search([('user_id', '=', user_id)], limit=1)
        if not profile:
            return http.Response(json.dumps({'error': 'Profile not found'}), content_type='application/json', status=404)
        return http.Response(json.dumps(self._profile_to_json(profile)), content_type='application/json', status=200)

    @http.route('/api/network/profiles/search', type='http', auth='none', methods=['GET'], csrf=False)
    def search_profiles(self):
        return _auth_required(lambda: self._search_profiles())()

    def _search_profiles(self):
        q = request.httprequest.args.get('q', '').strip()
        domain = []
        if q:
            domain = ['|', '|', ('user_id.name', 'ilike', q), ('headline', 'ilike', q), ('location', 'ilike', q)]
        profiles = request.env['heyla.network.profile'].sudo().search(domain, limit=50)
        return http.Response(json.dumps([self._profile_to_json(p) for p in profiles]), content_type='application/json', status=200)

    # ---- Connections ----
    @http.route('/api/network/connections', type='http', auth='none', methods=['GET'], csrf=False)
    def get_connections(self):
        return _auth_required(lambda: self._get_connections())()

    def _get_connections(self):
        user = _get_user()
        if not user:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=401)
        accepted = request.env['heyla.network.connection'].sudo().search([
            '|',
            ('follower_id', '=', user.id),
            ('following_id', '=', user.id),
            ('status', '=', 'accepted'),
        ])
        pending = request.env['heyla.network.connection'].sudo().search([
            ('following_id', '=', user.id),
            ('status', '=', 'pending'),
        ])
        return http.Response(json.dumps({
            'connections': [{
                'id': str(c.id),
                'userId': str(c.following_id.id if c.follower_id.id == user.id else c.follower_id.id),
                'name': c.following_id.name if c.follower_id.id == user.id else c.follower_id.name,
                'status': c.status,
                'createdAt': c.created_at.isoformat() if c.created_at else '',
            } for c in accepted],
            'pendingRequests': [{
                'id': str(c.id),
                'userId': str(c.follower_id.id),
                'name': c.follower_id.name or '',
                'createdAt': c.created_at.isoformat() if c.created_at else '',
            } for c in pending],
        }), content_type='application/json', status=200)

    @http.route('/api/network/connections/connect', type='http', auth='none', methods=['POST'], csrf=False)
    def send_connection_request(self):
        return _auth_required(lambda: self._send_connection_request())()

    def _send_connection_request(self):
        user = _get_user()
        if not user:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=401)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)
        target_id = data.get('userId')
        if not target_id:
            return http.Response(json.dumps({'error': 'userId required'}), content_type='application/json', status=400)
        target = request.env['heyla.user'].sudo().browse(int(target_id))
        if not target.exists():
            return http.Response(json.dumps({'error': 'User not found'}), content_type='application/json', status=404)
        if target.id == user.id:
            return http.Response(json.dumps({'error': 'Cannot connect to yourself'}), content_type='application/json', status=400)
        existing = request.env['heyla.network.connection'].sudo().search([
            ('follower_id', '=', user.id),
            ('following_id', '=', target.id),
        ], limit=1)
        if existing:
            return http.Response(json.dumps({'error': 'Connection already exists'}), content_type='application/json', status=400)
        request.env['heyla.network.connection'].sudo().create({
            'follower_id': user.id,
            'following_id': target.id,
            'status': 'pending',
        })
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=201)

    @http.route('/api/network/connections/accept', type='http', auth='none', methods=['POST'], csrf=False)
    def accept_connection(self):
        return _auth_required(lambda: self._accept_connection())()

    def _accept_connection(self):
        user = _get_user()
        if not user:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=401)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)
        conn_id = data.get('connectionId')
        conn = request.env['heyla.network.connection'].sudo().browse(int(conn_id))
        if not conn.exists() or conn.following_id.id != user.id:
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        conn.sudo().write({'status': 'accepted'})
        follower_profile = request.env['heyla.network.profile'].sudo().search([('user_id', '=', conn.follower_id.id)], limit=1)
        following_profile = request.env['heyla.network.profile'].sudo().search([('user_id', '=', conn.following_id.id)], limit=1)
        if follower_profile:
            follower_profile.sudo().write({'connection_count': request.env['heyla.network.connection'].sudo().search_count([('follower_id', '=', conn.follower_id.id), ('status', '=', 'accepted')]) + request.env['heyla.network.connection'].sudo().search_count([('following_id', '=', conn.follower_id.id), ('status', '=', 'accepted')])})
        if following_profile:
            following_profile.sudo().write({'connection_count': request.env['heyla.network.connection'].sudo().search_count([('follower_id', '=', conn.following_id.id), ('status', '=', 'accepted')]) + request.env['heyla.network.connection'].sudo().search_count([('following_id', '=', conn.following_id.id), ('status', '=', 'accepted')])})
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/network/connections/<int:conn_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def remove_connection(self, conn_id):
        return _auth_required(lambda: self._remove_connection(conn_id))()

    def _remove_connection(self, conn_id):
        user = _get_user()
        if not user:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=401)
        conn = request.env['heyla.network.connection'].sudo().browse(conn_id)
        if not conn.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        if conn.follower_id.id != user.id and conn.following_id.id != user.id:
            return http.Response(json.dumps({'error': 'Forbidden'}), content_type='application/json', status=403)
        conn.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ---- Applicants ----
    @http.route('/api/network-jobs/<int:job_id>/applicants/<int:applicant_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_applicant(self, job_id, applicant_id):
        return _auth_required(lambda: self._update_applicant(job_id, applicant_id))()

    def _update_applicant(self, job_id, applicant_id):
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)
        rec = request.env['heyla.network.applicant'].sudo().browse(applicant_id)
        if not rec.exists() or rec.job_id.id != job_id:
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        if 'status' in data:
            rec.sudo().write({'status': data['status']})
        if 'notes' in data:
            rec.sudo().write({'notes': data['notes']})
        return http.Response(json.dumps(self._applicant_to_json(rec)), content_type='application/json', status=200)

    @http.route('/api/network-jobs/<int:job_id>/applicants', type='http', auth='none', methods=['POST'], csrf=False)
    def apply_job(self, job_id):
        return _auth_required(lambda: self._apply_job(job_id))()

    def _apply_job(self, job_id):
        user = _get_user()
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid data'}), content_type='application/json', status=400)
        job = request.env['heyla.network.job'].sudo().browse(job_id)
        if not job.exists():
            return http.Response(json.dumps({'error': 'Job not found'}), content_type='application/json', status=404)
        a = request.env['heyla.network.applicant'].sudo().create({
            'job_id': job_id,
            'name': data.get('name', user.name if user else ''),
            'email': data.get('email', user.email if user else ''),
            'avatar': data.get('avatar', ''),
            'status': 'Applied',
            'applied_date': datetime.now(),
            'notes': data.get('notes', ''),
        })
        return http.Response(json.dumps(self._applicant_to_json(a)), content_type='application/json', status=201)

    # ---- Users list for search/connect ----
    @http.route('/api/network/users', type='http', auth='none', methods=['GET'], csrf=False)
    def list_users(self):
        return _auth_required(lambda: self._list_users())()

    def _list_users(self):
        user = _get_user()
        q = request.httprequest.args.get('q', '').strip()
        domain = [('id', '!=', user.id)] if user else []
        if q:
            domain.append(('name', 'ilike', q))
        users = request.env['heyla.user'].sudo().search(domain, limit=50)
        return http.Response(json.dumps([{
            'id': str(u.id), 'name': u.name or '', 'email': u.email or '',
            'company': u.company or '', 'role': u.role or '',
        } for u in users]), content_type='application/json', status=200)
