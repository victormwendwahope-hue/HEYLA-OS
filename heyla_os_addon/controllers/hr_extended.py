import json
from odoo import fields, http
from odoo.http import request
from .auth import _auth_required


class BonusController(http.Controller):

    @http.route('/api/bonus-types', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_bonus_types(self):
        types = request.env['heyla.bonus.type'].sudo().search([])
        return http.Response(json.dumps([{
            'id': t.id, 'name': t.name, 'code': t.code,
            'category': t.category, 'calculationBasis': t.calculation_basis,
            'defaultAmount': t.default_amount, 'defaultPercentage': t.default_percentage,
            'taxable': t.taxable, 'isActive': t.is_active,
        } for t in types]), content_type='application/json')

    @http.route('/api/bonus-types', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_bonus_type(self):
        data = json.loads(request.httprequest.data)
        bt = request.env['heyla.bonus.type'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'category': data.get('category', 'performance'),
            'calculation_basis': data.get('calculationBasis', 'fixed_amount'),
            'default_amount': data.get('defaultAmount', 0),
            'default_percentage': data.get('defaultPercentage', 0),
            'taxable': data.get('taxable', True),
        })
        return http.Response(json.dumps({'id': bt.id}), content_type='application/json', status=201)

    @http.route('/api/employee-bonuses', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_bonuses(self):
        bonuses = request.env['heyla.employee.bonus'].sudo().search([])
        return http.Response(json.dumps([{
            'id': b.id, 'bonusNumber': b.bonus_number,
            'employeeId': b.employee_id.id, 'employeeName': b.employee_name,
            'bonusType': b.bonus_type_name, 'category': b.category,
            'amount': b.amount, 'currency': b.currency,
            'period': b.period, 'awardDate': str(b.award_date) if b.award_date else '',
            'status': b.status,
        } for b in bonuses]), content_type='application/json')

    @http.route('/api/employee-bonuses', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_bonus(self):
        data = json.loads(request.httprequest.data)
        bonus = request.env['heyla.employee.bonus'].sudo().create({
            'employee_id': data.get('employeeId'),
            'bonus_type_id': data.get('bonusTypeId'),
            'amount': data.get('amount', 0),
            'currency': data.get('currency', 'KES'),
            'period': data.get('period', ''),
            'reason': data.get('reason', ''),
            'status': data.get('status', 'draft'),
        })
        return http.Response(json.dumps({'id': bonus.id, 'bonusNumber': bonus.bonus_number}), content_type='application/json', status=201)

    @http.route('/api/employee-bonuses/<int:bonus_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_employee_bonus(self, bonus_id):
        data = json.loads(request.httprequest.data)
        bonus = request.env['heyla.employee.bonus'].sudo().browse(bonus_id)
        if not bonus.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'paid_in_payroll', 'payroll_period', 'paid_date', 'approved_by', 'notes']:
            if f in data:
                writable[f] = data[f]
        bonus.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')


class TerminalBenefitController(http.Controller):

    @http.route('/api/terminal-benefit-types', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_terminal_benefit_types(self):
        types = request.env['heyla.terminal.benefit.type'].sudo().search([])
        return http.Response(json.dumps([{
            'id': t.id, 'name': t.name, 'code': t.code,
            'category': t.category, 'calculationMethod': t.calculation_method,
            'daysPerYear': t.days_per_year,
            'minServiceMonths': t.min_service_months,
            'taxable': t.taxable,
        } for t in types]), content_type='application/json')

    @http.route('/api/terminal-benefits', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_terminal_benefits(self):
        benefits = request.env['heyla.employee.terminal.benefit'].sudo().search([])
        return http.Response(json.dumps([{
            'id': b.id, 'benefitNumber': b.benefit_number,
            'employeeId': b.employee_id.id, 'employeeName': b.employee_name,
            'category': b.category, 'terminationDate': str(b.termination_date) if b.termination_date else '',
            'reason': b.reason_for_exit,
            'serviceYears': b.service_years,
            'monthlySalary': b.monthly_salary,
            'calculatedAmount': b.calculated_amount,
            'totalAmount': b.total_amount,
            'status': b.status,
        } for b in benefits]), content_type='application/json')

    @http.route('/api/terminal-benefits', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_terminal_benefit(self):
        data = json.loads(request.httprequest.data)
        tb = request.env['heyla.employee.terminal.benefit'].sudo().create({
            'employee_id': data.get('employeeId'),
            'benefit_type_id': data.get('benefitTypeId'),
            'termination_date': data.get('terminationDate'),
            'start_date': data.get('startDate'),
            'reason_for_exit': data.get('reason', 'resignation'),
            'monthly_salary': data.get('monthlySalary', 0),
            'adjustments': data.get('adjustments', 0),
        })
        return http.Response(json.dumps({'id': tb.id, 'benefitNumber': tb.benefit_number}), content_type='application/json', status=201)

    @http.route('/api/terminal-benefits/<int:tb_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_terminal_benefit(self, tb_id):
        data = json.loads(request.httprequest.data)
        tb = request.env['heyla.employee.terminal.benefit'].sudo().browse(tb_id)
        if not tb.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'paid', 'paid_date', 'paid_in_payroll', 'payroll_period', 'approved_by', 'adjustments', 'notes']:
            if f in data:
                writable[f] = data[f]
        tb.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')


class CasualWorkerController(http.Controller):

    @http.route('/api/casual-workers', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_casual_workers(self):
        workers = request.env['heyla.casual.worker'].sudo().search([])
        return http.Response(json.dumps([{
            'id': w.id, 'workerNumber': w.worker_number,
            'firstName': w.first_name, 'lastName': w.last_name, 'name': w.name,
            'phone': w.phone, 'dailyRate': w.daily_rate,
            'currency': w.currency, 'isActive': w.is_active,
            'totalDaysWorked': w.total_days_worked, 'totalPaid': w.total_paid,
        } for w in workers]), content_type='application/json')

    @http.route('/api/casual-workers', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_casual_worker(self):
        data = json.loads(request.httprequest.data)
        worker = request.env['heyla.casual.worker'].sudo().create({
            'first_name': data.get('firstName'), 'last_name': data.get('lastName'),
            'phone': data.get('phone'), 'daily_rate': data.get('dailyRate', 0),
            'currency': data.get('currency', 'KES'),
            'department': data.get('department', ''),
            'engagement_type': data.get('engagementType', 'casual'),
        })
        return http.Response(json.dumps({'id': worker.id}), content_type='application/json', status=201)

    @http.route('/api/casual-workers/<int:worker_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_casual_worker(self, worker_id):
        data = json.loads(request.httprequest.data)
        w = request.env['heyla.casual.worker'].sudo().browse(worker_id)
        if not w.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        w.write({k.replace('isActive', 'is_active').replace('dailyRate', 'daily_rate'): v for k, v in data.items() if k in ['dailyRate', 'isActive', 'phone', 'department', 'bankName', 'bankAccount']})
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/casual-attendance', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_casual_attendance(self):
        records = request.env['heyla.casual.attendance'].sudo().search([])
        return http.Response(json.dumps([{
            'id': a.id, 'workerId': a.worker_id.id, 'workerName': a.worker_name,
            'date': str(a.date) if a.date else '',
            'hoursWorked': a.hours_worked, 'amountEarned': a.amount_earned,
            'overtimeHours': a.overtime_hours,
        } for a in records]), content_type='application/json')

    @http.route('/api/casual-attendance', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_casual_attendance(self):
        data = json.loads(request.httprequest.data)
        rec = request.env['heyla.casual.attendance'].sudo().create({
            'worker_id': data.get('workerId'), 'date': data.get('date'),
            'clock_in': data.get('clockIn'), 'clock_out': data.get('clockOut'),
            'overtime_hours': data.get('overtimeHours', 0),
        })
        return http.Response(json.dumps({'id': rec.id}), content_type='application/json', status=201)

    @http.route('/api/casual-payments', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_casual_payments(self):
        payments = request.env['heyla.casual.payment'].sudo().search([])
        return http.Response(json.dumps([{
            'id': p.id, 'paymentNumber': p.payment_number,
            'workerId': p.worker_id.id, 'workerName': p.worker_name,
            'periodStart': str(p.period_start) if p.period_start else '',
            'periodEnd': str(p.period_end) if p.period_end else '',
            'grossAmount': p.gross_amount, 'deductions': p.deductions,
            'netAmount': p.net_amount, 'paid': p.paid, 'status': p.status,
        } for p in payments]), content_type='application/json')

    @http.route('/api/casual-payments', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_casual_payment(self):
        data = json.loads(request.httprequest.data)
        pay = request.env['heyla.casual.payment'].sudo().create({
            'worker_id': data.get('workerId'),
            'period_start': data.get('periodStart'),
            'period_end': data.get('periodEnd'),
            'days_worked': data.get('daysWorked', 0),
            'total_hours': data.get('totalHours', 0),
            'gross_amount': data.get('grossAmount', 0),
            'deductions': data.get('deductions', 0),
            'net_amount': data.get('netAmount', 0),
            'payment_method': data.get('paymentMethod', 'cash'),
        })
        return http.Response(json.dumps({'id': pay.id}), content_type='application/json', status=201)


class OvertimeController(http.Controller):

    @http.route('/api/overtime-policies', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_overtime_policies(self):
        policies = request.env['heyla.overtime.policy'].sudo().search([])
        return http.Response(json.dumps([{
            'id': p.id, 'name': p.name, 'code': p.code,
            'rateMultiplier': p.rate_multiplier,
            'applicableDays': p.applicable_days,
            'requiresApproval': p.requires_approval,
            'isActive': p.is_active,
        } for p in policies]), content_type='application/json')

    @http.route('/api/overtime-policies', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_overtime_policy(self):
        data = json.loads(request.httprequest.data)
        p = request.env['heyla.overtime.policy'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'rate_multiplier': data.get('rateMultiplier', 1.5),
            'applicable_days': data.get('applicableDays', 'weekday'),
            'after_hours': data.get('afterHours', 8),
            'requires_approval': data.get('requiresApproval', True),
        })
        return http.Response(json.dumps({'id': p.id}), content_type='application/json', status=201)

    @http.route('/api/employee-overtime', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_overtime(self):
        records = request.env['heyla.employee.overtime'].sudo().search([])
        return http.Response(json.dumps([{
            'id': o.id, 'employeeId': o.employee_id.id, 'employeeName': o.employee_name,
            'date': str(o.date) if o.date else '',
            'totalHours': o.total_hours, 'overtimeType': o.overtime_type,
            'multiplier': o.multiplier, 'hourlyRate': o.hourly_rate,
            'amount': o.amount, 'currency': o.currency,
            'approved': o.approved, 'paidInPayroll': o.paid_in_payroll,
        } for o in records]), content_type='application/json')

    @http.route('/api/employee-overtime', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_overtime(self):
        data = json.loads(request.httprequest.data)
        ot = request.env['heyla.employee.overtime'].sudo().create({
            'employee_id': data.get('employeeId'),
            'date': data.get('date'),
            'start_time': data.get('startTime'),
            'end_time': data.get('endTime'),
            'overtime_type': data.get('overtimeType', 'weekday'),
            'multiplier': data.get('multiplier', 1.5),
            'reason': data.get('reason', ''),
        })
        return http.Response(json.dumps({'id': ot.id}), content_type='application/json', status=201)


class SalaryStructureController(http.Controller):

    @http.route('/api/pay-grades', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_pay_grades(self):
        grades = request.env['heyla.pay.grade'].sudo().search([])
        return http.Response(json.dumps([{
            'id': g.id, 'name': g.name, 'code': g.code, 'level': g.level,
            'minSalary': g.min_salary, 'maxSalary': g.max_salary,
            'currency': g.currency,
            'annualIncrement': g.annual_increment,
            'department': g.department,
        } for g in grades]), content_type='application/json')

    @http.route('/api/pay-grades', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_pay_grade(self):
        data = json.loads(request.httprequest.data)
        g = request.env['heyla.pay.grade'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'level': data.get('level', 1),
            'min_salary': data.get('minSalary', 0),
            'max_salary': data.get('maxSalary', 0),
            'currency': data.get('currency', 'KES'),
            'department': data.get('department', ''),
        })
        return http.Response(json.dumps({'id': g.id}), content_type='application/json', status=201)

    @http.route('/api/salary-components', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_salary_components(self):
        comps = request.env['heyla.salary.component'].sudo().search([])
        return http.Response(json.dumps([{
            'id': c.id, 'name': c.name, 'code': c.code,
            'category': c.category, 'type': c.type,
            'defaultAmount': c.default_amount,
            'defaultPercentage': c.default_percentage,
            'taxable': c.taxable, 'isMandatory': c.is_mandatory,
        } for c in comps]), content_type='application/json')

    @http.route('/api/salary-components', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_salary_component(self):
        data = json.loads(request.httprequest.data)
        c = request.env['heyla.salary.component'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'category': data.get('category', 'earning'),
            'type': data.get('type', 'fixed'),
            'default_amount': data.get('defaultAmount', 0),
            'default_percentage': data.get('defaultPercentage', 0),
            'taxable': data.get('taxable', True),
        })
        return http.Response(json.dumps({'id': c.id}), content_type='application/json', status=201)

    @http.route('/api/employee-salary-structures', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_salary_structures(self):
        structs = request.env['heyla.employee.salary.structure'].sudo().search([])
        return http.Response(json.dumps([{
            'id': s.id, 'employeeId': s.employee_id.id, 'employeeName': s.employee_name,
            'payGrade': s.pay_grade_id.name if s.pay_grade_id else '',
            'effectiveDate': str(s.effective_date) if s.effective_date else '',
            'baseSalary': s.base_salary, 'currency': s.currency,
            'totalEarnings': s.total_earnings,
            'totalDeductions': s.total_deductions,
            'netSalary': s.net_salary,
        } for s in structs]), content_type='application/json')

    @http.route('/api/employee-salary-structures', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_salary_structure(self):
        data = json.loads(request.httprequest.data)
        s = request.env['heyla.employee.salary.structure'].sudo().create({
            'employee_id': data.get('employeeId'),
            'pay_grade_id': data.get('payGradeId'),
            'effective_date': data.get('effectiveDate'),
            'base_salary': data.get('baseSalary', 0),
            'currency': data.get('currency', 'KES'),
        })
        for comp in data.get('components', []):
            request.env['heyla.employee.salary.component'].sudo().create({
                'structure_id': s.id,
                'component_id': comp.get('componentId'),
                'amount': comp.get('amount', 0),
                'percentage': comp.get('percentage', 0),
            })
        return http.Response(json.dumps({'id': s.id}), content_type='application/json', status=201)


class BenefitController(http.Controller):

    @http.route('/api/benefit-plans', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_benefit_plans(self):
        plans = request.env['heyla.benefit.plan'].sudo().search([])
        return http.Response(json.dumps([{
            'id': p.id, 'name': p.name, 'code': p.code,
            'category': p.category, 'provider': p.provider,
            'costPerEmployee': p.cost_per_employee,
            'employerContribution': p.employer_contribution,
            'currency': p.currency,
        } for p in plans]), content_type='application/json')

    @http.route('/api/benefit-plans', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_benefit_plan(self):
        data = json.loads(request.httprequest.data)
        p = request.env['heyla.benefit.plan'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'category': data.get('category', 'health_insurance'),
            'provider': data.get('provider', ''),
            'cost_per_employee': data.get('costPerEmployee', 0),
            'employer_contribution': data.get('employerContribution', 100),
            'currency': data.get('currency', 'KES'),
        })
        return http.Response(json.dumps({'id': p.id}), content_type='application/json', status=201)

    @http.route('/api/employee-benefits', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_benefits(self):
        benefits = request.env['heyla.employee.benefit'].sudo().search([])
        return http.Response(json.dumps([{
            'id': b.id, 'employeeId': b.employee_id.id, 'employeeName': b.employee_name,
            'planId': b.plan_id.id, 'planName': b.plan_name,
            'category': b.category,
            'employeeCost': b.employee_cost, 'employerCost': b.employer_cost,
            'totalCost': b.total_cost, 'status': b.status,
        } for b in benefits]), content_type='application/json')

    @http.route('/api/employee-benefits', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_benefit(self):
        data = json.loads(request.httprequest.data)
        b = request.env['heyla.employee.benefit'].sudo().create({
            'employee_id': data.get('employeeId'),
            'plan_id': data.get('planId'),
            'opt_in': data.get('optIn', True),
            'coverage_start': data.get('coverageStart'),
            'coverage_end': data.get('coverageEnd'),
        })
        return http.Response(json.dumps({'id': b.id}), content_type='application/json', status=201)

    @http.route('/api/employee-benefits/<int:ben_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_employee_benefit(self, ben_id):
        data = json.loads(request.httprequest.data)
        b = request.env['heyla.employee.benefit'].sudo().browse(ben_id)
        if not b.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'opt_in', 'coverage_start', 'coverage_end']:
            if f in data:
                writable[f] = data[f]
        b.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/employee-dependents', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_dependents(self):
        deps = request.env['heyla.employee.dependent'].sudo().search([])
        return http.Response(json.dumps([{
            'id': d.id, 'employeeId': d.employee_id.id,
            'name': d.name, 'relationship': d.relationship,
            'dateOfBirth': str(d.date_of_birth) if d.date_of_birth else '',
        } for d in deps]), content_type='application/json')

    @http.route('/api/employee-dependents', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_dependent(self):
        data = json.loads(request.httprequest.data)
        d = request.env['heyla.employee.dependent'].sudo().create({
            'employee_id': data.get('employeeId'),
            'name': data.get('name'),
            'relationship': data.get('relationship'),
            'date_of_birth': data.get('dateOfBirth'),
            'national_id': data.get('nationalId', ''),
        })
        return http.Response(json.dumps({'id': d.id}), content_type='application/json', status=201)


class DisciplinaryController(http.Controller):

    @http.route('/api/disciplinary-types', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_disciplinary_types(self):
        types = request.env['heyla.disciplinary.type'].sudo().search([])
        return http.Response(json.dumps([{
            'id': t.id, 'name': t.name, 'code': t.code,
            'severity': t.severity, 'category': t.category,
            'typicalAction': t.typical_action,
        } for t in types]), content_type='application/json')

    @http.route('/api/disciplinary-cases', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_disciplinary_cases(self):
        cases = request.env['heyla.disciplinary.case'].sudo().search([])
        return http.Response(json.dumps([{
            'id': c.id, 'caseNumber': c.case_number,
            'employeeId': c.employee_id.id, 'employeeName': c.employee_name,
            'category': c.category, 'severity': c.severity,
            'incidentDate': str(c.incident_date) if c.incident_date else '',
            'actionTaken': c.action_taken, 'status': c.status,
        } for c in cases]), content_type='application/json')

    @http.route('/api/disciplinary-cases', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_disciplinary_case(self):
        data = json.loads(request.httprequest.data)
        c = request.env['heyla.disciplinary.case'].sudo().create({
            'employee_id': data.get('employeeId'),
            'disciplinary_type_id': data.get('disciplinaryTypeId'),
            'incident_date': data.get('incidentDate'),
            'description': data.get('description'),
            'reported_by': data.get('reportedBy', ''),
            'action_taken': data.get('actionTaken', ''),
        })
        return http.Response(json.dumps({'id': c.id}), content_type='application/json', status=201)

    @http.route('/api/disciplinary-cases/<int:case_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_disciplinary_case(self, case_id):
        data = json.loads(request.httprequest.data)
        c = request.env['heyla.disciplinary.case'].sudo().browse(case_id)
        if not c.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'action_taken', 'outcome', 'approved_by', 'notes']:
            if f in data:
                writable[f] = data[f]
        c.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/grievances', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_grievances(self):
        grievances = request.env['heyla.grievance'].sudo().search([])
        return http.Response(json.dumps([{
            'id': g.id, 'grievanceNumber': g.grievance_number,
            'employeeId': g.employee_id.id, 'employeeName': g.employee_name,
            'grievanceType': g.grievance_type, 'subject': g.subject,
            'status': g.status,
        } for g in grievances]), content_type='application/json')

    @http.route('/api/grievances', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_grievance(self):
        data = json.loads(request.httprequest.data)
        g = request.env['heyla.grievance'].sudo().create({
            'employee_id': data.get('employeeId'),
            'grievance_type': data.get('grievanceType', 'other'),
            'subject': data.get('subject'),
            'description': data.get('description'),
            'incident_date': data.get('incidentDate'),
            'is_confidential': data.get('isConfidential', False),
        })
        return http.Response(json.dumps({'id': g.id}), content_type='application/json', status=201)

    @http.route('/api/grievances/<int:griev_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_grievance(self, griev_id):
        data = json.loads(request.httprequest.data)
        g = request.env['heyla.grievance'].sudo().browse(griev_id)
        if not g.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'resolution', 'resolved_by', 'notes']:
            if f in data:
                writable[f] = data[f]
        g.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')


class TrainingController(http.Controller):

    @http.route('/api/training-courses', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_training_courses(self):
        courses = request.env['heyla.training.course'].sudo().search([])
        return http.Response(json.dumps([{
            'id': c.id, 'name': c.name, 'code': c.code,
            'category': c.category, 'durationHours': c.duration_hours,
            'durationDays': c.duration_days, 'deliveryMethod': c.delivery_method,
            'provider': c.provider, 'costPerParticipant': c.cost_per_participant,
            'certificationOffered': c.certification_offered,
            'isMandatory': c.is_mandatory,
        } for c in courses]), content_type='application/json')

    @http.route('/api/training-courses', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_training_course(self):
        data = json.loads(request.httprequest.data)
        c = request.env['heyla.training.course'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'category': data.get('category', 'technical'),
            'duration_hours': data.get('durationHours', 0),
            'duration_days': data.get('durationDays', 0),
            'delivery_method': data.get('deliveryMethod', 'in_person'),
            'provider': data.get('provider', ''),
            'cost_per_participant': data.get('costPerParticipant', 0),
            'certification_offered': data.get('certificationOffered', False),
        })
        return http.Response(json.dumps({'id': c.id}), content_type='application/json', status=201)

    @http.route('/api/training-sessions', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_training_sessions(self):
        sessions = request.env['heyla.training.session'].sudo().search([])
        return http.Response(json.dumps([{
            'id': s.id, 'name': s.name,
            'courseId': s.course_id.id, 'trainer': s.trainer,
            'startDate': str(s.start_date) if s.start_date else '',
            'endDate': str(s.end_date) if s.end_date else '',
            'location': s.location, 'status': s.status,
        } for s in sessions]), content_type='application/json')

    @http.route('/api/training-sessions', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_training_session(self):
        data = json.loads(request.httprequest.data)
        s = request.env['heyla.training.session'].sudo().create({
            'name': data.get('name'),
            'course_id': data.get('courseId'),
            'trainer': data.get('trainer', ''),
            'start_date': data.get('startDate'),
            'end_date': data.get('endDate'),
            'location': data.get('location', ''),
        })
        return http.Response(json.dumps({'id': s.id}), content_type='application/json', status=201)

    @http.route('/api/employee-training', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_training(self):
        records = request.env['heyla.employee.training'].sudo().search([])
        return http.Response(json.dumps([{
            'id': r.id, 'employeeId': r.employee_id.id, 'employeeName': r.employee_name,
            'courseId': r.course_id.id, 'courseName': r.course_name,
            'enrollmentDate': str(r.enrollment_date) if r.enrollment_date else '',
            'completionDate': str(r.completion_date) if r.completion_date else '',
            'status': r.status, 'score': r.score, 'grade': r.grade,
            'certificateNumber': r.certificate_number,
        } for r in records]), content_type='application/json')

    @http.route('/api/employee-training', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_training(self):
        data = json.loads(request.httprequest.data)
        r = request.env['heyla.employee.training'].sudo().create({
            'employee_id': data.get('employeeId'),
            'course_id': data.get('courseId'),
            'session_id': data.get('sessionId'),
            'status': data.get('status', 'enrolled'),
        })
        return http.Response(json.dumps({'id': r.id}), content_type='application/json', status=201)

    @http.route('/api/employee-training/<int:rec_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_employee_training(self, rec_id):
        data = json.loads(request.httprequest.data)
        r = request.env['heyla.employee.training'].sudo().browse(rec_id)
        if not r.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'completion_date', 'score', 'grade', 'certificate_number', 'feedback']:
            if f in data:
                writable[f] = data[f]
        r.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/employee-certifications', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_certifications(self):
        certs = request.env['heyla.employee.certification'].sudo().search([])
        return http.Response(json.dumps([{
            'id': c.id, 'employeeId': c.employee_id.id, 'employeeName': c.employee_name,
            'name': c.name, 'issuingBody': c.issuing_body,
            'certificateNumber': c.certificate_number,
            'issueDate': str(c.issue_date) if c.issue_date else '',
            'expiryDate': str(c.expiry_date) if c.expiry_date else '',
        } for c in certs]), content_type='application/json')

    @http.route('/api/employee-certifications', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_certification(self):
        data = json.loads(request.httprequest.data)
        c = request.env['heyla.employee.certification'].sudo().create({
            'employee_id': data.get('employeeId'),
            'name': data.get('name'),
            'issuing_body': data.get('issuingBody', ''),
            'certificate_number': data.get('certificateNumber', ''),
            'issue_date': data.get('issueDate'),
            'expiry_date': data.get('expiryDate'),
            'never_expires': data.get('neverExpires', False),
        })
        return http.Response(json.dumps({'id': c.id}), content_type='application/json', status=201)


class AssetController(http.Controller):

    @http.route('/api/asset-categories', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_asset_categories(self):
        cats = request.env['heyla.asset.category'].sudo().search([])
        return http.Response(json.dumps([{
            'id': c.id, 'name': c.name, 'code': c.code,
            'depreciationMethod': c.depreciation_method,
            'usefulLifeYears': c.useful_life_years,
        } for c in cats]), content_type='application/json')

    @http.route('/api/asset-categories', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_asset_category(self):
        data = json.loads(request.httprequest.data)
        c = request.env['heyla.asset.category'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'depreciation_method': data.get('depreciationMethod', 'straight_line'),
            'useful_life_years': data.get('usefulLifeYears', 5),
        })
        return http.Response(json.dumps({'id': c.id}), content_type='application/json', status=201)

    @http.route('/api/company-assets', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_company_assets(self):
        assets = request.env['heyla.company.asset'].sudo().search([])
        return http.Response(json.dumps([{
            'id': a.id, 'assetNumber': a.asset_number, 'name': a.name,
            'category': a.category_id.name if a.category_id else '',
            'serialNumber': a.serial_number,
            'purchaseDate': str(a.purchase_date) if a.purchase_date else '',
            'purchaseCost': a.purchase_cost, 'currency': a.currency,
            'condition': a.condition, 'location': a.location, 'status': a.status,
        } for a in assets]), content_type='application/json')

    @http.route('/api/company-assets', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_company_asset(self):
        data = json.loads(request.httprequest.data)
        a = request.env['heyla.company.asset'].sudo().create({
            'name': data.get('name'),
            'category_id': data.get('categoryId'),
            'serial_number': data.get('serialNumber', ''),
            'model': data.get('model', ''),
            'manufacturer': data.get('manufacturer', ''),
            'purchase_date': data.get('purchaseDate'),
            'purchase_cost': data.get('purchaseCost', 0),
            'currency': data.get('currency', 'KES'),
            'location': data.get('location', ''),
        })
        return http.Response(json.dumps({'id': a.id}), content_type='application/json', status=201)

    @http.route('/api/company-assets/<int:asset_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_company_asset(self, asset_id):
        data = json.loads(request.httprequest.data)
        a = request.env['heyla.company.asset'].sudo().browse(asset_id)
        if not a.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'condition', 'location', 'current_value', 'notes']:
            if f in data:
                writable[f] = data[f]
        a.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/asset-assignments', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_asset_assignments(self):
        assigns = request.env['heyla.employee.asset.assignment'].sudo().search([])
        return http.Response(json.dumps([{
            'id': a.id, 'assetId': a.asset_id.id, 'assetName': a.asset_name,
            'employeeId': a.employee_id.id, 'employeeName': a.employee_name,
            'assignedDate': str(a.assigned_date) if a.assigned_date else '',
            'returnedDate': str(a.returned_date) if a.returned_date else '',
            'status': a.status,
        } for a in assigns]), content_type='application/json')

    @http.route('/api/asset-assignments', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_asset_assignment(self):
        data = json.loads(request.httprequest.data)
        a = request.env['heyla.employee.asset.assignment'].sudo().create({
            'asset_id': data.get('assetId'),
            'employee_id': data.get('employeeId'),
            'assigned_date': data.get('assignedDate'),
            'expected_return_date': data.get('expectedReturnDate'),
            'condition_on_assignment': data.get('conditionOnAssignment', 'good'),
        })
        return http.Response(json.dumps({'id': a.id}), content_type='application/json', status=201)

    @http.route('/api/asset-assignments/<int:assign_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_asset_assignment(self, assign_id):
        data = json.loads(request.httprequest.data)
        a = request.env['heyla.employee.asset.assignment'].sudo().browse(assign_id)
        if not a.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['returned_date', 'condition_on_return', 'status', 'notes']:
            if f in data:
                writable[f] = data[f]
        a.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')


class ExitController(http.Controller):

    @http.route('/api/exit-types', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_exit_types(self):
        types = request.env['heyla.exit.type'].sudo().search([])
        return http.Response(json.dumps([{
            'id': t.id, 'name': t.name, 'code': t.code,
            'noticePeriodDays': t.notice_period_days,
            'requiresClearance': t.requires_clearance,
            'requiresExitInterview': t.requires_exit_interview,
        } for t in types]), content_type='application/json')

    @http.route('/api/employee-exits', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_exits(self):
        exits = request.env['heyla.employee.exit'].sudo().search([])
        return http.Response(json.dumps([{
            'id': e.id, 'exitNumber': e.exit_number,
            'employeeId': e.employee_id.id, 'employeeName': e.employee_name,
            'reason': e.reason, 'noticeDate': str(e.notice_date) if e.notice_date else '',
            'lastWorkingDate': str(e.last_working_date) if e.last_working_date else '',
            'status': e.status,
        } for e in exits]), content_type='application/json')

    @http.route('/api/employee-exits', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_exit(self):
        data = json.loads(request.httprequest.data)
        e = request.env['heyla.employee.exit'].sudo().create({
            'employee_id': data.get('employeeId'),
            'exit_type_id': data.get('exitTypeId'),
            'reason': data.get('reason', 'resignation'),
            'reason_details': data.get('reasonDetails', ''),
            'notice_date': data.get('noticeDate'),
            'last_working_date': data.get('lastWorkingDate'),
            'notice_period_days': data.get('noticePeriodDays', 30),
        })
        return http.Response(json.dumps({'id': e.id}), content_type='application/json', status=201)

    @http.route('/api/employee-exits/<int:exit_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_employee_exit(self, exit_id):
        data = json.loads(request.httprequest.data)
        e = request.env['heyla.employee.exit'].sudo().browse(exit_id)
        if not e.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'exit_date', 'last_working_date', 'is_eligible_for_rehire', 'final_settlement_amount', 'settlement_paid', 'notes']:
            if f in data:
                writable[f] = data[f]
        e.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')

    @http.route('/api/exit-checklists/<int:exit_id>', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_exit_checklists(self, exit_id):
        items = request.env['heyla.exit.checklist'].sudo().search([('exit_id', '=', exit_id)], order='sequence')
        return http.Response(json.dumps([{
            'id': i.id, 'taskName': i.task_name, 'category': i.category,
            'assignedTo': i.assigned_to, 'completed': i.completed,
            'completedBy': i.completed_by, 'completedDate': str(i.completed_date) if i.completed_date else '',
        } for i in items]), content_type='application/json')

    @http.route('/api/exit-interviews/<int:exit_id>', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_exit_interviews(self, exit_id):
        interviews = request.env['heyla.exit.interview'].sudo().search([('exit_id', '=', exit_id)])
        return http.Response(json.dumps([{
            'id': i.id, 'interviewDate': str(i.interview_date) if i.interview_date else '',
            'interviewer': i.interviewer,
            'reasonForLeaving': i.reason_for_leaving,
            'overallSatisfaction': i.overall_satisfaction,
        } for i in interviews]), content_type='application/json')


class JobRequisitionController(http.Controller):

    @http.route('/api/job-requisitions', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_job_requisitions(self):
        reqs = request.env['heyla.job.requisition'].sudo().search([])
        return http.Response(json.dumps([{
            'id': r.id, 'requisitionNumber': r.requisition_number,
            'title': r.title, 'department': r.department,
            'employmentType': r.employment_type,
            'vacanciesCount': r.vacancies_count,
            'location': r.location,
            'urgency': r.urgency, 'status': r.status,
        } for r in reqs]), content_type='application/json')

    @http.route('/api/job-requisitions', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_job_requisition(self):
        data = json.loads(request.httprequest.data)
        r = request.env['heyla.job.requisition'].sudo().create({
            'title': data.get('title'),
            'department': data.get('department', ''),
            'reporting_to': data.get('reportingTo', ''),
            'employment_type': data.get('employmentType', 'full_time'),
            'contract_type': data.get('contractType', 'permanent'),
            'vacancies_count': data.get('vacanciesCount', 1),
            'location': data.get('location', ''),
            'min_salary': data.get('minSalary', 0),
            'max_salary': data.get('maxSalary', 0),
            'currency': data.get('currency', 'KES'),
            'urgency': data.get('urgency', 'medium'),
            'justification': data.get('justification', ''),
            'qualifications': data.get('qualifications', ''),
            'responsibilities': data.get('responsibilities', ''),
            'skills_required': data.get('skillsRequired', ''),
            'requested_by': data.get('requestedBy', ''),
        })
        return http.Response(json.dumps({'id': r.id}), content_type='application/json', status=201)

    @http.route('/api/job-requisitions/<int:req_id>', type='http', auth='none', methods=['PATCH'], csrf=False)
    @_auth_required
    def update_job_requisition(self, req_id):
        data = json.loads(request.httprequest.data)
        r = request.env['heyla.job.requisition'].sudo().browse(req_id)
        if not r.exists():
            return http.Response(json.dumps({'error': 'Not found'}), content_type='application/json', status=404)
        writable = {}
        for f in ['status', 'approved_by', 'rejection_reason', 'notes']:
            if f in data:
                writable[f] = data[f]
        r.write(writable)
        return http.Response(json.dumps({'ok': True}), content_type='application/json')


class ClassificationController(http.Controller):

    @http.route('/api/employee-classifications', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employee_classifications(self):
        classes = request.env['heyla.employee.classification'].sudo().search([])
        return http.Response(json.dumps([{
            'id': c.id, 'name': c.name, 'code': c.code,
            'taxCategory': c.tax_category,
            'nssfApplicable': c.nssf_applicable,
            'nhifApplicable': c.nhif_applicable,
            'housingLevyApplicable': c.housing_levy_applicable,
            'payeApplicable': c.paye_applicable,
        } for c in classes]), content_type='application/json')

    @http.route('/api/employee-classifications', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employee_classification(self):
        data = json.loads(request.httprequest.data)
        c = request.env['heyla.employee.classification'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'tax_category': data.get('taxCategory', 'resident'),
        })
        return http.Response(json.dumps({'id': c.id}), content_type='application/json', status=201)

    @http.route('/api/employment-terms', type='http', auth='none', methods=['GET'], csrf=False)
    @_auth_required
    def get_employment_terms(self):
        terms = request.env['heyla.employment.term'].sudo().search([])
        return http.Response(json.dumps([{
            'id': t.id, 'name': t.name, 'code': t.code,
            'contractType': t.contract_type,
            'probationMonths': t.probation_months,
            'noticePeriodDays': t.notice_period_days,
            'leaveEntitlementDays': t.leave_entitlement_days,
        } for t in terms]), content_type='application/json')

    @http.route('/api/employment-terms', type='http', auth='none', methods=['POST'], csrf=False)
    @_auth_required
    def create_employment_term(self):
        data = json.loads(request.httprequest.data)
        t = request.env['heyla.employment.term'].sudo().create({
            'name': data.get('name'), 'code': data.get('code', ''),
            'contract_type': data.get('contractType', 'permanent'),
            'probation_months': data.get('probationMonths', 3),
            'notice_period_days': data.get('noticePeriodDays', 30),
            'leave_entitlement_days': data.get('leaveEntitlementDays', 21),
        })
        return http.Response(json.dumps({'id': t.id}), content_type='application/json', status=201)
