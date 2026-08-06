from odoo import http
from odoo.http import request
from .auth import _auth_required
from .networking import _get_user
from .networking_core import _json_error, _load_json
import json
import hashlib
from datetime import datetime

from odoo.addons.heyla_os_addon.models.career_data import (
    SALARY_BENCHMARKS, CAREER_PATHS, TRADE_SKILLS, TRADE_COURSES,
    DEFAULT_SKILLS, DEFAULT_COURSES,
)


def _normalize(text):
    return ' '.join(__import__('re').sub(r'[^a-z0-9\s]', ' ', (text or '').lower()).split())


class NetworkingGrowthController(http.Controller):

    # ==================== Helpers ====================

    def _get_or_create_profile(self, user):
        return request.env['heyla.network.profile'].sudo()._get_or_create(user)

    def _parse_date(self, value):
        if not value:
            return False
        try:
            return __import__('datetime').date.fromisoformat(str(value)[:10])
        except (ValueError, TypeError):
            return False

    def _project_to_json(self, p):
        try:
            media = json.loads(p.media or '[]')
        except (json.JSONDecodeError, TypeError):
            media = []
        return {
            'id': str(p.id),
            'title': p.title or '',
            'description': p.description or '',
            'category': p.category or '',
            'clientName': p.client_name or '',
            'location': p.location or '',
            'gpsLat': p.gps_lat or 0,
            'gpsLon': p.gps_lon or 0,
            'startDate': p.start_date.isoformat() if p.start_date else '',
            'endDate': p.end_date.isoformat() if p.end_date else '',
            'outcome': p.outcome or '',
            'media': media,
            'beforePhoto': p.before_photo or '',
            'afterPhoto': p.after_photo or '',
            'testimonial': p.testimonial or '',
            'rating': p.rating or 0,
            'verified': p.verified,
            'verifiedBy': p.verified_by.name if p.verified_by else '',
        }

    def _machine_to_json(self, m):
        return {
            'id': str(m.id),
            'machineType': m.machine_type or '',
            'manufacturer': m.manufacturer or '',
            'model': m.model or '',
            'yearsExperience': m.years_experience or 0,
            'operatingHours': m.operating_hours or 0,
            'fuelEfficiency': m.fuel_efficiency or '',
            'maintenanceKnowledge': m.maintenance_knowledge or False,
            'safetyRecord': m.safety_record or '',
            'incidents': m.incidents or 0,
            'training': m.training or '',
            'verified': m.verified,
        }

    def _community_to_json(self, c, user=None):
        uid = user.id if user else 0
        is_member = bool(user and user in c.member_ids)
        return {
            'id': str(c.id),
            'name': c.name or '',
            'description': c.description or '',
            'type': c.community_type or '',
            'category': c.category or '',
            'icon': c.icon or '',
            'coverImage': c.cover_image or '',
            'isPrivate': c.is_private or False,
            'memberCount': c.member_count or 0,
            'postCount': c.post_count or 0,
            'createdBy': c.created_by.name if c.created_by else '',
            'isMember': is_member,
            'isAdmin': bool(user and (c.created_by.id == uid or user in c.admin_ids)),
            'createdAt': c.created_at.isoformat() if c.created_at else '',
        }

    def _community_post_to_json(self, p, user=None):
        uid = user.id if user else 0
        liked = bool(request.env['heyla.network.community.post.like'].sudo().search_count(
            [('post_id', '=', p.id), ('user_id', '=', uid)]))
        return {
            'id': str(p.id),
            'communityId': str(p.community_id.id),
            'authorId': str(p.author_id.id) if p.author_id else '',
            'authorName': p.author_name or '',
            'authorAvatar': p.author_avatar or '',
            'content': p.content or '',
            'image': p.image or '',
            'video': p.video or '',
            'mediaType': p.media_type or '',
            'linkUrl': p.link_url or '',
            'likes': p.like_count or 0,
            'liked': liked,
            'createdAt': p.created_at.isoformat() if p.created_at else '',
        }

    def _help_to_json(self, h, user=None):
        return {
            'id': str(h.id),
            'communityId': str(h.community_id.id),
            'authorId': str(h.author_id.id) if h.author_id else '',
            'authorName': h.author_name or '',
            'authorAvatar': h.author_avatar or '',
            'title': h.title or '',
            'description': h.description or '',
            'category': h.category or 'general',
            'status': h.status or 'open',
            'image': h.image or '',
            'video': h.video or '',
            'mediaType': h.media_type or '',
            'offerCount': h.offer_count or 0,
            'createdAt': h.created_at.isoformat() if h.created_at else '',
            'resolvedAt': h.resolved_at.isoformat() if h.resolved_at else '',
            'replies': [self._help_reply_to_json(r) for r in h.reply_ids],
        }

    def _help_reply_to_json(self, r):
        return {
            'id': str(r.id),
            'helpId': str(r.help_id.id),
            'authorId': str(r.author_id.id) if r.author_id else '',
            'authorName': r.author_name or '',
            'authorAvatar': r.author_avatar or '',
            'content': r.content or '',
            'image': r.image or '',
            'video': r.video or '',
            'mediaType': r.media_type or '',
            'createdAt': r.created_at.isoformat() if r.created_at else '',
        }

    def _event_to_json(self, e, user=None):
        uid = user.id if user else 0
        attendee = request.env['heyla.network.event.attendee'].sudo().search(
            [('event_id', '=', e.id), ('user_id', '=', uid)], limit=1) if user else None
        return {
            'id': str(e.id),
            'name': e.name or '',
            'description': e.description or '',
            'type': e.event_type or '',
            'organizerName': e.organizer_name or '',
            'communityId': str(e.community_id.id) if e.community_id else '',
            'location': e.location or '',
            'isVirtual': e.is_virtual or False,
            'onlineLink': e.online_link or '',
            'startTime': e.start_time.isoformat() if e.start_time else '',
            'endTime': e.end_time.isoformat() if e.end_time else '',
            'capacity': e.capacity or 0,
            'coverImage': e.cover_image or '',
            'certificateIssued': e.certificate_issued or False,
            'attendeeCount': e.attendee_count or 0,
            'myStatus': attendee.status if attendee else '',
            'myQrCode': attendee.qr_code if attendee else '',
        }

    def _mentorship_to_json(self, m, viewer_id):
        return {
            'id': str(m.id),
            'mentorId': str(m.mentor_id.id),
            'mentorName': m.mentor_id.name or '',
            'menteeId': str(m.mentee_id.id),
            'menteeName': m.mentee_id.name or '',
            'status': m.status,
            'focusArea': m.focus_area or '',
            'goal': m.goal or '',
            'progress': m.progress or 0,
            'progressNotes': m.progress_notes or '',
            'startedAt': m.started_at.isoformat() if m.started_at else '',
            'isMentor': m.mentor_id.id == viewer_id,
            'isMentee': m.mentee_id.id == viewer_id,
        }

    # ==================== Trade Portfolio ====================

    @http.route('/api/network/projects', type='http', auth='none', methods=['GET'], csrf=False)
    def get_my_projects(self):
        return _auth_required(lambda: self._get_my_projects())()

    def _get_my_projects(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        return http.Response(json.dumps([self._project_to_json(p) for p in profile.project_ids]),
                             content_type='application/json', status=200)

    @http.route('/api/network/projects/<int:user_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def get_user_projects(self, user_id):
        return _auth_required(lambda: self._get_user_projects(user_id))()

    def _get_user_projects(self, user_id):
        profile = request.env['heyla.network.profile'].sudo().search([('user_id', '=', user_id)], limit=1)
        if not profile:
            return _json_error('Profile not found', 404)
        return http.Response(json.dumps([self._project_to_json(p) for p in profile.project_ids]),
                             content_type='application/json', status=200)

    @http.route('/api/network/projects', type='http', auth='none', methods=['POST'], csrf=False)
    def create_project(self):
        return _auth_required(lambda: self._create_project())()

    def _create_project(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        title = (data.get('title') or '').strip()
        if not title:
            return _json_error('Title required')
        profile = self._get_or_create_profile(user)
        try:
            rating = int(data.get('rating') or 0)
        except (ValueError, TypeError):
            rating = 0
        project = request.env['heyla.network.project'].sudo().create({
            'profile_id': profile.id,
            'title': title,
            'description': data.get('description', ''),
            'category': data.get('category', ''),
            'client_name': data.get('clientName', ''),
            'location': data.get('location', ''),
            'gps_lat': data.get('gpsLat') or 0,
            'gps_lon': data.get('gpsLon') or 0,
            'start_date': self._parse_date(data.get('startDate')),
            'end_date': self._parse_date(data.get('endDate')),
            'outcome': data.get('outcome', ''),
            'media': json.dumps(data.get('media') or []),
            'before_photo': data.get('beforePhoto', ''),
            'after_photo': data.get('afterPhoto', ''),
            'testimonial': data.get('testimonial', ''),
            'rating': min(5, max(0, rating)),
        })
        return http.Response(json.dumps(self._project_to_json(project)), content_type='application/json', status=201)

    @http.route('/api/network/projects/<int:project_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_project(self, project_id):
        return _auth_required(lambda: self._delete_project(project_id))()

    def _delete_project(self, project_id):
        user = _get_user()
        project = request.env['heyla.network.project'].sudo().browse(project_id)
        if not project.exists():
            return _json_error('Not found', 404)
        if project.profile_id.user_id.id != user.id and user.role != 'admin':
            return _json_error('Forbidden', 403)
        project.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ==================== Machine Experience ====================

    @http.route('/api/network/machines', type='http', auth='none', methods=['GET'], csrf=False)
    def get_my_machines(self):
        return _auth_required(lambda: self._get_my_machines())()

    def _get_my_machines(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        return http.Response(json.dumps([self._machine_to_json(m) for m in profile.machine_ids]),
                             content_type='application/json', status=200)

    @http.route('/api/network/machines', type='http', auth='none', methods=['POST'], csrf=False)
    def create_machine(self):
        return _auth_required(lambda: self._create_machine())()

    def _create_machine(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        mtype = data.get('machineType', '')
        valid_types = [t[0] for t in request.env['heyla.network.machine'].sudo()._fields['machine_type'].selection]
        if mtype not in valid_types:
            return _json_error('Invalid machine type')
        try:
            years_exp = float(data.get('yearsExperience') or 0)
            op_hours = float(data.get('operatingHours') or 0)
            incidents = int(data.get('incidents') or 0)
        except (ValueError, TypeError):
            years_exp, op_hours, incidents = 0, 0, 0
        profile = self._get_or_create_profile(user)
        machine = request.env['heyla.network.machine'].sudo().create({
            'profile_id': profile.id,
            'machine_type': mtype,
            'manufacturer': data.get('manufacturer', ''),
            'model': data.get('model', ''),
            'years_experience': years_exp,
            'operating_hours': op_hours,
            'fuel_efficiency': data.get('fuelEfficiency', ''),
            'maintenance_knowledge': bool(data.get('maintenanceKnowledge')),
            'safety_record': data.get('safetyRecord', ''),
            'incidents': max(0, incidents),
            'training': data.get('training', ''),
        })
        return http.Response(json.dumps(self._machine_to_json(machine)), content_type='application/json', status=201)

    @http.route('/api/network/machines/<int:machine_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_machine(self, machine_id):
        return _auth_required(lambda: self._delete_machine(machine_id))()

    def _delete_machine(self, machine_id):
        user = _get_user()
        machine = request.env['heyla.network.machine'].sudo().browse(machine_id)
        if not machine.exists():
            return _json_error('Not found', 404)
        if machine.profile_id.user_id.id != user.id and user.role != 'admin':
            return _json_error('Forbidden', 403)
        machine.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ==================== Skill Endorsements ====================

    @http.route('/api/network/skills/<int:skill_id>/endorse', type='http', auth='none', methods=['POST'], csrf=False)
    def endorse_skill(self, skill_id):
        return _auth_required(lambda: self._endorse_skill(skill_id))()

    def _endorse_skill(self, skill_id):
        user = _get_user()
        skill = request.env['heyla.network.profile.skill'].sudo().browse(skill_id)
        if not skill.exists():
            return _json_error('Skill not found', 404)
        if skill.profile_id.user_id.id == user.id:
            return _json_error('You cannot endorse your own skill', 400)
        if user in skill.endorsed_by_ids:
            return _json_error('Already endorsed', 400)
        skill.sudo().write({
            'endorsed_by_ids': [(4, user.id)],
            'endorsements': (skill.endorsements or 0) + 1,
        })
        skill.profile_id.sudo().recompute_reputation()
        return http.Response(json.dumps({'ok': True, 'endorsements': skill.endorsements}),
                             content_type='application/json', status=200)

    # ==================== Communities ====================

    @http.route('/api/network/communities', type='http', auth='none', methods=['GET'], csrf=False)
    def list_communities(self):
        return _auth_required(lambda: self._list_communities())()

    def _list_communities(self):
        user = _get_user()
        communities = request.env['heyla.network.community'].sudo().search([])
        mine = request.env['heyla.network.community'].sudo().search([('member_ids', 'in', user.id)])
        return http.Response(json.dumps({
            'communities': [self._community_to_json(c, user) for c in communities],
            'mine': [self._community_to_json(c, user) for c in mine],
        }), content_type='application/json', status=200)

    @http.route('/api/network/communities', type='http', auth='none', methods=['POST'], csrf=False)
    def create_community(self):
        return _auth_required(lambda: self._create_community())()

    def _create_community(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        name = (data.get('name') or '').strip()
        if not name:
            return _json_error('Name required')
        ctype = data.get('type', 'trade')
        valid_types = [t[0] for t in request.env['heyla.network.community'].sudo()._fields['community_type'].selection]
        if ctype not in valid_types:
            return _json_error('Invalid community type')
        community = request.env['heyla.network.community'].sudo().create({
            'name': name,
            'description': data.get('description', ''),
            'community_type': ctype,
            'category': data.get('category', ''),
            'icon': data.get('icon', ''),
            'cover_image': data.get('coverImage', ''),
            'is_private': bool(data.get('isPrivate')),
            'created_by': user.id,
            'admin_ids': [(6, 0, [user.id])],
            'member_ids': [(6, 0, [user.id])],
        })
        return http.Response(json.dumps(self._community_to_json(community, user)), content_type='application/json', status=201)

    @http.route('/api/network/communities/<int:community_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def get_community(self, community_id):
        return _auth_required(lambda: self._get_community(community_id))()

    def _get_community(self, community_id):
        user = _get_user()
        community = request.env['heyla.network.community'].sudo().browse(community_id)
        if not community.exists():
            return _json_error('Not found', 404)
        posts = request.env['heyla.network.community.post'].sudo().search([('community_id', '=', community.id)], order='id desc', limit=50)
        helps = request.env['heyla.network.community.help'].sudo().search([('community_id', '=', community.id)], order='id desc', limit=50)
        members = [{'id': str(m.id), 'name': m.name or '', 'avatar': m.avatar or ''} for m in community.member_ids[:24]]
        return http.Response(json.dumps({
            **self._community_to_json(community, user),
            'posts': [self._community_post_to_json(p, user) for p in posts],
            'help': [self._help_to_json(h, user) for h in helps],
            'members': members,
        }), content_type='application/json', status=200)

    @http.route('/api/network/communities/<int:community_id>/join', type='http', auth='none', methods=['POST'], csrf=False)
    def join_community(self, community_id):
        return _auth_required(lambda: self._join_community(community_id))()

    def _join_community(self, community_id):
        user = _get_user()
        community = request.env['heyla.network.community'].sudo().browse(community_id)
        if not community.exists():
            return _json_error('Not found', 404)
        if user not in community.member_ids:
            community.sudo().write({'member_ids': [(4, user.id)]})
        return http.Response(json.dumps({'ok': True, 'memberCount': len(community.member_ids)}),
                             content_type='application/json', status=200)

    @http.route('/api/network/communities/<int:community_id>/leave', type='http', auth='none', methods=['POST'], csrf=False)
    def leave_community(self, community_id):
        return _auth_required(lambda: self._leave_community(community_id))()

    def _leave_community(self, community_id):
        user = _get_user()
        community = request.env['heyla.network.community'].sudo().browse(community_id)
        if not community.exists():
            return _json_error('Not found', 404)
        if community.created_by.id == user.id:
            return _json_error('Community creator cannot leave', 400)
        if user in community.member_ids:
            community.sudo().write({'member_ids': [(3, user.id)]})
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/network/communities/<int:community_id>/posts', type='http', auth='none', methods=['POST'], csrf=False)
    def create_community_post(self, community_id):
        return _auth_required(lambda: self._create_community_post(community_id))()

    def _create_community_post(self, community_id):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        community = request.env['heyla.network.community'].sudo().browse(community_id)
        if not community.exists():
            return _json_error('Not found', 404)
        if user not in community.member_ids and user.role != 'admin':
            return _json_error('Join the community to post', 403)
        content = (data.get('content') or '').strip()
        if not content:
            return _json_error('Content required')
        post = request.env['heyla.network.community.post'].sudo().create({
            'community_id': community.id,
            'author_id': user.id,
            'content': content,
            'image': data.get('image', ''),
            'video': data.get('video', ''),
            'media_type': data.get('mediaType', ''),
            'link_url': data.get('linkUrl', ''),
        })
        return http.Response(json.dumps(self._community_post_to_json(post, user)), content_type='application/json', status=201)

    @http.route('/api/network/communities/<int:community_id>/help', type='http', auth='none', methods=['POST'], csrf=False)
    def create_community_help(self, community_id):
        return _auth_required(lambda: self._create_community_help(community_id))()

    def _create_community_help(self, community_id):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        community = request.env['heyla.network.community'].sudo().browse(community_id)
        if not community.exists():
            return _json_error('Not found', 404)
        if user not in community.member_ids and user.role != 'admin':
            return _json_error('Join the community to ask for help', 403)
        title = (data.get('title') or '').strip()
        if not title:
            return _json_error('Title required')
        help_rec = request.env['heyla.network.community.help'].sudo().create({
            'community_id': community.id,
            'author_id': user.id,
            'title': title,
            'description': data.get('description', ''),
            'category': data.get('category', 'general'),
            'image': data.get('image', ''),
            'video': data.get('video', ''),
            'media_type': data.get('mediaType', ''),
            'status': 'open',
        })
        return http.Response(json.dumps(self._help_to_json(help_rec, user)), content_type='application/json', status=201)

    @http.route('/api/network/communities/<int:community_id>/help/<int:help_id>/offer', type='http', auth='none', methods=['POST'], csrf=False)
    def offer_community_help(self, community_id, help_id):
        return _auth_required(lambda: self._offer_community_help(community_id, help_id))()

    def _offer_community_help(self, community_id, help_id):
        user = _get_user()
        data = _load_json() or {}
        help_rec = request.env['heyla.network.community.help'].sudo().browse(help_id)
        if not help_rec.exists() or help_rec.community_id.id != community_id:
            return _json_error('Not found', 404)
        if help_rec.status == 'resolved':
            return _json_error('This request has been resolved', 400)
        content = (data.get('content') or '').strip()
        if not content:
            return _json_error('Offer message required')
        reply = request.env['heyla.network.community.help.reply'].sudo().create({
            'help_id': help_rec.id,
            'author_id': user.id,
            'content': content,
            'image': data.get('image', ''),
            'video': data.get('video', ''),
            'media_type': data.get('mediaType', ''),
        })
        return http.Response(json.dumps(self._help_reply_to_json(reply)), content_type='application/json', status=201)

    @http.route('/api/network/communities/<int:community_id>/help/<int:help_id>/resolve', type='http', auth='none', methods=['POST'], csrf=False)
    def resolve_community_help(self, community_id, help_id):
        return _auth_required(lambda: self._resolve_community_help(community_id, help_id))()

    def _resolve_community_help(self, community_id, help_id):
        user = _get_user()
        help_rec = request.env['heyla.network.community.help'].sudo().browse(help_id)
        if not help_rec.exists() or help_rec.community_id.id != community_id:
            return _json_error('Not found', 404)
        community = help_rec.community_id
        if help_rec.author_id.id != user.id and community.created_by.id != user.id and user.role != 'admin':
            return _json_error('Forbidden', 403)
        if help_rec.status == 'open':
            help_rec.sudo().write({'status': 'resolved', 'resolved_at': datetime.now()})
        return http.Response(json.dumps(self._help_to_json(help_rec, user)), content_type='application/json', status=200)

    @http.route('/api/network/communities/<int:community_id>/posts/<int:post_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_community_post(self, community_id, post_id):
        return _auth_required(lambda: self._delete_community_post(community_id, post_id))()

    def _delete_community_post(self, community_id, post_id):
        user = _get_user()
        post = request.env['heyla.network.community.post'].sudo().browse(post_id)
        if not post.exists() or post.community_id.id != community_id:
            return _json_error('Not found', 404)
        community = post.community_id
        if post.author_id.id != user.id and community.created_by.id != user.id and user.role != 'admin':
            return _json_error('Forbidden', 403)
        post.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/network/communities/<int:community_id>/posts/<int:post_id>/like', type='http', auth='none', methods=['POST'], csrf=False)
    def like_community_post(self, community_id, post_id):
        return _auth_required(lambda: self._like_community_post(community_id, post_id))()

    def _like_community_post(self, community_id, post_id):
        user = _get_user()
        post = request.env['heyla.network.community.post'].sudo().browse(post_id)
        if not post.exists() or post.community_id.id != community_id:
            return _json_error('Not found', 404)
        existing = request.env['heyla.network.community.post.like'].sudo().search(
            [('post_id', '=', post.id), ('user_id', '=', user.id)], limit=1)
        if existing:
            existing.sudo().unlink()
            liked = False
        else:
            request.env['heyla.network.community.post.like'].sudo().create({'post_id': post.id, 'user_id': user.id})
            liked = True
        count = request.env['heyla.network.community.post.like'].sudo().search_count([('post_id', '=', post.id)])
        return http.Response(json.dumps({'liked': liked, 'likes': count}),
                             content_type='application/json', status=200)

    # ==================== Events ====================

    @http.route('/api/network/events', type='http', auth='none', methods=['GET'], csrf=False)
    def list_events(self):
        return _auth_required(lambda: self._list_events())()

    def _list_events(self):
        user = _get_user()
        upcoming = request.env['heyla.network.event'].sudo().search([('start_time', '>=', datetime.now())], order='start_time asc', limit=50)
        mine = request.env['heyla.network.event.attendee'].sudo().search([('user_id', '=', user.id)])
        return http.Response(json.dumps({
            'upcoming': [self._event_to_json(e, user) for e in upcoming],
            'myEvents': [self._event_to_json(a.event_id, user) for a in mine],
        }), content_type='application/json', status=200)

    @http.route('/api/network/events', type='http', auth='none', methods=['POST'], csrf=False)
    def create_event(self):
        return _auth_required(lambda: self._create_event())()

    def _create_event(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        name = (data.get('name') or '').strip()
        if not name:
            return _json_error('Name required')
        start = data.get('startTime')
        if not start:
            return _json_error('Start time required')
        try:
            start_dt = datetime.fromisoformat(start.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return _json_error('Invalid start time')
        etype = data.get('type', 'networking')
        valid_types = [t[0] for t in request.env['heyla.network.event'].sudo()._fields['event_type'].selection]
        if etype not in valid_types:
            return _json_error('Invalid event type')
        end_dt = False
        if data.get('endTime'):
            try:
                end_dt = datetime.fromisoformat(str(data['endTime']).replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                end_dt = False
        community_id = False
        if data.get('communityId'):
            try:
                community_id = int(data['communityId'])
            except (ValueError, TypeError):
                community_id = False
        event = request.env['heyla.network.event'].sudo().create({
            'name': name,
            'description': data.get('description', ''),
            'event_type': etype,
            'organizer_id': user.id,
            'organizer_name': data.get('organizerName', user.name or ''),
            'community_id': community_id,
            'location': data.get('location', ''),
            'is_virtual': bool(data.get('isVirtual')),
            'online_link': data.get('onlineLink', ''),
            'start_time': start_dt,
            'end_time': end_dt or False,
            'capacity': max(0, int(data.get('capacity') or 0)),
            'cover_image': data.get('coverImage', ''),
            'certificate_issued': bool(data.get('certificateIssued')),
        })
        return http.Response(json.dumps(self._event_to_json(event, user)), content_type='application/json', status=201)

    @http.route('/api/network/events/<int:event_id>/register', type='http', auth='none', methods=['POST'], csrf=False)
    def register_event(self, event_id):
        return _auth_required(lambda: self._register_event(event_id))()

    def _register_event(self, event_id):
        user = _get_user()
        event = request.env['heyla.network.event'].sudo().browse(event_id)
        if not event.exists():
            return _json_error('Not found', 404)
        existing = request.env['heyla.network.event.attendee'].sudo().search(
            [('event_id', '=', event.id), ('user_id', '=', user.id)], limit=1)
        if existing:
            return _json_error('Already registered', 400)
        if event.capacity and event.attendee_count >= event.capacity:
            return _json_error('Event is full', 400)
        digest = hashlib.sha256(f'heyla-event-{event.id}-user-{user.id}'.encode()).hexdigest()[:16].upper()
        attendee = request.env['heyla.network.event.attendee'].sudo().create({
            'event_id': event.id,
            'user_id': user.id,
            'qr_code': f'HEYLA-{event.id}-{user.id}-{digest}',
        })
        return http.Response(json.dumps({
            'ok': True,
            'qrCode': attendee.qr_code,
            'attendeeCount': event.attendee_count,
        }), content_type='application/json', status=201)

    @http.route('/api/network/events/<int:event_id>/checkin', type='http', auth='none', methods=['POST'], csrf=False)
    def checkin_event(self, event_id):
        return _auth_required(lambda: self._checkin_event(event_id))()

    def _checkin_event(self, event_id):
        user = _get_user()
        data = _load_json() or {}
        event = request.env['heyla.network.event'].sudo().browse(event_id)
        if not event.exists():
            return _json_error('Not found', 404)
        attendee = request.env['heyla.network.event.attendee'].sudo().search(
            [('event_id', '=', event.id), ('user_id', '=', user.id)], limit=1)
        if not attendee:
            return _json_error('Not registered for this event', 400)
        code = data.get('qrCode', '')
        if attendee.qr_code and code and code != attendee.qr_code:
            return _json_error('Invalid QR code', 400)
        attendee.sudo().write({'status': 'checked_in', 'checked_in_at': datetime.now()})
        return http.Response(json.dumps({'ok': True, 'status': attendee.status}), content_type='application/json', status=200)

    # ==================== Mentorship ====================

    @http.route('/api/network/mentorship', type='http', auth='none', methods=['GET'], csrf=False)
    def get_mentorship(self):
        return _auth_required(lambda: self._get_mentorship())()

    def _get_mentorship(self):
        user = _get_user()
        as_mentor = request.env['heyla.network.mentorship'].sudo().search([('mentor_id', '=', user.id)], order='id desc')
        as_mentee = request.env['heyla.network.mentorship'].sudo().search([('mentee_id', '=', user.id)], order='id desc')
        return http.Response(json.dumps({
            'asMentor': [self._mentorship_to_json(m, user.id) for m in as_mentor],
            'asMentee': [self._mentorship_to_json(m, user.id) for m in as_mentee],
        }), content_type='application/json', status=200)

    @http.route('/api/network/mentorship/request', type='http', auth='none', methods=['POST'], csrf=False)
    def request_mentorship(self):
        return _auth_required(lambda: self._request_mentorship())()

    def _request_mentorship(self):
        user = _get_user()
        data = _load_json()
        if data is None:
            return _json_error('Invalid data')
        mentor_id = data.get('mentorId')
        if not mentor_id:
            return _json_error('mentorId required')
        mentor = request.env['heyla.user'].sudo().browse(int(mentor_id))
        if not mentor.exists():
            return _json_error('Mentor not found', 404)
        if mentor.id == user.id:
            return _json_error('You cannot mentor yourself', 400)
        existing = request.env['heyla.network.mentorship'].sudo().search([
            ('mentor_id', '=', mentor.id),
            ('mentee_id', '=', user.id),
            ('status', 'in', ['pending', 'active']),
        ], limit=1)
        if existing:
            return _json_error('Mentorship already exists', 400)
        record = request.env['heyla.network.mentorship'].sudo().create({
            'mentor_id': mentor.id,
            'mentee_id': user.id,
            'focus_area': data.get('focusArea', ''),
            'goal': data.get('goal', ''),
        })
        return http.Response(json.dumps(self._mentorship_to_json(record, user.id)), content_type='application/json', status=201)

    @http.route('/api/network/mentorship/<int:mentorship_id>/respond', type='http', auth='none', methods=['POST'], csrf=False)
    def respond_mentorship(self, mentorship_id):
        return _auth_required(lambda: self._respond_mentorship(mentorship_id))()

    def _respond_mentorship(self, mentorship_id):
        user = _get_user()
        data = _load_json() or {}
        record = request.env['heyla.network.mentorship'].sudo().browse(mentorship_id)
        if not record.exists():
            return _json_error('Not found', 404)
        if record.mentor_id.id != user.id and user.role != 'admin':
            return _json_error('Only the mentor can respond', 403)
        if record.status != 'pending':
            return _json_error('Already responded', 400)
        accept = bool(data.get('accept'))
        record.sudo().write({
            'status': 'active' if accept else 'declined',
            'started_at': datetime.now() if accept else False,
        })
        return http.Response(json.dumps(self._mentorship_to_json(record, user.id)), content_type='application/json', status=200)

    @http.route('/api/network/mentorship/<int:mentorship_id>/progress', type='http', auth='none', methods=['POST'], csrf=False)
    def update_mentorship_progress(self, mentorship_id):
        return _auth_required(lambda: self._update_mentorship_progress(mentorship_id))()

    def _update_mentorship_progress(self, mentorship_id):
        user = _get_user()
        data = _load_json() or {}
        record = request.env['heyla.network.mentorship'].sudo().browse(mentorship_id)
        if not record.exists():
            return _json_error('Not found', 404)
        if record.mentor_id.id != user.id and record.mentee_id.id != user.id:
            return _json_error('Forbidden', 403)
        if record.status != 'active':
            return _json_error('Mentorship is not active', 400)
        vals = {}
        if 'progress' in data:
            vals['progress'] = min(100, max(0, int(data['progress'] or 0)))
        if 'progressNotes' in data:
            vals['progress_notes'] = data['progressNotes']
        if data.get('complete'):
            vals['status'] = 'completed'
            vals['progress'] = 100
            vals['completed_at'] = datetime.now()
        if vals:
            record.sudo().write(vals)
        return http.Response(json.dumps(self._mentorship_to_json(record, user.id)), content_type='application/json', status=200)

    @http.route('/api/network/mentors', type='http', auth='none', methods=['GET'], csrf=False)
    def list_mentors(self):
        return _auth_required(lambda: self._list_mentors())()

    def _list_mentors(self):
        profiles = request.env['heyla.network.profile'].sudo().search([('mentor_available', '=', True)])
        return http.Response(json.dumps([{
            'userId': str(p.user_id.id),
            'name': p.user_id.name or '',
            'headline': p.headline or '',
            'mentorBio': p.mentor_bio or '',
            'mentorAreas': p.mentor_areas or '',
            'reputation': p.reputation_score or 0,
            'location': p.location or '',
        } for p in profiles]), content_type='application/json', status=200)

    # ==================== AI: Job Matching ====================

    @http.route('/api/network/jobs/matched', type='http', auth='none', methods=['GET'], csrf=False)
    def matched_jobs(self):
        return _auth_required(lambda: self._matched_jobs())()

    def _matched_jobs(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        jobs = request.env['heyla.network.job'].sudo().search([])
        p_skills = {_normalize(s.name) for s in profile.skill_ids}
        p_loc = _normalize(profile.location or '')
        availability = profile.availability or 'open_to_work'
        availability_score = 100 if availability in ('open_to_work', 'freelance', 'daily_labour', 'seasonal') else (40 if availability == 'employed' else 70)

        results = []
        for job in jobs:
            req = [_normalize(s.strip()) for s in (job.skills or '').split('\n') if s.strip()]
            matched = [r for r in req if r and r in p_skills]
            if req:
                skill_score = 100.0 * len(matched) / len(req)
            else:
                skill_score = 50.0
            j_loc = _normalize(job.location or '')
            loc_score = 100.0 if (p_loc and j_loc and p_loc in j_loc) else (0.0 if (p_loc and j_loc) else 50.0)
            exp_score = 100.0 if not job.min_experience or (profile.years_of_experience or 0) >= job.min_experience else 0.0
            score = (0.50 * skill_score + 0.20 * loc_score + 0.15 * exp_score + 0.15 * availability_score)
            results.append({
                'id': str(job.id),
                'title': job.title or '',
                'company': job.company or '',
                'location': job.location or '',
                'type': job.job_type or 'Full-time',
                'salary': job.salary or '',
                'posted': job.posted or '',
                'skills': [s.strip() for s in (job.skills or '').split('\n') if s.strip()],
                'description': job.description or '',
                'matchedSkills': matched,
                'matchScore': round(score, 1),
                'applicantCount': len(job.applicant_ids),
            })
        results.sort(key=lambda r: r['matchScore'], reverse=True)
        return http.Response(json.dumps({
            'totalJobs': len(results),
            'jobs': results[:50],
        }), content_type='application/json', status=200)

    # ==================== AI: Career Coach ====================

    @http.route('/api/network/career-coach', type='http', auth='none', methods=['GET'], csrf=False)
    def career_coach(self):
        return _auth_required(lambda: self._career_coach())()

    def _career_coach(self):
        user = _get_user()
        profile = self._get_or_create_profile(user)
        trade = profile.trade_category or 'general'
        years = profile.years_of_experience or 0

        salary_table = SALARY_BENCHMARKS.get(trade, SALARY_BENCHMARKS.get('technician', []))
        bracket = None
        for b in salary_table:
            if years >= b[0]:
                bracket = b
        if bracket is None and salary_table:
            bracket = salary_table[0]
        next_bracket = None
        if bracket:
            next_bracket = next((b for b in salary_table if b[0] > bracket[0]), None)

        path = CAREER_PATHS.get(trade, CAREER_PATHS.get('technician', []))
        roadmap = []
        for i, (role, min_years) in enumerate(path):
            is_current = years >= min_years and (i + 1 >= len(path) or years < path[i + 1][1])
            roadmap.append({
                'role': role,
                'minYears': min_years,
                'reached': years >= min_years,
                'currentStep': is_current,
            })
        next_role = None
        for step in roadmap:
            if not step['reached']:
                next_role = step['role']
                break

        have = {_normalize(s.name) for s in profile.skill_ids}
        desired = TRADE_SKILLS.get(trade, DEFAULT_SKILLS)
        gaps = [s for s in desired if _normalize(s) not in have]

        courses = TRADE_COURSES.get(trade, DEFAULT_COURSES)
        certifications = [v.verification_type for v in profile.verification_ids if v.status == 'verified']

        if not profile.trade_category:
            advice = 'Complete your Digital Skills Passport (trade category, experience, availability) to unlock your career roadmap and salary benchmarks.'
        elif gaps:
            advice = 'Close your skill gaps to qualify for the next career level. Focus on: ' + ', '.join(gaps[:4]) + '.'
        elif next_role:
            advice = f'You are ready for the next step: {next_role}. Strengthen verifications and apply for supervisor-level roles.'
        else:
            advice = 'You are at the top of this career ladder. Consider mentoring others, advanced certification, or management training.'

        return http.Response(json.dumps({
            'trade': trade,
            'tradeLabel': dict(request.env['heyla.network.profile'].sudo()._fields['trade_category'].selection).get(trade, 'General'),
            'yearsOfExperience': years,
            'roadmap': roadmap,
            'nextRole': next_role,
            'currentSalaryRange': {'low': bracket[1], 'high': bracket[2]} if bracket else None,
            'nextSalaryRange': {'low': next_bracket[1], 'high': next_bracket[2]} if next_bracket else None,
            'skillGaps': gaps,
            'recommendedCourses': courses,
            'verifiedCertifications': certifications,
            'advice': advice,
        }), content_type='application/json', status=200)

    # ==================== AI: Resume Generation ====================

    @http.route('/api/network/resume/generate', type='http', auth='none', methods=['POST'], csrf=False)
    def generate_resume(self):
        return _auth_required(lambda: self._generate_resume())()

    def _generate_resume(self):
        user = _get_user()
        data = _load_json() or {}
        fmt = data.get('format', 'ats')
        valid_formats = ['ats', 'corporate', 'construction', 'mining', 'oil_gas', 'healthcare', 'hospitality', 'logistics', 'government', 'international']
        if fmt not in valid_formats:
            return _json_error('Invalid format')
        profile = self._get_or_create_profile(user)
        resume = self._build_resume(profile, fmt)
        return http.Response(json.dumps({
            'format': fmt,
            'resume': resume,
            'textLength': len(resume),
        }), content_type='application/json', status=200)

    def _build_resume(self, profile, fmt):
        user = profile.user_id
        trade = profile.trade_category or ''
        years = profile.years_of_experience or 0
        verified = [v for v in profile.verification_ids if v.status == 'verified']
        badges = [v.verification_type for v in verified]
        skills = ['%s%s' % (s.name, ' (%s)' % s.level if s.level else '') for s in profile.skill_ids]
        experiences = profile.experience_ids
        worklog = profile.worklog_ids
        education = profile.education_ids
        references = [r for r in profile.reference_ids if r.status == 'verified']

        trade_label = dict(request.env['heyla.network.profile'].sudo()._fields['trade_category'].selection).get(trade, '')
        lines = []

        def header():
            lines.append(user.name or '')
            lines.append(profile.headline or '')
            lines.append(' | '.join(x for x in [profile.location, profile.phone, user.email, profile.website] if x))
            lines.append('Reputation Score: %s/100 | Verified: %s' % (round(profile.reputation_score or 0, 1), len(badges)))
            lines.append('')

        def section(title):
            lines.append('')
            lines.append(title.upper())
            lines.append('-' * 40)

        # --- Summary ---
        summary_parts = [user.name or '']
        if trade_label and years:
            summary_parts.append('a verified %s with %g years of experience' % (trade_label.lower(), years))
        else:
            summary_parts.append('a verified professional')
        if profile.location:
            summary_parts.append('based in %s' % profile.location)
        if skills:
            summary_parts.append('skilled in %s' % ', '.join(skills[:6]))
        if fmt == 'international':
            summary_parts.append('available for international roles' if profile.willing_to_relocate else 'open to relocation opportunities')
        elif fmt == 'government':
            summary_parts.append('with a clean verification and compliance record')
        summary = summary_parts[0] + ' is ' + ' '.join(summary_parts[1:]) + '.'
        if profile.about:
            summary += ' ' + profile.about.strip()
        lines.append(summary.strip())

        # --- Work Experience ---
        if experiences:
            section('Work Experience')
            for e in experiences:
                period = '%s - %s' % (e.start_date or '', 'Present' if e.current else (e.end_date or ''))
                lines.append('%s' % e.title)
                lines.append('%s | %s | %s' % (e.company or '', e.location or '', period))
                if e.description:
                    lines.append(e.description)
                lines.append('')
        if worklog:
            if not experiences:
                section('Work Experience')
            for w in worklog:
                period = '%s - %s' % (w.start_date or '', w.end_date or 'Present')
                lines.append('%s' % (w.role or w.employer))
                lines.append('%s | %s | %s' % (w.employer, w.location or '', period))
                detail = []
                if w.hours_worked:
                    detail.append('%g hours' % w.hours_worked)
                if w.equipment_used:
                    detail.append('equipment: %s' % w.equipment_used)
                if w.output:
                    detail.append('output: %s' % w.output)
                if w.attendance_rating:
                    detail.append('attendance rating %s/5' % w.attendance_rating)
                if w.safety_incidents == 0:
                    detail.append('zero safety incidents')
                if detail:
                    lines.append(' | '.join(detail))
                if w.supervisor_review:
                    lines.append('Supervisor review: %s' % w.supervisor_review)
                lines.append('')

        # --- Projects / Portfolio ---
        if profile.project_ids:
            section('Projects')
            for p in profile.project_ids:
                lines.append('%s' % p.title)
                meta = [x for x in [p.client_name, p.location, p.category] if x]
                if meta:
                    lines.append(' | '.join(meta))
                if p.description:
                    lines.append(p.description)
                if p.outcome:
                    lines.append('Outcome: %s' % p.outcome)
                if p.rating:
                    lines.append('Client rating: %s/5' % p.rating)
                if p.testimonial:
                    lines.append('Testimonial: %s' % p.testimonial)
                lines.append('')

        # --- Machine Experience ---
        if profile.machine_ids and fmt in ('construction', 'mining', 'oil_gas', 'ats'):
            section('Machine Experience')
            for m in profile.machine_ids:
                label = dict(request.env['heyla.network.machine'].sudo()._fields['machine_type'].selection).get(m.machine_type, m.machine_type)
                lines.append('%s | %s %s | %g years | %g hours' % (label, m.manufacturer or '', m.model or '', m.years_experience or 0, m.operating_hours or 0))
                extras = [x for x in [m.fuel_efficiency, m.safety_record, 'maintenance trained' if m.maintenance_knowledge else ''] if x]
                if extras:
                    lines.append(' | '.join(extras))
                if m.training:
                    lines.append('Training: %s' % m.training)
                lines.append('')

        # --- Education ---
        if education:
            section('Education')
            for e in education:
                line = e.school or ''
                if e.degree:
                    line += ' - %s' % e.degree
                if e.field:
                    line += ' (%s)' % e.field
                if e.start_date or e.end_date:
                    line += ' | %s - %s' % (e.start_date or '', e.end_date or '')
                lines.append(line)
            lines.append('')

        # --- Certifications ---
        if badges:
            section('Verifications & Certifications')
            labels = dict(request.env['heyla.network.verification'].sudo()._fields['verification_type'].selection)
            for b in badges:
                lines.append('- %s' % labels.get(b, b))
            lines.append('')

        # --- References ---
        if references:
            section('References')
            for r in references:
                line = '%s' % (r.reviewer_name or '')
                if r.reviewer_role:
                    line += ' (%s' % r.reviewer_role
                    if r.company:
                        line += ', %s' % r.company
                    line += ')'
                if r._avg_rating():
                    line += ' - average rating %s/5' % round(r._avg_rating(), 1)
                lines.append(line)
                if r.comment:
                    lines.append('"%s"' % r.comment)
                lines.append('')

        # --- Passport / availability (international & ats) ---
        passport_lines = []
        if profile.availability:
            avail_labels = dict(request.env['heyla.network.profile'].sudo()._fields['availability'].selection)
            passport_lines.append('Availability: %s' % avail_labels.get(profile.availability, profile.availability))
        if profile.expected_salary:
            passport_lines.append('Expected salary: %s' % profile.expected_salary)
        if profile.languages:
            passport_lines.append('Languages: %s' % profile.languages)
        if fmt in ('international', 'ats', 'logistics'):
            if profile.nationality:
                passport_lines.append('Nationality: %s' % profile.nationality)
            if profile.passport_status:
                passport_lines.append('Passport: %s' % profile.passport_status)
            if profile.visa_status:
                passport_lines.append('Visa: %s' % profile.visa_status)
            if profile.willing_to_relocate:
                passport_lines.append('Willing to relocate: %s' % (profile.relocation_countries or 'Yes'))
        if passport_lines:
            section('Additional Information')
            for pl in passport_lines:
                lines.append(pl)

        text = '\n'.join(lines).strip()
        if fmt == 'ats':
            text = text.replace('- ', '').replace(' | ', ', ')
        return text
