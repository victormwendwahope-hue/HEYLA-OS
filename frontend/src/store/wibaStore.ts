import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface WIBAClaim {
  id: string;
  employee: string;
  department: string;
  claimType: 'Medical' | 'Disability' | 'Death' | 'Rehabilitation';
  description: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Approved' | 'Rejected';
  dateOfIncident: string;
  dateFiled: string;
  insurerRef: string;
}

interface WibaState {
  claims: WIBAClaim[];
  loading: boolean;
  error: string | null;
  fetchClaims: () => Promise<void>;
  addClaim: (c: Omit<WIBAClaim, 'id' | 'dateFiled' | 'status'>) => Promise<void>;
  updateClaim: (id: string, data: Partial<WIBAClaim>) => Promise<void>;
  removeClaim: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useWibaStore = create<WibaState>((set) => ({
  claims: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchClaims: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<WIBAClaim[]>('/wiba-claims');
      set({ claims: data, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch WIBA claims';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addClaim: async (c) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<WIBAClaim>('/wiba-claims', c);
      set((s) => ({ claims: [created, ...s.claims], loading: false }));
      toast.success('WIBA claim filed');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to file WIBA claim';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  updateClaim: async (id, data) => {
    set({ error: null });
    try {
      const updated = await api.patch<WIBAClaim>(`/wiba-claims/${id}`, data);
      set((s) => ({ claims: s.claims.map((c) => (c.id === id ? updated : c)) }));
      toast.success('WIBA claim updated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update WIBA claim';
      set({ error: msg });
      toast.error(msg);
    }
  },

  removeClaim: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/wiba-claims/${id}`);
      set((s) => ({ claims: s.claims.filter((c) => c.id !== id) }));
      toast.success('WIBA claim removed');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove WIBA claim';
      set({ error: msg });
      toast.error(msg);
    }
  },
}));
