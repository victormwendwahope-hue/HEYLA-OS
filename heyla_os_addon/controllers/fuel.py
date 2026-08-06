from odoo import http
from odoo.http import request
from .auth import _auth_required
import json
from collections import defaultdict
from statistics import median
from datetime import datetime

# --- Analytics configuration (research-backed defaults) ---
# Fuel efficiency floors by vehicle class (km/L). Below this = flag for review.
EFFICIENCY_MIN = {'Truck': 4.0, 'Van': 7.0, 'Car': 9.0, 'Motorcycle': 22.0}
DEFAULT_EFFICIENCY_MIN = 4.0
# Typical consumption used when a vehicle has no fill-to-fill history yet.
TYPICAL_KPL = {'Truck': 5.0, 'Van': 10.0, 'Car': 12.0, 'Motorcycle': 30.0}
DEFAULT_TYPICAL_KPL = 5.0
# Market price sanity caps (KES/L). Entries above cap * tolerance are flagged.
MARKET_PRICE_KES = {'Diesel': 230.0, 'Petrol': 220.0}
PRICE_TOLERANCE = 1.25
# Liters over expected consumption before a fill is flagged (30% = research-based 3% theft band scaled per fill).
VARIANCE_TOLERANCE = 0.30
# Volume at which suspiciously short distances are investigated.
MIN_SUSPICIOUS_LITERS = 30.0
# Fill-to-fill efficiency below this for a large fill = odometer mismatch risk.
GAP_KM_PER_LITER_MIN = 2.5


def _typical_kpl(entry):
    return TYPICAL_KPL.get(entry.vehicle_type or '', DEFAULT_TYPICAL_KPL)


def _kpl_floor(entry):
    return EFFICIENCY_MIN.get(entry.vehicle_type or '', DEFAULT_EFFICIENCY_MIN)


def _price_cap(entry):
    return MARKET_PRICE_KES.get(entry.fuel_type or 'Diesel', MARKET_PRICE_KES['Diesel']) * PRICE_TOLERANCE


def _median(values):
    vals = [v for v in values if v and v > 0]
    return median(vals) if vals else 0.0


def _build_analytics(entries, vehicles):
    """Fill-to-fill fuel analytics: efficiency, cost/km, per-vehicle/driver/month rollups
    and anomaly detection (over-capacity, low efficiency, high price, odometer gaps, variance)."""
    ordered = sorted(entries, key=lambda e: (e.plate or e.vehicle_name or '', e.date or datetime.today().date(), e.mileage or 0, e.id))
    per_plate = defaultdict(list)
    for e in ordered:
        per_plate[e.plate or e.vehicle_name or 'unknown'].append(e)

    totals = {'totalCost': 0.0, 'totalLiters': 0.0, 'totalKm': 0.0}
    variance_loss = 0.0
    anomalies = []
    per_vehicle = []
    per_driver = []
    monthly = defaultdict(lambda: {'month': '', 'totalCost': 0.0, 'totalLiters': 0.0, 'kmDriven': 0.0})

    for plate, plate_entries in per_plate.items():
        recent_kpl = []
        last = plate_entries[-1]
        v = {
            'plate': plate, 'name': last.vehicle_name or '', 'model': last.vehicle_model or '',
            'type': last.vehicle_type or '', 'fills': 0, 'totalLiters': 0.0, 'totalCost': 0.0,
            'kmDriven': 0.0, 'avgPrice': 0.0, 'lastFill': last.date.isoformat() if last.date else '',
            'lastMileage': last.mileage or 0.0, 'tankCapacity': last.tank_capacity or 0.0,
            'varianceLiters': 0.0, 'expectedLiters': 0.0,
        }
        driver_agg = defaultdict(lambda: {'driver': '', 'fills': 0, 'totalCost': 0.0, 'totalLiters': 0.0, 'kmDriven': 0.0})

        for e in plate_entries:
            distance = e._distance()
            liters = e.liters or 0.0
            kpl = distance / liters if liters else 0.0
            baseline = _median(recent_kpl[-5:]) or _typical_kpl(e)
            expected = distance / baseline if distance else 0.0
            variance_liters = liters - expected
            if variance_liters > 0 and expected > 0:
                variance_loss += variance_liters * (e.cost_per_liter or 0.0)
            if kpl > 0:
                recent_kpl.append(kpl)

            month = (e.date or datetime.today().date()).isoformat()[:7]
            m = monthly[month]
            m['month'] = month
            m['totalCost'] += e.total_cost or 0.0
            m['totalLiters'] += liters
            m['kmDriven'] += distance

            totals['totalCost'] += e.total_cost or 0.0
            totals['totalLiters'] += liters
            totals['totalKm'] += distance

            v['fills'] += 1
            v['totalLiters'] += liters
            v['totalCost'] += e.total_cost or 0.0
            v['kmDriven'] += distance
            v['varianceLiters'] += variance_liters if variance_liters > 0 else 0.0
            v['expectedLiters'] += expected

            if e.driver:
                d = driver_agg[e.driver]
                d['driver'] = e.driver
                d['fills'] += 1
                d['totalCost'] += e.total_cost or 0.0
                d['totalLiters'] += liters
                d['kmDriven'] += distance

            flags = _anomaly_flags(e, distance, kpl, variance_liters, expected)
            for flag, severity, message in flags:
                anomalies.append({
                    'id': str(e.id), 'date': e.date.isoformat() if e.date else '',
                    'plate': e.plate or '', 'vehicleName': e.vehicle_name or '',
                    'vehicleModel': e.vehicle_model or '', 'flag': flag, 'severity': severity,
                    'message': message, 'liters': liters, 'kmPerLiter': kpl,
                    'costPerLiter': e.cost_per_liter or 0.0, 'totalCost': e.total_cost or 0.0,
                })

        v['avgPrice'] = v['totalCost'] / v['totalLiters'] if v['totalLiters'] else 0.0
        v['avgKpl'] = v['kmDriven'] / v['totalLiters'] if v['totalLiters'] else 0.0
        v['costPerKm'] = v['totalCost'] / v['kmDriven'] if v['kmDriven'] else 0.0
        if v['avgKpl'] == 0:
            v['status'] = 'no-data'
        elif v['avgKpl'] < _kpl_floor(last) * 0.8:
            v['status'] = 'concern'
        elif v['avgKpl'] < _kpl_floor(last):
            v['status'] = 'watch'
        else:
            v['status'] = 'ok'
        per_vehicle.append(v)

        for d in driver_agg.values():
            d['avgKpl'] = d['kmDriven'] / d['totalLiters'] if d['totalLiters'] else 0.0
            d['costPerKm'] = d['totalCost'] / d['kmDriven'] if d['kmDriven'] else 0.0
            per_driver.append(d)

    per_driver.sort(key=lambda d: d['totalCost'], reverse=True)
    per_vehicle.sort(key=lambda v: v['totalCost'], reverse=True)

    fleet = []
    for veh in vehicles:
        fleet.append({
            'id': str(veh.id), 'name': veh.name, 'plate': veh.plate, 'type': veh.vehicle_type or '',
            'status': veh.status or '', 'driver': veh.driver or '', 'mileage': veh.mileage or 0.0,
            'fuelType': veh.fuel_type or '', 'tankCapacity': veh.tank_capacity or 0.0,
        })

    month_list = sorted(monthly.values(), key=lambda m: m['month'])
    for m in month_list:
        m['label'] = m['month']
        m['costPerKm'] = m['totalCost'] / m['kmDriven'] if m['kmDriven'] else 0.0
        m['avgKpl'] = m['kmDriven'] / m['totalLiters'] if m['totalLiters'] else 0.0

    summary = {
        'totalCost': totals['totalCost'],
        'totalLiters': totals['totalLiters'],
        'totalKm': totals['totalKm'],
        'avgKpl': totals['totalKm'] / totals['totalLiters'] if totals['totalLiters'] else 0.0,
        'costPerKm': totals['totalCost'] / totals['totalKm'] if totals['totalKm'] else 0.0,
        'avgPrice': totals['totalCost'] / totals['totalLiters'] if totals['totalLiters'] else 0.0,
        'anomalyCount': len(anomalies),
        'estVarianceLoss': variance_loss,
        'entryCount': len(entries),
    }

    anomalies.sort(key=lambda a: {'high': 0, 'medium': 1, 'low': 2}[a['severity']])

    return {'summary': summary, 'vehicles': per_vehicle, 'drivers': per_driver,
            'monthly': month_list, 'anomalies': anomalies, 'fleet': fleet}


def _anomaly_flags(e, distance, kpl, variance_liters, expected):
    flags = []
    liters = e.liters or 0.0
    if e.tank_capacity and liters > e.tank_capacity:
        flags.append(('OVER_CAPACITY', 'high',
                      f'{liters:.0f}L exceeds tank capacity of {e.tank_capacity:.0f}L'))
    if distance and kpl < GAP_KM_PER_LITER_MIN and liters >= MIN_SUSPICIOUS_LITERS:
        flags.append(('ODOMETER_GAP', 'high',
                      f'{liters:.0f}L for only {distance:.0f} km ({kpl:.1f} km/L) — check odometer reading'))
    if variance_liters > 0 and expected > 0 and variance_liters / expected > VARIANCE_TOLERANCE:
        flags.append(('VARIANCE_HIGH', 'medium',
                      f'{variance_liters:.0f}L over expected for distance driven ({expected:.0f}L expected)'))
    if kpl and kpl < _kpl_floor(e):
        flags.append(('LOW_EFFICIENCY', 'medium',
                      f'{kpl:.1f} km/L below the {e.vehicle_type or "vehicle"} floor of {_kpl_floor(e):.1f} km/L'))
    if e.cost_per_liter and e.cost_per_liter > _price_cap(e):
        flags.append(('HIGH_PRICE', 'low',
                      f'{e.cost_per_liter:.0f} KES/L above the {e.fuel_type or "fuel"} market cap of {_price_cap(e):.0f} KES/L'))
    if liters >= MIN_SUSPICIOUS_LITERS and not distance and not e.trip_distance:
        flags.append(('NO_DISTANCE', 'low',
                      f'{liters:.0f}L logged without an odometer or trip distance'))
    return flags


class FuelController(http.Controller):

    def _entry_to_json(self, e):
        return {
            'id': str(e.id), 'vehicleId': e.vehicle_id or '',
            'vehicleName': e.vehicle_name or '', 'vehicleModel': e.vehicle_model or '',
            'vehicleType': e.vehicle_type or '', 'plate': e.plate or '', 'driver': e.driver or '',
            'date': e.date.isoformat() if e.date else '',
            'liters': e.liters, 'costPerLiter': e.cost_per_liter,
            'totalCost': e.total_cost, 'mileage': e.mileage,
            'station': e.station or '', 'fuelType': e.fuel_type or 'Diesel',
            'loadState': e.load_state or 'Unloaded', 'cargoWeight': e.cargo_weight,
            'kmPerLiter': e.km_per_liter, 'tripDistance': e.trip_distance,
            'tankCapacity': e.tank_capacity or 0.0, 'costPerKm': e.cost_per_km,
            'notes': e.notes or '',
        }

    def _sync_vehicle_odometer(self, entry):
        """Keep the fleet vehicle's odometer in sync with the latest fill reading."""
        if not entry.plate or not entry.mileage:
            return
        veh = request.env['heyla.transport.vehicle'].sudo().search([('plate', '=', entry.plate)], limit=1)
        if veh and entry.mileage > (veh.mileage or 0):
            veh.mileage = entry.mileage

    @http.route('/api/fuel', type='http', auth='none', methods=['GET'], csrf=False)
    def get_entries(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._entry_to_json(e) for e in request.env['heyla.fuel.entry'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/fuel/analytics', type='http', auth='none', methods=['GET'], csrf=False)
    def get_analytics(self):
        def _handler():
            entries = request.env['heyla.fuel.entry'].sudo().search([])
            vehicles = request.env['heyla.transport.vehicle'].sudo().search([])
            return http.Response(
                json.dumps(_build_analytics(entries, vehicles)),
                content_type='application/json', status=200,
            )
        return _auth_required(_handler)()

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
                'vehicle_type': data.get('vehicleType', 'Truck'),
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
                'tank_capacity': data.get('tankCapacity', 0.0),
                'notes': data.get('notes', ''),
            })
            self._sync_vehicle_odometer(e)
            return http.Response(json.dumps(self._entry_to_json(e)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)

    @http.route('/api/fuel/<int:rec_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_entry(self, rec_id):
        return _auth_required(lambda: self._update_entry(rec_id))()

    def _update_entry(self, rec_id):
        rec = request.env['heyla.fuel.entry'].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception):
            return http.Response(json.dumps({'error': 'Request failed'}), content_type='application/json', status=400)
        field_map = {
            'vehicleId': 'vehicle_id', 'vehicleName': 'vehicle_name', 'vehicleModel': 'vehicle_model',
            'vehicleType': 'vehicle_type', 'plate': 'plate', 'driver': 'driver', 'liters': 'liters',
            'costPerLiter': 'cost_per_liter', 'mileage': 'mileage', 'station': 'station',
            'fuelType': 'fuel_type', 'loadState': 'load_state', 'cargoWeight': 'cargo_weight',
            'tripDistance': 'trip_distance', 'tankCapacity': 'tank_capacity', 'notes': 'notes',
        }
        vals = {o: data[f] for f, o in field_map.items() if f in data}
        if 'date' in data:
            vals['date'] = data['date'] or False
        if vals:
            rec.sudo().write(vals)
            self._sync_vehicle_odometer(rec)
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
