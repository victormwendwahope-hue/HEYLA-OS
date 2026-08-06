import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface FuelEntry {
  id: string; vehicleId: string; vehicleName: string; vehicleModel: string;
  vehicleType: string; plate: string; driver: string; date: string; liters: number;
  costPerLiter: number; totalCost: number; mileage: number; station: string;
  fuelType: 'Diesel' | 'Petrol'; loadState: 'Loaded' | 'Unloaded';
  cargoWeight: number; kmPerLiter: number; tripDistance: number;
  tankCapacity: number; costPerKm: number; notes: string;
}

export interface FuelAnomaly {
  id: string; date: string; plate: string; vehicleName: string; vehicleModel: string;
  flag: string; severity: 'high' | 'medium' | 'low'; message: string;
  liters: number; kmPerLiter: number; costPerLiter: number; totalCost: number;
}

export interface FuelVehicleStats {
  plate: string; name: string; model: string; type: string; fills: number;
  totalLiters: number; totalCost: number; kmDriven: number; avgKpl: number;
  costPerKm: number; avgPrice: number; lastFill: string; lastMileage: number;
  tankCapacity: number; varianceLiters: number; expectedLiters: number;
  status: 'ok' | 'watch' | 'concern' | 'no-data';
}

export interface FuelDriverStats {
  driver: string; fills: number; totalCost: number; totalLiters: number;
  kmDriven: number; avgKpl: number; costPerKm: number;
}

export interface FuelMonthly {
  month: string; label: string; totalCost: number; totalLiters: number;
  kmDriven: number; costPerKm: number; avgKpl: number;
}

export interface FleetVehicleLite {
  id: string; name: string; plate: string; type: string; status: string;
  driver: string; mileage: number; fuelType: string; tankCapacity: number;
}

export interface FuelAnalytics {
  summary: {
    totalCost: number; totalLiters: number; totalKm: number; avgKpl: number;
    costPerKm: number; avgPrice: number; anomalyCount: number;
    estVarianceLoss: number; entryCount: number;
  };
  vehicles: FuelVehicleStats[];
  drivers: FuelDriverStats[];
  monthly: FuelMonthly[];
  anomalies: FuelAnomaly[];
  fleet: FleetVehicleLite[];
}

interface FuelState {
  entries: FuelEntry[]; analytics: FuelAnalytics | null; loading: boolean; error: string | null;
  fetchEntries: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  addEntry: (e: Partial<FuelEntry>) => Promise<void>;
  updateEntry: (id: string, data: Partial<FuelEntry>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useFuelStore = create<FuelState>((set) => ({
  entries: [], analytics: null, loading: false, error: null,
  clearError: () => set({ error: null }),

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try { set({ entries: await api.get<FuelEntry[]>('/fuel'), loading: false }); }
    catch (err: unknown) { set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false }); toast.error('Failed to fetch fuel entries'); }
  },

  fetchAnalytics: async () => {
    try { set({ analytics: await api.get<FuelAnalytics>('/fuel/analytics') }); }
    catch { toast.error('Failed to fetch fuel analytics'); }
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
