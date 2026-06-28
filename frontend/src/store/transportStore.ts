import { create } from 'zustand';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: 'Truck' | 'Van' | 'Motorcycle' | 'Car';
  status: 'Active' | 'Maintenance' | 'Idle';
  driver: string;
  mileage: number;
  fuelType: 'Diesel' | 'Petrol' | 'Electric';
  lastService: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  status: 'Available' | 'On Trip' | 'Off Duty';
  trips: number;
  rating: number;
  avatar?: string;
}

export interface Shipment {
  id: string;
  trackingNo: string;
  origin: string;
  destination: string;
  status: 'Pending' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Cancelled';
  driver: string;
  vehicle: string;
  weight: string;
  estimatedDelivery: string;
  createdAt: string;
}

const mockVehicles: Vehicle[] = [
  { id: '1', name: 'Isuzu FRR', plate: 'KDA 123A', type: 'Truck', status: 'Active', driver: 'James Mwangi', mileage: 125000, fuelType: 'Diesel', lastService: '2024-01-10' },
  { id: '2', name: 'Toyota Hiace', plate: 'KDB 456B', type: 'Van', status: 'Active', driver: 'Peter Oduor', mileage: 89000, fuelType: 'Diesel', lastService: '2024-01-20' },
  { id: '3', name: 'Mitsubishi Canter', plate: 'KCC 789C', type: 'Truck', status: 'Maintenance', driver: '', mileage: 210000, fuelType: 'Diesel', lastService: '2023-12-15' },
  { id: '4', name: 'Honda Boda', plate: 'KMFX 012', type: 'Motorcycle', status: 'Active', driver: 'Brian Kipchoge', mileage: 45000, fuelType: 'Petrol', lastService: '2024-02-01' },
  { id: '5', name: 'Toyota Probox', plate: 'KDE 345D', type: 'Car', status: 'Idle', driver: '', mileage: 67000, fuelType: 'Petrol', lastService: '2024-01-28' },
];

const mockDrivers: Driver[] = [
  { id: '1', name: 'James Mwangi', phone: '+254 712 111 222', license: 'DL-2020-001', status: 'On Trip', trips: 234, rating: 4.8 },
  { id: '2', name: 'Peter Oduor', phone: '+254 733 333 444', license: 'DL-2019-045', status: 'Available', trips: 189, rating: 4.6 },
  { id: '3', name: 'Brian Kipchoge', phone: '+254 700 555 666', license: 'DL-2021-112', status: 'On Trip', trips: 156, rating: 4.9 },
  { id: '4', name: 'Samuel Kamau', phone: '+254 711 777 888', license: 'DL-2018-078', status: 'Off Duty', trips: 312, rating: 4.5 },
];

const mockShipments: Shipment[] = [
  { id: '1', trackingNo: 'SHP-2024-001', origin: 'Nairobi', destination: 'Mombasa', status: 'In Transit', driver: 'James Mwangi', vehicle: 'KDA 123A', weight: '2,500 kg', estimatedDelivery: '2024-02-15', createdAt: '2024-02-12' },
  { id: '2', trackingNo: 'SHP-2024-002', origin: 'Nairobi', destination: 'Kisumu', status: 'Delivered', driver: 'Peter Oduor', vehicle: 'KDB 456B', weight: '800 kg', estimatedDelivery: '2024-02-10', createdAt: '2024-02-08' },
  { id: '3', trackingNo: 'SHP-2024-003', origin: 'Nakuru', destination: 'Eldoret', status: 'Pending', driver: '', vehicle: '', weight: '1,200 kg', estimatedDelivery: '2024-02-18', createdAt: '2024-02-14' },
  { id: '4', trackingNo: 'SHP-2024-004', origin: 'Mombasa', destination: 'Nairobi', status: 'Picked Up', driver: 'Brian Kipchoge', vehicle: 'KMFX 012', weight: '150 kg', estimatedDelivery: '2024-02-16', createdAt: '2024-02-14' },
];

interface TransportState {
  vehicles: Vehicle[];
  drivers: Driver[];
  shipments: Shipment[];
  loading: boolean;
  fetchVehicles: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  fetchShipments: () => Promise<void>;
  addVehicle: (v: Vehicle) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  addDriver: (d: Driver) => Promise<void>;
  updateDriver: (id: string, data: Partial<Driver>) => Promise<void>;
  removeDriver: (id: string) => Promise<void>;
  addShipment: (s: Shipment) => Promise<void>;
  updateShipment: (id: string, data: Partial<Shipment>) => Promise<void>;
  removeShipment: (id: string) => Promise<void>;
}

export const useTransportStore = create<TransportState>((set) => ({
  vehicles: mockVehicles,
  drivers: mockDrivers,
  shipments: mockShipments,
  loading: false,
  fetchVehicles: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Vehicle[]>('/vehicles');
      set({ vehicles: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchDrivers: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Driver[]>('/drivers');
      set({ drivers: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchShipments: async () => {
    set({ loading: true });
    try {
      const data = await api.get<Shipment[]>('/shipments');
      set({ shipments: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  addVehicle: async (v) => {
    try {
      const created = await api.post<Vehicle>('/vehicles', v);
      set((s) => ({ vehicles: [...s.vehicles, created] }));
      toast.success('Vehicle created');
    } catch {
      set((s) => ({ vehicles: [...s.vehicles, v] }));
      toast.error('Failed to create vehicle');
    }
  },
  updateVehicle: async (id, data) => {
    try {
      const updated = await api.patch<Vehicle>(`/vehicles/${id}`, data);
      set((s) => ({ vehicles: s.vehicles.map((v) => v.id === id ? updated : v) }));
      toast.success('Vehicle updated');
    } catch {
      set((s) => ({ vehicles: s.vehicles.map((v) => v.id === id ? { ...v, ...data } : v) }));
      toast.error('Failed to update vehicle');
    }
  },
  removeVehicle: async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }));
      toast.success('Vehicle deleted');
    } catch {
      set((s) => ({ vehicles: s.vehicles.filter((v) => v.id !== id) }));
      toast.error('Failed to delete vehicle');
    }
  },
  addDriver: async (d) => {
    try {
      const created = await api.post<Driver>('/drivers', d);
      set((s) => ({ drivers: [...s.drivers, created] }));
      toast.success('Driver created');
    } catch {
      set((s) => ({ drivers: [...s.drivers, d] }));
      toast.error('Failed to create driver');
    }
  },
  updateDriver: async (id, data) => {
    try {
      const updated = await api.patch<Driver>(`/drivers/${id}`, data);
      set((s) => ({ drivers: s.drivers.map((d) => d.id === id ? updated : d) }));
      toast.success('Driver updated');
    } catch {
      set((s) => ({ drivers: s.drivers.map((d) => d.id === id ? { ...d, ...data } : d) }));
      toast.error('Failed to update driver');
    }
  },
  removeDriver: async (id) => {
    try {
      await api.delete(`/drivers/${id}`);
      set((s) => ({ drivers: s.drivers.filter((d) => d.id !== id) }));
      toast.success('Driver deleted');
    } catch {
      set((s) => ({ drivers: s.drivers.filter((d) => d.id !== id) }));
      toast.error('Failed to delete driver');
    }
  },
  addShipment: async (sh) => {
    try {
      const created = await api.post<Shipment>('/shipments', sh);
      set((s) => ({ shipments: [...s.shipments, created] }));
      toast.success('Shipment created');
    } catch {
      set((s) => ({ shipments: [...s.shipments, sh] }));
      toast.error('Failed to create shipment');
    }
  },
  updateShipment: async (id, data) => {
    try {
      const updated = await api.patch<Shipment>(`/shipments/${id}`, data);
      set((s) => ({ shipments: s.shipments.map((sh) => sh.id === id ? updated : sh) }));
      toast.success('Shipment updated');
    } catch {
      set((s) => ({ shipments: s.shipments.map((sh) => sh.id === id ? { ...sh, ...data } : sh) }));
      toast.error('Failed to update shipment');
    }
  },
  removeShipment: async (id) => {
    try {
      await api.delete(`/shipments/${id}`);
      set((s) => ({ shipments: s.shipments.filter((sh) => sh.id !== id) }));
      toast.success('Shipment deleted');
    } catch {
      set((s) => ({ shipments: s.shipments.filter((sh) => sh.id !== id) }));
      toast.error('Failed to delete shipment');
    }
  },
}));
