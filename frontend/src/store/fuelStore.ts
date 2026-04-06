import { create } from 'zustand';

export interface FuelEntry {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plate: string;
  driver: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  mileage: number;
  station: string;
  fuelType: 'Diesel' | 'Petrol';
}

const mockFuelEntries: FuelEntry[] = [
  { id: '1', vehicleId: '1', vehicleName: 'Isuzu FRR', plate: 'KDA 123A', driver: 'James Mwangi', date: '2024-02-12', liters: 80, costPerLiter: 210, totalCost: 16800, mileage: 125000, station: 'Total Westlands', fuelType: 'Diesel' },
  { id: '2', vehicleId: '2', vehicleName: 'Toyota Hiace', plate: 'KDB 456B', driver: 'Peter Oduor', date: '2024-02-11', liters: 55, costPerLiter: 210, totalCost: 11550, mileage: 89000, station: 'Shell Kilimani', fuelType: 'Diesel' },
  { id: '3', vehicleId: '4', vehicleName: 'Honda Boda', plate: 'KMFX 012', driver: 'Brian Kipchoge', date: '2024-02-10', liters: 8, costPerLiter: 217, totalCost: 1736, mileage: 45000, station: 'Rubis CBD', fuelType: 'Petrol' },
  { id: '4', vehicleId: '1', vehicleName: 'Isuzu FRR', plate: 'KDA 123A', driver: 'James Mwangi', date: '2024-02-05', liters: 75, costPerLiter: 208, totalCost: 15600, mileage: 124200, station: 'Total Mombasa Rd', fuelType: 'Diesel' },
  { id: '5', vehicleId: '5', vehicleName: 'Toyota Probox', plate: 'KDE 345D', driver: 'Samuel Kamau', date: '2024-02-03', liters: 35, costPerLiter: 217, totalCost: 7595, mileage: 67000, station: 'Shell Langata', fuelType: 'Petrol' },
  { id: '6', vehicleId: '2', vehicleName: 'Toyota Hiace', plate: 'KDB 456B', driver: 'Peter Oduor', date: '2024-01-28', liters: 50, costPerLiter: 205, totalCost: 10250, mileage: 88200, station: 'Total Thika Rd', fuelType: 'Diesel' },
];

interface FuelState {
  entries: FuelEntry[];
  addEntry: (e: FuelEntry) => void;
  updateEntry: (id: string, data: Partial<FuelEntry>) => void;
  removeEntry: (id: string) => void;
}

export const useFuelStore = create<FuelState>((set) => ({
  entries: mockFuelEntries,
  addEntry: (e) => set((s) => ({ entries: [...s.entries, e] })),
  updateEntry: (id, data) => set((s) => ({ entries: s.entries.map((e) => e.id === id ? { ...e, ...data } : e) })),
  removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
}));
