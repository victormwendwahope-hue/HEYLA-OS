from odoo import http
from odoo.http import request
from .auth import _auth_required
import json


class TransportController(http.Controller):

    def _vehicle_to_json(self, v):
        return {
            'id': str(v.id), 'name': v.name or '', 'plate': v.plate or '',
            'type': v.vehicle_type or 'Car', 'status': v.status or 'Active',
            'driver': v.driver or '', 'mileage': v.mileage,
            'fuelType': v.fuel_type or 'Diesel',
            'lastService': v.last_service.isoformat() if v.last_service else '',
        }

    def _driver_to_json(self, d):
        return {
            'id': str(d.id), 'name': d.name or '', 'phone': d.phone or '',
            'license': d.license or '', 'status': d.status or 'Available',
            'trips': d.trips, 'rating': d.rating, 'avatar': d.avatar or '',
        }

    def _shipment_to_json(self, s):
        return {
            'id': str(s.id), 'trackingNo': s.tracking_no or '',
            'origin': s.origin or '', 'destination': s.destination or '',
            'status': s.status or 'Pending', 'driver': s.driver or '',
            'vehicle': s.vehicle or '', 'weight': s.weight or '',
            'estimatedDelivery': s.estimated_delivery.isoformat() if s.estimated_delivery else '',
            'createdAt': s.created_at.isoformat() if s.created_at else '',
        }

    def _crud_routes(self, base, model, to_json):
        @http.route(f'/api/{base}', type='http', auth='none', methods=['GET'], csrf=False)
        def get_all(self):
            return _auth_required(lambda: http.Response(
                json.dumps([to_json(r) for r in request.env[model].sudo().search([])]),
                content_type='application/json', status=200,
            ))()

        @http.route(f'/api/{base}', type='http', auth='none', methods=['POST'], csrf=False)
        def create(self):
            return _auth_required(lambda: self._create_record(model, to_json))()

        @http.route(f'/api/{base}/<int:rec_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
        def update(self, rec_id):
            return _auth_required(lambda: self._update_record(model, to_json, rec_id))()

        @http.route(f'/api/{base}/<int:rec_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
        def delete(self, rec_id):
            return _auth_required(lambda: self._delete_record(model, rec_id))()

    # ---- Vehicles ----
    @http.route('/api/vehicles', type='http', auth='none', methods=['GET'], csrf=False)
    def get_vehicles(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._vehicle_to_json(v) for v in request.env['heyla.transport.vehicle'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/vehicles', type='http', auth='none', methods=['POST'], csrf=False)
    def create_vehicle(self):
        return _auth_required(lambda: self._create_vehicle())()

    def _create_vehicle(self):
        try:
            data = json.loads(request.httprequest.data)
            v = request.env['heyla.transport.vehicle'].sudo().create({
                'name': data.get('name', ''), 'plate': data.get('plate', ''),
                'vehicle_type': data.get('type', 'Car'), 'status': data.get('status', 'Active'),
                'driver': data.get('driver', ''), 'mileage': data.get('mileage', 0.0),
                'fuel_type': data.get('fuelType', 'Diesel'),
            })
            return http.Response(json.dumps(self._vehicle_to_json(v)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/vehicles/<int:rec_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_vehicle(self, rec_id):
        return _auth_required(lambda: self._update_vehicle(rec_id))()

    def _update_vehicle(self, rec_id):
        rec = request.env['heyla.transport.vehicle'].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        data = json.loads(request.httprequest.data)
        field_map = {'name': 'name', 'plate': 'plate', 'type': 'vehicle_type',
                     'status': 'status', 'driver': 'driver', 'mileage': 'mileage',
                     'fuelType': 'fuel_type'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if 'lastService' in data:
            vals['last_service'] = data['lastService'] or False
        if vals:
            rec.sudo().write(vals)
        return http.Response(json.dumps(self._vehicle_to_json(rec)), content_type='application/json', status=200)

    @http.route('/api/vehicles/<int:rec_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_vehicle(self, rec_id):
        return _auth_required(lambda: self._delete_record('heyla.transport.vehicle', rec_id))()

    # ---- Drivers ----
    @http.route('/api/drivers', type='http', auth='none', methods=['GET'], csrf=False)
    def get_drivers(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._driver_to_json(d) for d in request.env['heyla.transport.driver'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/drivers', type='http', auth='none', methods=['POST'], csrf=False)
    def create_driver(self):
        return _auth_required(lambda: self._create_driver())()

    def _create_driver(self):
        try:
            data = json.loads(request.httprequest.data)
            d = request.env['heyla.transport.driver'].sudo().create({
                'name': data.get('name', ''), 'phone': data.get('phone', ''),
                'license': data.get('license', ''), 'status': data.get('status', 'Available'),
                'trips': data.get('trips', 0), 'rating': data.get('rating', 0.0),
                'avatar': data.get('avatar', ''),
            })
            return http.Response(json.dumps(self._driver_to_json(d)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/drivers/<int:rec_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_driver(self, rec_id):
        return _auth_required(lambda: self._update_driver(rec_id))()

    def _update_driver(self, rec_id):
        rec = request.env['heyla.transport.driver'].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        data = json.loads(request.httprequest.data)
        field_map = {'name': 'name', 'phone': 'phone', 'license': 'license',
                     'status': 'status', 'trips': 'trips', 'rating': 'rating', 'avatar': 'avatar'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if vals:
            rec.sudo().write(vals)
        return http.Response(json.dumps(self._driver_to_json(rec)), content_type='application/json', status=200)

    @http.route('/api/drivers/<int:rec_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_driver(self, rec_id):
        return _auth_required(lambda: self._delete_record('heyla.transport.driver', rec_id))()

    # ---- Shipments ----
    @http.route('/api/shipments', type='http', auth='none', methods=['GET'], csrf=False)
    def get_shipments(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._shipment_to_json(s) for s in request.env['heyla.transport.shipment'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/shipments', type='http', auth='none', methods=['POST'], csrf=False)
    def create_shipment(self):
        return _auth_required(lambda: self._create_shipment())()

    def _create_shipment(self):
        try:
            data = json.loads(request.httprequest.data)
            s = request.env['heyla.transport.shipment'].sudo().create({
                'tracking_no': data.get('trackingNo', ''),
                'origin': data.get('origin', ''), 'destination': data.get('destination', ''),
                'status': data.get('status', 'Pending'), 'driver': data.get('driver', ''),
                'vehicle': data.get('vehicle', ''), 'weight': data.get('weight', ''),
                'estimated_delivery': data.get('estimatedDelivery') or False,
            })
            return http.Response(json.dumps(self._shipment_to_json(s)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/shipments/<int:rec_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_shipment(self, rec_id):
        return _auth_required(lambda: self._update_shipment(rec_id))()

    def _update_shipment(self, rec_id):
        rec = request.env['heyla.transport.shipment'].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        data = json.loads(request.httprequest.data)
        field_map = {'trackingNo': 'tracking_no', 'origin': 'origin', 'destination': 'destination',
                     'status': 'status', 'driver': 'driver', 'vehicle': 'vehicle', 'weight': 'weight'}
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if 'estimatedDelivery' in data:
            vals['estimated_delivery'] = data['estimatedDelivery'] or False
        if vals:
            rec.sudo().write(vals)
        return http.Response(json.dumps(self._shipment_to_json(rec)), content_type='application/json', status=200)

    @http.route('/api/shipments/<int:rec_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_shipment(self, rec_id):
        return _auth_required(lambda: self._delete_record('heyla.transport.shipment', rec_id))()

    # ---- Helpers ----
    def _delete_record(self, model, rec_id):
        rec = request.env[model].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
