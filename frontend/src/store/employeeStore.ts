import { create } from 'zustand';
import { Employee } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

// Mock data as fallback
const mockEmployees: Employee[] = [
  {
    id: '1', firstName: 'Wanjiku', lastName: 'Mwangi', email: 'wanjiku@heyla.co', phone: '+254 712 345 678',
    nationalId: '12345678', kraPin: 'A001234567Z', nssfNo: 'NSS001', nhifNo: 'NHF001',
    department: 'Engineering', position: 'Senior Developer', employmentType: 'Full-time', status: 'Active',
    startDate: '2023-01-15', baseSalary: 180000, housingAllowance: 30000, transportAllowance: 15000,
    medicalAllowance: 10000, otherAllowances: 5000, address: 'Westlands, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'Peter Mwangi', emergencyPhone: '+254 722 111 222',
    bankName: 'Equity Bank', bankAccount: '0123456789',
  },
  // ... (keep all mock data entries as fallback)
  {
    id: '5', firstName: 'Njeri', lastName: 'Kariuki', email: 'njeri@heyla.co', phone: '+254 745 789 012',
    nationalId: '56789012', kraPin: 'A005678901Z', nssfNo: 'NSS005', nhifNo: 'NHF005',
    department: 'HR', position: 'HR Manager', employmentType: 'Full-time', status: 'Active',
    startDate: '2021-08-01', baseSalary: 160000, housingAllowance: 28000, transportAllowance: 14000,
    medicalAllowance: 10000, otherAllowances: 5000, address: 'Karen, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'James Kariuki', emergencyPhone: '+254 731 000 111',
    bankName: 'ABSA', bankAccount: '4444555566',
  },
];

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

