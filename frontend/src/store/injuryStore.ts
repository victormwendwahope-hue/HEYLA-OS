import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Injury {
  id: string;
  employee: string;
  department: string;
  injuryType: 'Minor' | 'Moderate' | 'Severe' | 'Critical';
  bodyPart: string;
  cause: string;
  location: string;
  date: string;
  daysLost: number;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';
  reportedBy: string;
  correctiveAction: string;
}

interface InjuryState {
  injuries: Injury[];
  loading: boolean;
  error: string | null;
  fetchInjuries: () => Promise<void>;
  addInjury: (i: Omit<Injury, 'id' | 'status' | 'reportedBy' | 'date'>) => Promise<void>;
  updateInjury: (id: string, data: Partial<Injury>) => Promise<void>;
  removeInjury: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useInjuryStore = create<InjuryState>((set) => ({
  injuries: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchInjuries: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<Injury[]>('/injuries');
      set({ injuries: data, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch injuries';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addInjury: async (i) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<Injury>('/injuries', i);
      set((s) => ({ injuries: [created, ...s.injuries], loading: false }));
      toast.success('Injury reported');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to report injury';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  updateInjury: async (id, data) => {
    set({ error: null });
    try {
      const updated = await api.patch<Injury>(`/injuries/${id}`, data);
      set((s) => ({ injuries: s.injuries.map((i) => (i.id === id ? updated : i)) }));
      toast.success('Injury updated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update injury';
      set({ error: msg });
      toast.error(msg);
    }
  },

  removeInjury: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/injuries/${id}`);
      set((s) => ({ injuries: s.injuries.filter((i) => i.id !== id) }));
      toast.success('Injury deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete injury';
      set({ error: msg });
      toast.error(msg);
    }
  },
}));
