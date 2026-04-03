import { create } from 'zustand';
import { Employee } from '@/types';

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
  {
    id: '2', firstName: 'Ochieng', lastName: 'Otieno', email: 'ochieng@heyla.co', phone: '+254 733 456 789',
    nationalId: '23456789', kraPin: 'A002345678Z', nssfNo: 'NSS002', nhifNo: 'NHF002',
    department: 'Sales', position: 'Sales Manager', employmentType: 'Full-time', status: 'Active',
    startDate: '2022-06-01', baseSalary: 150000, housingAllowance: 25000, transportAllowance: 12000,
    medicalAllowance: 8000, otherAllowances: 3000, address: 'Kilimani, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'Mary Otieno', emergencyPhone: '+254 711 333 444',
    bankName: 'KCB', bankAccount: '9876543210',
  },
  {
    id: '3', firstName: 'Amina', lastName: 'Hassan', email: 'amina@heyla.co', phone: '+254 700 567 890',
    nationalId: '34567890', kraPin: 'A003456789Z', nssfNo: 'NSS003', nhifNo: 'NHF003',
    department: 'Finance', position: 'Accountant', employmentType: 'Full-time', status: 'Active',
    startDate: '2023-03-20', baseSalary: 120000, housingAllowance: 20000, transportAllowance: 10000,
    medicalAllowance: 8000, otherAllowances: 2000, address: 'Parklands, Nairobi', city: 'Nairobi',
    country: 'Kenya', emergencyContact: 'Ali Hassan', emergencyPhone: '+254 755 666 777',
    bankName: 'Co-op Bank', bankAccount: '5555666677',
  },
  {
    id: '4', firstName: 'Kiprop', lastName: 'Kosgei', email: 'kiprop@heyla.co', phone: '+254 710 678 901',
    nationalId: '45678901', kraPin: 'A004567890Z', nssfNo: 'NSS004', nhifNo: 'NHF004',
    department: 'Marketing', position: 'Marketing Lead', employmentType: 'Full-time', status: 'On Leave',
    startDate: '2022-11-10', baseSalary: 140000, housingAllowance: 22000, transportAllowance: 12000,
    medicalAllowance: 8000, otherAllowances: 4000, address: 'Eldoret Town', city: 'Eldoret',
    country: 'Kenya', emergencyContact: 'Sarah Kosgei', emergencyPhone: '+254 720 888 999',
    bankName: 'Stanbic', bankAccount: '1111222233',
  },
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

interface EmployeeState {
  employees: Employee[];
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: mockEmployees,
  addEmployee: (emp) => set((s) => ({ employees: [...s.employees, emp] })),
  updateEmployee: (id, data) =>
    set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
  removeEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),
}));
