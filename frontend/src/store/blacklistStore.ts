import { create } from 'zustand';
import { api } from '@/lib/api';
import { sanitizeError } from '@/lib/secure';
import { toast } from 'sonner';

export interface BlacklistEntry {
  id: string;
  name: string;
  email: string;
  reason: string;
  addedDate: string;
  addedBy: string;
  severity: 'High' | 'Medium' | 'Low';
}

interface BlacklistState {
  entries: BlacklistEntry[];
  loading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  addEntry: (e: Omit<BlacklistEntry, 'id' | 'addedDate'>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useBlacklistStore = create<BlacklistState>((set) => ({
  entries: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<BlacklistEntry[]>('/blacklist');
      set({ entries: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch blacklist';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  addEntry: async (e) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<BlacklistEntry>('/blacklist', e);
      set((s) => ({ entries: [created, ...s.entries], loading: false }));
      toast.success('Entry added to blacklist');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add entry';
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  removeEntry: async (id) => {
    set({ error: null });
    try {
      await api.delete(`/blacklist/${id}`);
      set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
      toast.success('Removed from blacklist');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove entry';
      set({ error: msg });
      toast.error(msg);
    }
  },
}));
