import { useState } from 'react';
import { useEmployeeStore } from '@/store/employeeStore';
import { usePayrollStore } from '@/store/payrollStore';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, Users, Receipt, ArrowRight, Save, Edit3 } from 'lucide-react';
import { PayType } from '@/types';

export default function HRPayrollPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
  const computePayroll = usePayrollStore((s) => s.computePayroll);
  const addRecord = usePayrollStore((s) => s.addRecord);
  const navigate = useNavigate();

  const activeEmployees = employees.filter((e) => e.status === 'Active');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ hourlyRate?: number; baseSalary?: number; transportAllowance?: number; otherAllowances?: number; housingAllowance?: number; medicalAllowance?: number }>({});
  const [hoursWorked, setHoursWorked] = useState<Record<string, number>>({});
  const [overtime, setOvertime] = useState<Record<string, number>>({});
  const [processing, setProcessing] = useState(false);

  const payGroups: Record<PayType, typeof activeEmployees> = {
    Hourly: activeEmployees.filter((e) => e.payType === 'Hourly'),
    Basic: activeEmployees.filter((e) => e.payType === 'Basic'),
    Salary: activeEmployees.filter((e) => e.payType === 'Salary'),
  };

  const hourlyCount = payGroups.Hourly.length;
  const basicCount = payGroups.Basic.length;
  const salaryCount = payGroups.Salary.length;

  const totalHourlyCost = payGroups.Hourly.reduce((s, e) => {
    const hrs = hoursWorked[e.id] || 160;
    const ot = overtime[e.id] || 0;
    const reg = e.hourlyRate * Math.min(hrs, 208);
    return s + reg + e.hourlyRate * 1.5 * ot;
  }, 0);

  const totalBasicCost = payGroups.Basic.reduce((s, e) => s + e.baseSalary + e.transportAllowance + e.otherAllowances, 0);
  const totalSalaryCost = payGroups.Salary.reduce((s, e) => s + e.baseSalary + e.housingAllowance + e.transportAllowance + e.medicalAllowance + e.otherAllowances, 0);
  const totalPayroll = totalHourlyCost + totalBasicCost + totalSalaryCost;

  const startEdit = (e: typeof activeEmployees[0]) => {
    setEditingId(e.id);
    setEditValues({ hourlyRate: e.hourlyRate, baseSalary: e.baseSalary, transportAllowance: e.transportAllowance, otherAllowances: e.otherAllowances, housingAllowance: e.housingAllowance, medicalAllowance: e.medicalAllowance });
  };

  const saveEdit = (id: string) => {
    updateEmployee(id, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const pushToAccounting = () => {
    const period = new Date().toISOString().slice(0, 7);
    setProcessing(true);
    activeEmployees.forEach((e) => {
      const hrs = hoursWorked[e.id] || (e.payType === 'Hourly' ? 160 : 0);
      const ot = overtime[e.id] || 0;
      const record = computePayroll(e, hrs, ot, period);
      addRecord(record);
    });
    setProcessing(false);
    navigate('/accounting/payroll');
  };

  const payTypeMeta: Record<PayType, { label: string; description: string; icon: typeof Clock; color: string }> = {
    Hourly: { label: 'Hourly Rate', description: 'Paid per hour worked', icon: Clock, color: 'text-blue-500' },
    Basic: { label: 'Basic Rate', description: 'Fixed monthly base + allowances', icon: DollarSign, color: 'text-green-500' },
    Salary: { label: 'Salary', description: 'Full monthly salary + allowances', icon: Users, color: 'text-purple-500' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="HR Payroll" description="Manage hourly rates, basic rates, and salary structures">
        <Button type="button" onClick={pushToAccounting} isLoading={processing} disabled={processing || activeEmployees.length === 0}>
          <Receipt className="w-4 h-4" />
          Process & Push to Accounting
          <ArrowRight className="w-4 h-4" />
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Hourly Workers" value={String(hourlyCount)} description={formatCurrency(totalHourlyCost) + ' est. monthly'} icon={Clock} />
        <StatCard title="Basic Rate" value={String(basicCount)} description={formatCurrency(totalBasicCost) + ' est. monthly'} icon={DollarSign} />
        <StatCard title="Salaried" value={String(salaryCount)} description={formatCurrency(totalSalaryCost) + ' monthly'} icon={Users} />
        <StatCard title="Total Payroll Cost" value={formatCurrency(totalPayroll)} change="Estimated monthly" changeType="neutral" icon={Receipt} />
      </div>

      {(Object.keys(payGroups) as PayType[]).map((payType) => {
        const group = payGroups[payType];
        if (group.length === 0) return null;
        const meta = payTypeMeta[payType];

        return (
          <div key={payType} className="glass rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <meta.icon className={`w-5 h-5 ${meta.color}`} />
              <div>
                <h3 className="font-semibold">{meta.label} Employees</h3>
                <p className="text-xs text-muted-foreground">{meta.description} · {group.length} employee{group.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                    {payType === 'Hourly' && (
                      <>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Hourly Rate</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Hours/Month</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Overtime</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Est. Gross</th>
                      </>
                    )}
                    {payType === 'Basic' && (
                      <>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Basic Salary</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Transport</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Other</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Total</th>
                      </>
                    )}
                    {payType === 'Salary' && (
                      <>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Base Salary</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Housing</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Transport</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Medical</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                      </>
                    )}
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((e, i) => {
                    const isEditing = editingId === e.id;
                    const gross = payType === 'Hourly'
                      ? (hoursWorked[e.id] || 160) * e.hourlyRate + (overtime[e.id] || 0) * e.hourlyRate * 1.5
                      : payType === 'Basic'
                      ? e.baseSalary + e.transportAllowance + e.otherAllowances
                      : e.baseSalary + e.housingAllowance + e.transportAllowance + e.medicalAllowance + e.otherAllowances;

                    return (
                      <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                              {e.firstName[0]}{e.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{e.firstName} {e.lastName}</p>
                              <p className="text-xs text-muted-foreground">{e.position}</p>
                            </div>
                          </div>
                        </td>

                        {payType === 'Hourly' && (
                          <>
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input type="number" value={editValues.hourlyRate || 0} onChange={(ev) => setEditValues({ ...editValues, hourlyRate: Number(ev.target.value) })}
                                  className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              ) : (
                                <span className="font-medium">{formatCurrency(e.hourlyRate)}<span className="text-xs text-muted-foreground">/hr</span></span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center hidden sm:table-cell">
                              <input type="number" value={hoursWorked[e.id] ?? 160} onChange={(ev) => setHoursWorked({ ...hoursWorked, [e.id]: Number(ev.target.value) })}
                                className="w-20 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} max={744} />
                            </td>
                            <td className="px-4 py-3 text-center hidden md:table-cell">
                              <input type="number" value={overtime[e.id] ?? 0} onChange={(ev) => setOvertime({ ...overtime, [e.id]: Number(ev.target.value) })}
                                className="w-20 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                            </td>
                            <td className="px-4 py-3 text-right hidden lg:table-cell font-medium text-primary">{formatCurrency(gross)}</td>
                          </>
                        )}

                        {payType === 'Basic' && (
                          <>
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input type="number" value={editValues.baseSalary || 0} onChange={(ev) => setEditValues({ ...editValues, baseSalary: Number(ev.target.value) })}
                                  className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              ) : (
                                <span className="font-medium">{formatCurrency(e.baseSalary)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center hidden sm:table-cell">
                              {isEditing ? (
                                <input type="number" value={editValues.transportAllowance || 0} onChange={(ev) => setEditValues({ ...editValues, transportAllowance: Number(ev.target.value) })}
                                  className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              ) : (
                                <span>{formatCurrency(e.transportAllowance)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center hidden md:table-cell">
                              {isEditing ? (
                                <input type="number" value={editValues.otherAllowances || 0} onChange={(ev) => setEditValues({ ...editValues, otherAllowances: Number(ev.target.value) })}
                                  className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              ) : (
                                <span>{formatCurrency(e.otherAllowances)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right hidden lg:table-cell font-medium text-primary">{formatCurrency(gross)}</td>
                          </>
                        )}

                        {payType === 'Salary' && (
                          <>
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input type="number" value={editValues.baseSalary || 0} onChange={(ev) => setEditValues({ ...editValues, baseSalary: Number(ev.target.value) })}
                                  className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              ) : (
                                <span className="font-medium">{formatCurrency(e.baseSalary)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center hidden sm:table-cell">
                              {isEditing ? (
                                <input type="number" value={editValues.housingAllowance || 0} onChange={(ev) => setEditValues({ ...editValues, housingAllowance: Number(ev.target.value) })}
                                  className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              ) : (
                                <span>{formatCurrency(e.housingAllowance)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center hidden md:table-cell">
                              {isEditing ? (
                                <input type="number" value={editValues.transportAllowance || 0} onChange={(ev) => setEditValues({ ...editValues, transportAllowance: Number(ev.target.value) })}
                                  className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              ) : (
                                <span>{formatCurrency(e.transportAllowance)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center hidden lg:table-cell">
                              {isEditing ? (
                                <input type="number" value={editValues.medicalAllowance || 0} onChange={(ev) => setEditValues({ ...editValues, medicalAllowance: Number(ev.target.value) })}
                                  className="w-24 px-2 py-1 rounded border border-input bg-background text-sm text-center" min={0} />
                              ) : (
                                <span>{formatCurrency(e.medicalAllowance)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-primary">{formatCurrency(gross)}</td>
                          </>
                        )}

                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <button onClick={() => saveEdit(e.id)} className="inline-flex items-center gap-1 text-green-500 text-xs font-medium hover:underline">
                              <Save className="w-3.5 h-3.5" /> Save
                            </button>
                          ) : (
                            <button onClick={() => startEdit(e)} className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline">
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {activeEmployees.length > 0 && (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted-foreground mb-4">
            After setting rates, push payroll data to Accounting for final processing with deductions (PAYE, NSSF, NHIF) and payslip exports.
          </p>
          <Button type="button" onClick={pushToAccounting} isLoading={processing} disabled={processing}>
            <Receipt className="w-4 h-4" />
            Process & Push to Accounting
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {activeEmployees.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Employees</h3>
          <p className="text-muted-foreground">Add employees in HR & People to start managing payroll rates.</p>
        </div>
      )}
    </div>
  );
}
