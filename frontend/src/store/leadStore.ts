import { create } from 'zustand';
import api from '@/lib/api';
import type { Lead } from '@/types';

interface LeadState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: () => Promise<void>;
  addLead: (lead: Lead) => Promise<void>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,
  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/crm/leads');
      set({ leads: res.data.data || [], loading: false });
    } catch (err: any) {
      console.error(err);
      set({ error: 'Failed to fetch leads', loading: false });
    }
  },
  addLead: async (lead) => {
    try {
      await api.post('/crm/leads', lead);
      get().fetchLeads();
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to add lead');
    }
  },
  updateLead: async (id, data) => {
    try {
      await api.put(`/crm/leads/${id}`, data);
      get().fetchLeads();
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to update lead');
    }
  },
})); 
