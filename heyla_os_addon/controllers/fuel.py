from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class FuelController(http.Controller):

    def _entry_to_json(self, e):
        return {
            'id': str(e.id), 'vehicleId': e.vehicle_id or '',
            'vehicleName': e.vehicle_name or '', 'vehicleModel': e.vehicle_model or '',
            'plate': e.plate or '', 'driver': e.driver or '',
            'date': e.date.isoformat() if e.date else '',
            'liters': e.liters, 'costPerLiter': e.cost_per_liter,
            'totalCost': e.total_cost, 'mileage': e.mileage,
            'station': e.station or '', 'fuelType': e.fuel_type or 'Diesel',
            'loadState': e.load_state or 'Unloaded', 'cargoWeight': e.cargo_weight,
            'kmPerLiter': e.km_per_liter, 'tripDistance': e.trip_distance,
        }

    @http.route('/api/fuel', type='http', auth='none', methods=['GET'], csrf=False)
    def get_entries(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._entry_to_json(e) for e in request.env['heyla.fuel.entry'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/fuel', type='http', auth='none', methods=['POST'], csrf=False)
    def create_entry(self):
        return _auth_required(lambda: self._create_entry())()

    def _create_entry(self):
        try:
            data = json.loads(request.httprequest.data)
            e = request.env['heyla.fuel.entry'].sudo().create({
                'vehicle_id': data.get('vehicleId', ''),
                'vehicle_name': data.get('vehicleName', ''),
                'vehicle_model': data.get('vehicleModel', ''),
                'plate': data.get('plate', ''),
                'driver': data.get('driver', ''),
                'date': data.get('date') or False,
                'liters': data.get('liters', 0.0),
                'cost_per_liter': data.get('costPerLiter', 0.0),
                'mileage': data.get('mileage', 0.0),
                'station': data.get('station', ''),
                'fuel_type': data.get('fuelType', 'Diesel'),
                'load_state': data.get('loadState', 'Unloaded'),
                'cargo_weight': data.get('cargoWeight', 0.0),
                'trip_distance': data.get('tripDistance', 0.0),
            })
            return http.Response(json.dumps(self._entry_to_json(e)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)

    @http.route('/api/fuel/<int:rec_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_entry(self, rec_id):
        return _auth_required(lambda: self._update_entry(rec_id))()

    def _update_entry(self, rec_id):
        rec = request.env['heyla.fuel.entry'].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        data = json.loads(request.httprequest.data)
        field_map = {
            'vehicleId': 'vehicle_id', 'vehicleName': 'vehicle_name', 'vehicleModel': 'vehicle_model',
            'plate': 'plate', 'driver': 'driver', 'liters': 'liters',
            'costPerLiter': 'cost_per_liter', 'mileage': 'mileage', 'station': 'station',
            'fuelType': 'fuel_type', 'loadState': 'load_state', 'cargoWeight': 'cargo_weight',
            'tripDistance': 'trip_distance',
        }
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if 'date' in data:
            vals['date'] = data['date'] or False
        if vals:
            rec.sudo().write(vals)
        return http.Response(json.dumps(self._entry_to_json(rec)), content_type='application/json', status=200)

    @http.route('/api/fuel/<int:rec_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_entry(self, rec_id):
        return _auth_required(lambda: self._delete_entry(rec_id))()

    def _delete_entry(self, rec_id):
        rec = request.env['heyla.fuel.entry'].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
