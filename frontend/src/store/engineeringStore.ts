import { create } from 'zustand';

export type FIDICType = 'Red Book' | 'Yellow Book' | 'Silver Book' | 'Gold Book';

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  manager: string;
}

export interface Contract {
  id: string;
  projectId: string;
  name: string;
  type: FIDICType;
  employer: string;
  contractor: string;
  engineer: string;
  price: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Terminated';
  startDate: string;
  endDate: string;
  currency: string;
}

export interface Claim {
  id: string;
  contractId: string;
  title: string;
  type: 'EOT' | 'Payment' | 'Both';
  dateOfEvent: string;
  description: string;
  amount?: number;
  daysRequested?: number;
  status: 'Notice Sent' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  timeBarDays: number;
  noticeDate: string;
  documents: string[];
}

export interface Variation {
  id: string;
  contractId: string;
  description: string;
  costImpact: number;
  timeImpact: number;
  status: 'Requested' | 'Under Review' | 'Approved' | 'Rejected';
  requestDate: string;
}

export interface PaymentCertificate {
  id: string;
  contractId: string;
  certNumber: number;
  amountDue: number;
  retentionDeducted: number;
  netPayment: number;
  dueDate: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Paid';
}

export interface Dispute {
  id: string;
  contractId: string;
  title: string;
  type: 'NOD' | 'DAB Referral' | 'Arbitration';
  status: 'Filed' | 'Under Review' | 'Hearing' | 'Resolved';
  filedDate: string;
  description: string;
}

export interface EarlyWarning {
  id: string;
  projectId: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigationPlan: string;
  status: 'Open' | 'Mitigated' | 'Closed';
  date: string;
}

interface EngStore {
  projects: Project[];
  contracts: Contract[];
  claims: Claim[];
  variations: Variation[];
  payments: PaymentCertificate[];
  disputes: Dispute[];
  earlyWarnings: EarlyWarning[];
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, d: Partial<Project>) => void;
  addContract: (c: Omit<Contract, 'id'>) => void;
  updateContract: (id: string, d: Partial<Contract>) => void;
  addClaim: (c: Omit<Claim, 'id'>) => void;
  updateClaim: (id: string, d: Partial<Claim>) => void;
  addVariation: (v: Omit<Variation, 'id'>) => void;
  updateVariation: (id: string, d: Partial<Variation>) => void;
  addPayment: (p: Omit<PaymentCertificate, 'id'>) => void;
  updatePayment: (id: string, d: Partial<PaymentCertificate>) => void;
  addDispute: (d: Omit<Dispute, 'id'>) => void;
  addEarlyWarning: (e: Omit<EarlyWarning, 'id'>) => void;
  updateEarlyWarning: (id: string, d: Partial<EarlyWarning>) => void;
}

const mockProjects: Project[] = [
  { id: 'PRJ001', name: 'Nairobi Expressway Phase 2', client: 'Kenya National Highways Authority', status: 'In Progress', progress: 45, budget: 5200000000, spent: 2340000000, startDate: '2025-06-01', endDate: '2028-12-31', manager: 'Eng. James Mwangi' },
  { id: 'PRJ002', name: 'Mombasa Port Expansion', client: 'Kenya Ports Authority', status: 'Planning', progress: 10, budget: 3800000000, spent: 380000000, startDate: '2026-01-15', endDate: '2029-06-30', manager: 'Eng. Fatuma Hassan' },
  { id: 'PRJ003', name: 'Lake Turkana Wind Farm Extension', client: 'LTWP Consortium', status: 'In Progress', progress: 72, budget: 1500000000, spent: 1080000000, startDate: '2024-03-01', endDate: '2026-09-30', manager: 'Eng. Peter Oloo' },
  { id: 'PRJ004', name: 'Kisumu Waterfront Development', client: 'Kisumu County Government', status: 'On Hold', progress: 25, budget: 890000000, spent: 222500000, startDate: '2025-09-01', endDate: '2027-12-31', manager: 'Eng. Rose Atieno' },
];

const mockContracts: Contract[] = [
  { id: 'CON001', projectId: 'PRJ001', name: 'Main Works - Expressway Construction', type: 'Red Book', employer: 'KNHA', contractor: 'China Wu Yi Ltd', engineer: 'Eng. James Mwangi', price: 4500000000, status: 'Active', startDate: '2025-07-01', endDate: '2028-12-31', currency: 'KES' },
  { id: 'CON002', projectId: 'PRJ001', name: 'Design & Build - Toll System', type: 'Yellow Book', employer: 'KNHA', contractor: 'TechBridge Systems', engineer: 'Eng. Sarah Mutua', price: 350000000, status: 'Active', startDate: '2026-01-01', endDate: '2027-06-30', currency: 'KES' },
  { id: 'CON003', projectId: 'PRJ002', name: 'EPC - Port Terminal', type: 'Silver Book', employer: 'KPA', contractor: 'CRBC International', engineer: 'Eng. Fatuma Hassan', price: 3200000000, status: 'Draft', startDate: '2026-03-01', endDate: '2029-06-30', currency: 'KES' },
  { id: 'CON004', projectId: 'PRJ003', name: 'O&M - Wind Turbines', type: 'Gold Book', employer: 'LTWP', contractor: 'Vestas Kenya', engineer: 'Eng. Peter Oloo', price: 450000000, status: 'Active', startDate: '2024-06-01', endDate: '2034-06-01', currency: 'KES' },
];

const mockClaims: Claim[] = [
  { id: 'CLM001', contractId: 'CON001', title: 'Unforeseen Ground Conditions - Km 12-15', type: 'Both', dateOfEvent: '2026-02-10', description: 'Encountered rock formation not indicated in site investigation report', amount: 85000000, daysRequested: 45, status: 'Submitted', timeBarDays: 28, noticeDate: '2026-02-15', documents: ['geo_report.pdf'] },
  { id: 'CLM002', contractId: 'CON001', title: 'Delayed Access to Site Section B', type: 'EOT', dateOfEvent: '2026-03-01', description: 'Employer failed to provide access per programme', daysRequested: 30, status: 'Under Review', timeBarDays: 28, noticeDate: '2026-03-05', documents: [] },
  { id: 'CLM003', contractId: 'CON002', title: 'Design Change - Payment Gateway', type: 'Payment', dateOfEvent: '2026-03-20', description: 'Employer requested additional payment gateway integration', amount: 12000000, status: 'Notice Sent', timeBarDays: 28, noticeDate: '2026-03-22', documents: [] },
];

const mockVariations: Variation[] = [
  { id: 'VAR001', contractId: 'CON001', description: 'Additional drainage works at interchange 3', costImpact: 45000000, timeImpact: 20, status: 'Approved', requestDate: '2026-01-15' },
  { id: 'VAR002', contractId: 'CON001', description: 'Change in pavement specification from flexible to rigid', costImpact: 120000000, timeImpact: 35, status: 'Under Review', requestDate: '2026-03-10' },
  { id: 'VAR003', contractId: 'CON002', description: 'Add ANPR camera system at toll booths', costImpact: 28000000, timeImpact: 15, status: 'Requested', requestDate: '2026-04-01' },
];

const mockPayments: PaymentCertificate[] = [
  { id: 'PAY001', contractId: 'CON001', certNumber: 1, amountDue: 450000000, retentionDeducted: 45000000, netPayment: 405000000, dueDate: '2025-10-15', status: 'Paid' },
  { id: 'PAY002', contractId: 'CON001', certNumber: 2, amountDue: 520000000, retentionDeducted: 52000000, netPayment: 468000000, dueDate: '2026-01-15', status: 'Paid' },
  { id: 'PAY003', contractId: 'CON001', certNumber: 3, amountDue: 380000000, retentionDeducted: 38000000, netPayment: 342000000, dueDate: '2026-04-15', status: 'Approved' },
  { id: 'PAY004', contractId: 'CON002', certNumber: 1, amountDue: 70000000, retentionDeducted: 7000000, netPayment: 63000000, dueDate: '2026-04-01', status: 'Submitted' },
];

const mockDisputes: Dispute[] = [
  { id: 'DIS001', contractId: 'CON001', title: 'Valuation of Rock Excavation', type: 'NOD', status: 'Filed', filedDate: '2026-03-25', description: 'Contractor disputes the Engineer valuation of rock excavation rates' },
];

const mockEarlyWarnings: EarlyWarning[] = [
  { id: 'EW001', projectId: 'PRJ001', description: 'Rainy season may delay earthworks on Section C', riskLevel: 'High', mitigationPlan: 'Accelerate earthworks in dry period, prepare drainage beforehand', status: 'Open', date: '2026-04-01' },
  { id: 'EW002', projectId: 'PRJ002', description: 'Steel prices rising globally - may affect budget', riskLevel: 'Medium', mitigationPlan: 'Consider early procurement of structural steel', status: 'Open', date: '2026-03-28' },
  { id: 'EW003', projectId: 'PRJ003', description: 'Turbine blade supplier reported potential delay', riskLevel: 'High', mitigationPlan: 'Identify alternative supplier, negotiate priority shipping', status: 'Mitigated', date: '2026-03-15' },
];

const uid = () => Math.random().toString(36).slice(2, 9);

export const useEngineeringStore = create<EngStore>((set) => ({
  projects: mockProjects,
  contracts: mockContracts,
  claims: mockClaims,
  variations: mockVariations,
  payments: mockPayments,
  disputes: mockDisputes,
  earlyWarnings: mockEarlyWarnings,
  addProject: (p) => set((s) => ({ projects: [...s.projects, { ...p, id: `PRJ${uid()}` }] })),
  updateProject: (id, d) => set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...d } : p) })),
  addContract: (c) => set((s) => ({ contracts: [...s.contracts, { ...c, id: `CON${uid()}` }] })),
  updateContract: (id, d) => set((s) => ({ contracts: s.contracts.map((c) => c.id === id ? { ...c, ...d } : c) })),
  addClaim: (c) => set((s) => ({ claims: [...s.claims, { ...c, id: `CLM${uid()}` }] })),
  updateClaim: (id, d) => set((s) => ({ claims: s.claims.map((c) => c.id === id ? { ...c, ...d } : c) })),
  addVariation: (v) => set((s) => ({ variations: [...s.variations, { ...v, id: `VAR${uid()}` }] })),
  updateVariation: (id, d) => set((s) => ({ variations: s.variations.map((v) => v.id === id ? { ...v, ...d } : v) })),
  addPayment: (p) => set((s) => ({ payments: [...s.payments, { ...p, id: `PAY${uid()}` }] })),
  updatePayment: (id, d) => set((s) => ({ payments: s.payments.map((p) => p.id === id ? { ...p, ...d } : p) })),
  addDispute: (d) => set((s) => ({ disputes: [...s.disputes, { ...d, id: `DIS${uid()}` }] })),
  addEarlyWarning: (e) => set((s) => ({ earlyWarnings: [...s.earlyWarnings, { ...e, id: `EW${uid()}` }] })),
  updateEarlyWarning: (id, d) => set((s) => ({ earlyWarnings: s.earlyWarnings.map((e) => e.id === id ? { ...e, ...d } : e) })),
}));
