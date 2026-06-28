export type PayType = 'Hourly' | 'Salary' | 'Basic';

export interface Employee {
  id: string;
  payrollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  kraPin: string;
  nssfNo: string;
  nhifNo: string;
  department: string;
  position: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  payType: PayType;
  status: 'Active' | 'On Leave' | 'Terminated';
  startDate: string;
  baseSalary: number;
  hourlyRate: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  avatar?: string;
  address: string;
  city: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  bankName: string;
  bankAccount: string;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  sickLeaveDays: number;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  period: string;
  payType: PayType;
  hourlyRate: number;
  hoursWorked: number;
  basicPay: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  overtime: number;
  overtime2: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'Draft' | 'Published' | 'Paid';
  paidAt?: string;
  payslipGeneratedAt?: string;
  createdAt: string;
}

export interface Payslip {
  id: string;
  payrollRecordId: string;
  employeeId: string;
  payslipNumber: string;
  period: string;
  employeeName: string;
  payrollNumber: string;
  department: string;
  position: string;
  basicPay: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  overtime: number;
  overtime2: number;
  grossPay: number;
  paye: number;
  nssf: number;
  nhif: number;
  totalDeductions: number;
  netPay: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  sickLeaveDays: number;
  paymentDate: string;
  companyName: string;
  companyKraPin: string;
  generatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
  value: number;
  source: string;
  assignedTo: string;
  createdAt: string;
  notes: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dueDate: string;
  createdAt: string;
  currency: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: 'admin' | 'manager' | 'employee' | 'individual';
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  taxFields: string[];
  flag: string;
}
