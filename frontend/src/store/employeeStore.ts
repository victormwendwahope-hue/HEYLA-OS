import { create } from 'zustand';
import api from '@/lib/api';

import { Employee } from '@/types';

interface EmployeeState {
  employees: Employee[];
  fetchEmployees: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  fetchEmployees: async () => {
    try {
      const { data } = await api.get('/hr/employees');
      set({ employees: data.data });
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  },
  addEmployee: async (employee) => {
    try {
      await api.post('/hr/employees', employee);
      get().fetchEmployees(); // Refresh list
    } catch (error) {
      console.error('Failed to add employee:', error);
      throw error;
    }
  },
  deleteEmployee: async (id) => {
    try {
      await api.delete(`/hr/employees/${id}`);
      get().fetchEmployees(); // Refresh list
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw error;
    }
  },
}));

export * from './employeeHooks';
export { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
