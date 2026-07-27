from odoo import http
from odoo.http import request
from .auth import _auth_required
import json
import os
import uuid

ALLOWED_MIMES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip', 'application/gzip',
}
MAX_FILE_SIZE = 50 * 1024 * 1024


class UploadController(http.Controller):

    @http.route('/api/upload', type='http', auth='none', methods=['POST'], csrf=False)
    def upload_file(self):
        return _auth_required(lambda: self._upload_file())()

    def _upload_file(self):
        try:
            file = request.httprequest.files.get('file')
            if not file:
                return http.Response(json.dumps({'error': 'No file provided'}), content_type='application/json', status=400)

            mimetype = file.content_type or 'application/octet-stream'
            if mimetype not in ALLOWED_MIMES:
                return http.Response(json.dumps({'error': 'File type not allowed'}), content_type='application/json', status=400)

            data = file.read()
            if len(data) > MAX_FILE_SIZE:
                return http.Response(json.dumps({'error': 'File too large (max 50MB)'}), content_type='application/json', status=400)

            filename = file.filename or 'unnamed'
            ext = os.path.splitext(filename)[1] if '.' in filename else ''
            stored_name = f"{uuid.uuid4().hex}{ext}"

            import base64
            attachment = request.env['ir.attachment'].sudo().create({
                'name': stored_name,
                'datas': base64.b64encode(data).decode('utf-8') if isinstance(data, bytes) else data,
                'mimetype': mimetype,
                'res_model': 'heyla.upload',
                'res_id': 0,
            })

            return http.Response(
                json.dumps({
                    'url': f'/api/upload/{attachment.id}',
                    'filename': stored_name,
                    'size': len(data),
                    'mime': mimetype,
                }),
                content_type='application/json', status=201,
            )
        except Exception:
            return http.Response(json.dumps({'error': 'Upload failed'}), content_type='application/json', status=400)
