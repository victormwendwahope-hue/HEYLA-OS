import { create } from 'zustand';
import { Employee } from '@/types';
import { api } from '@/lib/api';
import { sanitizeError } from '@/lib/secure';
import { toast } from 'sonner';

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  addEmployee: (emp: Omit<Employee, 'id' | 'payrollNumber'>) => Promise<Employee | null>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<Employee[]>('/employees');
      set({ employees: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch employees';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addEmployee: async (emp) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<Employee>('/employees', emp);
      set((s) => ({ employees: [created, ...s.employees], loading: false }));
      toast.success('Employee created successfully');
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create employee';
      set({ error: msg, loading: false });
      toast.error(msg);
      return null;
    }
  },

  updateEmployee: async (id, data) => {
    set({ error: null });
    try {
      const updated = await api.patch<Employee>(`/employees/${id}`, data);
      set((s) => ({ employees: s.employees.map((e) => (e.id === id ? updated : e)) }));
      toast.success('Employee updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update employee';
      set({ error: msg });
      toast.error(msg);
    }
  },

  removeEmployee: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/employees/${id}`);
      set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }));
      toast.success('Employee deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete employee';
      set({ error: msg });
      toast.error(msg);
    }
  },
}));
