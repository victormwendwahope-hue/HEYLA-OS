import { create } from 'zustand';

export interface FuelEntry {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleModel: string;
  plate: string;
  driver: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  mileage: number;
  station: string;
  fuelType: 'Diesel' | 'Petrol';
  loadState: 'Loaded' | 'Unloaded';
  cargoWeight: number; // in kg
  kmPerLiter: number;
  tripDistance: number;
}

const mockFuelEntries: FuelEntry[] = [
  { id: '1', vehicleId: '1', vehicleName: 'Isuzu FRR', vehicleModel: 'FRR 90N', plate: 'KDA 123A', driver: 'James Mwangi', date: '2024-02-12', liters: 80, costPerLiter: 210, totalCost: 16800, mileage: 125000, station: 'Total Westlands', fuelType: 'Diesel', loadState: 'Loaded', cargoWeight: 4500, kmPerLiter: 4.2, tripDistance: 336 },
  { id: '2', vehicleId: '2', vehicleName: 'Toyota Hiace', vehicleModel: 'KDH 223', plate: 'KDB 456B', driver: 'Peter Oduor', date: '2024-02-11', liters: 55, costPerLiter: 210, totalCost: 11550, mileage: 89000, station: 'Shell Kilimani', fuelType: 'Diesel', loadState: 'Loaded', cargoWeight: 1200, kmPerLiter: 6.8, tripDistance: 374 },
  { id: '3', vehicleId: '4', vehicleName: 'Honda Boda', vehicleModel: 'CB125F', plate: 'KMFX 012', driver: 'Brian Kipchoge', date: '2024-02-10', liters: 8, costPerLiter: 217, totalCost: 1736, mileage: 45000, station: 'Rubis CBD', fuelType: 'Petrol', loadState: 'Unloaded', cargoWeight: 0, kmPerLiter: 35, tripDistance: 280 },
  { id: '4', vehicleId: '1', vehicleName: 'Isuzu FRR', vehicleModel: 'FRR 90N', plate: 'KDA 123A', driver: 'James Mwangi', date: '2024-02-05', liters: 75, costPerLiter: 208, totalCost: 15600, mileage: 124200, station: 'Total Mombasa Rd', fuelType: 'Diesel', loadState: 'Unloaded', cargoWeight: 0, kmPerLiter: 5.8, tripDistance: 435 },
  { id: '5', vehicleId: '5', vehicleName: 'Toyota Probox', vehicleModel: 'NCP160', plate: 'KDE 345D', driver: 'Samuel Kamau', date: '2024-02-03', liters: 35, costPerLiter: 217, totalCost: 7595, mileage: 67000, station: 'Shell Langata', fuelType: 'Petrol', loadState: 'Loaded', cargoWeight: 350, kmPerLiter: 11.2, tripDistance: 392 },
  { id: '6', vehicleId: '2', vehicleName: 'Toyota Hiace', vehicleModel: 'KDH 223', plate: 'KDB 456B', driver: 'Peter Oduor', date: '2024-01-28', liters: 50, costPerLiter: 205, totalCost: 10250, mileage: 88200, station: 'Total Thika Rd', fuelType: 'Diesel', loadState: 'Unloaded', cargoWeight: 0, kmPerLiter: 8.1, tripDistance: 405 },
  { id: '7', vehicleId: '3', vehicleName: 'Mitsubishi Canter', vehicleModel: 'FE85', plate: 'KCC 789C', driver: 'John Wekesa', date: '2024-02-08', liters: 65, costPerLiter: 210, totalCost: 13650, mileage: 210500, station: 'Shell Industrial', fuelType: 'Diesel', loadState: 'Loaded', cargoWeight: 3800, kmPerLiter: 3.9, tripDistance: 253 },
  { id: '8', vehicleId: '3', vehicleName: 'Mitsubishi Canter', vehicleModel: 'FE85', plate: 'KCC 789C', driver: 'John Wekesa', date: '2024-01-25', liters: 45, costPerLiter: 208, totalCost: 9360, mileage: 209800, station: 'Total Athi River', fuelType: 'Diesel', loadState: 'Unloaded', cargoWeight: 0, kmPerLiter: 5.6, tripDistance: 252 },
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
