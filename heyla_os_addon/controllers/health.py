from odoo import http
from odoo.http import request
import json


class HealthController(http.Controller):

    @http.route('/api/health', type='http', auth='none', methods=['GET'], csrf=False)
    def health(self):
        return http.Response(
            json.dumps({'status': 'ok', 'service': 'HEYLA OS Backend'}),
            content_type='application/json',
            status=200,
        )
