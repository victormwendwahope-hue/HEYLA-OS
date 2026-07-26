import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Vehicle {
  id: string; name: string; plate: string;
  type: 'Truck' | 'Van' | 'Motorcycle' | 'Car';
  status: 'Active' | 'Maintenance' | 'Idle';
  driver: string; mileage: number;
  fuelType: 'Diesel' | 'Petrol' | 'Electric';
  lastService: string;
}

export interface Driver {
  id: string; name: string; phone: string;
  license: string; status: 'Available' | 'On Trip' | 'Off Duty';
  trips: number; rating: number; avatar?: string;
}

export interface Shipment {
  id: string; trackingNo: string; origin: string; destination: string;
  status: 'Pending' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Cancelled';
  driver: string; vehicle: string; weight: string;
  estimatedDelivery: string; createdAt: string;
}

interface TransportState {
  vehicles: Vehicle[]; drivers: Driver[]; shipments: Shipment[];
  loading: boolean; error: string | null;
  fetchVehicles: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  fetchShipments: () => Promise<void>;
  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  addDriver: (d: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (id: string, data: Partial<Driver>) => Promise<void>;
  removeDriver: (id: string) => Promise<void>;
  addShipment: (s: Omit<Shipment, 'id' | 'createdAt'>) => Promise<void>;
  updateShipment: (id: string, data: Partial<Shipment>) => Promise<void>;
  removeShipment: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  vehicles: [], drivers: [], shipments: [],
  loading: false, error: null,
  clearError: () => set({ error: null }),

  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try { set({ vehicles: await api.get<Vehicle[]>('/vehicles'), loading: false }); }
    catch (err: unknown) { set({ error: err instanceof Error ? err.message : 'Unknown error', loading: false }); toast.error('Failed to fetch vehicles'); }
  },
  fetchDrivers: async () => {
    try { set({ drivers: await api.get<Driver[]>('/drivers') }); }
    catch { toast.error('Failed to fetch drivers'); }
  },
  fetchShipments: async () => {
    try { set({ shipments: await api.get<Shipment[]>('/shipments') }); }
    catch { toast.error('Failed to fetch shipments'); }
  },

  addVehicle: async (v) => {
    try { const created = await api.post<Vehicle>('/vehicles', v); set((s) => ({ vehicles: [...s.vehicles, created] })); toast.success('Vehicle added'); }
    catch { toast.error('Failed to add vehicle'); }
  },
  updateVehicle: async (id, data) => {
    try { const updated = await api.patch<Vehicle>(`/vehicles/${id}`, data); set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? updated : v)) })); toast.success('Vehicle updated'); }
    catch { toast.error('Failed to update vehicle'); }
  },
  removeVehicle: async (id) => {
    try { await api.delete(`/vehicles/${id}`); set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) })); toast.success('Vehicle removed'); }
    catch { toast.error('Failed to remove vehicle'); }
  },

  addDriver: async (d) => {
    try { const created = await api.post<Driver>('/drivers', d); set((s) => ({ drivers: [...s.drivers, created] })); toast.success('Driver added'); }
    catch { toast.error('Failed to add driver'); }
  },
  updateDriver: async (id, data) => {
    try { const updated = await api.patch<Driver>(`/drivers/${id}`, data); set((s) => ({ drivers: s.drivers.map((d) => (d.id === id ? updated : d)) })); toast.success('Driver updated'); }
    catch { toast.error('Failed to update driver'); }
  },
  removeDriver: async (id) => {
    try { await api.delete(`/drivers/${id}`); set((s) => ({ drivers: s.drivers.filter((d) => d.id !== id) })); toast.success('Driver removed'); }
    catch { toast.error('Failed to remove driver'); }
  },

  addShipment: async (s) => {
    try { const created = await api.post<Shipment>('/shipments', s); set((s2) => ({ shipments: [...s2.shipments, created] })); toast.success('Shipment created'); }
    catch { toast.error('Failed to create shipment'); }
  },
  updateShipment: async (id, data) => {
    try { const updated = await api.patch<Shipment>(`/shipments/${id}`, data); set((s) => ({ shipments: s.shipments.map((sh) => (sh.id === id ? updated : sh)) })); toast.success('Shipment updated'); }
    catch { toast.error('Failed to update shipment'); }
  },
  removeShipment: async (id) => {
    try { await api.delete(`/shipments/${id}`); set((s) => ({ shipments: s.shipments.filter((sh) => sh.id !== id) })); toast.success('Shipment removed'); }
    catch { toast.error('Failed to remove shipment'); }
  },
}));
