export interface Employee {
  id: string;
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
  status: 'Active' | 'On Leave' | 'Terminated';
  startDate: string;
  baseSalary: number;
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
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
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
