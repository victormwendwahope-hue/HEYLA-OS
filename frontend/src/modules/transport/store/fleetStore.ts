import { create } from 'zustand';
import { seedFleetData, FleetDatabase } from '@/modules/transport/data/mockData';
import { buildVehicleHealth } from '@/modules/transport/utils/health';
import { Vehicle, Driver, HeavyEquipment, WorkOrder, Breakdown, MaintenanceSchedule, Trip, Tyre, ComplianceAlert, VehicleHealth } from '@/modules/transport/types';

interface FleetState extends FleetDatabase {
  health: Record<string, VehicleHealth>;
  initialized: boolean;
  init: () => void;
  updateVehicle: (v: Vehicle) => void;
  refreshHealth: () => void;
  addDriver: (d: Driver) => void;
  addVehicle: (v: Vehicle) => void;
  addEquipment: (e: HeavyEquipment) => void;
  updateDriver: (d: Driver) => void;
  addWorkOrder: (w: WorkOrder) => void;
  updateWorkOrder: (w: WorkOrder) => void;
  addBreakdown: (b: Breakdown) => void;
  addMaintenance: (m: MaintenanceSchedule) => void;
  addTrip: (t: Trip) => void;
  addTyre: (t: Tyre) => void;
  acknowledgeAlert: (id: string) => void;
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

  addDriver: (d) => {
    set({ drivers: [d, ...get().drivers] });
  },

  updateDriver: (d) => {
    set({ drivers: get().drivers.map((x) => (x.id === d.id ? d : x)) });
  },

  addVehicle: (v) => {
    const vehicles = [v, ...get().vehicles];
    set({ vehicles, health: { ...get().health, [v.id]: buildVehicleHealth(v, { ...get(), vehicles }) } });
  },

  addEquipment: (e) => {
    set({ heavyEquipment: [e, ...get().heavyEquipment] });
  },

  addWorkOrder: (w) => {
    set({ workOrders: [w, ...get().workOrders] });
  },

  updateWorkOrder: (w) => {
    set({ workOrders: get().workOrders.map((x) => (x.id === w.id ? w : x)) });
  },

  addBreakdown: (b) => {
    set({ breakdowns: [b, ...get().breakdowns] });
  },

  addMaintenance: (m) => {
    set({ maintenance: [m, ...get().maintenance] });
  },

  addTrip: (t) => {
    set({ trips: [t, ...get().trips] });
  },

  addTyre: (t) => {
    set({ tyres: [t, ...get().tyres] });
  },

  acknowledgeAlert: (id) => {
    set({ complianceAlerts: get().complianceAlerts.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' } : a)) });
  },
}));
