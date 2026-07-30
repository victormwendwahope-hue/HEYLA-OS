from odoo import http
from odoo.http import request
import json
from datetime import datetime


def _auth(f):
    def wrapper(*args, **kwargs):
        auth = request.httprequest.headers.get('Authorization', '')
        token = auth.replace('Bearer ', '') if auth.startswith('Bearer ') else ''
        if not token:
            return http.Response(json.dumps({'error': 'Auth required'}), content_type='application/json', status=401)
        from odoo.addons.heyla_os_addon.models.res_user import _hash_token
        h = _hash_token(token)
        u = request.env['heyla.user'].sudo().search([('token', '=', h)], limit=1)
        if not u:
            u = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
        if not u:
            return http.Response(json.dumps({'error': 'Invalid token'}), content_type='application/json', status=401)
        request.heyla_user = u
        return f(*args, **kwargs)
    return wrapper


def _get_or_create_profile(user):
    profile = request.env['ntv.user.profile'].sudo().search([('user_id', '=', user.id)], limit=1)
    if not profile:
        profile = request.env['ntv.user.profile'].sudo().create({
            'user_id': user.id,
            'display_name': user.name,
            'headline': getattr(user, 'headline', ''),
            'photo': getattr(user, 'avatar', ''),
            'phone': getattr(user, 'phone', ''),
        })
    return profile


def _profile_json(p):
    return {
        'id': p.id, 'userId': p.user_id.id, 'name': p.display_name, 'headline': p.headline,
        'about': p.about, 'photo': p.photo, 'coverImage': p.cover_image,
        'location': p.location, 'phone': p.phone, 'website': p.website,
        'githubUrl': p.github_url, 'linkedinUrl': p.linkedin_url, 'portfolioUrl': p.portfolio_url,
        'institution': p.institution, 'course': p.course, 'graduationYear': p.graduation_year,
        'cvUrl': p.cv_url, 'availability': p.availability,
        'connections': p.connection_count, 'followers': p.follower_count,
        'following': p.following_count, 'posts': p.post_count, 'profileViews': p.profile_views,
        'verified': p.is_verified, 'verifiedType': p.verified_type,
        'skills': [{'id': s.id, 'name': s.name, 'endorsements': s.endorsements} for s in p.skill_ids],
        'experience': [{
            'id': e.id, 'title': e.title, 'company': e.company, 'location': e.location,
            'startDate': e.start_date, 'endDate': e.end_date, 'current': e.current, 'description': e.description,
        } for e in p.experience_ids],
        'education': [{
            'id': e.id, 'school': e.school, 'degree': e.degree, 'field': e.field,
            'startDate': e.start_date, 'endDate': e.end_date, 'grade': e.grade, 'description': e.description,
        } for e in p.education_ids],
        'certifications': [{
            'id': c.id, 'name': c.name, 'issuer': c.issuer, 'issueDate': c.issue_date,
            'expiryDate': c.expiry_date, 'credentialUrl': c.credential_url,
        } for c in p.certification_ids],
    }


def _post_json(post, user=None):
    liked = bool(user and request.env['ntv.post.like'].sudo().search([('post_id', '=', post.id), ('user_id', '=', user.id)], limit=1))
    saved = bool(user and request.env['ntv.post.save'].sudo().search([('post_id', '=', post.id), ('user_id', '=', user.id)], limit=1))
    return {
        'id': post.id, 'content': post.content, 'postType': post.post_type,
        'mediaUrl': post.media_url, 'mediaType': post.media_type,
        'linkUrl': post.link_url, 'linkTitle': post.link_title,
        'likes': post.likes_count, 'comments': post.comments_count,
        'shares': post.shares_count, 'saves': post.saves_count,
        'liked': liked, 'saved': saved,
        'createdAt': post.created_at.isoformat() if post.created_at else None,
        'author': {
            'id': post.author_profile_id.id if post.author_profile_id else None,
            'userId': post.author_user_id.id if post.author_user_id else None,
            'name': post.author_name, 'headline': post.author_headline,
            'photo': post.author_photo,
        },
        'company': {
            'id': post.company_id.id if post.company_id else None,
            'name': post.company_name, 'logo': post.company_logo,
        } if post.company_id else None,
        'comments': [{
            'id': c.id, 'userId': c.user_id.id, 'userName': c.user_id.name,
            'userPhoto': c.user_id.avatar, 'content': c.content,
            'createdAt': c.created_at.isoformat() if c.created_at else None,
        } for c in post.comment_ids[:10]],
    }


def _job_json(j):
    return {
        'id': j.id, 'title': j.title, 'employmentType': j.employment_type,
        'location': j.location, 'isRemote': j.is_remote, 'county': j.county,
        'industry': j.industry, 'salaryRange': j.salary_range, 'isPaid': j.is_paid,
        'duration': j.duration, 'experienceLevel': j.experience_level,
        'requiredSkills': j.required_skills, 'description': j.description,
        'responsibilities': j.responsibilities, 'requirements': j.requirements,
        'deadline': j.deadline.isoformat() if j.deadline else None,
        'postedDate': j.posted_date.isoformat() if j.posted_date else None,
        'isActive': j.is_active, 'applicantCount': j.applicant_count,
        'company': {'id': j.company_id.id, 'name': j.company_name, 'logo': j.company_logo},
    }


def _company_json(c):
    return {
        'id': c.id, 'name': c.name, 'logo': c.logo, 'coverImage': c.cover_image,
        'industry': c.industry, 'description': c.description, 'website': c.website,
        'location': c.location, 'email': c.email, 'phone': c.phone,
        'employeeCount': c.employee_count, 'followers': c.followers_count,
        'verified': c.is_verified, 'jobs': c.job_count,
    }


class NtvController(http.Controller):

    # ==================== PROFILES ====================

    @http.route('/api/ntv/profile', type='http', auth='none', methods=['GET', 'PUT'], csrf=False)
    @_auth
    def profile(self):
        user = request.heyla_user
        profile = _get_or_create_profile(user)
        if request.httprequest.method == 'GET':
            return http.Response(json.dumps(_profile_json(profile)), content_type='application/json')
        data = json.loads(request.httprequest.data)
        upd = {}
        for f in ['headline', 'about', 'photo', 'cover_image', 'location', 'phone', 'website',
                  'github_url', 'linkedin_url', 'portfolio_url', 'institution', 'course',
                  'graduation_year', 'cv_url', 'availability']:
            if f in data:
                upd[f] = data[f]
        if upd:
            upd['updated_at'] = datetime.now()
            profile.write(upd)

        if 'skills' in data:
            profile.skill_ids.unlink()
            for s in data['skills']:
                request.env['ntv.profile.skill'].sudo().create({'profile_id': profile.id, 'name': s.get('name', s) if isinstance(s, dict) else s})
        if 'experience' in data:
            profile.experience_ids.unlink()
            for e in data['experience']:
                vals = {'profile_id': profile.id, 'title': e.get('title', '')}
                for f in ['company', 'location', 'start_date', 'end_date', 'description']:
                    if f in e: vals[f] = e[f]
                if 'current' in e: vals['current'] = e['current']
                request.env['ntv.profile.experience'].sudo().create(vals)
        if 'education' in data:
            profile.education_ids.unlink()
            for e in data['education']:
                vals = {'profile_id': profile.id, 'school': e.get('school', '')}
                for f in ['degree', 'field', 'start_date', 'end_date', 'grade', 'description']:
                    if f in e: vals[f] = e[f]
                request.env['ntv.profile.education'].sudo().create(vals)
        if 'certifications' in data:
            profile.certification_ids.unlink()
            for c in data.get('certifications', []):
                vals = {'profile_id': profile.id, 'name': c.get('name', '')}
                for f in ['issuer', 'issue_date', 'expiry_date', 'credential_url']:
                    if f in c: vals[f] = c[f]
                request.env['ntv.profile.certification'].sudo().create(vals)

        return http.Response(json.dumps(_profile_json(profile)), content_type='application/json')

    @http.route('/api/ntv/profiles/<int:user_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def profile_by_user(self, user_id):
        profile = request.env['ntv.user.profile'].sudo().search([('user_id', '=', user_id)], limit=1)
        if not profile:
            return http.Response(json.dumps({'error': 'Profile not found'}), content_type='application/json', status=404)
        p = _profile_json(profile)
        conn = request.env['ntv.connection'].sudo().search([
            '|', ('requester_id', '=', user_id), ('target_id', '=', user_id)
        ], limit=1)
        p['connectionStatus'] = conn.status if conn else None
        return http.Response(json.dumps(p), content_type='application/json')

    @http.route('/api/ntv/profiles/search', type='http', auth='none', methods=['GET'], csrf=False)
    def profile_search(self):
        q = request.httprequest.args.get('q', '')
        domain = []
        if q:
            domain = ['|', '|', ('display_name', 'ilike', q), ('headline', 'ilike', q), ('location', 'ilike', q)]
        profiles = request.env['ntv.user.profile'].sudo().search(domain, limit=20)
        return http.Response(json.dumps([_profile_json(p) for p in profiles]), content_type='application/json')

    # ==================== FEED / POSTS ====================

    @http.route('/api/ntv/feed', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth
    def feed(self):
        user = request.heyla_user
        following = request.env['ntv.follow'].sudo().search([('follower_id', '=', user.id)]).mapped('following_id')
        following_ids = [user.id] + [f.id for f in following]
        domain = [('author_user_id', 'in', following_ids)]
        posts = request.env['ntv.post'].sudo().search(domain, limit=30)
        return http.Response(json.dumps([_post_json(p, user) for p in posts]), content_type='application/json')

    @http.route('/api/ntv/posts', type='http', auth='none', methods=['GET', 'POST'], csrf=False)
    @_auth
    def posts(self):
        user = request.heyla_user
        if request.httprequest.method == 'POST':
            data = json.loads(request.httprequest.data)
            profile = _get_or_create_profile(user)
            vals = {
                'author_profile_id': profile.id,
                'author_user_id': user.id,
                'content': data.get('content', ''),
                'post_type': data.get('postType', 'status'),
                'media_url': data.get('mediaUrl'),
                'media_type': data.get('mediaType'),
                'link_url': data.get('linkUrl'),
                'link_title': data.get('linkTitle'),
            }
            post = request.env['ntv.post'].sudo().create(vals)
            profile.post_count = len(request.env['ntv.post'].sudo().search([('author_user_id', '=', user.id)]))
            return http.Response(json.dumps(_post_json(post, user)), content_type='application/json', status=201)

        posts = request.env['ntv.post'].sudo().search([], limit=30)
        return http.Response(json.dumps([_post_json(p, user) for p in posts]), content_type='application/json')

    @http.route('/api/ntv/posts/<int:post_id>/like', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def toggle_like(self, post_id):
        user = request.heyla_user
        like = request.env['ntv.post.like'].sudo().search([('post_id', '=', post_id), ('user_id', '=', user.id)], limit=1)
        if like:
            like.unlink()
            liked = False
        else:
            request.env['ntv.post.like'].sudo().create({'post_id': post_id, 'user_id': user.id})
            liked = True
        post = request.env['ntv.post'].sudo().browse(post_id)
        return http.Response(json.dumps({'liked': liked, 'likes': post.likes_count}), content_type='application/json')

    @http.route('/api/ntv/posts/<int:post_id>/comment', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def add_comment(self, post_id):
        user = request.heyla_user
        data = json.loads(request.httprequest.data)
        request.env['ntv.post.comment'].sudo().create({
            'post_id': post_id, 'user_id': user.id,
            'content': data.get('content', ''),
            'parent_id': data.get('parentId'),
        })
        post = request.env['ntv.post'].sudo().browse(post_id)
        return http.Response(json.dumps({'comments': post.comments_count}), content_type='application/json')

    @http.route('/api/ntv/posts/<int:post_id>/save', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def toggle_save(self, post_id):
        user = request.heyla_user
        save = request.env['ntv.post.save'].sudo().search([('post_id', '=', post_id), ('user_id', '=', user.id)], limit=1)
        if save:
            save.unlink()
            saved = False
        else:
            request.env['ntv.post.save'].sudo().create({'post_id': post_id, 'user_id': user.id})
            saved = True
        return http.Response(json.dumps({'saved': saved}), content_type='application/json')

    @http.route('/api/ntv/posts/<int:post_id>/share', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def share_post(self, post_id):
        user = request.heyla_user
        data = json.loads(request.httprequest.data)
        share = request.env['ntv.post.share'].sudo().create({
            'post_id': post_id, 'user_id': user.id, 'content': data.get('content', ''),
        })
        post = request.env['ntv.post'].sudo().browse(post_id)
        post.shares_count = len(request.env['ntv.post.share'].sudo().search([('post_id', '=', post_id)]))
        return http.Response(json.dumps({'ok': True, 'shares': post.shares_count}), content_type='application/json')

    @http.route('/api/ntv/posts/<int:post_id>/delete', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def delete_post(self, post_id):
        post = request.env['ntv.post'].sudo().browse(post_id)
        if post.author_user_id.id != request.heyla_user.id:
            return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=403)
        post.unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    # ==================== PROJECTS ====================

    @http.route('/api/ntv/projects', type='http', auth='none', methods=['GET', 'POST'], csrf=False)
    @_auth
    def projects(self):
        user = request.heyla_user
        if request.httprequest.method == 'POST':
            data = json.loads(request.httprequest.data)
            profile = _get_or_create_profile(user)
            project = request.env['ntv.project'].sudo().create({
                'author_profile_id': profile.id,
                'title': data.get('title', ''),
                'description': data.get('description'),
                'thumbnail': data.get('thumbnail'),
                'technologies': data.get('technologies'),
                'github_url': data.get('githubUrl'),
                'live_url': data.get('liveUrl'),
            })
            return http.Response(json.dumps({
                'id': project.id, 'title': project.title, 'description': project.description,
                'thumbnail': project.thumbnail, 'technologies': project.technologies,
                'githubUrl': project.github_url, 'liveUrl': project.live_url,
            }), content_type='application/json', status=201)

        projects = request.env['ntv.project'].sudo().search([], limit=30)
        return http.Response(json.dumps([{
            'id': p.id, 'title': p.title, 'description': p.description, 'thumbnail': p.thumbnail,
            'technologies': p.technologies, 'githubUrl': p.github_url, 'liveUrl': p.live_url,
            'authorName': p.author_name, 'likes': p.likes_count, 'comments': p.comments_count,
        } for p in projects]), content_type='application/json')

    # ==================== COMPANIES ====================

    @http.route('/api/ntv/companies', type='http', auth='none', methods=['GET', 'POST'], csrf=False)
    @_auth
    def companies(self, company_id=None):
        user = request.heyla_user
        if request.httprequest.method == 'POST':
            data = json.loads(request.httprequest.data)
            existing = request.env['ntv.company'].sudo().search([('user_id', '=', user.id)], limit=1)
            if existing:
                return http.Response(json.dumps({'error': 'Company profile already exists'}), content_type='application/json', status=400)
            company = request.env['ntv.company'].sudo().create({
                'user_id': user.id, 'name': data.get('name', ''),
                'logo': data.get('logo'), 'industry': data.get('industry'),
                'description': data.get('description'), 'website': data.get('website'),
                'location': data.get('location'), 'email': data.get('email'),
                'phone': data.get('phone'), 'employee_count': data.get('employeeCount'),
            })
            return http.Response(json.dumps(_company_json(company)), content_type='application/json', status=201)
        companies = request.env['ntv.company'].sudo().search([])
        return http.Response(json.dumps([_company_json(c) for c in companies]), content_type='application/json')

    @http.route('/api/ntv/companies/<int:company_id>', type='http', auth='none', methods=['GET', 'PUT'], csrf=False)
    @_auth
    def company_detail(self, company_id):
        c = request.env['ntv.company'].sudo().browse(company_id)
        if not c.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        if request.httprequest.method == 'PUT':
            if c.user_id.id != request.heyla_user.id:
                return http.Response(json.dumps({'error': 'Unauthorized'}), content_type='application/json', status=403)
            data = json.loads(request.httprequest.data)
            for f in ['name', 'logo', 'industry', 'description', 'website', 'location', 'email', 'phone', 'employee_count']:
                if f in data:
                    c[f] = data[f]
        return http.Response(json.dumps(_company_json(c)), content_type='application/json')

    # ==================== JOBS ====================

    @http.route('/api/ntv/jobs', type='http', auth='none', methods=['GET', 'POST'], csrf=False)
    @_auth
    def jobs(self):
        user = request.heyla_user
        if request.httprequest.method == 'POST':
            data = json.loads(request.httprequest.data)
            company = request.env['ntv.company'].sudo().search([('user_id', '=', user.id)], limit=1)
            if not company:
                return http.Response(json.dumps({'error': 'Create a company profile first'}), content_type='application/json', status=400)
            job = request.env['ntv.job'].sudo().create({
                'company_id': company.id, 'posted_by_id': user.id,
                'title': data.get('title', ''), 'employment_type': data.get('employmentType', 'full_time'),
                'location': data.get('location'), 'is_remote': data.get('isRemote', False),
                'county': data.get('county'), 'industry': data.get('industry'),
                'salary_range': data.get('salaryRange'), 'is_paid': data.get('isPaid', True),
                'duration': data.get('duration'), 'experience_level': data.get('experienceLevel', 'entry'),
                'required_skills': data.get('requiredSkills'), 'description': data.get('description'),
                'responsibilities': data.get('responsibilities'), 'requirements': data.get('requirements'),
                'deadline': data.get('deadline'), 'application_method': data.get('applicationMethod'),
            })
            return http.Response(json.dumps(_job_json(job)), content_type='application/json', status=201)

        domain = [('is_active', '=', True)]
        args = request.httprequest.args
        if args.get('type'):
            domain.append(('employment_type', '=', args['type']))
        if args.get('county'):
            domain.append(('county', '=', args['county']))
        if args.get('industry'):
            domain.append(('industry', '=', args['industry']))
        if args.get('remote') == 'true':
            domain.append(('is_remote', '=', True))
        if args.get('q'):
            domain.append(('title', 'ilike', args['q']))
        jobs = request.env['ntv.job'].sudo().search(domain, limit=50, order='posted_date desc')
        return http.Response(json.dumps([_job_json(j) for j in jobs]), content_type='application/json')

    @http.route('/api/ntv/jobs/<int:job_id>/apply', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def apply_job(self, job_id):
        user = request.heyla_user
        data = json.loads(request.httprequest.data)
        existing = request.env['ntv.job.applicant'].sudo().search([('job_id', '=', job_id), ('user_id', '=', user.id)], limit=1)
        if existing:
            return http.Response(json.dumps({'error': 'Already applied'}), content_type='application/json', status=400)
        profile = _get_or_create_profile(user)
        request.env['ntv.job.applicant'].sudo().create({
            'job_id': job_id, 'user_id': user.id, 'profile_id': profile.id,
            'phone': data.get('phone'), 'cv_url': data.get('cvUrl'), 'cover_note': data.get('coverNote'),
        })
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=201)

    @http.route('/api/ntv/jobs/saved', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth
    def saved_jobs(self):
        user = request.heyla_user
        saves = request.env['ntv.post.save'].sudo().search([('user_id', '=', user.id)])
        post_ids = saves.mapped('post_id')
        jobs = request.env['ntv.job'].sudo().search([('id', 'in', post_ids.ids)])
        return http.Response(json.dumps([_job_json(j) for j in jobs]), content_type='application/json')

    # ==================== CONNECTIONS & FOLLOW ====================

    @http.route('/api/ntv/connections', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth
    def connections(self):
        user = request.heyla_user
        accepted = request.env['ntv.connection'].sudo().search([
            '|', ('requester_id', '=', user.id), ('target_id', '=', user.id),
            ('status', '=', 'accepted'),
        ])
        result = []
        for c in accepted:
            other = c.target_id if c.requester_id.id == user.id else c.requester_id
            profile = request.env['ntv.user.profile'].sudo().search([('user_id', '=', other.id)], limit=1)
            result.append({
                'id': c.id, 'userId': other.id, 'name': other.name, 'photo': profile.photo if profile else None,
                'headline': profile.headline if profile else None,
                'connectedAt': c.updated_at.isoformat() if c.updated_at else None,
            })
        return http.Response(json.dumps(result), content_type='application/json')

    @http.route('/api/ntv/connections/requests', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth
    def connection_requests(self):
        user = request.heyla_user
        pending = request.env['ntv.connection'].sudo().search([('target_id', '=', user.id), ('status', '=', 'pending')])
        result = []
        for c in pending:
            profile = request.env['ntv.user.profile'].sudo().search([('user_id', '=', c.requester_id.id)], limit=1)
            result.append({
                'id': c.id, 'userId': c.requester_id.id, 'name': c.requester_id.name,
                'photo': profile.photo if profile else None,
                'headline': profile.headline if profile else None,
            })
        return http.Response(json.dumps(result), content_type='application/json')

    @http.route('/api/ntv/connections/connect', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def send_connect(self):
        data = json.loads(request.httprequest.data)
        user = request.heyla_user
        target_id = data.get('userId')
        if not target_id or target_id == user.id:
            return http.Response(json.dumps({'error': 'Invalid user'}), content_type='application/json', status=400)
        existing = request.env['ntv.connection'].sudo().search([
            '|', ('requester_id', '=', user.id), ('target_id', '=', user.id),
        ])
        if existing:
            return http.Response(json.dumps({'error': 'Connection already exists'}), content_type='application/json', status=400)
        request.env['ntv.connection'].sudo().create({'requester_id': user.id, 'target_id': target_id})
        request.env['ntv.notification'].sudo().create({
            'user_id': target_id, 'actor_id': user.id,
            'notification_type': 'connection_request',
            'title': f'{user.name} sent you a connection request',
            'link': f'/network/{user.id}',
        })
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/ntv/connections/accept', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def accept_connect(self):
        data = json.loads(request.httprequest.data)
        conn = request.env['ntv.connection'].sudo().browse(data.get('id'))
        if not conn or conn.target_id.id != request.heyla_user.id:
            return http.Response(json.dumps({'error': 'Invalid'}), content_type='application/json', status=400)
        conn.status = 'accepted'
        conn.updated_at = datetime.now()
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/ntv/connections/remove', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def remove_connect(self):
        data = json.loads(request.httprequest.data)
        conn = request.env['ntv.connection'].sudo().browse(data.get('id'))
        if conn:
            conn.unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/ntv/follow', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def toggle_follow(self):
        data = json.loads(request.httprequest.data)
        user = request.heyla_user
        target_id = data.get('userId')
        if not target_id or target_id == user.id:
            return http.Response(json.dumps({'error': 'Invalid'}), content_type='application/json', status=400)
        f = request.env['ntv.follow'].sudo().search([('follower_id', '=', user.id), ('following_id', '=', target_id)], limit=1)
        if f:
            f.unlink()
            following = False
        else:
            request.env['ntv.follow'].sudo().create({'follower_id': user.id, 'following_id': target_id})
            following = True
        return http.Response(json.dumps({'following': following}), content_type='application/json')

    @http.route('/api/ntv/suggestions', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth
    def suggestions(self):
        user = request.heyla_user
        following_ids = request.env['ntv.follow'].sudo().search([('follower_id', '=', user.id)]).mapped('following_id.id')
        connected_ids = request.env['ntv.connection'].sudo().search([
            '|', ('requester_id', '=', user.id), ('target_id', '=', user.id),
            ('status', '=', 'accepted'),
        ])
        exclude = set(following_ids + [user.id] + [c.requester_id.id for c in connected_ids] + [c.target_id.id for c in connected_ids])
        profiles = request.env['ntv.user.profile'].sudo().search([], limit=15)
        suggestions = [p for p in profiles if p.user_id.id not in exclude][:5]
        return http.Response(json.dumps([{
            'userId': p.user_id.id, 'name': p.display_name, 'headline': p.headline,
            'photo': p.photo, 'connections': p.connection_count,
        } for p in suggestions]), content_type='application/json')

    # ==================== MESSAGES ====================

    @http.route('/api/ntv/conversations', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth
    def conversations(self):
        user = request.heyla_user
        convs = request.env['ntv.conversation'].sudo().search([
            '|', ('user_a_id', '=', user.id), ('user_b_id', '=', user.id)
        ], order='last_message_at desc')
        result = []
        for c in convs:
            other = c.user_b_id if c.user_a_id.id == user.id else c.user_a_id
            unread = c.user_a_unread if c.user_a_id.id == user.id else c.user_b_unread
            profile = request.env['ntv.user.profile'].sudo().search([('user_id', '=', other.id)], limit=1)
            result.append({
                'id': c.id, 'userId': other.id, 'name': other.name,
                'photo': profile.photo if profile else None,
                'lastMessage': c.last_message, 'lastMessageAt': c.last_message_at.isoformat() if c.last_message_at else None,
                'unread': unread,
            })
        return http.Response(json.dumps(result), content_type='application/json')

    @http.route('/api/ntv/messages/<int:user_id>', type='http', auth='none', methods=['GET', 'POST'], csrf=False)
    @_auth
    def messages(self, user_id):
        user = request.heyla_user
        if request.httprequest.method == 'POST':
            data = json.loads(request.httprequest.data)
            msg = request.env['ntv.message'].sudo().create({
                'sender_id': user.id, 'receiver_id': user_id, 'content': data.get('content', ''),
            })
            conv = request.env['ntv.conversation'].sudo().search([
                '|', ('user_a_id', '=', user.id), ('user_b_id', '=', user.id),
            ])
            if not conv:
                conv = request.env['ntv.conversation'].sudo().create({
                    'user_a_id': min(user.id, user_id),
                    'user_b_id': max(user.id, user_id),
                })
            conv.last_message = data.get('content')
            conv.last_message_at = datetime.now()
            return http.Response(json.dumps({'ok': True}), content_type='application/json', status=201)

        messages = request.env['ntv.message'].sudo().search([
            '|',
            ('sender_id', '=', user.id), ('receiver_id', '=', user.id),
        ], order='timestamp asc')
        return http.Response(json.dumps([{
            'id': m.id, 'senderId': m.sender_id.id, 'receiverId': m.receiver_id.id,
            'content': m.content, 'isRead': m.is_read,
            'timestamp': m.timestamp.isoformat() if m.timestamp else None,
        } for m in messages]), content_type='application/json')

    # ==================== NOTIFICATIONS ====================

    @http.route('/api/ntv/notifications', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth
    def notifications(self):
        user = request.heyla_user
        notifs = request.env['ntv.notification'].sudo().search([('user_id', '=', user.id)], limit=30)
        return http.Response(json.dumps([{
            'id': n.id, 'type': n.notification_type, 'title': n.title,
            'message': n.message, 'link': n.link, 'isRead': n.is_read,
            'actorName': n.actor_id.name if n.actor_id else None,
            'actorPhoto': n.actor_id.avatar if n.actor_id else None,
            'timestamp': n.timestamp.isoformat() if n.timestamp else None,
        } for n in notifs]), content_type='application/json')

    @http.route('/api/ntv/notifications/<int:notif_id>/read', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth
    def read_notification(self, notif_id):
        notif = request.env['ntv.notification'].sudo().browse(notif_id)
        if notif:
            notif.is_read = True
            notif.read_at = datetime.now()
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/ntv/notifications/unread-count', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth
    def unread_count(self):
        user = request.heyla_user
        count = request.env['ntv.notification'].sudo().search_count([('user_id', '=', user.id), ('is_read', '=', False)])
        return http.Response(json.dumps({'count': count}), content_type='application/json')
