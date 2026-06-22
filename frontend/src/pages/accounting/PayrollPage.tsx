import { useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { useEmployeeStore } from '@/store/employeeStore';
import { formatCurrency } from '@/utils/countries';
import { apiBaseUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, Calculator, Download } from 'lucide-react';

export default function PayrollPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const activeEmployees = employees.filter((e) => e.status === 'Active');

  const [exporting, setExporting] = useState(false);

  const payrollData = activeEmployees.map((e) => {
    const gross = e.baseSalary + e.housingAllowance + e.transportAllowance + e.medicalAllowance + e.otherAllowances;
    const paye = Math.max(0, (gross - 24000) * 0.3);
    const nssf = Math.min(gross * 0.06, 2160);
    const nhif = 1700;
    const netPay = gross - paye - nssf - nhif;
    return { ...e, gross, paye, nssf, nhif, netPay };
  });

  const totalGross = payrollData.reduce((s, p) => s + p.gross, 0);
  const totalNet = payrollData.reduce((s, p) => s + p.netPay, 0);
  const totalDeductions = totalGross - totalNet;

  const onExportPayslips = async () => {
    if (exporting) return;
    if (!payrollData.length) return;

    try {
      setExporting(true);

      // Backend expects: { items: [...] }
      const res = await fetch(`${apiBaseUrl()}/payroll/export-payslips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('heyla_token') || ''}`,
        },
        body: JSON.stringify({ items: payrollData }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const cd = res.headers.get('content-disposition') || '';
      const match = cd.match(/filename="?([^"]+)"?/i);
      a.download = match?.[1] || `payslips_${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Payroll" description="Monthly payroll processing and management">
        <Button
          type="button"
          onClick={onExportPayslips}
          isLoading={exporting}
          disabled={exporting || payrollData.length === 0}
        >
          <Download className="w-4 h-4" />
          Export Payslips
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Gross" value={formatCurrency(totalGross)} icon={DollarSign} iconColor="gradient-primary" />
        <StatCard title="Total Net Pay" value={formatCurrency(totalNet)} change="After deductions" changeType="neutral" icon={Calculator} />
        <StatCard title="Total Deductions" value={formatCurrency(totalDeductions)} change="PAYE + NSSF + NHIF" changeType="negative" icon={DollarSign} />
        <StatCard title="Active Employees" value={String(activeEmployees.length)} icon={Users} />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Payroll Breakdown — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Gross</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">PAYE</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">NSSF</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">NHIF</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted-foreground">{p.department}</p>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">{formatCurrency(p.gross)}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-destructive">{formatCurrency(p.paye)}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-destructive">{formatCurrency(p.nssf)}</td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell text-destructive">{formatCurrency(p.nhif)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(p.netPay)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-bold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">{formatCurrency(totalGross)}</td>
                <td className="px-4 py-3 text-right hidden md:table-cell text-destructive">{formatCurrency(payrollData.reduce((s, p) => s + p.paye, 0))}</td>
                <td className="px-4 py-3 text-right hidden md:table-cell text-destructive">{formatCurrency(payrollData.reduce((s, p) => s + p.nssf, 0))}</td>
                <td className="px-4 py-3 text-right hidden lg:table-cell text-destructive">{formatCurrency(payrollData.reduce((s, p) => s + p.nhif, 0))}</td>
                <td className="px-4 py-3 text-right text-primary">{formatCurrency(totalNet)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
