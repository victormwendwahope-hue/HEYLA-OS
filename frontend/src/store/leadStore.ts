import { create } from 'zustand';
import { Lead } from '@/types';
import { api } from '@/lib/api';
import { sanitizeError } from '@/lib/secure';
import { toast } from 'sonner';

interface LeadState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  removeLead: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<Lead[]>('/leads');
      set({ leads: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch leads';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addLead: async (lead) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<Lead>('/leads', lead);
      set((s) => ({ leads: [created, ...s.leads], loading: false }));
      toast.success('Lead created');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create lead';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  updateLead: async (id, data) => {
    set({ error: null });
    try {
      const updated = await api.patch<Lead>(`/leads/${id}`, data);
      set((s) => ({ leads: s.leads.map((l) => (l.id === id ? updated : l)) }));
      toast.success('Lead updated');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update lead';
      set({ error: msg });
      toast.error(msg);
    }
  },

  removeLead: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/leads/${id}`);
      set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
      toast.success('Lead deleted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete lead';
      set({ error: msg });
      toast.error(msg);
    }
  },
}));
