import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Incident {
  id: string; type: 'Accident' | 'Near-miss' | 'Hazard';
  location: string; description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Investigating' | 'Resolved' | 'Closed';
  reportedBy: string; reportedDate: string;
  assignedTo: string; attachments: string;
}

export interface ComplianceItem {
  id: string; category: 'DOSH' | 'WIBA';
  item: string; status: 'Compliant' | 'Warning' | 'Overdue';
  dueDate: string; lastChecked: string;
  certNumber?: string; expiryDate?: string;
}

export interface Inspection {
  id: string; title: string; location: string; inspector: string;
  date: string; status: 'Scheduled' | 'In Progress' | 'Completed';
  result?: 'Pass' | 'Fail' | 'Conditional';
  checklist: { item: string; checked: boolean; notes: string }[];
}

export interface SafetyAlert {
  id: string; type: 'Overdue Check' | 'Expired Certification' | 'High Risk Incident';
  message: string; severity: 'Info' | 'Warning' | 'Critical';
  date: string; read: boolean;
}

interface EHSStore {
  incidents: Incident[]; compliance: ComplianceItem[];
  inspections: Inspection[]; alerts: SafetyAlert[];
  loading: boolean; error: string | null;
  fetchIncidents: () => Promise<void>;
  fetchCompliance: () => Promise<void>;
  fetchInspections: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  clearError: () => void;
}

export const useEHSStore = create<EHSStore>((set) => ({
  incidents: [], compliance: [], inspections: [], alerts: [],
  loading: false, error: null,
  clearError: () => set({ error: null }),

  fetchIncidents: async () => {
    set({ loading: true, error: null });
    try { set({ incidents: await api.get<Incident[]>('/ehs-incidents'), loading: false }); }
    catch (err: unknown) { set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false }); toast.error('Failed to fetch incidents'); }
  },
  fetchCompliance: async () => {
    try { set({ compliance: await api.get<ComplianceItem[]>('/ehs-compliance') }); }
    catch { toast.error('Failed to fetch compliance'); }
  },
  fetchInspections: async () => {
    try { set({ inspections: await api.get<Inspection[]>('/ehs-inspections') }); }
    catch { toast.error('Failed to fetch inspections'); }
  },
  fetchAlerts: async () => {
    try { set({ alerts: await api.get<SafetyAlert[]>('/ehs-alerts') }); }
    catch { toast.error('Failed to fetch alerts'); }
  },
}));
