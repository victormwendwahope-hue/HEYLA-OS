import { create } from 'zustand';
import { Employee } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const mockEmployees: Employee[] = [
  {
    id: '1', firstName: 'Wanjiku', lastName: 'Mwangi', email: 'wanjiku@heyla.co', phone: '+254 712 345 678',
    nationalId: '12345678', kraPin: 'A001234567Z', nssfNo: 'NSS001', nhifNo: 'NHF001',
    department: 'Engineering', position: 'Senior Developer', employmentType: 'Full-time', payType: 'Salary', status: 'Active',
    startDate: '2023-01-15', baseSalary: 180000, hourlyRate: 0, housingAllowance: 30000, transportAllowance: 15000,
    medicalAllowance: 10000, otherAllowances: 5000, address: 'Westlands, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'Peter Mwangi', emergencyPhone: '+254 722 111 222',
    bankName: 'Equity Bank', bankAccount: '0123456789',
  },
  {
    id: '2', firstName: 'Ochieng', lastName: 'Otieno', email: 'ochieng@heyla.co', phone: '+254 733 456 789',
    nationalId: '23456789', kraPin: 'A002345678Z', nssfNo: 'NSS002', nhifNo: 'NHF002',
    department: 'Sales', position: 'Sales Manager', employmentType: 'Full-time', payType: 'Salary', status: 'Active',
    startDate: '2022-06-01', baseSalary: 150000, hourlyRate: 0, housingAllowance: 25000, transportAllowance: 12000,
    medicalAllowance: 8000, otherAllowances: 3000, address: 'Kilimani, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'Mary Otieno', emergencyPhone: '+254 711 333 444',
    bankName: 'KCB', bankAccount: '9876543210',
  },
  {
    id: '3', firstName: 'Amina', lastName: 'Hassan', email: 'amina@heyla.co', phone: '+254 700 567 890',
    nationalId: '34567890', kraPin: 'A003456789Z', nssfNo: 'NSS003', nhifNo: 'NHF003',
    department: 'Finance', position: 'Accountant', employmentType: 'Full-time', payType: 'Salary', status: 'Active',
    startDate: '2023-03-20', baseSalary: 120000, hourlyRate: 0, housingAllowance: 20000, transportAllowance: 10000,
    medicalAllowance: 8000, otherAllowances: 2000, address: 'Parklands, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'Ali Hassan', emergencyPhone: '+254 755 666 777',
    bankName: 'Co-op Bank', bankAccount: '5555666677',
  },
  {
    id: '4', firstName: 'Kiprop', lastName: 'Kosgei', email: 'kiprop@heyla.co', phone: '+254 710 678 901',
    nationalId: '45678901', kraPin: 'A004567890Z', nssfNo: 'NSS004', nhifNo: 'NHF004',
    department: 'Marketing', position: 'Marketing Lead', employmentType: 'Full-time', payType: 'Salary', status: 'On Leave',
    startDate: '2022-11-10', baseSalary: 140000, hourlyRate: 0, housingAllowance: 22000, transportAllowance: 12000,
    medicalAllowance: 8000, otherAllowances: 4000, address: 'Eldoret Town', city: 'Eldoret',
    country: 'Kenya', emergencyContact: 'Sarah Kosgei', emergencyPhone: '+254 720 888 999',
    bankName: 'Stanbic', bankAccount: '1111222233',
  },
  {
    id: '5', firstName: 'Njeri', lastName: 'Kariuki', email: 'njeri@heyla.co', phone: '+254 745 789 012',
    nationalId: '56789012', kraPin: 'A005678901Z', nssfNo: 'NSS005', nhifNo: 'NHF005',
    department: 'HR', position: 'HR Manager', employmentType: 'Full-time', payType: 'Salary', status: 'Active',
    startDate: '2021-08-01', baseSalary: 160000, hourlyRate: 0, housingAllowance: 28000, transportAllowance: 14000,
    medicalAllowance: 10000, otherAllowances: 5000, address: 'Karen, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'James Kariuki', emergencyPhone: '+254 731 000 111',
    bankName: 'ABSA', bankAccount: '4444555566',
  },
  {
    id: '6', firstName: 'Brian', lastName: 'Kipchumba', email: 'brian@heyla.co', phone: '+254 701 234 567',
    nationalId: '67890123', kraPin: 'A006789012Z', nssfNo: 'NSS006', nhifNo: 'NHF006',
    department: 'Security', position: 'Security Guard', employmentType: 'Part-time', payType: 'Hourly', status: 'Active',
    startDate: '2024-01-10', baseSalary: 0, hourlyRate: 350, housingAllowance: 0, transportAllowance: 0,
    medicalAllowance: 0, otherAllowances: 0, address: 'Kasarani, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'Jane Kipchumba', emergencyPhone: '+254 721 444 555',
    bankName: 'Equity Bank', bankAccount: '9988776655',
  },
  {
    id: '7', firstName: 'Faith', lastName: 'Wanjala', email: 'faith@heyla.co', phone: '+254 723 456 789',
    nationalId: '78901234', kraPin: 'A007890123Z', nssfNo: 'NSS007', nhifNo: 'NHF007',
    department: 'Logistics', position: 'Delivery Rider', employmentType: 'Contract', payType: 'Basic', status: 'Active',
    startDate: '2024-03-01', baseSalary: 45000, hourlyRate: 0, housingAllowance: 0, transportAllowance: 5000,
    medicalAllowance: 0, otherAllowances: 0, address: 'Kisumu Town', city: 'Kisumu',
    country: 'Kenya', emergencyContact: 'Peter Wanjala', emergencyPhone: '+254 732 555 666',
    bankName: 'KCB', bankAccount: '2233445566',
  },
];

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  fetchEmployees: () => Promise<void>;
  addEmployee: (emp: Employee) => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: mockEmployees,
  loading: false,
  fetchEmployees: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Employee[]>('/employees');
      set({ employees: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addEmployee: async (emp) => {
    try {
      const created = await api.post<Employee>('/employees', emp);
      set((s) => ({ employees: [...s.employees, created] }));
      toast.success('Employee created');
    } catch {
      set((s) => ({ employees: [...s.employees, emp] }));
      toast.error('Failed to create employee');
    }
  },
  updateEmployee: async (id, data) => {
    try {
      const updated = await api.patch<Employee>(`/employees/${id}`, data);
      set((s) => ({ employees: s.employees.map((e) => (e.id === id ? updated : e)) }));
      toast.success('Employee updated');
    } catch {
      set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, ...data } : e)) }));
      toast.error('Failed to update employee');
    }
  },
  removeEmployee: async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }));
      toast.success('Employee deleted');
    } catch {
      set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }));
      toast.error('Failed to delete employee');
    }
  },
}));
