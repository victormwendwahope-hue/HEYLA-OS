import { create } from 'zustand';
import { PayrollRecord, Payslip, Employee } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PayrollState {
  records: PayrollRecord[];
  payslips: Payslip[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  fetchPayslips: () => Promise<void>;
  addRecord: (record: PayrollRecord) => Promise<void>;
  updateRecord: (id: string, data: Partial<PayrollRecord>) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  publishPayroll: (records: PayrollRecord[]) => Promise<void>;
  payRecord: (id: string) => Promise<void>;
  generatePayslip: (recordId: string) => Promise<Payslip | null>;
  getRecordsByPeriod: (period: string) => PayrollRecord[];
  getPayslipsByPeriod: (period: string) => Payslip[];
  getPayslipByEmployee: (payrollNumber: string) => Payslip | undefined;
}

function generateId(): string {
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeGross(employee: Employee, hoursWorked: number, overtime: number): number {
  if (employee.payType === 'Hourly') {
    return employee.hourlyRate * Math.min(hoursWorked, 208) + employee.hourlyRate * 1.5 * overtime;
  }
  return employee.baseSalary + employee.housingAllowance + employee.transportAllowance + employee.medicalAllowance + employee.otherAllowances;
}

function computeDeductions(gross: number): { paye: number; nssf: number; nhif: number; total: number } {
  const paye = Math.max(0, (gross - 24000) * 0.3);
  const nssf = Math.min(gross * 0.06, 2160);
  const nhif = 1700;
  return { paye, nssf, nhif, total: paye + nssf + nhif };
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  records: [],
  payslips: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const data = await api.get<PayrollRecord[]>('/payroll');
      set({ records: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchPayslips: async () => {
    try {
      const data = await api.get<Payslip[]>('/payroll/payslips');
      set({ payslips: data });
    } catch { /* ignore */ }
  },
  computePayroll: (employee: Employee, hoursWorked: number, overtime: number, period: string): PayrollRecord => {
    const grossPay = computeGross(employee, hoursWorked, overtime);
    const { total: deductions } = computeDeductions(grossPay);
    return {
      id: generateId(),
      employeeId: employee.id,
      period,
      payType: employee.payType,
      hourlyRate: employee.hourlyRate,
      hoursWorked,
      basicPay: employee.payType === 'Hourly' ? 0 : employee.baseSalary,
      overtime,
      grossPay,
      deductions,
      netPay: grossPay - deductions,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    };
  },
  publishPayroll: async (records) => {
    const published = records.map((r) => ({ ...r, status: 'Published' as const }));
    try {
      const results: PayrollRecord[] = [];
      for (const r of published) {
        const created = await api.post<PayrollRecord>('/payroll', r);
        results.push(created);
      }
      set((s) => ({ records: [...s.records, ...results] }));
      toast.success(`${results.length} payroll record(s) published`);
    } catch {
      set((s) => ({ records: [...s.records, ...published] }));
      toast.success(`${published.length} payroll record(s) published (offline)`);
    }
  },
  addRecord: async (record) => {
    try {
      const created = await api.post<PayrollRecord>('/payroll', record);
      set((s) => ({ records: [...s.records, created] }));
      toast.success('Payroll record created');
    } catch {
      set((s) => ({ records: [...s.records, record] }));
      toast.error('Failed to create payroll record');
    }
  },
  updateRecord: async (id, data) => {
    try {
      const updated = await api.patch<PayrollRecord>(`/payroll/${id}`, data);
      set((s) => ({ records: s.records.map((r) => (r.id === id ? updated : r)) }));
      toast.success('Payroll record updated');
    } catch {
      set((s) => ({ records: s.records.map((r) => (r.id === id ? { ...r, ...data } : r)) }));
      toast.error('Failed to update payroll record');
    }
  },
  payRecord: async (id) => {
    const now = new Date().toISOString();
    try {
      const updated = await api.patch<PayrollRecord>(`/payroll/${id}`, { status: 'Paid', paidAt: now });
      set((s) => ({ records: s.records.map((r) => (r.id === id ? updated : r)) }));
      toast.success('Payment recorded');
    } catch {
      set((s) => ({
        records: s.records.map((r) =>
          r.id === id ? { ...r, status: 'Paid' as const, paidAt: now } : r
        ),
      }));
      toast.success('Payment recorded (offline)');
    }
  },
  removeRecord: async (id) => {
    try {
      await api.delete(`/payroll/${id}`);
      set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
      toast.success('Payroll record deleted');
    } catch {
      set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
      toast.error('Failed to delete payroll record');
    }
  },
  generatePayslip: async (recordId: string): Promise<Payslip | null> => {
    try {
      const payslip = await api.post<Payslip>('/payroll/generate-payslip', { recordId });
      set((s) => ({
        payslips: [...s.payslips, payslip],
        records: s.records.map((r) =>
          r.id === recordId ? { ...r, payslipGeneratedAt: new Date().toISOString() } : r
        ),
      }));
      toast.success('Payslip generated');
      return payslip;
    } catch {
      toast.error('Failed to generate payslip');
      return null;
    }
  },
  getRecordsByPeriod: (period) => get().records.filter((r) => r.period === period),
  getPayslipsByPeriod: (period) => get().payslips.filter((p) => p.period === period),
  getPayslipByEmployee: (payrollNumber) => get().payslips.find((p) => p.payrollNumber === payrollNumber),
}));