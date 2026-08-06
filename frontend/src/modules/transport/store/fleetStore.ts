import { create } from 'zustand';
import { seedFleetData, FleetDatabase } from '@/modules/transport/data/mockData';
import { buildVehicleHealth, VehicleHealth } from '@/modules/transport/utils/health';
import { Vehicle } from '@/modules/transport/types';

interface FleetState extends FleetDatabase {
  health: Record<string, VehicleHealth>;
  initialized: boolean;
  init: () => void;
  updateVehicle: (v: Vehicle) => void;
  refreshHealth: () => void;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  ...seedFleetData(),
  health: {},
  initialized: false,

  init: () => {
    if (get().initialized) return;
    const db = seedFleetData();
    const health: Record<string, VehicleHealth> = {};
    for (const v of db.vehicles) {
      health[v.id] = buildVehicleHealth(v, db);
    }
    set({ ...db, health, initialized: true });
  },

  updateVehicle: (v) => {
    const { vehicles, health } = get();
    const next = vehicles.map((x) => (x.id === v.id ? v : x));
    const updated = buildVehicleHealth(v, { ...get() });
    set({ vehicles: next, health: { ...health, [v.id]: updated } });
  },

  refreshHealth: () => {
    const db = get();
    const health: Record<string, VehicleHealth> = {};
    for (const v of db.vehicles) {
      health[v.id] = buildVehicleHealth(v, db);
    }
    set({ health });
  },
}));
