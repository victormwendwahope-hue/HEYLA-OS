import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface FuelEntry {
  id: string; vehicleId: string; vehicleName: string; vehicleModel: string;
  plate: string; driver: string; date: string; liters: number;
  costPerLiter: number; totalCost: number; mileage: number; station: string;
  fuelType: 'Diesel' | 'Petrol'; loadState: 'Loaded' | 'Unloaded';
  cargoWeight: number; kmPerLiter: number; tripDistance: number;
}

interface FuelState {
  entries: FuelEntry[]; loading: boolean; error: string | null;
  fetchEntries: () => Promise<void>;
  addEntry: (e: Omit<FuelEntry, 'id' | 'totalCost' | 'kmPerLiter'>) => Promise<void>;
  updateEntry: (id: string, data: Partial<FuelEntry>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useFuelStore = create<FuelState>((set) => ({
  entries: [], loading: false, error: null,
  clearError: () => set({ error: null }),

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try { set({ entries: await api.get<FuelEntry[]>('/fuel'), loading: false }); }
    catch (err: unknown) { set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false }); toast.error('Failed to fetch fuel entries'); }
  },

  addEntry: async (e) => {
    try { const created = await api.post<FuelEntry>('/fuel', e); set((s) => ({ entries: [...s.entries, created] })); toast.success('Fuel entry added'); }
    catch { toast.error('Failed to add fuel entry'); }
  },
  updateEntry: async (id, data) => {
    try { const updated = await api.patch<FuelEntry>(`/fuel/${id}`, data); set((s) => ({ entries: s.entries.map((e) => (e.id === id ? updated : e)) })); toast.success('Fuel entry updated'); }
    catch { toast.error('Failed to update fuel entry'); }
  },
  removeEntry: async (id) => {
    try { await api.delete(`/fuel/${id}`); set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })); toast.success('Fuel entry removed'); }
    catch { toast.error('Failed to remove fuel entry'); }
  },
}));
