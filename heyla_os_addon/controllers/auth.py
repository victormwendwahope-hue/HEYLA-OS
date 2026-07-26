from odoo import http
from odoo.http import request
import json
import hashlib
import secrets
from datetime import datetime

try:
    import requests as http_requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


def _hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def _generate_token():
    return secrets.token_hex(32)


def _auth_required(f):
    def wrapper(*args, **kwargs):
        auth_header = request.httprequest.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
        if not token:
            return http.Response(
                json.dumps({'error': 'Authentication required'}),
                content_type='application/json', status=401,
            )
        user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
        if not user:
            return http.Response(
                json.dumps({'error': 'Invalid token'}),
                content_type='application/json', status=401,
            )
        request.heyla_user = user
        return f(*args, **kwargs)
    return wrapper


def _user_to_json(user):
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'company': user.company or '',
        'role': user.role,
        'avatar': user.avatar or '',
        'facility_name': user.facility_name or '',
        'facility_logo': user.facility_logo or '',
    }


GOOGLE_CLIENT_ID = '319632867370-o8hnhe1b0dfl614gn7c2dq3kne4qlqo5.apps.googleusercontent.com'


def _verify_google_token(credential):
    if not HAS_REQUESTS:
        return None
    try:
        resp = http_requests.get(
            f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}',
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        if data.get('aud') != GOOGLE_CLIENT_ID:
            return None
        if not data.get('email_verified'):
            return None
        return data
    except Exception:
        return None


class AuthController(http.Controller):

    @http.route('/api/auth/login', type='http', auth='none', methods=['POST'], csrf=False)
    def login(self):
        try:
            data = json.loads(request.httprequest.data)
            email = data.get('email', '').strip().lower()
            password = _hash_password(data.get('password', ''))
            user = request.env['heyla.user'].sudo().search([('email', '=', email), ('password', '=', password)], limit=1)
            if not user:
                return http.Response(
                    json.dumps({'error': 'Invalid email or password'}),
                    content_type='application/json', status=401,
                )
            token = _generate_token()
            refresh = _generate_token()
            user.sudo().write({'password': token, 'refresh_token': refresh, 'last_login': datetime.now()})
            return http.Response(
                json.dumps({'token': token, 'refreshToken': refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/auth/register', type='http', auth='none', methods=['POST'], csrf=False)
    def register(self):
        try:
            data = json.loads(request.httprequest.data)
            email = data.get('email', '').strip().lower()
            existing = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if existing:
                return http.Response(
                    json.dumps({'error': 'Email already registered'}),
                    content_type='application/json', status=400,
                )
            password = _hash_password(data.get('password', ''))
            token = _generate_token()
            refresh = _generate_token()
            user = request.env['heyla.user'].sudo().create({
                'name': data.get('name', ''),
                'email': email,
                'password': token,
                'refresh_token': refresh,
                'company': data.get('company', ''),
                'role': 'admin' if data.get('accountType') == 'individual' else 'employee',
                'facility_name': data.get('facilityName', ''),
                'facility_logo': data.get('facilityLogo', ''),
            })
            return http.Response(
                json.dumps({'token': token, 'refreshToken': refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/auth/google/login', type='http', auth='none', methods=['POST'], csrf=False)
    def google_login(self):
        try:
            data = json.loads(request.httprequest.data)
            info = _verify_google_token(data.get('credential', ''))
            if not info:
                return http.Response(
                    json.dumps({'error': 'Invalid Google credential'}),
                    content_type='application/json', status=401,
                )
            email = info.get('email', '').strip().lower()
            user = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if not user:
                return http.Response(
                    json.dumps({'error': 'No account found with this email. Please register first.'}),
                    content_type='application/json', status=404,
                )
            token = _generate_token()
            refresh = _generate_token()
            avatar = info.get('picture', '')
            vals = {'password': token, 'refresh_token': refresh, 'last_login': datetime.now()}
            if not user.avatar and avatar:
                vals['avatar'] = avatar
            if not user.name:
                vals['name'] = info.get('name', email.split('@')[0])
            user.sudo().write(vals)
            return http.Response(
                json.dumps({'token': token, 'refreshToken': refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/auth/google/register', type='http', auth='none', methods=['POST'], csrf=False)
    def google_register(self):
        try:
            data = json.loads(request.httprequest.data)
            info = _verify_google_token(data.get('credential', ''))
            if not info:
                return http.Response(
                    json.dumps({'error': 'Invalid Google credential'}),
                    content_type='application/json', status=401,
                )
            email = info.get('email', '').strip().lower()
            existing = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if existing:
                return http.Response(
                    json.dumps({'error': 'Email already registered. Please log in instead.'}),
                    content_type='application/json', status=400,
                )
            token = _generate_token()
            refresh = _generate_token()
            user = request.env['heyla.user'].sudo().create({
                'name': info.get('name', email.split('@')[0]),
                'email': email,
                'password': token,
                'refresh_token': refresh,
                'avatar': info.get('picture', ''),
                'company': data.get('facilityName', ''),
                'role': 'admin',
                'facility_name': data.get('facilityName', ''),
                'facility_logo': data.get('facilityLogo', ''),
            })
            return http.Response(
                json.dumps({'token': token, 'refreshToken': refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/auth/me', type='http', auth='none', methods=['GET'], csrf=False)
    def me(self):
        return _auth_required(lambda: http.Response(
            json.dumps({'user': _user_to_json(request.heyla_user)}),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/auth/refresh', type='http', auth='none', methods=['POST'], csrf=False)
    def refresh(self):
        try:
            data = json.loads(request.httprequest.data)
            rt = data.get('refreshToken', '')
            user = request.env['heyla.user'].sudo().search([('refresh_token', '=', rt)], limit=1)
            if not user:
                return http.Response(
                    json.dumps({'error': 'Invalid refresh token'}),
                    content_type='application/json', status=401,
                )
            token = _generate_token()
            refresh = _generate_token()
            user.sudo().write({'password': token, 'refresh_token': refresh})
            return http.Response(
                json.dumps({'token': token, 'refreshToken': refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/auth/logout', type='http', auth='none', methods=['POST'], csrf=False)
    def logout(self):
        try:
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
            if user:
                user.sudo().write({'password': _generate_token(), 'refresh_token': ''})
            return http.Response(
                json.dumps({'ok': True}),
                content_type='application/json', status=200,
            )
        except Exception as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/auth/logout-all', type='http', auth='none', methods=['POST'], csrf=False)
    def logout_all(self):
        auth_header = request.httprequest.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
        user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
        if user:
            user.sudo().write({'password': _generate_token(), 'refresh_token': ''})
        return http.Response(
            json.dumps({'ok': True}),
            content_type='application/json', status=200,
        )

    @http.route('/api/auth/change-password', type='http', auth='none', methods=['POST'], csrf=False)
    def change_password(self):
        try:
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
            if not user:
                return http.Response(
                    json.dumps({'error': 'Authentication required'}),
                    content_type='application/json', status=401,
                )
            data = json.loads(request.httprequest.data)
            new_hash = _hash_password(data.get('newPassword', ''))
            new_token = _generate_token()
            new_refresh = _generate_token()
            user.sudo().write({'password': new_hash, 'refresh_token': new_refresh})
            return http.Response(
                json.dumps({'ok': True}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/auth/profile', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_profile(self):
        try:
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
            if not user:
                return http.Response(
                    json.dumps({'error': 'Authentication required'}),
                    content_type='application/json', status=401,
                )
            data = json.loads(request.httprequest.data)
            vals = {}
            if 'name' in data:
                vals['name'] = data['name']
            if 'company' in data:
                vals['company'] = data['company']
            if 'avatar' in data:
                vals['avatar'] = data['avatar']
            if 'facilityName' in data:
                vals['facility_name'] = data['facilityName']
            if 'facilityLogo' in data:
                vals['facility_logo'] = data['facilityLogo']
            if vals:
                user.sudo().write(vals)
            return http.Response(
                json.dumps({'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )
