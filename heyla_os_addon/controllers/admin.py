from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class AdminController(http.Controller):

    def _user_to_json(self, u):
        return {
            'id': str(u.id), 'name': u.name or '', 'email': u.email or '',
            'company': u.company or '', 'role': u.role or 'employee',
            'avatar': u.avatar or '', 'active': u.active,
            'lastLogin': u.last_login.isoformat() if u.last_login else None,
        }

    @http.route('/api/admin/users', type='http', auth='none', methods=['GET'], csrf=False)
    def get_users(self):
        return _auth_required(lambda: self._get_users())()

    def _get_users(self):
        if request.heyla_user.role != 'admin':
            return http.Response(json.dumps({'error': 'Admin access required'}), content_type='application/json', status=403)
        return http.Response(
            json.dumps([self._user_to_json(u) for u in request.env['heyla.user'].sudo().search([])]),
            content_type='application/json', status=200,
        )

    @http.route('/api/admin/users/<int:user_id>/role', type='http', auth='none', methods=['PATCH'], csrf=False)
    def set_role(self, user_id):
        return _auth_required(lambda: self._set_role(user_id))()

    def _set_role(self, user_id):
        if request.heyla_user.role != 'admin':
            return http.Response(json.dumps({'error': 'Admin access required'}), content_type='application/json', status=403)
        data = json.loads(request.httprequest.data)
        user = request.env['heyla.user'].sudo().browse(user_id)
        if not user.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        if 'role' in data:
            user.sudo().write({'role': data['role']})
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/admin/users/<int:user_id>/revoke-sessions', type='http', auth='none', methods=['POST'], csrf=False)
    def revoke_sessions(self, user_id):
        return _auth_required(lambda: self._revoke_sessions(user_id))()

    def _revoke_sessions(self, user_id):
        if request.heyla_user.role != 'admin':
            return http.Response(json.dumps({'error': 'Admin access required'}), content_type='application/json', status=403)
        user = request.env['heyla.user'].sudo().browse(user_id)
        if not user.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        import secrets
        user.sudo().write({'password': secrets.token_hex(32), 'refresh_token': ''})
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/admin/users/<int:user_id>/reset-password', type='http', auth='none', methods=['POST'], csrf=False)
    def reset_password(self, user_id):
        return _auth_required(lambda: self._reset_password(user_id))()

    def _reset_password(self, user_id):
        if request.heyla_user.role != 'admin':
            return http.Response(json.dumps({'error': 'Admin access required'}), content_type='application/json', status=403)
        user = request.env['heyla.user'].sudo().browse(user_id)
        if not user.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        data = json.loads(request.httprequest.data)
        from .auth import _hash_password
        user.sudo().write({'password': _hash_password(data.get('newPassword', '')), 'refresh_token': ''})
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/admin/audit-logs', type='http', auth='none', methods=['GET'], csrf=False)
    def audit_logs(self):
        return _auth_required(lambda: self._audit_logs())()

    def _audit_logs(self):
        if request.heyla_user.role != 'admin':
            return http.Response(json.dumps({'error': 'Admin access required'}), content_type='application/json', status=403)
        return http.Response(
            json.dumps([]),
            content_type='application/json', status=200,
        )
