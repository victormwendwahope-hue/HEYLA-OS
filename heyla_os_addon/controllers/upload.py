from odoo import http
from odoo.http import request
from .auth import _auth_required
import json
import os
import uuid


class UploadController(http.Controller):

    @http.route('/api/upload', type='http', auth='none', methods=['POST'], csrf=False)
    def upload_file(self):
        return _auth_required(lambda: self._upload_file())()

    def _upload_file(self):
        try:
            file = request.httprequest.files.get('file')
            if not file:
                return http.Response(json.dumps({'error': 'No file provided'}), content_type='application/json', status=400)

            filename = file.filename
            ext = os.path.splitext(filename)[1] if '.' in filename else ''
            stored_name = f"{uuid.uuid4().hex}{ext}"
            mimetype = file.content_type or 'application/octet-stream'
            data = file.read()

            # Store as attachment
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
        except Exception as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
