import { useState, useEffect } from 'react';
import { PageHeader, StatCard, StatusBadge, EmptyState } from '@/components/shared/CommonUI';
import { useEmployeeStore } from '@/store/employeeStore';
import { usePayrollStore } from '@/store/payrollStore';
import { formatCurrency } from '@/utils/countries';
import { apiBaseUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DollarSign, Calculator, Download, Receipt, Trash2 } from 'lucide-react';

export default function PayrollPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const { records, fetchRecords, getRecordsByPeriod, removeRecord } = usePayrollStore();

  const [exporting, setExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const allPeriods = [...new Set(records.map((r) => r.period))].sort().reverse();

  useEffect(() => {
    if (!selectedPeriod && allPeriods.length > 0) {
      setSelectedPeriod(allPeriods[0]);
    }
  }, [allPeriods, selectedPeriod]);

  const currentPeriod = selectedPeriod || new Date().toISOString().slice(0, 7);

  const filteredRecords = getRecordsByPeriod(currentPeriod);

  const employeeMap = Object.fromEntries(employees.map((e) => [e.id, e]));

  const totalGross = filteredRecords.reduce((s, r) => s + r.grossPay, 0);
  const totalNet = filteredRecords.reduce((s, r) => s + r.netPay, 0);
  const totalDeductions = filteredRecords.reduce((s, r) => s + r.deductions, 0);

  const onExportPayslips = async () => {
    if (exporting) return;
    if (!filteredRecords.length) return;

    try {
      setExporting(true);

      const res = await fetch(`${apiBaseUrl()}/payroll/export-payslips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('heyla_token') || ''}`,
        },
        body: JSON.stringify({ items: filteredRecords }),
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
      a.download = match?.[1] || `payslips_${currentPeriod}.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this payroll record?')) {
      removeRecord(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Payroll" description="Monthly payroll processing and management">
        <div className="flex items-center gap-2">
          <Link to="/hr/payroll" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors">
            <Receipt className="w-4 h-4" /> HR Payroll Setup
          </Link>
          <Button
            type="button"
            onClick={onExportPayslips}
            isLoading={exporting}
            disabled={exporting || filteredRecords.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Payslips
          </Button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Period:</label>
        <select
          value={currentPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        >
          {allPeriods.length > 0 ? (
            allPeriods.map((p) => <option key={p}>{p}</option>)
          ) : (
            <option>{currentPeriod}</option>
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Gross" value={formatCurrency(totalGross)} icon={DollarSign} iconColor="gradient-primary" />
        <StatCard title="Total Net Pay" value={formatCurrency(totalNet)} change="After deductions" changeType="neutral" icon={Calculator} />
        <StatCard title="Total Deductions" value={formatCurrency(totalDeductions)} change="PAYE + NSSF + NHIF" changeType="negative" icon={DollarSign} />
        <StatCard title="Record Count" value={String(filteredRecords.length)} icon={Receipt} />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Payroll Records — {currentPeriod}</h3>
        </div>
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Gross Pay</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Deductions</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Net Pay</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => {
                  const emp = employeeMap[r.employeeId];
                  const statusVariant = r.status === 'Approved' ? 'success' : r.status === 'Paid' ? 'info' : 'warning';
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId}</p>
                        <p className="text-xs text-muted-foreground">{emp?.department || 'Unknown'}</p>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">{formatCurrency(r.grossPay)}</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-destructive">{formatCurrency(r.deductions)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrency(r.netPay)}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={r.status} variant={statusVariant} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-destructive text-xs font-medium hover:underline flex items-center gap-1 justify-center mx-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 font-bold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">{formatCurrency(totalGross)}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-destructive">{formatCurrency(totalDeductions)}</td>
                  <td className="px-4 py-3 text-right text-primary">{formatCurrency(totalNet)}</td>
                  <td className="px-4 py-3 text-center">{filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No Payroll Records"
            description={`No payroll records found for ${currentPeriod}. Push payroll data from HR Payroll Setup to generate records.`}
            action={
              <Link to="/hr/payroll" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Receipt className="w-4 h-4" /> Go to HR Payroll Setup
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
