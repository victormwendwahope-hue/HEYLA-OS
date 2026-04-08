import { create } from 'zustand';

export interface Incident {
  id: string;
  type: 'Accident' | 'Near-miss' | 'Hazard';
  location: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Investigating' | 'Resolved' | 'Closed';
  reportedBy: string;
  reportedDate: string;
  assignedTo: string;
  attachments: string[];
}

export interface ComplianceItem {
  id: string;
  category: 'DOSH' | 'WIBA';
  item: string;
  status: 'Compliant' | 'Warning' | 'Overdue';
  dueDate: string;
  lastChecked: string;
  certNumber?: string;
  expiryDate?: string;
}

export interface Inspection {
  id: string;
  title: string;
  location: string;
  inspector: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  result?: 'Pass' | 'Fail' | 'Conditional';
  checklist: { item: string; checked: boolean; notes: string }[];
}

export interface SafetyAlert {
  id: string;
  type: 'Overdue Check' | 'Expired Certification' | 'High Risk Incident';
  message: string;
  severity: 'Info' | 'Warning' | 'Critical';
  date: string;
  read: boolean;
}

interface EHSStore {
  incidents: Incident[];
  compliance: ComplianceItem[];
  inspections: Inspection[];
  alerts: SafetyAlert[];
  addIncident: (i: Omit<Incident, 'id'>) => void;
  updateIncident: (id: string, data: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  addCompliance: (c: Omit<ComplianceItem, 'id'>) => void;
  updateCompliance: (id: string, data: Partial<ComplianceItem>) => void;
  addInspection: (i: Omit<Inspection, 'id'>) => void;
  updateInspection: (id: string, data: Partial<Inspection>) => void;
  markAlertRead: (id: string) => void;
}

const mockIncidents: Incident[] = [
  { id: 'INC001', type: 'Accident', location: 'Warehouse B', description: 'Worker slipped on wet floor near loading dock', severity: 'High', status: 'Investigating', reportedBy: 'John Mwangi', reportedDate: '2026-04-01', assignedTo: 'Sarah Odhiambo', attachments: [] },
  { id: 'INC002', type: 'Near-miss', location: 'Construction Site A', description: 'Scaffolding bolt found loose during inspection', severity: 'Medium', status: 'Reported', reportedBy: 'Peter Kamau', reportedDate: '2026-04-03', assignedTo: 'James Otieno', attachments: [] },
  { id: 'INC003', type: 'Hazard', location: 'Office Block C', description: 'Exposed electrical wiring in server room', severity: 'Critical', status: 'Resolved', reportedBy: 'Mary Wanjiku', reportedDate: '2026-03-28', assignedTo: 'David Njoroge', attachments: [] },
  { id: 'INC004', type: 'Accident', location: 'Plant Floor', description: 'Chemical spill during transfer operation', severity: 'High', status: 'Investigating', reportedBy: 'Grace Akinyi', reportedDate: '2026-04-05', assignedTo: 'Sarah Odhiambo', attachments: [] },
  { id: 'INC005', type: 'Near-miss', location: 'Parking Area', description: 'Forklift near-collision with pedestrian', severity: 'Medium', status: 'Closed', reportedBy: 'Samuel Kiprotich', reportedDate: '2026-03-20', assignedTo: 'James Otieno', attachments: [] },
];

const mockCompliance: ComplianceItem[] = [
  { id: 'C001', category: 'DOSH', item: 'Fire Safety Certificate', status: 'Compliant', dueDate: '2026-12-31', lastChecked: '2026-01-15', certNumber: 'DOSH-FS-2026-001', expiryDate: '2026-12-31' },
  { id: 'C002', category: 'DOSH', item: 'Workplace Safety Audit', status: 'Warning', dueDate: '2026-04-30', lastChecked: '2025-10-15', certNumber: 'DOSH-WSA-2025-012', expiryDate: '2026-04-30' },
  { id: 'C003', category: 'WIBA', item: 'Employee Insurance Coverage', status: 'Compliant', dueDate: '2026-06-30', lastChecked: '2026-02-01', certNumber: 'WIBA-EIC-2026-045', expiryDate: '2026-06-30' },
  { id: 'C004', category: 'DOSH', item: 'Equipment Inspection Report', status: 'Overdue', dueDate: '2026-03-15', lastChecked: '2025-09-15', certNumber: 'DOSH-EIR-2025-089', expiryDate: '2026-03-15' },
  { id: 'C005', category: 'WIBA', item: 'Hazardous Material Handling License', status: 'Compliant', dueDate: '2027-01-31', lastChecked: '2026-03-01', certNumber: 'WIBA-HML-2026-007', expiryDate: '2027-01-31' },
  { id: 'C006', category: 'DOSH', item: 'First Aid Training Certification', status: 'Warning', dueDate: '2026-05-15', lastChecked: '2025-11-15', certNumber: 'DOSH-FAT-2025-034', expiryDate: '2026-05-15' },
];

const mockInspections: Inspection[] = [
  { id: 'INS001', title: 'Monthly Fire Safety Check', location: 'Building A', inspector: 'Sarah Odhiambo', date: '2026-04-10', status: 'Scheduled', checklist: [
    { item: 'Fire extinguishers checked', checked: false, notes: '' },
    { item: 'Emergency exits clear', checked: false, notes: '' },
    { item: 'Fire alarm tested', checked: false, notes: '' },
    { item: 'Sprinkler system operational', checked: false, notes: '' },
  ]},
  { id: 'INS002', title: 'Electrical Safety Inspection', location: 'Plant Floor', inspector: 'David Njoroge', date: '2026-04-02', status: 'Completed', result: 'Pass', checklist: [
    { item: 'Wiring insulation intact', checked: true, notes: 'All good' },
    { item: 'Circuit breakers tested', checked: true, notes: 'Passed' },
    { item: 'Grounding verified', checked: true, notes: 'Verified' },
  ]},
  { id: 'INS003', title: 'PPE Compliance Audit', location: 'Construction Site A', inspector: 'James Otieno', date: '2026-04-07', status: 'In Progress', checklist: [
    { item: 'Helmets worn by all workers', checked: true, notes: '' },
    { item: 'Safety boots worn', checked: true, notes: '' },
    { item: 'High-vis vests worn', checked: false, notes: '2 workers missing vests' },
    { item: 'Gloves provided', checked: true, notes: '' },
  ]},
];

const mockAlerts: SafetyAlert[] = [
  { id: 'A001', type: 'Expired Certification', message: 'Equipment Inspection Report has expired (was due 2026-03-15)', severity: 'Critical', date: '2026-04-01', read: false },
  { id: 'A002', type: 'Overdue Check', message: 'Workplace Safety Audit due in 22 days', severity: 'Warning', date: '2026-04-08', read: false },
  { id: 'A003', type: 'High Risk Incident', message: 'Chemical spill at Plant Floor requires immediate attention', severity: 'Critical', date: '2026-04-05', read: false },
  { id: 'A004', type: 'Overdue Check', message: 'First Aid Training Certification renewal due in 37 days', severity: 'Warning', date: '2026-04-08', read: true },
];

export const useEHSStore = create<EHSStore>((set) => ({
  incidents: mockIncidents,
  compliance: mockCompliance,
  inspections: mockInspections,
  alerts: mockAlerts,
  addIncident: (i) => set((s) => ({ incidents: [...s.incidents, { ...i, id: `INC${String(s.incidents.length + 1).padStart(3, '0')}` }] })),
  updateIncident: (id, data) => set((s) => ({ incidents: s.incidents.map((i) => i.id === id ? { ...i, ...data } : i) })),
  deleteIncident: (id) => set((s) => ({ incidents: s.incidents.filter((i) => i.id !== id) })),
  addCompliance: (c) => set((s) => ({ compliance: [...s.compliance, { ...c, id: `C${String(s.compliance.length + 1).padStart(3, '0')}` }] })),
  updateCompliance: (id, data) => set((s) => ({ compliance: s.compliance.map((c) => c.id === id ? { ...c, ...data } : c) })),
  addInspection: (i) => set((s) => ({ inspections: [...s.inspections, { ...i, id: `INS${String(s.inspections.length + 1).padStart(3, '0')}` }] })),
  updateInspection: (id, data) => set((s) => ({ inspections: s.inspections.map((i) => i.id === id ? { ...i, ...data } : i) })),
  markAlertRead: (id) => set((s) => ({ alerts: s.alerts.map((a) => a.id === id ? { ...a, read: true } : a) })),
}));
