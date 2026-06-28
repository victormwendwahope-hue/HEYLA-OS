import { create } from 'zustand';
import { Lead } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const mockLeads: Lead[] = [
  { id: '1', name: 'Safaricom PLC', email: 'info@safaricom.co.ke', phone: '+254 722 000 000', company: 'Safaricom', status: 'Qualified', value: 2500000, source: 'Referral', assignedTo: 'Ochieng Otieno', createdAt: '2024-01-10', notes: 'Enterprise deal' },
  { id: '2', name: 'KCB Group', email: 'biz@kcb.co.ke', phone: '+254 711 111 111', company: 'KCB', status: 'Proposal', value: 1800000, source: 'Website', assignedTo: 'Wanjiku Mwangi', createdAt: '2024-01-15', notes: 'Banking integration' },
  { id: '3', name: 'Twiga Foods', email: 'contact@twiga.com', phone: '+254 700 222 333', company: 'Twiga', status: 'New', value: 950000, source: 'Cold Call', assignedTo: 'Kiprop Kosgei', createdAt: '2024-02-01', notes: 'Supply chain solution' },
  { id: '4', name: 'M-KOPA Solar', email: 'sales@mkopa.com', phone: '+254 733 444 555', company: 'M-KOPA', status: 'Won', value: 3200000, source: 'Conference', assignedTo: 'Ochieng Otieno', createdAt: '2023-12-20', notes: 'Signed!' },
  { id: '5', name: 'Jumia Kenya', email: 'partners@jumia.co.ke', phone: '+254 755 666 777', company: 'Jumia', status: 'Contacted', value: 1400000, source: 'LinkedIn', assignedTo: 'Amina Hassan', createdAt: '2024-02-10', notes: 'Follow up next week' },
  { id: '6', name: 'Sendy Logistics', email: 'hello@sendy.co.ke', phone: '+254 700 888 999', company: 'Sendy', status: 'Lost', value: 800000, source: 'Referral', assignedTo: 'Kiprop Kosgei', createdAt: '2024-01-05', notes: 'Went with competitor' },
];

interface LeadState {
  leads: Lead[];
  loading: boolean;
  fetchLeads: () => Promise<void>;
  addLead: (lead: Lead) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  removeLead: (id: string) => Promise<void>;
}

export const useLeadStore = create<LeadState>((set) => ({
  leads: mockLeads,
  loading: false,
  fetchLeads: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Lead[]>('/leads');
      set({ leads: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addLead: async (lead) => {
    try {
      const created = await api.post<Lead>('/leads', lead);
      set((s) => ({ leads: [...s.leads, created] }));
      toast.success('Lead created');
    } catch {
      set((s) => ({ leads: [...s.leads, lead] }));
      toast.error('Failed to create lead');
    }
  },
  updateLead: async (id, data) => {
    try {
      const updated = await api.patch<Lead>(`/leads/${id}`, data);
      set((s) => ({ leads: s.leads.map((l) => (l.id === id ? updated : l)) }));
      toast.success('Lead updated');
    } catch {
      set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...data } : l)) }));
      toast.error('Failed to update lead');
    }
  },
  removeLead: async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
      toast.success('Lead deleted');
    } catch {
      set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
      toast.error('Failed to delete lead');
    }
  },
}));
