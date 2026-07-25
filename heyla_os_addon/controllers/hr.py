from odoo import http, fields
from odoo.http import request
from .auth import _auth_required
import json
import base64


class HRController(http.Controller):

    def _employee_to_json(self, emp):
        return {
            'id': str(emp.id),
            'payrollNumber': emp.payroll_number or f'PAY-{emp.id:05d}',
            'firstName': emp.first_name,
            'lastName': emp.last_name,
            'name': emp.name,
            'email': emp.email,
            'phone': emp.phone or '',
            'nationalId': emp.national_id or '',
            'kraPin': emp.kra_pin or '',
            'nssfNo': emp.nssf_no or '',
            'nhifNo': emp.nhif_no or '',
            'department': emp.department or '',
            'position': emp.position or '',
            'employmentType': emp.employment_type or 'Full-time',
            'payType': emp.pay_type or 'Salary',
            'status': emp.status or 'Active',
            'startDate': emp.start_date.isoformat() if emp.start_date else '',
            'baseSalary': emp.base_salary,
            'hourlyRate': emp.hourly_rate,
            'housingAllowance': emp.housing_allowance,
            'transportAllowance': emp.transport_allowance,
            'medicalAllowance': emp.medical_allowance,
            'otherAllowances': emp.other_allowances,
            'avatar': emp.avatar or '',
            'address': emp.address or '',
            'city': emp.city or '',
            'country': emp.country or '',
            'emergencyContact': emp.emergency_contact or '',
            'emergencyPhone': emp.emergency_phone or '',
            'bankName': emp.bank_name or '',
            'bankAccount': emp.bank_account or '',
            'paidLeaveDays': emp.paid_leave_days,
            'unpaidLeaveDays': emp.unpaid_leave_days,
            'sickLeaveDays': emp.sick_leave_days,
        }

    # ---- Employees ----
    @http.route('/api/employees', type='http', auth='none', methods=['GET'], csrf=False)
    def get_employees(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._employee_to_json(e) for e in request.env['heyla.employee'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/employees', type='http', auth='none', methods=['POST'], csrf=False)
    def create_employee(self):
        return _auth_required(lambda: self._create_employee())()

    def _create_employee(self):
        try:
            data = json.loads(request.httprequest.data)
            vals = {
                'first_name': data.get('firstName', ''),
                'last_name': data.get('lastName', ''),
                'email': data.get('email', ''),
                'phone': data.get('phone', ''),
                'national_id': data.get('nationalId', ''),
                'kra_pin': data.get('kraPin', ''),
                'nssf_no': data.get('nssfNo', ''),
                'nhif_no': data.get('nhifNo', ''),
                'department': data.get('department', ''),
                'position': data.get('position', ''),
                'employment_type': data.get('employmentType', 'Full-time'),
                'pay_type': data.get('payType', 'Salary'),
                'status': data.get('status', 'Active'),
                'start_date': data.get('startDate') or False,
                'base_salary': data.get('baseSalary', 0.0),
                'hourly_rate': data.get('hourlyRate', 0.0),
                'housing_allowance': data.get('housingAllowance', 0.0),
                'transport_allowance': data.get('transportAllowance', 0.0),
                'medical_allowance': data.get('medicalAllowance', 0.0),
                'other_allowances': data.get('otherAllowances', 0.0),
                'address': data.get('address', ''),
                'city': data.get('city', ''),
                'country': data.get('country', ''),
                'emergency_contact': data.get('emergencyContact', ''),
                'emergency_phone': data.get('emergencyPhone', ''),
                'bank_name': data.get('bankName', ''),
                'bank_account': data.get('bankAccount', ''),
            }
            emp = request.env['heyla.employee'].sudo().create(vals)
            return http.Response(
                json.dumps(self._employee_to_json(emp)),
                content_type='application/json', status=201,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/employees/<int:emp_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_employee(self, emp_id):
        return _auth_required(lambda: self._update_employee(emp_id))()

    def _update_employee(self, emp_id):
        try:
            emp = request.env['heyla.employee'].sudo().browse(emp_id)
            if not emp.exists():
                return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
            data = json.loads(request.httprequest.data)
            field_map = {
                'firstName': 'first_name', 'lastName': 'last_name', 'email': 'email',
                'phone': 'phone', 'nationalId': 'national_id', 'kraPin': 'kra_pin',
                'nssfNo': 'nssf_no', 'nhifNo': 'nhif_no', 'department': 'department',
                'position': 'position', 'employmentType': 'employment_type',
                'payType': 'pay_type', 'status': 'status',
                'baseSalary': 'base_salary', 'hourlyRate': 'hourly_rate',
                'housingAllowance': 'housing_allowance', 'transportAllowance': 'transport_allowance',
                'medicalAllowance': 'medical_allowance', 'otherAllowances': 'other_allowances',
                'address': 'address', 'city': 'city', 'country': 'country',
                'emergencyContact': 'emergency_contact', 'emergencyPhone': 'emergency_phone',
                'bankName': 'bank_name', 'bankAccount': 'bank_account',
                'paidLeaveDays': 'paid_leave_days', 'unpaidLeaveDays': 'unpaid_leave_days',
                'sickLeaveDays': 'sick_leave_days',
            }
            vals = {}
            for frontend_field, odoo_field in field_map.items():
                if frontend_field in data:
                    vals[odoo_field] = data[frontend_field]
            if 'startDate' in data:
                vals['start_date'] = data['startDate'] or False
            if vals:
                emp.sudo().write(vals)
            return http.Response(
                json.dumps(self._employee_to_json(emp)),
                content_type='application/json', status=200,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/employees/<int:emp_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_employee(self, emp_id):
        return _auth_required(lambda: self._delete_employee(emp_id))()

    def _delete_employee(self, emp_id):
        emp = request.env['heyla.employee'].sudo().browse(emp_id)
        if not emp.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        emp.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ---- Payroll ----
    @http.route('/api/payroll', type='http', auth='none', methods=['GET'], csrf=False)
    def get_payroll(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._payroll_to_json(r) for r in request.env['heyla.payroll.record'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/payroll', type='http', auth='none', methods=['POST'], csrf=False)
    def create_payroll(self):
        return _auth_required(lambda: self._create_payroll())()

    def _payroll_to_json(self, r):
        return {
            'id': str(r.id),
            'employeeId': str(r.employee_id.id) if r.employee_id else '',
            'period': r.period or '',
            'payType': r.pay_type or 'Salary',
            'hourlyRate': r.hourly_rate,
            'hoursWorked': r.hours_worked,
            'basicPay': r.basic_pay,
            'housingAllowance': r.housing_allowance,
            'transportAllowance': r.transport_allowance,
            'medicalAllowance': r.medical_allowance,
            'otherAllowances': r.other_allowances,
            'overtime': r.overtime,
            'overtime2': r.overtime2,
            'grossPay': r.gross_pay,
            'deductions': r.deductions,
            'netPay': r.net_pay,
            'status': r.status or 'Draft',
            'paidAt': r.paid_at.isoformat() if r.paid_at else None,
            'payslipGeneratedAt': r.payslip_generated_at.isoformat() if r.payslip_generated_at else None,
            'createdAt': r.created_at.isoformat() if r.created_at else '',
        }

    def _create_payroll(self):
        try:
            data = json.loads(request.httprequest.data)
            vals = {
                'employee_id': int(data.get('employeeId', 0)) if data.get('employeeId') else False,
                'period': data.get('period', ''),
                'pay_type': data.get('payType', 'Salary'),
                'hourly_rate': data.get('hourlyRate', 0.0),
                'hours_worked': data.get('hoursWorked', 0.0),
                'basic_pay': data.get('basicPay', 0.0),
                'housing_allowance': data.get('housingAllowance', 0.0),
                'transport_allowance': data.get('transportAllowance', 0.0),
                'medical_allowance': data.get('medicalAllowance', 0.0),
                'other_allowances': data.get('otherAllowances', 0.0),
                'overtime': data.get('overtime', 0.0),
                'overtime2': data.get('overtime2', 0.0),
                'deductions': data.get('deductions', 0.0),
                'status': data.get('status', 'Draft'),
            }
            record = request.env['heyla.payroll.record'].sudo().create(vals)
            return http.Response(
                json.dumps(self._payroll_to_json(record)),
                content_type='application/json', status=201,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    @http.route('/api/payroll/<int:rec_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_payroll(self, rec_id):
        return _auth_required(lambda: self._update_payroll(rec_id))()

    def _update_payroll(self, rec_id):
        rec = request.env['heyla.payroll.record'].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
        field_map = {
            'basicPay': 'basic_pay', 'housingAllowance': 'housing_allowance',
            'transportAllowance': 'transport_allowance', 'medicalAllowance': 'medical_allowance',
            'otherAllowances': 'other_allowances', 'overtime': 'overtime', 'overtime2': 'overtime2',
            'deductions': 'deductions', 'status': 'status', 'period': 'period',
            'hoursWorked': 'hours_worked', 'hourlyRate': 'hourly_rate',
        }
        vals = {}
        for f, o in field_map.items():
            if f in data:
                vals[o] = data[f]
        if 'paidAt' in data:
            vals['paid_at'] = data['paidAt'] or False
        if vals:
            rec.sudo().write(vals)
        return http.Response(json.dumps(self._payroll_to_json(rec)), content_type='application/json', status=200)

    @http.route('/api/payroll/<int:rec_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_payroll(self, rec_id):
        return _auth_required(lambda: self._delete_payroll(rec_id))()

    def _delete_payroll(self, rec_id):
        rec = request.env['heyla.payroll.record'].sudo().browse(rec_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    @http.route('/api/payroll/payslips', type='http', auth='none', methods=['GET'], csrf=False)
    def get_payslips(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._payslip_to_json(p) for p in request.env['heyla.payslip'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    def _payslip_to_json(self, p):
        return {
            'id': str(p.id),
            'payrollRecordId': str(p.payroll_record_id.id) if p.payroll_record_id else '',
            'employeeId': str(p.employee_id.id) if p.employee_id else '',
            'payslipNumber': p.payslip_number or '',
            'period': p.period or '',
            'employeeName': p.employee_name or '',
            'payrollNumber': p.payroll_number or '',
            'department': p.department or '',
            'position': p.position or '',
            'basicPay': p.basic_pay,
            'housingAllowance': p.housing_allowance,
            'transportAllowance': p.transport_allowance,
            'medicalAllowance': p.medical_allowance,
            'otherAllowances': p.other_allowances,
            'overtime': p.overtime,
            'overtime2': p.overtime2,
            'grossPay': p.gross_pay,
            'paye': p.paye,
            'nssf': p.nssf,
            'nhif': p.nhif,
            'totalDeductions': p.total_deductions,
            'netPay': p.net_pay,
            'paidLeaveDays': p.paid_leave_days,
            'unpaidLeaveDays': p.unpaid_leave_days,
            'sickLeaveDays': p.sick_leave_days,
            'paymentDate': p.payment_date.isoformat() if p.payment_date else '',
            'companyName': p.company_name or '',
            'companyKraPin': p.company_kra_pin or '',
            'generatedAt': p.generated_at.isoformat() if p.generated_at else '',
        }

    @http.route('/api/payroll/generate-payslip', type='http', auth='none', methods=['POST'], csrf=False)
    def generate_payslip(self):
        return _auth_required(lambda: self._generate_payslip())()

    def _generate_payslip(self):
        try:
            data = json.loads(request.httprequest.data)
            record_id = int(data.get('recordId', 0))
            record = request.env['heyla.payroll.record'].sudo().browse(record_id)
            if not record.exists() or not record.employee_id:
                return http.Response(json.dumps({'error': 'Invalid record'}), content_type='application/json', status=404)

            emp = record.employee_id
            gross = record.gross_pay
            paye = gross * 0.3 if gross > 24000 else 0
            nssf = min(gross * 0.06, 2160)
            nhif = 1700 if gross >= 100000 else 900 if gross >= 60000 else 500
            total_ded = paye + nssf + nhif

            slip = request.env['heyla.payslip'].sudo().create({
                'payroll_record_id': record.id,
                'employee_id': emp.id,
                'payslip_number': f'SLIP-{record.id:05d}-{record.period or "0000"}',
                'period': record.period,
                'employee_name': emp.name,
                'payroll_number': emp.payroll_number,
                'department': emp.department,
                'position': emp.position,
                'basic_pay': record.basic_pay,
                'housing_allowance': record.housing_allowance,
                'transport_allowance': record.transport_allowance,
                'medical_allowance': record.medical_allowance,
                'other_allowances': record.other_allowances,
                'overtime': record.overtime,
                'overtime2': record.overtime2,
                'gross_pay': gross,
                'paye': paye,
                'nssf': nssf,
                'nhif': nhif,
                'total_deductions': total_ded,
                'net_pay': gross - total_ded,
                'paid_leave_days': emp.paid_leave_days,
                'unpaid_leave_days': emp.unpaid_leave_days,
                'sick_leave_days': emp.sick_leave_days,
                'payment_date': record.paid_at.date() if record.paid_at else False,
            })
            record.sudo().write({'payslip_generated_at': fields.Datetime.now(), 'status': 'Published'})
            return http.Response(
                json.dumps(self._payslip_to_json(slip)),
                content_type='application/json', status=201,
            )
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(
                json.dumps({'error': str(e)}),
                content_type='application/json', status=400,
            )

    # ---- Attendance ----
    @http.route('/api/attendance', type='http', auth='none', methods=['GET'], csrf=False)
    def get_attendance(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._attendance_to_json(a) for a in request.env['heyla.attendance'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/attendance', type='http', auth='none', methods=['POST'], csrf=False)
    def create_attendance(self):
        return _auth_required(lambda: self._create_attendance())()

    def _attendance_to_json(self, a):
        return {
            'id': str(a.id),
            'employeeId': str(a.employee_id.id) if a.employee_id else '',
            'date': a.date.isoformat() if a.date else '',
            'checkIn': a.check_in or '',
            'checkOut': a.check_out or '',
            'status': a.status or 'Present',
        }

    def _create_attendance(self):
        try:
            data = json.loads(request.httprequest.data)
            vals = {
                'employee_id': int(data.get('employeeId', 0)) if data.get('employeeId') else False,
                'date': data.get('date') or False,
                'check_in': data.get('checkIn', ''),
                'check_out': data.get('checkOut', ''),
                'status': data.get('status', 'Present'),
            }
            rec = request.env['heyla.attendance'].sudo().create(vals)
            return http.Response(json.dumps(self._attendance_to_json(rec)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/attendance/<int:att_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_attendance(self, att_id):
        return _auth_required(lambda: self._update_attendance(att_id))()

    def _update_attendance(self, att_id):
        rec = request.env['heyla.attendance'].sudo().browse(att_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
        vals = {}
        if 'checkIn' in data:
            vals['check_in'] = data['checkIn']
        if 'checkOut' in data:
            vals['check_out'] = data['checkOut']
        if 'status' in data:
            vals['status'] = data['status']
        if 'date' in data:
            vals['date'] = data['date']
        if vals:
            rec.sudo().write(vals)
        return http.Response(json.dumps(self._attendance_to_json(rec)), content_type='application/json', status=200)

    # ---- Employee Documents ----
    @http.route('/api/employee-documents/list/all', type='http', auth='none', methods=['GET'], csrf=False)
    def get_all_documents(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._doc_to_json(d) for d in request.env['heyla.employee.document'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/employee-documents/list/<int:emp_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def get_employee_documents(self, emp_id):
        return _auth_required(lambda: http.Response(
            json.dumps([self._doc_to_json(d) for d in request.env['heyla.employee.document'].sudo().search([('employee_id', '=', emp_id)])]),
            content_type='application/json', status=200,
        ))()

    def _doc_to_json(self, d):
        return {
            'id': str(d.id),
            'employeeId': str(d.employee_id.id) if d.employee_id else '',
            'originalName': d.original_name or '',
            'filename': d.filename or '',
            'mime': d.mime or '',
            'size': d.size or 0,
            'category': d.category or 'Other',
            'description': d.description or '',
            'uploadedBy': d.uploaded_by or '',
            'uploadedAt': d.uploaded_at.isoformat() if d.uploaded_at else '',
        }

    @http.route('/api/employee-documents/upload-multiple/<int:emp_id>', type='http', auth='none', methods=['POST'], csrf=False)
    def upload_documents(self, emp_id):
        return _auth_required(lambda: self._upload_documents(emp_id))()

    def _upload_documents(self, emp_id):
        try:
            emp = request.env['heyla.employee'].sudo().browse(emp_id)
            if not emp.exists():
                return http.Response(json.dumps({'error': 'Employee not found'}), content_type='application/json', status=404)

            file = request.httprequest.files.get('file')
            if not file:
                return http.Response(json.dumps({'error': 'No file provided'}), content_type='application/json', status=400)

            filename = file.filename
            mimetype = file.content_type or 'application/octet-stream'
            data = file.read()

            doc = request.env['heyla.employee.document'].sudo().create({
                'employee_id': emp.id,
                'original_name': filename,
                'filename': filename,
                'mime': mimetype,
                'size': len(data),
                'file_data': base64.b64encode(data).decode('utf-8') if isinstance(data, bytes) else data,
                'category': request.httprequest.form.get('category', 'Other'),
                'description': request.httprequest.form.get('description', ''),
                'uploaded_by': request.heyla_user.name if hasattr(request, 'heyla_user') else '',
            })
            return http.Response(
                json.dumps(self._doc_to_json(doc)),
                content_type='application/json', status=201,
            )
        except Exception as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/employee-documents/download/<int:doc_id>', type='http', auth='none', methods=['GET'], csrf=False)
    def download_document(self, doc_id):
        return _auth_required(lambda: self._download_document(doc_id))()

    def _download_document(self, doc_id):
        doc = request.env['heyla.employee.document'].sudo().browse(doc_id)
        if not doc.exists() or not doc.file_data:
            return http.Response(json.dumps({'error': 'Document not found'}), content_type='application/json', status=404)
        import base64
        headers = [('Content-Type', doc.mime or 'application/octet-stream'), ('Content-Disposition', f'attachment; filename="{doc.original_name}"')]
        return request.make_response(base64.b64decode(doc.file_data), headers)

    @http.route('/api/employee-documents/<int:doc_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_document(self, doc_id):
        return _auth_required(lambda: self._delete_document(doc_id))()

    def _delete_document(self, doc_id):
        doc = request.env['heyla.employee.document'].sudo().browse(doc_id)
        if not doc.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        doc.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ---- Leave ----
    @http.route('/api/leave', type='http', auth='none', methods=['GET'], csrf=False)
    def get_leaves(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._leave_to_json(l) for l in request.env['heyla.leave'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/leave', type='http', auth='none', methods=['POST'], csrf=False)
    def create_leave(self):
        return _auth_required(lambda: self._create_leave())()

    def _leave_to_json(self, l):
        return {
            'id': str(l.id),
            'employeeId': str(l.employee_id.id) if l.employee_id else '',
            'employeeName': l.employee_id.name if l.employee_id else '',
            'leaveType': l.leave_type or 'Annual',
            'startDate': l.start_date.isoformat() if l.start_date else '',
            'endDate': l.end_date.isoformat() if l.end_date else '',
            'reason': l.reason or '',
            'status': l.status or 'Pending',
            'days': l.days,
        }

    def _create_leave(self):
        try:
            data = json.loads(request.httprequest.data)
            vals = {
                'employee_id': int(data.get('employeeId', 0)) if data.get('employeeId') else False,
                'leave_type': data.get('leaveType', 'Annual'),
                'start_date': data.get('startDate') or False,
                'end_date': data.get('endDate') or False,
                'reason': data.get('reason', ''),
                'status': data.get('status', 'Pending'),
            }
            rec = request.env['heyla.leave'].sudo().create(vals)
            return http.Response(json.dumps(self._leave_to_json(rec)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/leave/<int:leave_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_leave(self, leave_id):
        return _auth_required(lambda: self._update_leave(leave_id))()

    def _update_leave(self, leave_id):
        rec = request.env['heyla.leave'].sudo().browse(leave_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
        if 'status' in data:
            rec.sudo().write({'status': data['status']})
        if 'reason' in data:
            rec.sudo().write({'reason': data['reason']})
        return http.Response(json.dumps(self._leave_to_json(rec)), content_type='application/json', status=200)

    # ---- WIBA Claims ----
    @http.route('/api/wiba-claims', type='http', auth='none', methods=['GET'], csrf=False)
    def get_wiba_claims(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._wiba_to_json(w) for w in request.env['heyla.wiba.claim'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/wiba-claims', type='http', auth='none', methods=['POST'], csrf=False)
    def create_wiba_claim(self):
        return _auth_required(lambda: self._create_wiba_claim())()

    def _wiba_to_json(self, w):
        return {
            'id': str(w.id),
            'employee': w.employee or '',
            'department': w.department or '',
            'claimType': w.claim_type or 'Medical',
            'description': w.description or '',
            'amount': w.amount,
            'status': w.status or 'Pending',
            'dateOfIncident': w.date_of_incident.isoformat() if w.date_of_incident else '',
            'dateFiled': w.date_filed.isoformat() if w.date_filed else '',
            'insurerRef': w.insurer_ref or '',
        }

    def _create_wiba_claim(self):
        try:
            data = json.loads(request.httprequest.data)
            w = request.env['heyla.wiba.claim'].sudo().create({
                'employee': data.get('employee', ''),
                'department': data.get('department', ''),
                'claim_type': data.get('claimType', 'Medical'),
                'description': data.get('description', ''),
                'amount': data.get('amount', 0.0),
                'status': data.get('status', 'Pending'),
                'date_of_incident': data.get('dateOfIncident') or False,
            })
            return http.Response(json.dumps(self._wiba_to_json(w)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/wiba-claims/<int:claim_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_wiba_claim(self, claim_id):
        return _auth_required(lambda: self._update_wiba_claim(claim_id))()

    def _update_wiba_claim(self, claim_id):
        rec = request.env['heyla.wiba.claim'].sudo().browse(claim_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
        if 'status' in data:
            rec.sudo().write({'status': data['status']})
        return http.Response(json.dumps(self._wiba_to_json(rec)), content_type='application/json', status=200)

    # ---- Injuries ----
    @http.route('/api/injuries', type='http', auth='none', methods=['GET'], csrf=False)
    def get_injuries(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._injury_to_json(i) for i in request.env['heyla.injury'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/injuries', type='http', auth='none', methods=['POST'], csrf=False)
    def create_injury(self):
        return _auth_required(lambda: self._create_injury())()

    def _injury_to_json(self, i):
        return {
            'id': str(i.id),
            'employee': i.employee or '',
            'department': i.department or '',
            'injuryType': i.injury_type or 'Minor',
            'bodyPart': i.body_part or '',
            'cause': i.cause or '',
            'location': i.location or '',
            'date': i.date.isoformat() if i.date else '',
            'daysLost': i.days_lost or 0,
            'status': i.status or 'Reported',
            'reportedBy': i.reported_by or '',
            'correctiveAction': i.corrective_action or '',
        }

    def _create_injury(self):
        try:
            data = json.loads(request.httprequest.data)
            i = request.env['heyla.injury'].sudo().create({
                'employee': data.get('employee', ''),
                'department': data.get('department', ''),
                'injury_type': data.get('injuryType', 'Minor'),
                'body_part': data.get('bodyPart', ''),
                'cause': data.get('cause', ''),
                'location': data.get('location', ''),
                'date': data.get('date') or False,
                'days_lost': data.get('daysLost', 0),
                'status': data.get('status', 'Reported'),
                'reported_by': data.get('reportedBy', ''),
                'corrective_action': data.get('correctiveAction', ''),
            })
            return http.Response(json.dumps(self._injury_to_json(i)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/injuries/<int:inj_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_injury(self, inj_id):
        return _auth_required(lambda: self._update_injury(inj_id))()

    def _update_injury(self, inj_id):
        rec = request.env['heyla.injury'].sudo().browse(inj_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
        if 'status' in data:
            rec.sudo().write({'status': data['status']})
        if 'correctiveAction' in data:
            rec.sudo().write({'corrective_action': data['correctiveAction']})
        return http.Response(json.dumps(self._injury_to_json(rec)), content_type='application/json', status=200)

    # ---- Performance Reviews ----
    @http.route('/api/performance-reviews', type='http', auth='none', methods=['GET'], csrf=False)
    def get_reviews(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._review_to_json(r) for r in request.env['heyla.performance.review'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/performance-reviews', type='http', auth='none', methods=['POST'], csrf=False)
    def create_review(self):
        return _auth_required(lambda: self._create_review())()

    def _review_to_json(self, r):
        return {
            'id': str(r.id),
            'employeeId': str(r.employee_id.id) if r.employee_id else '',
            'quarter': r.quarter or '',
            'rating': r.rating,
            'feedback': r.feedback or '',
            'goals': [{'id': str(g.id), 'title': g.title, 'progress': g.progress} for g in r.goal_ids],
        }

    def _create_review(self):
        try:
            data = json.loads(request.httprequest.data)
            review = request.env['heyla.performance.review'].sudo().create({
                'employee_id': int(data.get('employeeId', 0)) if data.get('employeeId') else False,
                'quarter': data.get('quarter', ''),
                'rating': data.get('rating', 0.0),
                'feedback': data.get('feedback', ''),
            })
            for g in data.get('goals', []):
                request.env['heyla.performance.goal'].sudo().create({
                    'review_id': review.id,
                    'title': g.get('title', ''),
                    'progress': g.get('progress', 0.0),
                })
            return http.Response(json.dumps(self._review_to_json(review)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/performance-reviews/<int:rev_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    def update_review(self, rev_id):
        return _auth_required(lambda: self._update_review(rev_id))()

    def _update_review(self, rev_id):
        rec = request.env['heyla.performance.review'].sudo().browse(rev_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        try:
            data = json.loads(request.httprequest.data)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)
        if 'rating' in data:
            rec.sudo().write({'rating': data['rating']})
        if 'feedback' in data:
            rec.sudo().write({'feedback': data['feedback']})
        if 'goals' in data:
            rec.goal_ids.sudo().unlink()
            for g in data['goals']:
                request.env['heyla.performance.goal'].sudo().create({
                    'review_id': rec.id,
                    'title': g.get('title', ''),
                    'progress': g.get('progress', 0.0),
                })
        return http.Response(json.dumps(self._review_to_json(rec)), content_type='application/json', status=200)

    @http.route('/api/performance-reviews/<int:rev_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_review(self, rev_id):
        return _auth_required(lambda: self._delete_review(rev_id))()

    def _delete_review(self, rev_id):
        rec = request.env['heyla.performance.review'].sudo().browse(rev_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)

    # ---- Blacklist ----
    @http.route('/api/blacklist', type='http', auth='none', methods=['GET'], csrf=False)
    def get_blacklist(self):
        return _auth_required(lambda: http.Response(
            json.dumps([self._blacklist_to_json(b) for b in request.env['heyla.blacklist'].sudo().search([])]),
            content_type='application/json', status=200,
        ))()

    @http.route('/api/blacklist', type='http', auth='none', methods=['POST'], csrf=False)
    def create_blacklist(self):
        return _auth_required(lambda: self._create_blacklist())()

    def _blacklist_to_json(self, b):
        return {
            'id': str(b.id),
            'name': b.name or '',
            'email': b.email or '',
            'reason': b.reason or '',
            'addedDate': b.added_date.isoformat() if b.added_date else '',
            'addedBy': b.added_by or '',
            'severity': b.severity or 'Medium',
        }

    def _create_blacklist(self):
        try:
            data = json.loads(request.httprequest.data)
            b = request.env['heyla.blacklist'].sudo().create({
                'name': data.get('name', ''),
                'email': data.get('email', ''),
                'reason': data.get('reason', ''),
                'added_by': data.get('addedBy', ''),
                'severity': data.get('severity', 'Medium'),
            })
            return http.Response(json.dumps(self._blacklist_to_json(b)), content_type='application/json', status=201)
        except (json.JSONDecodeError, Exception) as e:
            return http.Response(json.dumps({'error': str(e)}), content_type='application/json', status=400)

    @http.route('/api/blacklist/<int:bl_id>', type='http', auth='none', methods=['DELETE'], csrf=False)
    def delete_blacklist(self, bl_id):
        return _auth_required(lambda: self._delete_blacklist(bl_id))()

    def _delete_blacklist(self, bl_id):
        rec = request.env['heyla.blacklist'].sudo().browse(bl_id)
        if not rec.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        rec.sudo().unlink()
        return http.Response(json.dumps({'ok': True}), content_type='application/json', status=200)
