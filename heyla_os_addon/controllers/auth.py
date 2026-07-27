from odoo import http
from odoo.http import request
import json
import hashlib
import secrets
import os
from datetime import datetime

try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False

try:
    import requests as http_requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


def _salt():
    return secrets.token_hex(16)


def _hash_password(password):
    if HAS_BCRYPT:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    salt = _salt()
    return f'{salt}${hashlib.sha256((salt + password).encode()).hexdigest()}'


def _check_password(password, stored):
    if stored and '$' in stored and HAS_BCRYPT is False:
        salt, hsh = stored.split('$', 1)
        return hsh == hashlib.sha256((salt + password).encode()).hexdigest()
    if HAS_BCRYPT:
        try:
            return bcrypt.checkpw(password.encode(), stored.encode())
        except Exception:
            return False
    return stored == hashlib.sha256(password.encode()).hexdigest()


TOKEN_EXPIRY_HOURS = 24
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '319632867370-o8hnhe1b0dfl614gn7c2dq3kne4qlqo5.apps.googleusercontent.com')
LINKEDIN_CLIENT_ID = os.environ.get('LINKEDIN_CLIENT_ID', '')
LINKEDIN_CLIENT_SECRET = os.environ.get('LINKEDIN_CLIENT_SECRET', '')


def _auth_required(f):
    def wrapper(*args, **kwargs):
        auth_header = request.httprequest.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
        if not token:
            return http.Response(
                json.dumps({'error': 'Authentication required'}),
                content_type='application/json', status=401,
            )
        from odoo.addons.heyla_os_addon.models.res_user import _hash_token
        token_hash = _hash_token(token)
        user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)
        if not user:
            user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
        if not user:
            return http.Response(
                json.dumps({'error': 'Invalid or expired token'}),
                content_type='application/json', status=401,
            )
        if user.token_expires_at and datetime.now() > user.token_expires_at:
            user.token = False
            user.token_expires_at = False
            return http.Response(
                json.dumps({'error': 'Token expired'}),
                content_type='application/json', status=401,
            )
        if user.token and user.token_expires_at is False:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token as ht, _generate_token as gt
            user.token = ht(gt())
            user.token_expires_at = datetime.now() + __import__('datetime').timedelta(hours=24)
        user._check_expiry()
        if user.subscription_status == 'expired':
            return http.Response(
                json.dumps({'error': 'Subscription expired', 'redirectToPayment': True, 'paymentUrl': '/payment'}),
                content_type='application/json', status=403,
            )
        request.heyla_user = user
        return f(*args, **kwargs)
    return wrapper


def _user_to_json(user):
    user._check_expiry()
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'company': user.company or '',
        'role': user.role,
        'avatar': user.avatar or '',
        'facility_name': user.facility_name or '',
        'facility_logo': user.facility_logo or '',
        'subscription': user._subscription_info(),
        'linkedinId': user.linkedin_id or '',
        'linkedinProfile': user.linkedin_profile or '',
        'talentPool': user.talent_pool or False,
        'headline': user.headline or '',
        'skills': user.skills or '',
        'photoUrl': user.photo_url or '',
    }


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
            password = data.get('password', '')
            if not email or not password:
                return http.Response(json.dumps({'error': 'Invalid credentials'}), content_type='application/json', status=401)
            user = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if not user:
                return http.Response(json.dumps({'error': 'Invalid credentials'}), content_type='application/json', status=401)
            password_hash = user.password_hash or user.password
            if not _check_password(password, password_hash):
                old_hash = hashlib.sha256(password.encode()).hexdigest()
                if user.password != old_hash:
                    return http.Response(json.dumps({'error': 'Invalid credentials'}), content_type='application/json', status=401)
            if not user.password_hash:
                user.password_hash = user.password
            raw_token = user._rotate_token()
            raw_refresh = user._rotate_refresh_token()
            user.last_login = datetime.now()
            return http.Response(
                json.dumps({'token': raw_token, 'refreshToken': raw_refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Invalid request'}), content_type='application/json', status=400)

    @http.route('/api/auth/register', type='http', auth='none', methods=['POST'], csrf=False)
    def register(self):
        try:
            data = json.loads(request.httprequest.data)
            email = data.get('email', '').strip().lower()
            if not email or not data.get('password'):
                return http.Response(json.dumps({'error': 'Email and password required'}), content_type='application/json', status=400)
            existing = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if existing:
                return http.Response(json.dumps({'error': 'Email already registered'}), content_type='application/json', status=400)
            user = request.env['heyla.user'].sudo().create({
                'name': data.get('name', ''),
                'email': email,
                'password': _hash_password(data.get('password', '')),
                'company': data.get('company', ''),
                'role': 'admin' if data.get('accountType') == 'individual' else 'employee',
                'facility_name': data.get('facilityName', ''),
                'facility_logo': data.get('facilityLogo', ''),
            })
            user.password_hash = user.password
            user._start_trial()
            raw_token = user._rotate_token()
            raw_refresh = user._rotate_refresh_token()
            return http.Response(
                json.dumps({'token': raw_token, 'refreshToken': raw_refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Registration failed'}), content_type='application/json', status=400)

    @http.route('/api/auth/google/login', type='http', auth='none', methods=['POST'], csrf=False)
    def google_login(self):
        try:
            data = json.loads(request.httprequest.data)
            info = _verify_google_token(data.get('credential', ''))
            if not info:
                return http.Response(json.dumps({'error': 'Invalid Google credential'}), content_type='application/json', status=401)
            email = info.get('email', '').strip().lower()
            user = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if not user:
                return http.Response(json.dumps({'error': 'No account found with this email'}), content_type='application/json', status=404)
            raw_token = user._rotate_token()
            raw_refresh = user._rotate_refresh_token()
            avatar = info.get('picture', '')
            vals = {'last_login': datetime.now()}
            if not user.avatar and avatar:
                vals['avatar'] = avatar
            if not user.name:
                vals['name'] = info.get('name', email.split('@')[0])
            user.sudo().write(vals)
            return http.Response(
                json.dumps({'token': raw_token, 'refreshToken': raw_refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Google login failed'}), content_type='application/json', status=400)

    @http.route('/api/auth/google/register', type='http', auth='none', methods=['POST'], csrf=False)
    def google_register(self):
        try:
            data = json.loads(request.httprequest.data)
            info = _verify_google_token(data.get('credential', ''))
            if not info:
                return http.Response(json.dumps({'error': 'Invalid Google credential'}), content_type='application/json', status=401)
            email = info.get('email', '').strip().lower()
            existing = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if existing:
                return http.Response(json.dumps({'error': 'Email already registered'}), content_type='application/json', status=400)
            user = request.env['heyla.user'].sudo().create({
                'name': info.get('name', email.split('@')[0]),
                'email': email,
                'password': _hash_password(secrets.token_hex(16)),
                'avatar': info.get('picture', ''),
                'company': data.get('facilityName', ''),
                'role': 'admin',
                'facility_name': data.get('facilityName', ''),
                'facility_logo': data.get('facilityLogo', ''),
            })
            user.password_hash = user.password
            user._start_trial()
            raw_token = user._rotate_token()
            raw_refresh = user._rotate_refresh_token()
            return http.Response(
                json.dumps({'token': raw_token, 'refreshToken': raw_refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Google registration failed'}), content_type='application/json', status=400)

    @http.route('/api/auth/linkedin/login', type='http', auth='none', methods=['POST'], csrf=False)
    def linkedin_login(self):
        try:
            data = json.loads(request.httprequest.data)
            access_token = data.get('accessToken', '')
            if not access_token:
                return http.Response(json.dumps({'error': 'Missing access token'}), content_type='application/json', status=400)
            if not HAS_REQUESTS:
                return http.Response(json.dumps({'error': 'Requests library not available'}), content_type='application/json', status=500)
            headers = {'Authorization': f'Bearer {access_token}'}
            me_resp = http_requests.get('https://api.linkedin.com/v2/userinfo', headers=headers, timeout=10)
            if me_resp.status_code != 200:
                return http.Response(json.dumps({'error': 'Failed to fetch LinkedIn profile'}), content_type='application/json', status=401)
            info = me_resp.json()
            email = info.get('email', '').strip().lower()
            if not email:
                return http.Response(json.dumps({'error': 'No email from LinkedIn'}), content_type='application/json', status=400)
            user = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if not user:
                return http.Response(json.dumps({'error': 'No account found with this email'}), content_type='application/json', status=404)
            raw_token = user._rotate_token()
            raw_refresh = user._rotate_refresh_token()
            linkedin_id = info.get('sub', '')
            name = info.get('name', '')
            picture = info.get('picture', '')
            vals = {'last_login': datetime.now(), 'linkedin_id': linkedin_id}
            if not user.avatar and picture:
                vals['avatar'] = picture
            if not user.linkedin_profile:
                vals['linkedin_profile'] = f'https://www.linkedin.com/in/{linkedin_id}'
            user.sudo().write(vals)
            return http.Response(
                json.dumps({'token': raw_token, 'refreshToken': raw_refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'LinkedIn login failed'}), content_type='application/json', status=400)

    @http.route('/api/auth/linkedin/register', type='http', auth='none', methods=['POST'], csrf=False)
    def linkedin_register(self):
        try:
            data = json.loads(request.httprequest.data)
            access_token = data.get('accessToken', '')
            if not access_token:
                return http.Response(json.dumps({'error': 'Missing access token'}), content_type='application/json', status=400)
            if not HAS_REQUESTS:
                return http.Response(json.dumps({'error': 'Requests library not available'}), content_type='application/json', status=500)
            headers = {'Authorization': f'Bearer {access_token}'}
            me_resp = http_requests.get('https://api.linkedin.com/v2/userinfo', headers=headers, timeout=10)
            if me_resp.status_code != 200:
                return http.Response(json.dumps({'error': 'Failed to fetch LinkedIn profile'}), content_type='application/json', status=401)
            info = me_resp.json()
            email = info.get('email', '').strip().lower()
            if not email:
                return http.Response(json.dumps({'error': 'No email from LinkedIn'}), content_type='application/json', status=400)
            existing = request.env['heyla.user'].sudo().search([('email', '=', email)], limit=1)
            if existing:
                return http.Response(json.dumps({'error': 'Email already registered'}), content_type='application/json', status=400)
            linkedin_id = info.get('sub', '')
            name = info.get('name', email.split('@')[0])
            picture = info.get('picture', '')
            user = request.env['heyla.user'].sudo().create({
                'name': name,
                'email': email,
                'password': _hash_password(secrets.token_hex(16)),
                'avatar': picture,
                'role': 'individual',
                'linkedin_id': linkedin_id,
                'linkedin_profile': f'https://www.linkedin.com/in/{linkedin_id}',
                'photo_url': picture,
                'talent_pool': True,
            })
            user.password_hash = user.password
            user._start_trial()
            raw_token = user._rotate_token()
            raw_refresh = user._rotate_refresh_token()
            try:
                email_resp = http_requests.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', headers=headers, timeout=10)
                if email_resp.status_code == 200:
                    email_data = email_resp.json()
                    elements = email_data.get('elements', [])
                    if elements:
                        verified_email = elements[0].get('handle~', {}).get('emailAddress', '')
                        if verified_email:
                            user.sudo().write({'email': verified_email.strip().lower()})
            except Exception:
                pass
            return http.Response(
                json.dumps({'token': raw_token, 'refreshToken': raw_refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'LinkedIn registration failed'}), content_type='application/json', status=400)

    @http.route('/api/auth/me', type='http', auth='none', methods=['GET'], csrf=False)
    def me(self):
        return _auth_required(lambda: http.Response(
            json.dumps({'user': _user_to_json(request.heyla_user)}),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/auth/refresh', type='http', auth='none', methods=['POST'], csrf=False)
    def refresh(self):
        try:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token
            data = json.loads(request.httprequest.data)
            rt = data.get('refreshToken', '')
            if not rt:
                return http.Response(json.dumps({'error': 'Missing refresh token'}), content_type='application/json', status=401)
            rt_hash = _hash_token(rt)
            user = request.env['heyla.user'].sudo().search([('refresh_token', '=', rt_hash)], limit=1)
            if not user:
                user = request.env['heyla.user'].sudo().search([('refresh_token', '=', rt)], limit=1)
            if not user:
                return http.Response(json.dumps({'error': 'Invalid refresh token'}), content_type='application/json', status=401)
            raw_token = user._rotate_token()
            raw_refresh = user._rotate_refresh_token()
            return http.Response(
                json.dumps({'token': raw_token, 'refreshToken': raw_refresh, 'user': _user_to_json(user)}),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Refresh failed'}), content_type='application/json', status=400)

    @http.route('/api/auth/logout', type='http', auth='none', methods=['POST'], csrf=False)
    def logout(self):
        try:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            if token:
                token_hash = _hash_token(token)
                user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)
                if not user:
                    user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
                if user:
                    user.token = False
                    user.token_expires_at = False
                    user.refresh_token = False
            return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/auth/logout-all', type='http', auth='none', methods=['POST'], csrf=False)
    def logout_all(self):
        try:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            if token:
                token_hash = _hash_token(token)
                user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)
                if not user:
                    user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
                if user:
                    user.token = False
                    user.token_expires_at = False
                    user.refresh_token = False
            return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
        except Exception:
            return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/auth/change-password', type='http', auth='none', methods=['POST'], csrf=False)
    def change_password(self):
        try:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            if not token:
                return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
            token_hash = _hash_token(token)
            user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)
            if not user:
                user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
            if not user:
                return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
            data = json.loads(request.httprequest.data)
            current = data.get('currentPassword', '')
            new = data.get('newPassword', '')
            if not current or not new:
                return http.Response(json.dumps({'error': 'Current and new password required'}), content_type='application/json', status=400)
            password_hash = user.password_hash or user.password
            if not _check_password(current, password_hash):
                old_hash = hashlib.sha256(current.encode()).hexdigest()
                if user.password != old_hash:
                    return http.Response(json.dumps({'error': 'Current password is incorrect'}), content_type='application/json', status=403)
            new_hash = _hash_password(new)
            user.password = new_hash
            user.password_hash = new_hash
            raw_token = user._rotate_token()
            raw_refresh = user._rotate_refresh_token()
            return http.Response(json.dumps({'ok': True, 'token': raw_token, 'refreshToken': raw_refresh}), content_type='application/json', status=200)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Password change failed'}), content_type='application/json', status=400)

    @http.route('/api/auth/profile', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_profile(self):
        try:
            from odoo.addons.heyla_os_addon.models.res_user import _hash_token
            auth_header = request.httprequest.headers.get('Authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header.startswith('Bearer ') else ''
            if not token:
                return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
            token_hash = _hash_token(token)
            user = request.env['heyla.user'].sudo().search([('token', '=', token_hash)], limit=1)
            if not user:
                user = request.env['heyla.user'].sudo().search([('password', '=', token)], limit=1)
            if not user:
                return http.Response(json.dumps({'error': 'Authentication required'}), content_type='application/json', status=401)
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
            return http.Response(json.dumps({'user': _user_to_json(user)}), content_type='application/json', status=200)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Profile update failed'}), content_type='application/json', status=400)