import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export type FIDICType = 'Red Book' | 'Yellow Book' | 'Silver Book' | 'Gold Book';

export interface Project {
  id: string; name: string; client: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  progress: number; budget: number; spent: number;
  startDate: string; endDate: string; manager: string;
}

export interface Contract {
  id: string; projectId: string; name: string; type: FIDICType;
  employer: string; contractor: string; engineer: string;
  price: number; status: 'Draft' | 'Active' | 'Completed' | 'Terminated';
  startDate: string; endDate: string; currency: string;
}

export interface Claim {
  id: string; contractId: string; title: string;
  type: 'EOT' | 'Payment' | 'Both';
  dateOfEvent: string; description: string; amount?: number; daysRequested?: number;
  status: 'Notice Sent' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  timeBarDays: number; noticeDate: string; documents: string;
}

export interface Variation {
  id: string; contractId: string; description: string;
  costImpact: number; timeImpact: number;
  status: 'Requested' | 'Under Review' | 'Approved' | 'Rejected'; requestDate: string;
}

export interface PaymentCertificate {
  id: string; contractId: string; certNumber: number;
  amountDue: number; retentionDeducted: number; netPayment: number;
  dueDate: string; status: 'Draft' | 'Submitted' | 'Approved' | 'Paid';
}

export interface Dispute {
  id: string; contractId: string; title: string;
  type: 'NOD' | 'DAB Referral' | 'Arbitration';
  status: 'Filed' | 'Under Review' | 'Hearing' | 'Resolved';
  filedDate: string; description: string;
}

export interface EarlyWarning {
  id: string; projectId: string; description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigationPlan: string; status: 'Open' | 'Mitigated' | 'Closed'; date: string;
}

interface EngStore {
  projects: Project[]; contracts: Contract[]; claims: Claim[];
  variations: Variation[]; payments: PaymentCertificate[];
  disputes: Dispute[]; earlyWarnings: EarlyWarning[];
  loading: boolean; error: string | null;
  fetchProjects: () => Promise<void>;
  fetchContracts: () => Promise<void>;
  fetchClaims: () => Promise<void>;
  fetchVariations: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchDisputes: () => Promise<void>;
  fetchEarlyWarnings: () => Promise<void>;
  clearError: () => void;
}

export const useEngineeringStore = create<EngStore>((set) => ({
  projects: [], contracts: [], claims: [], variations: [],
  payments: [], disputes: [], earlyWarnings: [],
  loading: false, error: null,
  clearError: () => set({ error: null }),

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try { set({ projects: await api.get<Project[]>('/engineering-projects'), loading: false }); }
    catch (err) { set({ error: (err as Error).message, loading: false }); toast.error('Failed to fetch projects'); }
  },
  fetchContracts: async () => {
    try { set({ contracts: await api.get<Contract[]>('/engineering-contracts') }); }
    catch { toast.error('Failed to fetch contracts'); }
  },
  fetchClaims: async () => {
    try { set({ claims: await api.get<Claim[]>('/engineering-claims') }); }
    catch { toast.error('Failed to fetch claims'); }
  },
  fetchVariations: async () => {
    try { set({ variations: await api.get<Variation[]>('/engineering-variations') }); }
    catch { toast.error('Failed to fetch variations'); }
  },
  fetchPayments: async () => {
    try { set({ payments: await api.get<PaymentCertificate[]>('/engineering-payments') }); }
    catch { toast.error('Failed to fetch payments'); }
  },
  fetchDisputes: async () => {
    try { set({ disputes: await api.get<Dispute[]>('/engineering-disputes') }); }
    catch { toast.error('Failed to fetch disputes'); }
  },
  fetchEarlyWarnings: async () => {
    try { set({ earlyWarnings: await api.get<EarlyWarning[]>('/engineering-early-warnings') }); }
    catch { toast.error('Failed to fetch early warnings'); }
  },
}));
