import { useState, useRef, useEffect } from 'react';
import { useEmployeeStore } from '@/store/employeeStore';
import { usePayrollStore } from '@/store/payrollStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import {
  DollarSign, Clock, Users, Receipt, Save, Edit3, Trash2, Plus, X, ArrowRight,
  Calendar, Ban, Stethoscope, Printer, FileText, Search, Send, Download, CheckCircle2, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Employee, Payslip } from '@/types';

type PageTab = 'setup' | 'payslips';
type PayTab = 'hourly' | 'basic';

function countWorkingDays(year: number, month: number): number {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

function getMonthRange(period: string): { start: string; end: string } {
  const [y, m] = period.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const start = `${period}-01`;
  const end = `${period}-${String(daysInMonth).padStart(2, '0')}`;
  return { start, end };
}

export default function HRPayrollPage() {
  const [pageTab, setPageTab] = useState<PageTab>('setup');
  const [tab, setTab] = useState<PayTab>('hourly');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [hoursWorked, setHoursWorked] = useState<Record<string, number>>({});
  const [overtime, setOvertime] = useState<Record<string, number>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ employeeId: '', rate: 0, transport: 0, housing: 0, medical: 0, other: 0 });
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [payrollNumberSearch, setPayrollNumberSearch] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const employees = useEmployeeStore((s) => s.employees);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
  const { records, payslips, publishPayroll, fetchRecords, fetchPayslips, getRecordsByPeriod, getPayslipsByPeriod, getPayslipByEmployee } = usePayrollStore();
  const { records: attendanceRecords, fetchRecords: fetchAttendance, getRecordsByEmployeeAndPeriod } = useAttendanceStore();
  const activeEmployees = employees.filter((e) => e.status === 'Active');

  const employeeMap = Object.fromEntries(employees.map((e) => [e.id, e]));

  useEffect(() => {
    fetchRecords();
    fetchPayslips();
    fetchAttendance();
  }, []);

  const periodRange = getMonthRange(period);
  const workingDays = countWorkingDays(Number(period.split('-')[0]), Number(period.split('-')[1]));

  const getActiveDaysFor = (employeeId: string) => {
    const empRecords = attendanceRecords.filter(
      (r) => r.employeeId === employeeId && r.date >= periodRange.start && r.date <= periodRange.end
    );
    const active = empRecords.filter((r) => r.status !== 'Absent').length;
    const absent = empRecords.filter((r) => r.status === 'Absent').length;
    return { active, absent, total: empRecords.length, workingDays };
  };

  const prorate = (fullAmount: number, activeDays: number): number => {
    if (workingDays === 0 || activeDays === 0) return 0;
    return (fullAmount / workingDays) * activeDays;
  };

  const hourlyEmployees = activeEmployees.filter((e) => e.payType === 'Hourly');
  const basicEmployees = activeEmployees.filter((e) => e.payType === 'Basic' || e.payType === 'Salary');

  const totalHourlyCost = hourlyEmployees.reduce((s, e) => {
    const { active } = getActiveDaysFor(e.id);
    const effectiveDays = active || workingDays;
    const hrs = prorate(hoursWorked[e.id] || 160, effectiveDays);
    const ot = overtime[e.id] || 0;
    return s + (e.hourlyRate || 0) * Math.min(hrs, 208) + (e.hourlyRate || 0) * 1.5 * ot;
  }, 0);

  const totalBasicCost = basicEmployees.reduce((s, e) => {
    const { active } = getActiveDaysFor(e.id);
    const effectiveDays = active || workingDays;
    const fullPay = (e.baseSalary || 0) + (e.housingAllowance || 0) + (e.transportAllowance || 0) + (e.medicalAllowance || 0) + (e.otherAllowances || 0);
    return s + prorate(fullPay, effectiveDays);
  }, 0);

  const startEdit = (e: Employee) => {
    setEditingId(e.id);
    setExpandedId(e.id);
    setEditValues({
      hourlyRate: e.hourlyRate,
      baseSalary: e.baseSalary,
      transportAllowance: e.transportAllowance,
      otherAllowances: e.otherAllowances,
      housingAllowance: e.housingAllowance,
      medicalAllowance: e.medicalAllowance,
      paidLeaveDays: e.paidLeaveDays,
      unpaidLeaveDays: e.unpaidLeaveDays,
      sickLeaveDays: e.sickLeaveDays,
    });
  };

  const saveEdit = (id: string) => {
    updateEmployee(id, editValues);
    setEditingId(null);
    setExpandedId(null);
    setEditValues({});
    toast.success('Payroll rate updated');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setExpandedId(null);
    setEditValues({});
  };

  const resetEmployeePay = (id: string) => {
    if (!confirm('Reset pay data for this employee?')) return;
    updateEmployee(id, {
      hourlyRate: 0, baseSalary: 0, transportAllowance: 0,
      housingAllowance: 0, medicalAllowance: 0, otherAllowances: 0,
    });
    toast.success('Pay data reset');
  };

  const handleAddToPayroll = () => {
    if (!addForm.employeeId) { toast.error('Select an employee'); return; }
    const emp = employees.find((e) => e.id === addForm.employeeId);
    if (!emp) return;
    if (tab === 'hourly') {
      updateEmployee(emp.id, { payType: 'Hourly', hourlyRate: addForm.rate });
    } else {
      updateEmployee(emp.id, {
        payType: 'Salary', baseSalary: addForm.rate,
        transportAllowance: addForm.transport, housingAllowance: addForm.housing,
        medicalAllowance: addForm.medical, otherAllowances: addForm.other,
      });
    }
    setShowAddModal(false);
    setAddForm({ employeeId: '', rate: 0, transport: 0, housing: 0, medical: 0, other: 0 });
    toast.success(`${emp.firstName} ${emp.lastName} added to ${tab === 'hourly' ? 'Hourly' : 'Basic'} payroll`);
  };

  const handlePublish = () => {
    const currentList = tab === 'hourly' ? hourlyEmployees : basicEmployees;
    if (currentList.length === 0) { toast.error('No employees to publish'); return; }
    const draftRecords = currentList.map((e) => {
      const { active } = getActiveDaysFor(e.id);
      const effectiveDays = active || workingDays;
      const hrs = tab === 'hourly' ? prorate(hoursWorked[e.id] || 160, effectiveDays) : 0;
      const ot = overtime[e.id] || 0;
      const gross = tab === 'hourly'
        ? (e.hourlyRate || 0) * Math.min(hrs, 208) + (e.hourlyRate || 0) * 1.5 * ot
        : prorate((e.baseSalary || 0) + (e.housingAllowance || 0) + (e.transportAllowance || 0) + (e.medicalAllowance || 0) + (e.otherAllowances || 0), effectiveDays);
      const deductions = Math.max(0, (gross - 24000) * 0.3) + Math.min(gross * 0.06, 2160) + 1700;
      return {
        id: `tmp-${e.id}-${Date.now()}`,
        employeeId: e.id,
        period,
        payType: e.payType,
        hourlyRate: e.hourlyRate || 0,
        hoursWorked: Math.round(hrs),
        basicPay: tab === 'hourly' ? 0 : Math.round(prorate(e.baseSalary || 0, effectiveDays)),
        housingAllowance: tab === 'hourly' ? 0 : Math.round(prorate(e.housingAllowance || 0, effectiveDays)),
        transportAllowance: tab === 'hourly' ? 0 : Math.round(prorate(e.transportAllowance || 0, effectiveDays)),
        medicalAllowance: tab === 'hourly' ? 0 : Math.round(prorate(e.medicalAllowance || 0, effectiveDays)),
        otherAllowances: tab === 'hourly' ? 0 : Math.round(prorate(e.otherAllowances || 0, effectiveDays)),
        overtime: ot,
        grossPay: Math.round(gross),
        deductions: Math.round(deductions),
        netPay: Math.round(gross - deductions),
        status: 'Published' as const,
        createdAt: new Date().toISOString(),
      };
    });
    publishPayroll(draftRecords);
  };

  const handlePrintPayslip = (p: Payslip) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(buildPayslipHtml(p));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const handlePrintAll = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const html = filteredPayslips.map(buildPayslipHtml).join('<div style="page-break-after: always;"></div>');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const currentPeriodPayslips = getPayslipsByPeriod(period);
  const allPayslips = payslips;
  const filteredPayslips = payrollNumberSearch
    ? allPayslips.filter((p) => p.payrollNumber.includes(payrollNumberSearch) || p.employeeName.toLowerCase().includes(payrollNumberSearch.toLowerCase()))
    : allPayslips;

  const availableForTab = employees.filter((e) => {
    if (e.status !== 'Active') return false;
    return tab === 'hourly' ? e.payType !== 'Hourly' : e.payType !== 'Basic' && e.payType !== 'Salary';
  });

  const currentList = tab === 'hourly' ? hourlyEmployees : basicEmployees;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="HR Payroll"
        description={pageTab === 'setup' ? 'Configure and publish payroll' : 'View and print payslips'}
      >
        {pageTab === 'setup' ? (
          <button onClick={() => setShowAddModal(true)}
            className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add to Payroll
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handlePrintAll} disabled={allPayslips.length === 0}
              className="border border-border px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors disabled:opacity-50">
              <Printer className="w-4 h-4" /> Print All
            </button>
            <button onClick={() => {
              const csv = exportPayslipsCsv(allPayslips);
              downloadCsv(csv, `payslips_${period}.csv`);
            }} disabled={allPayslips.length === 0}
              className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
              <Download className="w-4 h-4" /> Export All
            </button>
          </div>
        )}
      </PageHeader>

      {/* Page tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setPageTab('setup')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${pageTab === 'setup' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          <Receipt className="w-4 h-4" /> Payroll Setup
        </button>
        <button onClick={() => setPageTab('payslips')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${pageTab === 'payslips' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          <FileText className="w-4 h-4" /> Payslips ({allPayslips.length})
        </button>
      </div>

      {pageTab === 'setup' ? (
        <>
          {/* Pay type tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
            <button onClick={() => setTab('hourly')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'hourly' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Clock className="w-4 h-4" /> Hourly Rate
            </button>
            <button onClick={() => setTab('basic')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'basic' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Users className="w-4 h-4" /> Basic / General
            </button>
          </div>

          {/* Period + summary */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Pay Period:</label>
              <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{workingDays} working days</span>
              <span className="text-xs">(Mon-Fri)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {tab === 'hourly' ? (
              <>
                <StatCard title="Hourly Workers" value={String(hourlyEmployees.length)} description="Active employees" icon={Clock} />
                <StatCard title="Est. Monthly Cost" value={formatCurrency(totalHourlyCost)} description="Prorated by active days" icon={DollarSign} iconColor="gradient-primary" />
                <StatCard title="Avg Hourly Rate" value={hourlyEmployees.length ? formatCurrency(Math.round(hourlyEmployees.reduce((s, e) => s + (e.hourlyRate || 0), 0) / hourlyEmployees.length)) : 'KSh 0'} description="Across all hourly workers" icon={Users} />
                <StatCard title="Working Days" value={`${workingDays}`} description="Mon-Fri this period" icon={Calendar} />
              </>
            ) : (
              <>
                <StatCard title="Basic/Salary Workers" value={String(basicEmployees.length)} description="Active employees" icon={Users} />
                <StatCard title="Est. Monthly Cost" value={formatCurrency(totalBasicCost)} description="Prorated by active days" icon={DollarSign} iconColor="gradient-primary" />
                <StatCard title="Avg Salary" value={basicEmployees.length ? formatCurrency(Math.round(basicEmployees.reduce((s, e) => s + (e.baseSalary || 0), 0) / basicEmployees.length)) : 'KSh 0'} description="Base salary average" icon={Clock} />
                <StatCard title="Working Days" value={`${workingDays}`} description="Mon-Fri this period" icon={Calendar} />
              </>
            )}
          </div>

          {/* Employee Table */}
          {currentList.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No {tab === 'hourly' ? 'Hourly' : 'Basic'} Employees</h3>
              <p className="text-muted-foreground mb-4">No employees on this pay type yet. Add employees to the payroll group.</p>
              <button onClick={() => setShowAddModal(true)}
                className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 hover:opacity-90">
                <Plus className="w-4 h-4" /> Add Employee
              </button>
            </div>
          ) : (
            <div className="glass rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  {tab === 'hourly' ? <Clock className="w-4 h-4 text-blue-500" /> : <Users className="w-4 h-4 text-green-500" />}
                  {tab === 'hourly' ? 'Hourly Rate Employees' : 'Basic / General Employees'}
                  <span className="text-xs font-normal text-muted-foreground">({currentList.length} employee{currentList.length > 1 ? 's' : ''})</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">
                        <span className="flex items-center justify-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Active / {workingDays}
                        </span>
                      </th>
                      {tab === 'hourly' ? (
                        <>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Hourly Rate</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Hours/Month</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Overtime</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Est. Gross</th>
                        </>
                      ) : (
                        <>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Base Salary</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Housing</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Transport</th>
                          <th className="text-center px-4 py-3 font-medium text-muted-foreground">Medical</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Other</th>
                          <th className="text-right px-4 py-3 font-medium text-muted-foreground">Prorated Total</th>
                        </>
                      )}
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.map((e) => {
                      const isEditing = editingId === e.id;
                      const { active, absent } = getActiveDaysFor(e.id);
                      const effectiveDays = active || workingDays;
                      const isExpanded = expandedId === e.id && isEditing;

                      const rawGross = tab === 'hourly'
                        ? ((hoursWorked[e.id] || 160) * (e.hourlyRate || 0)) + ((overtime[e.id] || 0) * (e.hourlyRate || 0) * 1.5)
                        : (e.baseSalary || 0) + (e.housingAllowance || 0) + (e.transportAllowance || 0) + (e.medicalAllowance || 0) + (e.otherAllowances || 0);

                      const proratedGross = tab === 'hourly'
                        ? ((hoursWorked[e.id] || 160) * (e.hourlyRate || 0)) * (effectiveDays / workingDays) + ((overtime[e.id] || 0) * (e.hourlyRate || 0) * 1.5)
                        : prorate(rawGross, effectiveDays);

                      return (
                        <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0 mt-0.5">
                                {e.firstName[0]}{e.lastName[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm">{e.firstName} {e.lastName}</p>
                                <p className="text-xs text-muted-foreground truncate">{e.position} · {e.department}</p>
                                {isExpanded ? (
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Calendar className="w-3 h-3 text-blue-500" />
                                      <input type="number" value={editValues.paidLeaveDays ?? 0}
                                        onChange={(ev) => setEditValues({ ...editValues, paidLeaveDays: Number(ev.target.value) })}
                                        className="w-14 px-1 py-0.5 rounded border border-input bg-background text-xs text-center" min={0} />
                                      <span>paid</span>
                                    </label>
                                    <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Ban className="w-3 h-3 text-amber-500" />
                                      <input type="number" value={editValues.unpaidLeaveDays ?? 0}
                                        onChange={(ev) => setEditValues({ ...editValues, unpaidLeaveDays: Number(ev.target.value) })}
                                        className="w-14 px-1 py-0.5 rounded border border-input bg-background text-xs text-center" min={0} />
                                      <span>absent</span>
                                    </label>
                                    <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Stethoscope className="w-3 h-3 text-green-500" />
                                      <input type="number" value={editValues.sickLeaveDays ?? 0}
                                        onChange={(ev) => setEditValues({ ...editValues, sickLeaveDays: Number(ev.target.value) })}
                                        className="w-14 px-1 py-0.5 rounded border border-input bg-background text-xs text-center" min={0} />
                                      <span>sick</span>
                                    </label>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                                      <Calendar className="w-3 h-3" /> {e.paidLeaveDays} paid
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                                      <Ban className="w-3 h-3" /> {e.unpaidLeaveDays} absent
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                                      <Stethoscope className="w-3 h-3" /> {e.sickLeaveDays} sick
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Active Days Column */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              {active > 0 || absent > 0 ? (
                                <>
                                  <span className="font-medium text-sm flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-success" /> {active}
                                  </span>
                                  {absent > 0 && (
                                    <span className="text-[10px] flex items-center gap-0.5 text-destructive">
                                      <XCircle className="w-2.5 h-2.5" /> {absent} absent
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-muted-foreground">{workingDays}</span>
                              )}
                            </div>
                          </td>

                          {tab === 'hourly' ? (
                            <>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <input type="number" value={editValues.hourlyRate || 0}
                                    onChange={(ev) => setEditValues({ ...editValues, hourlyRate: Number(ev.target.value) })}
                                    className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                                ) : (
                                  <span className="font-medium">{formatCurrency(e.hourlyRate || 0)}<span className="text-xs text-muted-foreground">/hr</span></span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input type="number" value={hoursWorked[e.id] ?? 160}
                                  onChange={(ev) => setHoursWorked({ ...hoursWorked, [e.id]: Number(ev.target.value) })}
                                  className="w-20 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} max={744} />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input type="number" value={overtime[e.id] ?? 0}
                                  onChange={(ev) => setOvertime({ ...overtime, [e.id]: Number(ev.target.value) })}
                                  className="w-20 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="font-medium text-primary">{formatCurrency(proratedGross)}</span>
                                {effectiveDays !== workingDays && (
                                  <p className="text-[10px] text-muted-foreground">prorated</p>
                                )}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <input type="number" value={editValues.baseSalary || 0}
                                    onChange={(ev) => setEditValues({ ...editValues, baseSalary: Number(ev.target.value) })}
                                    className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                                ) : (<span className="font-medium">{formatCurrency(e.baseSalary || 0)}</span>)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <input type="number" value={editValues.housingAllowance || 0}
                                    onChange={(ev) => setEditValues({ ...editValues, housingAllowance: Number(ev.target.value) })}
                                    className="w-20 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                                ) : (<span className="text-sm">{formatCurrency(e.housingAllowance || 0)}</span>)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <input type="number" value={editValues.transportAllowance || 0}
                                    onChange={(ev) => setEditValues({ ...editValues, transportAllowance: Number(ev.target.value) })}
                                    className="w-20 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                                ) : (<span className="text-sm">{formatCurrency(e.transportAllowance || 0)}</span>)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <input type="number" value={editValues.medicalAllowance || 0}
                                    onChange={(ev) => setEditValues({ ...editValues, medicalAllowance: Number(ev.target.value) })}
                                    className="w-20 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                                ) : (<span className="text-sm">{formatCurrency(e.medicalAllowance || 0)}</span>)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <input type="number" value={editValues.otherAllowances || 0}
                                    onChange={(ev) => setEditValues({ ...editValues, otherAllowances: Number(ev.target.value) })}
                                    className="w-20 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                                ) : (<span className="text-sm">{formatCurrency(e.otherAllowances || 0)}</span>)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="font-medium text-primary">{formatCurrency(proratedGross)}</span>
                                {effectiveDays !== workingDays && (
                                  <p className="text-[10px] text-muted-foreground">prorated</p>
                                )}
                              </td>
                            </>
                          )}

                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {isEditing ? (
                                <>
                                  <button onClick={() => saveEdit(e.id)} className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-colors" title="Save"><Save className="w-3.5 h-3.5" /></button>
                                  <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Cancel"><X className="w-3.5 h-3.5" /></button>
                                </>
                              ) : (
                                <button onClick={() => startEdit(e)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                              )}
                              <button onClick={() => resetEmployeePay(e.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Reset pay data"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {tab === 'basic' && (
                    <tfoot>
                      <tr className="bg-muted/30 font-bold">
                        <td className="px-4 py-3">Total</td>
                        <td className="px-4 py-3" />
                        <td className="px-4 py-3 text-center">{formatCurrency(basicEmployees.reduce((s, e) => s + (e.baseSalary || 0), 0))}</td>
                        <td className="px-4 py-3 text-center">{formatCurrency(basicEmployees.reduce((s, e) => s + (e.housingAllowance || 0), 0))}</td>
                        <td className="px-4 py-3 text-center">{formatCurrency(basicEmployees.reduce((s, e) => s + (e.transportAllowance || 0), 0))}</td>
                        <td className="px-4 py-3 text-center">{formatCurrency(basicEmployees.reduce((s, e) => s + (e.medicalAllowance || 0), 0))}</td>
                        <td className="px-4 py-3 text-center">{formatCurrency(basicEmployees.reduce((s, e) => s + (e.otherAllowances || 0), 0))}</td>
                        <td className="px-4 py-3 text-right text-primary">{formatCurrency(totalBasicCost)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* Publish to Accounting */}
          {currentList.length > 0 && (
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-muted-foreground mb-2">
                Publish this {tab === 'hourly' ? 'hourly' : 'basic'} payroll for <strong>{period}</strong>.
                Pay is prorated by active days from attendance. Accounting will process payments and generate payslips.
              </p>
              <button onClick={handlePublish}
                className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4" />
                Publish {tab === 'hourly' ? 'Hourly' : 'Basic'} Payroll
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Add to Payroll Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
              <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h2 className="text-lg font-bold">Add to {tab === 'hourly' ? 'Hourly' : 'Basic'} Payroll</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddToPayroll(); }} className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Employee</label>
                    <select value={addForm.employeeId} onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select employee...</option>
                      {availableForTab.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} · {emp.department}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{tab === 'hourly' ? 'Hourly Rate (KSh)' : 'Base Salary (KSh)'}</label>
                    <input type="number" value={addForm.rate || ''} onChange={(e) => setAddForm({ ...addForm, rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" min={0} />
                  </div>
                  {tab === 'basic' && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Housing', field: 'housing' as const },
                        { label: 'Transport', field: 'transport' as const },
                        { label: 'Medical', field: 'medical' as const },
                        { label: 'Other', field: 'other' as const },
                      ].map((f) => (
                        <div key={f.field}>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label} Allowance</label>
                          <input type="number" value={(addForm as any)[f.field] || ''} onChange={(e) => setAddForm({ ...addForm, [f.field]: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" min={0} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                    <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add to Payroll</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ========== PAYSLIPS TAB ========== */
        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search by payroll number or name..."
                  value={payrollNumberSearch} onChange={(e) => setPayrollNumberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Period:</label>
                <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-sm w-40" />
              </div>
              <button onClick={handlePrintAll} disabled={filteredPayslips.length === 0}
                className="border border-border px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors disabled:opacity-50">
                <Printer className="w-4 h-4" /> Print All
              </button>
            </div>
          </div>

          {filteredPayslips.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payslips Yet</h3>
              <p className="text-muted-foreground">Payslips appear here once Accounting processes the published payroll and generates them.</p>
            </div>
          ) : (
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payslip #</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Payroll #</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Gross</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Deductions</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Net Pay</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Print</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayslips.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{p.payslipNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{p.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{p.department}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs">{p.payrollNumber}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(p.grossPay)}</td>
                        <td className="px-4 py-3 text-right text-destructive">{formatCurrency(p.totalDeductions)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(p.netPay)}</td>
                        <td className="px-4 py-3 text-center text-xs">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => { setSelectedPayslip(p); setShowPayslipModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View & Print">
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showPayslipModal && selectedPayslip && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
              <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
                  <h2 className="text-lg font-bold">Payslip — {selectedPayslip.employeeName}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handlePrintPayslip(selectedPayslip)}
                      className="border border-border px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button onClick={() => setShowPayslipModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div ref={printRef} className="p-6">
                  <PayslipDocument payslip={selectedPayslip} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {pageTab === 'payslips' && !selectedPayslip && filteredPayslips.length > 0 && (
        <div className="hidden">
          {filteredPayslips.map((p) => (
            <div key={p.id} className="p-6 mb-8 border-b border-gray-300">
              <PayslipDocument payslip={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildPayslipHtml(p: Payslip): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 8px">${label}</td><td style="padding:4px 8px;text-align:right">${value}</td></tr>`;
  const boldRow = (label: string, value: string, color = '#000') =>
    `<tr style="font-weight:700;border-top:1px solid #ccc"><td style="padding:6px 8px">${label}</td><td style="padding:6px 8px;text-align:right;color:${color}">${value}</td></tr>`;

  const paymentDate = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-';
  const generated = new Date(p.generatedAt).toLocaleString();

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payslip - ${p.employeeName}</title>
<style>
  @page { margin: 15mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #222; margin: 0; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px; }
  .header h2 { margin: 0; font-size: 20px; }
  .header p { margin: 4px 0 0; color: #666; font-size: 12px; }
  .header h3 { margin: 8px 0 0; font-size: 16px; }
  .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
  .info div { flex: 1; }
  .info .right { text-align: right; }
  .info p { margin: 3px 0; }
  .info strong { color: #000; }
  .info .muted { color: #666; }
  .tables { display: flex; gap: 24px; margin-bottom: 16px; }
  .tables > div { flex: 1; }
  .tables h4 { border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 0 0 8px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .footer { border-top: 2px solid #333; padding-top: 12px; text-align: right; }
  .footer .net { font-size: 18px; font-weight: 700; }
  .footer .net span { color: #2563eb; }
  .footer .gen { font-size: 11px; color: #888; margin-top: 4px; }
</style></head><body>
  <div class="header">
    <h2>${p.companyName || 'HEYLA OS SOLUTIONS LTD'}</h2>
    <p>KRA PIN: ${p.companyKraPin || 'A123456789Z'}</p>
    <h3>PAYSLIP — ${p.period}</h3>
  </div>
  <div class="info">
    <div>
      <p><span class="muted">Employee:</span> <strong>${p.employeeName}</strong></p>
      <p><span class="muted">Payroll No:</span> <strong>${p.payrollNumber}</strong></p>
      <p><span class="muted">Department:</span> ${p.department}</p>
      <p><span class="muted">Position:</span> ${p.position}</p>
    </div>
    <div class="right">
      <p><span class="muted">Payslip #:</span> <strong>${p.payslipNumber}</strong></p>
      <p><span class="muted">Period:</span> ${p.period}</p>
      <p><span class="muted">Payment Date:</span> ${paymentDate}</p>
      <p><span class="muted">Leave:</span> ${p.paidLeaveDays}p / ${p.unpaidLeaveDays}a / ${p.sickLeaveDays}s</p>
    </div>
  </div>
  <div class="tables">
    <div>
      <h4>EARNINGS</h4>
      <table>
        ${row('Basic Salary', formatCurrency(p.basicPay))}
        ${row('Housing Allowance', formatCurrency(p.housingAllowance))}
        ${row('Transport Allowance', formatCurrency(p.transportAllowance))}
        ${row('Medical Allowance', formatCurrency(p.medicalAllowance))}
        ${row('Other Allowances', formatCurrency(p.otherAllowances))}
        ${p.overtime > 0 ? row('Overtime', formatCurrency(p.overtime)) : ''}
        ${boldRow('GROSS PAY', formatCurrency(p.grossPay), '#2563eb')}
      </table>
    </div>
    <div>
      <h4>DEDUCTIONS</h4>
      <table>
        ${row('PAYE (Tax)', formatCurrency(p.paye))}
        ${row('NSSF', formatCurrency(p.nssf))}
        ${row('NHIF', formatCurrency(p.nhif))}
        ${boldRow('TOTAL DEDUCTIONS', formatCurrency(p.totalDeductions), '#dc2626')}
      </table>
    </div>
  </div>
  <div class="footer">
    <p class="net">NET PAY: <span>${formatCurrency(p.netPay)}</span></p>
    <p class="gen">Generated on ${generated}</p>
  </div>
</body></html>`;
}

function PayslipDocument({ payslip: p }: { payslip: Payslip }) {
  return (
    <div className="text-sm">
      <div className="text-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold">{p.companyName || 'HEYLA OS SOLUTIONS LTD'}</h2>
        <p className="text-muted-foreground">KRA PIN: {p.companyKraPin || 'A123456789Z'}</p>
        <h3 className="text-lg font-semibold mt-2">PAYSLIP — {p.period}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p><span className="text-muted-foreground">Employee:</span> <strong>{p.employeeName}</strong></p>
          <p><span className="text-muted-foreground">Payroll No:</span> <strong>{p.payrollNumber}</strong></p>
          <p><span className="text-muted-foreground">Department:</span> {p.department}</p>
          <p><span className="text-muted-foreground">Position:</span> {p.position}</p>
        </div>
        <div className="text-right">
          <p><span className="text-muted-foreground">Payslip #:</span> <strong>{p.payslipNumber}</strong></p>
          <p><span className="text-muted-foreground">Period:</span> {p.period}</p>
          <p><span className="text-muted-foreground">Payment Date:</span> {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}</p>
          <p><span className="text-muted-foreground">Leave:</span> {p.paidLeaveDays}p / {p.unpaidLeaveDays}a / {p.sickLeaveDays}s</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-semibold mb-2 border-b pb-1">EARNINGS</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1">Basic Salary</td><td className="text-right">{formatCurrency(p.basicPay)}</td></tr>
              <tr><td className="py-1">Housing Allowance</td><td className="text-right">{formatCurrency(p.housingAllowance)}</td></tr>
              <tr><td className="py-1">Transport Allowance</td><td className="text-right">{formatCurrency(p.transportAllowance)}</td></tr>
              <tr><td className="py-1">Medical Allowance</td><td className="text-right">{formatCurrency(p.medicalAllowance)}</td></tr>
              <tr><td className="py-1">Other Allowances</td><td className="text-right">{formatCurrency(p.otherAllowances)}</td></tr>
              {p.overtime > 0 && <tr><td className="py-1">Overtime</td><td className="text-right">{formatCurrency(p.overtime)}</td></tr>}
              <tr className="border-t font-bold"><td className="py-2">GROSS PAY</td><td className="text-right text-primary">{formatCurrency(p.grossPay)}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="font-semibold mb-2 border-b pb-1">DEDUCTIONS</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1">PAYE (Tax)</td><td className="text-right">{formatCurrency(p.paye)}</td></tr>
              <tr><td className="py-1">NSSF</td><td className="text-right">{formatCurrency(p.nssf)}</td></tr>
              <tr><td className="py-1">NHIF</td><td className="text-right">{formatCurrency(p.nhif)}</td></tr>
              <tr className="border-t font-bold"><td className="py-2">TOTAL DEDUCTIONS</td><td className="text-right text-destructive">{formatCurrency(p.totalDeductions)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-t pt-4 text-right">
        <p className="text-lg font-bold">NET PAY: <span className="text-primary">{formatCurrency(p.netPay)}</span></p>
        <p className="text-xs text-muted-foreground mt-1">Generated on {new Date(p.generatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}

function exportPayslipsCsv(payslips: Payslip[]): string {
  const headers = [
    'PayslipNumber', 'Period', 'EmployeeName', 'PayrollNumber', 'Department', 'Position',
    'BasicPay', 'HousingAllowance', 'TransportAllowance', 'MedicalAllowance', 'OtherAllowances',
    'Overtime', 'GrossPay', 'PAYE', 'NSSF', 'NHIF', 'TotalDeductions', 'NetPay',
    'PaidLeaveDays', 'UnpaidLeaveDays', 'SickLeaveDays', 'PaymentDate'
  ];
  const rows = payslips.map((p) => [
    p.payslipNumber, p.period, p.employeeName, p.payrollNumber, p.department, p.position,
    p.basicPay, p.housingAllowance, p.transportAllowance, p.medicalAllowance, p.otherAllowances,
    p.overtime, p.grossPay, p.paye, p.nssf, p.nhif, p.totalDeductions, p.netPay,
    p.paidLeaveDays, p.unpaidLeaveDays, p.sickLeaveDays, p.paymentDate
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}