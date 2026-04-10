import { create } from 'zustand';
import { Employee } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => api.get('/hr/employees').then(res => res.data.data),
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employee: Omit<Employee, 'id'>) => api.post('/hr/employees', employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: "Success", description: "Employee added." });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Employee>) => api.put(`/hr/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: "Success", description: "Employee updated." });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/hr/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: "Success", description: "Employee deleted." });
    },
  });
}

import { create } from 'zustand';
import api from '@/lib/api';
import type { Employee } from '@/types';

interface EmployeeStore {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  employees: [],
  loading: false,
  error: null,
  fetchEmployees: async () => {
    const { fetchEmployees: prevFetch } = get();
    if (get().loading) return prevFetch(); // Avoid duplicate calls

    set({ loading: true, error: null });
    try {
      const res = await api.get('/hr/employees');
      set({ 
        employees: res.data.data || [], 
        loading: false 
      });
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      set({ 
        error: err.response?.data?.message || 'Failed to fetch employees', 
        loading: false 
      });
    }
  },
}));

