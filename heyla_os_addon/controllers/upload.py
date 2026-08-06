from odoo import http
from odoo.http import request
from .auth import _auth_required
import json
import os
import uuid
import base64


ALLOWED_MIMES = {
    # Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    # Documents
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip', 'application/gzip',
    # Videos (HEYLA CONNECT: vivid 1080p clips, max 5 minutes)
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'video/3gpp', 'video/x-m4v', 'video/mov',
}

VIDEO_MIMES = {
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'video/ogg', 'video/x-m4v', 'video/mov',
}

# 1080p 5-minute clip @ ~8 Mbps ≈ 300MB headroom
MAX_FILE_SIZE = 400 * 1024 * 1024
MAX_VIDEO_SIZE = 400 * 1024 * 1024
MAX_IMAGE_SIZE = 15 * 1024 * 1024

CHUNK = 1024 * 1024


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
            is_video = mimetype in VIDEO_MIMES
            if mimetype not in ALLOWED_MIMES:
                return http.Response(json.dumps({'error': 'File type not allowed'}), content_type='application/json', status=400)

            data = file.read()
            limit = MAX_VIDEO_SIZE if is_video else MAX_IMAGE_SIZE if mimetype.startswith('image/') else MAX_FILE_SIZE
            if len(data) > limit:
                label = 'video' if is_video else ('image' if mimetype.startswith('image/') else 'file')
                return http.Response(json.dumps({'error': f'{label.capitalize()} too large (max {limit // (1024 * 1024)}MB)'}), content_type='application/json', status=400)

            filename = file.filename or 'unnamed'
            ext = os.path.splitext(filename)[1] if '.' in filename else ''
            stored_name = f"{uuid.uuid4().hex}{ext}"

            attachment = request.env['ir.attachment'].sudo().create({
                'name': stored_name,
                'datas': base64.b64encode(data).decode('utf-8'),
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

    @http.route('/api/upload/<int:attachment_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def serve_upload(self, attachment_id):
        attachment = request.env['ir.attachment'].sudo().browse(attachment_id)
        if not attachment.exists() or not attachment.datas:
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)

        raw = base64.b64decode(attachment.datas)
        mime = attachment.mimetype or 'application/octet-stream'
        size = len(raw)
        rng = request.httprequest.headers.get('Range')

        if rng and rng.startswith('bytes='):
            try:
                start_str, _, end_str = rng[len('bytes='):].partition('-')
                start = int(start_str) if start_str else 0
                end = int(end_str) if end_str else size - 1
                end = min(end, size - 1)
                start = min(start, size - 1)
                if start > end:
                    return http.Response(status=416)
                chunk = raw[start:end + 1]
                resp = http.Response(chunk, headers=[
                    ('Content-Range', f'bytes {start}-{end}/{size}'),
                    ('Accept-Ranges', 'bytes'),
                    ('Content-Type', mime),
                    ('Content-Length', str(len(chunk))),
                    ('Cache-Control', 'public, max-age=31536000, immutable'),
                ], status=206)
                return resp
            except Exception:
                pass

        return http.Response(raw, status=200, headers=[
            ('Content-Type', mime),
            ('Content-Length', str(size)),
            ('Accept-Ranges', 'bytes'),
            ('Cache-Control', 'public, max-age=31536000, immutable'),
        ])