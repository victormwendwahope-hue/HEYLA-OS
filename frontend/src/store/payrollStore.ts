import { create } from 'zustand';
import { PayrollRecord, Employee } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PayrollState {
  records: PayrollRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: PayrollRecord) => Promise<void>;
  updateRecord: (id: string, data: Partial<PayrollRecord>) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  computePayroll: (employee: Employee, hoursWorked: number, overtime: number, period: string) => PayrollRecord;
  getRecordsByPeriod: (period: string) => PayrollRecord[];
  approveRecord: (id: string, approvedBy: string) => Promise<void>;
}

function generateId(): string {
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function computeGross(employee: Employee, hoursWorked: number, overtime: number): number {
  if (employee.payType === 'Hourly') {
    const regular = employee.hourlyRate * Math.min(hoursWorked, 208);
    const ot = employee.hourlyRate * 1.5 * overtime;
    return regular + ot;
  }
  if (employee.payType === 'Basic') {
    return employee.baseSalary + employee.transportAllowance + employee.otherAllowances;
  }
  return employee.baseSalary + employee.housingAllowance + employee.transportAllowance + employee.medicalAllowance + employee.otherAllowances;
}

function computeDeductions(gross: number): number {
  const paye = Math.max(0, (gross - 24000) * 0.3);
  const nssf = Math.min(gross * 0.06, 2160);
  const nhif = 1700;
  return paye + nssf + nhif;
}

export const usePayrollStore = create<PayrollState>((set, get) => ({
  records: [],
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
  computePayroll: (employee: Employee, hoursWorked: number, overtime: number, period: string): PayrollRecord => {
    const grossPay = computeGross(employee, hoursWorked, overtime);
    const deductions = computeDeductions(grossPay);
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
  getRecordsByPeriod: (period) => get().records.filter((r) => r.period === period),
  approveRecord: async (id, approvedBy) => {
    try {
      const updated = await api.patch<PayrollRecord>(`/payroll/${id}`, { status: 'Approved', approvedBy });
      set((s) => ({ records: s.records.map((r) => r.id === id ? updated : r) }));
      toast.success('Payroll record approved');
    } catch {
      set((s) => ({
        records: s.records.map((r) =>
          r.id === id ? { ...r, status: 'Approved' as const, approvedBy } : r
        ),
      }));
      toast.error('Failed to approve payroll record');
    }
  },
}));
