import { useState, useEffect } from 'react';
import { PageHeader, StatCard, StatusBadge, EmptyState } from '@/components/shared/CommonUI';
import { useEmployeeStore } from '@/store/employeeStore';
import { usePayrollStore } from '@/store/payrollStore';
import { formatCurrency } from '@/utils/countries';
import { apiBaseUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DollarSign, Calculator, Download, Receipt, CheckCircle, FileText, Printer, X } from 'lucide-react';
import { toast } from 'sonner';
import { Payslip } from '@/types';

export default function PayrollPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const { records, payslips, fetchRecords, fetchPayslips, getRecordsByPeriod, payRecord, generatePayslip } = usePayrollStore();

  const [exporting, setExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [showPayslip, setShowPayslip] = useState<Payslip | null>(null);

  useEffect(() => {
    fetchRecords();
    fetchPayslips();
  }, []);

  const allPeriods = [...new Set(records.map((r) => r.period))].sort().reverse();

  useEffect(() => {
    if (!selectedPeriod && allPeriods.length > 0) {
      setSelectedPeriod(allPeriods[0]);
    }
  }, [allPeriods, selectedPeriod]);

  const currentPeriod = selectedPeriod || new Date().toISOString().slice(0, 7);
  const filteredRecords = getRecordsByPeriod(currentPeriod);
  const employeeMap = Object.fromEntries(employees.map((e) => [e.id, e]));

  const publishedRecords = filteredRecords.filter((r) => r.status === 'Published');
  const paidRecords = filteredRecords.filter((r) => r.status === 'Paid');

  const totalGross = filteredRecords.reduce((s, r) => s + r.grossPay, 0);
  const totalNet = filteredRecords.reduce((s, r) => s + r.netPay, 0);
  const totalDeductions = filteredRecords.reduce((s, r) => s + r.deductions, 0);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === publishedRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(publishedRecords.map((r) => r.id)));
    }
  };

  const handlePaySelected = async () => {
    if (selectedIds.size === 0) { toast.error('Select records to pay'); return; }
    if (!confirm(`Pay ${selectedIds.size} selected record(s)?`)) return;
    setProcessing(true);
    for (const id of selectedIds) {
      await payRecord(id);
    }
    setSelectedIds(new Set());
    setProcessing(false);
    toast.success(`${selectedIds.size} record(s) marked as Paid`);
  };

  const handleGeneratePayslips = async () => {
    const unpaidPaid = paidRecords.filter((r) => !r.payslipGeneratedAt);
    if (unpaidPaid.length === 0) { toast.error('No paid records awaiting payslip generation'); return; }
    setProcessing(true);
    let count = 0;
    for (const r of unpaidPaid) {
      const result = await generatePayslip(r.id);
      if (result) count++;
    }
    setProcessing(false);
    toast.success(`${count} payslip(s) generated`);
  };

  const onExportFull = async () => {
    if (exporting || !filteredRecords.length) return;
    setExporting(true);
    try {
      const csvRows: string[][] = [];
      const headers = [
        'Period', 'Status', 'EmployeeId', 'PayrollNumber', 'FirstName', 'LastName',
        'Department', 'Position', 'PayType', 'EmploymentType',
        'BasicPay', 'HousingAllowance', 'TransportAllowance', 'MedicalAllowance', 'OtherAllowances',
        'HourlyRate', 'HoursWorked', 'Overtime', 'GrossPay',
        'PAYE', 'NSSF', 'NHIF', 'TotalDeductions', 'NetPay',
        'PaidLeaveDays', 'UnpaidLeaveDays', 'SickLeaveDays',
        'PaymentDate', 'CreatedAt'
      ];
      csvRows.push(headers);

      for (const r of filteredRecords) {
        const emp = employeeMap[r.employeeId];
        const gross = r.grossPay;
        const paye = Math.max(0, (gross - 24000) * 0.3);
        const nssf = Math.min(gross * 0.06, 2160);
        const nhif = 1700;
        csvRows.push([
          r.period, r.status, r.employeeId, emp?.payrollNumber || '', emp?.firstName || '', emp?.lastName || '',
          emp?.department || '', emp?.position || '', r.payType, emp?.employmentType || '',
          String(r.basicPay || 0), String(emp?.housingAllowance || 0), String(emp?.transportAllowance || 0),
          String(emp?.medicalAllowance || 0), String(emp?.otherAllowances || 0),
          String(r.hourlyRate || 0), String(r.hoursWorked || 0), String(r.overtime || 0), String(gross),
          String(paye), String(nssf), String(nhif), String(r.deductions), String(r.netPay),
          String(emp?.paidLeaveDays || 0), String(emp?.unpaidLeaveDays || 0), String(emp?.sickLeaveDays || 0),
          r.paidAt || '', r.createdAt
        ]);
      }

      const csv = csvRows.map((row) => row.map((v) => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_full_${currentPeriod}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const periodPayslips = payslips.filter((p) => p.period === currentPeriod);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Payroll" description="Process published payroll, make payments, and generate payslips">
        <div className="flex items-center gap-2">
          {publishedRecords.length > 0 && (
            <Button type="button" onClick={handlePaySelected} isLoading={processing} disabled={selectedIds.size === 0 || processing}>
              <CheckCircle className="w-4 h-4" /> Pay Selected ({selectedIds.size})
            </Button>
          )}
          {paidRecords.length > 0 && (
            <Button type="button" onClick={handleGeneratePayslips} isLoading={processing} disabled={processing}>
              <FileText className="w-4 h-4" /> Generate Payslips
            </Button>
          )}
          <Button type="button" onClick={onExportFull} isLoading={exporting} disabled={filteredRecords.length === 0}>
            <Download className="w-4 h-4" /> Export Full Details
          </Button>

        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Period:</label>
        <select value={currentPeriod} onChange={(e) => { setSelectedPeriod(e.target.value); setSelectedIds(new Set()); }}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
          {allPeriods.length > 0 ? (
            allPeriods.map((p) => <option key={p}>{p}</option>)
          ) : (
            <option>{currentPeriod}</option>
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Published (Pending)" value={String(publishedRecords.length)} icon={Receipt} iconColor="gradient-primary" />
        <StatCard title="Paid" value={String(paidRecords.length)} icon={CheckCircle} />
        <StatCard title="Total Gross" value={formatCurrency(totalGross)} icon={DollarSign} />
        <StatCard title="Total Net Pay" value={formatCurrency(totalNet)} change={`${filteredRecords.length} records`} changeType="neutral" icon={Calculator} />
      </div>

      {/* Published Records */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-500" />
            Published Payroll — {currentPeriod}
            <span className="text-xs font-normal text-muted-foreground">({publishedRecords.length} pending)</span>
          </h3>
          {publishedRecords.length > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedIds.size === publishedRecords.length && publishedRecords.length > 0}
                onChange={toggleSelectAll} className="rounded border-input" />
              Select All
            </label>
          )}
        </div>
        {publishedRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-10 px-2 py-3" />
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Gross</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Deductions</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Net Pay</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Pay Type</th>
                </tr>
              </thead>
              <tbody>
                {publishedRecords.map((r) => {
                  const emp = employeeMap[r.employeeId];
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-2 py-3 text-center">
                        <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)}
                          className="rounded border-input" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId}</p>
                        <p className="text-xs text-muted-foreground">{emp?.department || ''} · {emp?.payrollNumber || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">{formatCurrency(r.grossPay)}</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-destructive">{formatCurrency(r.deductions)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(r.netPay)}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={r.payType} variant={r.payType === 'Hourly' ? 'warning' : 'info'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            {allPeriods.length > 0 ? 'All published records have been paid.' : 'No payroll records yet. HR publishes payroll from HR → Payroll Setup.'}
          </div>
        )}
      </div>

      {/* Paid Records */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            Paid Records — {currentPeriod}
            <span className="text-xs font-normal text-muted-foreground">({paidRecords.length} paid)</span>
          </h3>
        </div>
        {paidRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Gross</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Deductions</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Net Pay</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Paid At</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {paidRecords.map((r) => {
                  const emp = employeeMap[r.employeeId];
                  const ps = periodPayslips.find((p) => p.payrollRecordId === r.id);
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId}</p>
                        <p className="text-xs text-muted-foreground">{emp?.payrollNumber || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(r.grossPay)}</td>
                      <td className="px-4 py-3 text-right text-destructive">{formatCurrency(r.deductions)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(r.netPay)}</td>
                      <td className="px-4 py-3 text-center text-xs">{r.paidAt ? new Date(r.paidAt).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {ps ? (
                          <button onClick={() => setShowPayslip(ps)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View Payslip">
                            <FileText className="w-4 h-4 text-success" />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Receipt} title="No Paid Records" description="Pay published records first." />
        )}
      </div>

      {/* Payslip Preview Modal */}
      {showPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold">Payslip — {showPayslip.employeeName}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  if (!showPayslip) return;
                  const win = window.open('', '_blank');
                  if (!win) return;
                  win.document.write(buildPayslipHtml(showPayslip));
                  win.document.close();
                  win.focus();
                  setTimeout(() => win.print(), 300);
                }}
                  className="border border-border px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={() => setShowPayslip(null)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6">
              <PayslipDetail payslip={showPayslip} />
            </div>
          </div>
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
        ${p.overtime > 0 ? row('Overtime (OT1 ×1.5)', formatCurrency(p.overtime)) : ''}
        ${p.overtime2 > 0 ? row('Public Holiday (OT2 ×2.0)', formatCurrency(p.overtime2)) : ''}
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

function PayslipDetail({ payslip: p }: { payslip: Payslip }) {
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
              {p.overtime > 0 && <tr><td className="py-1">Overtime (OT1 ×1.5)</td><td className="text-right">{formatCurrency(p.overtime)}</td></tr>}
              {p.overtime2 > 0 && <tr><td className="py-1">Public Holiday (OT2 ×2.0)</td><td className="text-right">{formatCurrency(p.overtime2)}</td></tr>}
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