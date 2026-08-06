import {
  Vehicle, Driver, Trip, TripExpense, FuelTransaction, FuelTank, MaintenanceSchedule,
  WorkOrder, WorkOrderPart, SparePart, Tyre, TyreMovement, Breakdown, VehicleDocument,
  InsurancePolicy, ComplianceAlert, HeavyEquipment, EngineHourLog, VehicleProfitability,
  DriverScore, FuelType,
} from '@/modules/transport/types';

// Deterministic PRNG so the demo data is stable across reloads.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260214);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const between = (min: number, max: number) => min + rnd() * (max - min);
const int = (min: number, max: number) => Math.floor(between(min, max + 1));

const TRUCK_NAMES = [
  'Scania R450', 'Volvo FH', 'Mercedes Actros', 'MAN TGS', 'Isuzu FVR', 'DAF XF', 'Renault T',
  'Iveco S-Way', 'Hino 700', 'Mitsubishi Fuso', 'Foton Auman', 'Sinotruk HOWO', 'Shacman X3000',
  'Ashok Leyland', 'Tata Prima', 'BharatBenz 2823', 'Mack Anthem', 'Kenworth T680', 'Peterbilt 579',
  'Freightliner Cascadia', 'Ford Cargo', 'FAW J6', 'JAC N-Series', 'Dongfeng K07', 'Howo T5G',
];
const PICKUP_NAMES = [
  'Toyota Hilux', 'Isuzu D-Max', 'Ford Ranger', 'Mitsubishi L200', 'Nissan Navara', 'Mahindra Pik-Up',
  'Volkswagen Amarok', 'Great Wall Poer', 'Chevrolet Colorado', 'Ram 1500',
];
const EXCAVATOR_NAMES = ['Caterpillar 320', 'Komatsu PC210', 'Volvo EC220', 'Hitachi ZX200', 'JCB JS220'];
const EQUIPMENT_MODELS = ['CAT 320D2', 'PC210LC-10', 'EC220E', 'ZX200-5A', 'JS220LC'];
const VANS = ['Toyota HiAce', 'Ford Transit', 'Mercedes Sprinter'];
const CARS = ['Toyota Corolla', 'Hyundai Tucson', 'Kia Sportage'];

const KENYA_TOWNS = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Nyeri',
  'Meru', 'Narok', 'Naivasha', 'Kericho', 'Kakamega', 'Garissa', 'Kilifi', 'Malindi',
];
const DRIVER_NAMES = [
  'Peter Otieno', 'James Mwangi', 'David Kipchoge', 'Samuel Njenga', 'John Ochieng', 'Brian Wafula',
  'George Kamau', 'Dennis Onyango', 'Kevin Mutua', 'Collins Omondi', 'Victor Maina', 'Elijah Njoroge',
  'Stephen Chepkwony', 'Martin Kibet', 'Alex Wanjiru',
];
const STATIONS = ['TotalEnergies', 'Shell', 'Vivo Energy', 'Rubis', 'KenolKobil', 'Hash Energy', 'Ola Energy', 'Mt. Kenya Oils'];
const PLATE_LETTERS = ['K', 'K', 'K', 'K', 'K', 'K', 'K', 'K', 'K', 'K', 'K', 'KD'];
const DEPOTS = ['Embakasi', 'Mombasa', 'Nakuru', 'Eldoret', 'Nairobi CBD'];

function plate(prefix: string, i: number) {
  const letters = PLATE_LETTERS[Math.floor(rnd() * PLATE_LETTERS.length)];
  return `${letters}${prefix} ${String(1000 + i * 7).padStart(4, '0')}`;
}

function isoDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86400000);
  return d.toISOString();
}

function isoDaysAhead(days: number): string {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString();
}

const now = Date.now();
const currentYear = new Date(now).getFullYear();

// ---------------- Vehicles ----------------
const VEHICLES: Vehicle[] = [
  ...TRUCK_NAMES.map((name, i) => ({
    id: `v-truck-${i}`, name, plate: plate('C', i), type: 'Truck' as const,
    status: (['Active', 'Active', 'Active', 'Active', 'Maintenance', 'Idle', 'Out of Service'][i % 7]) as Vehicle['status'],
    driverId: `d-${i % 15}`, mileage: int(120000, 620000), fuelType: 'Diesel' as FuelType,
    tankCapacity: int(300, 500), lastService: isoDaysAgo(int(2, 45)), nextServiceKm: int(10000, 22000),
    acquisitionDate: isoDaysAgo(int(500, 3600)), depot: pick(DEPOTS), engineHours: int(4000, 18000),
    costPerKm: between(35, 62),
  })),
  ...PICKUP_NAMES.map((name, i) => ({
    id: `v-pickup-${i}`, name, plate: plate('K', 60 + i), type: 'Pickup' as const,
    status: (['Active', 'Active', 'Maintenance', 'Idle', 'Active', 'Active', 'Active', 'Active', 'Idle', 'Active'][i]) as Vehicle['status'],
    driverId: `d-${(i + 10) % 15}`, mileage: int(60000, 320000), fuelType: 'Diesel' as FuelType,
    tankCapacity: int(65, 80), lastService: isoDaysAgo(int(3, 40)), nextServiceKm: int(5000, 12000),
    acquisitionDate: isoDaysAgo(int(300, 2400)), depot: pick(DEPOTS), engineHours: int(1500, 9000),
    costPerKm: between(14, 24),
  })),
  ...EXCAVATOR_NAMES.map((name, i) => ({
    id: `v-excavator-${i}`, name, plate: plate('Q', 90 + i), type: 'Excavator' as const,
    status: (['Active', 'Active', 'Maintenance', 'Idle', 'Active'][i]) as Vehicle['status'],
    driverId: `d-${(i + 5) % 15}`, mileage: int(0, 0), fuelType: 'Diesel' as FuelType,
    tankCapacity: int(400, 600), lastService: isoDaysAgo(int(1, 35)), nextServiceKm: 0,
    acquisitionDate: isoDaysAgo(int(400, 2800)), depot: pick(DEPOTS), engineHours: int(2000, 15000),
    costPerKm: between(90, 140),
  })),
  ...VANS.map((name, i) => ({
    id: `v-van-${i}`, name, plate: plate('K', 110 + i), type: 'Van' as const,
    status: 'Active' as const, driverId: `d-${(i + 8) % 15}`, mileage: int(50000, 250000),
    fuelType: 'Diesel' as FuelType, tankCapacity: int(60, 90), lastService: isoDaysAgo(int(2, 30)),
    nextServiceKm: int(8000, 15000), acquisitionDate: isoDaysAgo(int(400, 2000)), depot: pick(DEPOTS),
    engineHours: int(1000, 6000), costPerKm: between(12, 18),
  })),
  ...CARS.map((name, i) => ({
    id: `v-car-${i}`, name, plate: plate('K', 120 + i), type: 'Car' as const,
    status: 'Active' as const, driverId: `d-${(i + 12) % 15}`, mileage: int(40000, 200000),
    fuelType: 'Petrol' as FuelType, tankCapacity: int(45, 60), lastService: isoDaysAgo(int(2, 30)),
    nextServiceKm: int(8000, 15000), acquisitionDate: isoDaysAgo(int(300, 1800)), depot: pick(DEPOTS),
    engineHours: int(800, 5000), costPerKm: between(10, 15),
  })),
];

// ---------------- Drivers ----------------
const DRIVERS: Driver[] = DRIVER_NAMES.map((name, i) => ({
  id: `d-${i}`, name, phone: `+254 7${int(10, 99)} ${int(100000, 999999)}`,
  license: `DL-${String(200000 + i * 333).padStart(7, '0')}`,
  licenseExpiry: isoDaysAhead(int(60, 800)),
  status: (['Available', 'On Trip', 'On Trip', 'Off Duty', 'Available', 'On Trip', 'Off Duty', 'Available', 'On Trip', 'On Trip', 'Available', 'Off Duty', 'On Trip', 'Available', 'On Trip'][i]) as Driver['status'],
  trips: int(12, 340), rating: Math.round(between(3.2, 5) * 10) / 10,
  hiredDate: isoDaysAgo(int(300, 3000)),
  assignedVehicleId: `v-truck-${i % 25}`,
  scores: {
    fuelEfficiency: int(55, 98), maintenance: int(60, 97), breakdowns: int(60, 99),
    tyres: int(55, 96), behavior: int(58, 99),
  },
}));

// ---------------- Trips ----------------
const TRIPS: Trip[] = [];
const TRIP_EXPENSES: TripExpense[] = [];
for (let i = 0; i < 80; i++) {
  const vehicle = pick(VEHICLES.filter((v) => v.type === 'Truck' || v.type === 'Pickup'));
  const driver = DRIVERS[Math.floor(rnd() * DRIVERS.length)];
  const completed = rnd() > 0.22;
  const daysAgo = int(0, 120);
  const distance = int(120, 900);
  const id = `trip-${i}`;
  TRIPS.push({
    id,
    reference: `TRP-${String(1000 + i).padStart(4, '0')}`,
    vehicleId: vehicle.id,
    driverId: driver.id,
    origin: pick(KENYA_TOWNS),
    destination: pick(KENYA_TOWNS),
    startTime: isoDaysAgo(daysAgo),
    endTime: isoDaysAgo(Math.max(0, daysAgo - 1)),
    status: completed ? (rnd() > 0.08 ? 'Completed' : 'Cancelled') : pick(['Pending', 'In Transit'] as const),
    distanceKm: distance,
    loadWeightT: Math.round(between(1, vehicle.type === 'Truck' ? 28 : 1.5) * 10) / 10,
    revenue: int(18000, 260000),
    plannedDistanceKm: distance + int(-40, 40),
    actualCost: 0,
  });
  const cost = TRIPS[TRIPS.length - 1].revenue * between(0.5, 0.85);
  TRIPS[TRIPS.length - 1].actualCost = Math.round(cost);
  if (rnd() > 0.35) {
    TRIP_EXPENSES.push({
      id: `te-${i}-1`, tripId: id, category: 'Fuel', amount: Math.round(cost * 0.7),
      date: isoDaysAgo(daysAgo), notes: 'Fuel stop',
    });
  }
  if (rnd() > 0.6) {
    TRIP_EXPENSES.push({
      id: `te-${i}-2`, tripId: id, category: pick(['Tolls', 'Parking', 'Food', 'Accommodation'] as const),
      amount: int(300, 8000), date: isoDaysAgo(daysAgo),
    });
  }
}

// ---------------- Fuel transactions (200) ----------------
const FUEL_TRANSACTIONS: FuelTransaction[] = [];
for (let i = 0; i < 200; i++) {
  const vehicle = pick(VEHICLES.filter((v) => v.type !== 'Excavator'));
  const driver = DRIVERS[Math.floor(rnd() * DRIVERS.length)];
  const daysAgo = int(0, 120);
  const tankCap = vehicle.tankCapacity;
  const liters = Math.round(between(20, tankCap));
  const price = between(228, 236);
  const station = pick(STATIONS);
  const mileage = Math.max(0, vehicle.mileage - int(1000, 15000));
  const tripDistance = int(60, 800);
  const kpl = vehicle.type === 'Truck' ? between(2.8, 6.2) : vehicle.type === 'Pickup' ? between(7, 13) : between(8, 14);
  const expectedLiters = Math.round(tripDistance / (vehicle.type === 'Truck' ? 5 : 10));
  const variance = liters - expectedLiters;
  const anomalyFlag: 'none' | 'watch' | 'concern' =
    variance > tankCap * 0.6 || kpl < 2.5 ? 'concern' : variance > tankCap * 0.3 ? 'watch' : 'none';
  FUEL_TRANSACTIONS.push({
    id: `fuel-${i}`, vehicleId: vehicle.id, date: isoDaysAgo(daysAgo), liters,
    costPerLiter: Math.round(price * 100) / 100, totalCost: Math.round(liters * price),
    mileage, station, fuelType: vehicle.fuelType, driverId: driver.id,
    loadState: rnd() > 0.45 ? 'Loaded' : 'Unloaded', cargoWeightT: Math.round(between(0, 28) * 10) / 10,
    tripDistanceKm: tripDistance, tankCapacity: tankCap, kmPerLiter: Math.round(kpl * 10) / 10,
    costPerKm: Math.round(price / kpl * 100) / 100, expectedLiters, varianceLiters: variance,
    anomaly: anomalyFlag, flagged: anomalyFlag !== 'none',
  });
}
const FLAGGED = FUEL_TRANSACTIONS.filter((f) => f.flagged);
for (const f of FLAGGED) {
  const idx = FUEL_TRANSACTIONS.findIndex((x) => x.id === f.id);
  if (idx >= 0) {
    FUEL_TRANSACTIONS[idx].notes =
      f.anomaly === 'concern'
        ? 'Over-fill vs expected consumption — possible theft or odometer tampering.'
        : 'Variance above tolerance — review trip distance and tank record.';
  }
}

// ---------------- Fuel tanks ----------------
const FUEL_TANKS: FuelTank[] = [
  { id: 'tank-1', name: 'Embakasi Depot Tank A', depot: 'Embakasi', capacityL: 20000, currentLevelL: 12400, fuelType: 'Diesel', lastRestocked: isoDaysAgo(3), stockCost: 231 },
  { id: 'tank-2', name: 'Embakasi Depot Tank B', depot: 'Embakasi', capacityL: 10000, currentLevelL: 3200, fuelType: 'Diesel', lastRestocked: isoDaysAgo(6), stockCost: 230 },
  { id: 'tank-3', name: 'Mombasa Port Tank', depot: 'Mombasa', capacityL: 25000, currentLevelL: 18800, fuelType: 'Diesel', lastRestocked: isoDaysAgo(1), stockCost: 229 },
  { id: 'tank-4', name: 'Nakuru Fuel Store', depot: 'Nakuru', capacityL: 8000, currentLevelL: 6100, fuelType: 'Diesel', lastRestocked: isoDaysAgo(5), stockCost: 232 },
  { id: 'tank-5', name: 'Petrol Tank — Nairobi CBD', depot: 'Nairobi CBD', capacityL: 6000, currentLevelL: 1500, fuelType: 'Petrol', lastRestocked: isoDaysAgo(4), stockCost: 221 },
];

// ---------------- Maintenance schedules (30) ----------------
const MAINT_TYPES: MaintenanceSchedule['type'][] = ['Oil Change', 'Filter', 'Brakes', 'Tyre Rotation', 'Full Service', 'Inspection', 'Coolant', 'Battery'];
const MAINTENANCE: MaintenanceSchedule[] = [];
for (let i = 0; i < 30; i++) {
  const vehicle = VEHICLES[i % VEHICLES.length];
  const type = MAINT_TYPES[i % MAINT_TYPES.length];
  const interval = type === 'Oil Change' ? 10000 : type === 'Full Service' ? 20000 : type === 'Inspection' ? 15000 : type === 'Tyre Rotation' ? 10000 : 20000;
  const lastKm = vehicle.mileage - int(0, interval);
  const dueInDays = int(-15, 40);
  const status: MaintenanceSchedule['status'] = dueInDays < 0 ? 'Overdue' : dueInDays <= 14 ? 'Due Soon' : 'Up to Date';
  MAINTENANCE.push({
    id: `maint-${i}`, vehicleId: vehicle.id, type, intervalKm: interval,
    lastCompletedKm: lastKm, lastCompletedDate: isoDaysAgo(int(20, 120)),
    nextDueKm: lastKm + interval, nextDueDate: isoDaysAhead(dueInDays), status,
    costEstimate: type === 'Full Service' ? int(18000, 60000) : type === 'Brakes' ? int(6000, 15000) : int(2000, 9000),
    assignedTo: pick(DRIVER_NAMES).split(' ')[0] + ' (workshop)',
  });
}

// ---------------- Spare parts ----------------
const SPARE_PARTS: SparePart[] = [
  { id: 'sp-1', sku: 'OIL-15W40-20L', name: 'Engine Oil 15W40 (20L)', category: 'Lubricants', quantityOnHand: 38, reorderLevel: 12, unitCost: 11800, supplier: 'TotalEnergies', location: 'A-1' },
  { id: 'sp-2', sku: 'FLT-AIR-1', name: 'Air Filter (Scania R450)', category: 'Filters', quantityOnHand: 7, reorderLevel: 6, unitCost: 4500, supplier: 'AutoXpress', location: 'B-2' },
  { id: 'sp-3', sku: 'FLT-OIL-2', name: 'Oil Filter (Isuzu FVR)', category: 'Filters', quantityOnHand: 4, reorderLevel: 8, unitCost: 1800, supplier: 'AutoXpress', location: 'B-3' },
  { id: 'sp-4', sku: 'BRK-PAD-H', name: 'Brake Pads (Hilux)', category: 'Brakes', quantityOnHand: 12, reorderLevel: 6, unitCost: 3200, supplier: 'AutoXpress', location: 'C-1' },
  { id: 'sp-5', sku: 'BRK-DISC-S', name: 'Brake Disc (Scania)', category: 'Brakes', quantityOnHand: 3, reorderLevel: 4, unitCost: 18500, supplier: 'Pan African Trucks', location: 'C-2' },
  { id: 'sp-6', sku: 'TYR-11R22.5', name: 'Tyre 11R22.5 (Steel Radial)', category: 'Tyres', quantityOnHand: 22, reorderLevel: 8, unitCost: 42000, supplier: 'Firestone', location: 'D-1' },
  { id: 'sp-7', sku: 'BAT-100AH', name: 'Battery 100Ah', category: 'Electrical', quantityOnHand: 9, reorderLevel: 4, unitCost: 18500, supplier: 'Delkor', location: 'E-1' },
  { id: 'sp-8', sku: 'BELT-FAN', name: 'Fan Belt (Actros)', category: 'Engine', quantityOnHand: 2, reorderLevel: 3, unitCost: 2800, supplier: 'Pan African Trucks', location: 'E-2' },
  { id: 'sp-9', sku: 'CLT-50-50', name: 'Coolant 50/50 (25L)', category: 'Lubricants', quantityOnHand: 16, reorderLevel: 6, unitCost: 6500, supplier: 'TotalEnergies', location: 'A-3' },
  { id: 'sp-10', sku: 'FIL-FUEL-3', name: 'Fuel Filter (HOWO)', category: 'Filters', quantityOnHand: 1, reorderLevel: 5, unitCost: 2400, supplier: 'Sinotruk KE', location: 'B-4' },
];

// ---------------- Work orders (12) + parts ----------------
const WO_TITLES = ['Full engine service', 'Brake overhaul', 'Suspension repair', 'Clutch replacement', 'Radiator flush', 'AC repair', 'Wheel alignment', 'Gearbox service'];
const WO_STATUSES: WorkOrder['status'][] = ['Open', 'In Progress', 'Waiting on Parts', 'Completed', 'Completed', 'Open'];
const WORK_ORDERS: WorkOrder[] = [];
for (let i = 0; i < 12; i++) {
  const vehicle = VEHICLES[i % VEHICLES.length];
  const title = WO_TITLES[i % WO_TITLES.length];
  const status = WO_STATUSES[i % WO_STATUSES.length];
  const part: WorkOrderPart = {
    id: `wop-${i}-1`, partId: SPARE_PARTS[i % SPARE_PARTS.length].id,
    partName: SPARE_PARTS[i % SPARE_PARTS.length].name,
    quantity: int(1, 3), unitCost: SPARE_PARTS[i % SPARE_PARTS.length].unitCost,
    totalCost: 0,
  };
  part.totalCost = part.quantity * part.unitCost;
  const labor = int(1500, 12000);
  WORK_ORDERS.push({
    id: `wo-${i}`, reference: `WO-${String(2026)}-${String(100 + i)}`, vehicleId: vehicle.id,
    title, description: `${title} for ${vehicle.name} (${vehicle.plate}).`,
    status, priority: (['Low', 'Medium', 'High', 'Critical'][i % 4]) as WorkOrder['priority'],
    createdDate: isoDaysAgo(int(2, 30)),
    scheduledDate: isoDaysAhead(int(-3, 12)),
    completedDate: status === 'Completed' ? isoDaysAgo(int(0, 20)) : undefined,
    assignedTo: pick(DRIVER_NAMES).split(' ')[0] + ' (workshop)',
    laborCost: labor, partsCost: part.totalCost,
    totalCost: labor + part.totalCost,
    parts: [part],
  });
}

// ---------------- Tyres (40) ----------------
const TYRE_BRANDS = ['Firestone', 'Bridgestone', 'Michelin', 'Goodyear', 'Maxxis', 'Continental'];
const TYRES: Tyre[] = [];
for (let i = 0; i < 40; i++) {
  const vehicle = VEHICLES[i % VEHICLES.length];
  const initial = int(14, 17);
  const worn = rnd();
  const status: Tyre['status'] = worn > 0.92 ? 'Scrapped' : worn > 0.8 ? 'Punctured' : worn > 0.55 ? 'Worn' : rnd() > 0.75 ? 'Retread' : 'Good';
  const positions: Tyre['position'][] = ['Front Left', 'Front Right', 'Rear Left', 'Rear Right', 'Spare'];
  TYRES.push({
    id: `tyre-${i}`, serialNo: `TY-${String(4000 + i).padStart(6, '0')}`,
    brand: TYRE_BRANDS[i % TYRE_BRANDS.length],
    size: vehicle.type === 'Truck' ? '11R22.5' : '265/70R16',
    vehicleId: vehicle.id, position: positions[i % positions.length],
    purchaseDate: isoDaysAgo(int(60, 500)), purchaseCost: int(28000, 52000),
    initialTreadMm: initial, currentTreadMm: status === 'Good' ? int(11, initial) : status === 'Worn' ? int(3, 6) : int(6, 13),
    kmDriven: int(5000, 90000), status, lastInspection: isoDaysAgo(int(3, 60)),
    notes: status === 'Punctured' ? 'Leaking valve — flagged for repair.' : undefined,
  });
}

// ---------------- Tyre movements ----------------
const TYRE_MOVEMENTS: TyreMovement[] = [];
for (let i = 0; i < 8; i++) {
  const from = TYRES[i % TYRES.length];
  const toV = VEHICLES[(i + 3) % VEHICLES.length];
  TYRE_MOVEMENTS.push({
    id: `tm-${i}`, tyreId: from.id, fromVehicleId: from.vehicleId, toVehicleId: toV.id,
    date: isoDaysAgo(int(5, 80)), reason: pick(['Rotation', 'New vehicle fit', 'Wear balance'] as const),
    position: pick(['Front Left', 'Front Right', 'Rear Left', 'Rear Right', 'Spare'] as const),
  });
}

// ---------------- Breakdowns ----------------
const BREAKDOWN_TYPES: Breakdown['type'][] = ['Mechanical', 'Electrical', 'Tyres', 'Accident', 'Other'];
const BREAKDOWNS: Breakdown[] = [];
for (let i = 0; i < 18; i++) {
  const vehicle = VEHICLES[i % VEHICLES.length];
  const resolved = rnd() > 0.3;
  BREAKDOWNS.push({
    id: `bd-${i}`, reference: `BRK-${String(700 + i)}`, vehicleId: vehicle.id,
    driverId: DRIVERS[i % DRIVERS.length].id,
    date: isoDaysAgo(int(2, 110)), location: pick(KENYA_TOWNS),
    type: BREAKDOWN_TYPES[i % BREAKDOWN_TYPES.length],
    description: pick([
      'Engine overheating — coolant leak detected.', 'Transmission slipping under load.',
      'Flat tyre on the highway.', 'Electrical short — dashboard warning lights.',
      'Clutch failure at low speed.', 'Brake pad worn to metal.',
      'Turbocharger boost loss.', 'Air suspension compressor failure.',
    ]),
    cost: resolved ? int(5000, 120000) : 0,
    downtimeHours: int(3, 48),
    status: resolved ? 'Resolved' : pick(['Reported', 'In Progress'] as const),
    resolvedDate: resolved ? isoDaysAgo(int(1, 100)) : undefined,
  });
}

// ---------------- Vehicle documents (30) ----------------
const DOC_TYPES: VehicleDocument['type'][] = ['Insurance', 'Road License', 'Inspection', 'PCO', 'Fitness', 'Logbook', 'NTSA'];
const VEHICLE_DOCUMENTS: VehicleDocument[] = [];
for (let i = 0; i < 30; i++) {
  const vehicle = VEHICLES[i % VEHICLES.length];
  const type = DOC_TYPES[i % DOC_TYPES.length];
  const expDays = i % 5 === 0 ? int(-10, 0) : i % 4 === 0 ? int(1, 20) : int(30, 365);
  VEHICLE_DOCUMENTS.push({
    id: `vd-${i}`, vehicleId: vehicle.id, type,
    referenceNo: `${type.replace(/\s/g, '').slice(0, 3).toUpperCase()}-${String(800000 + i * 13)}`,
    issueDate: isoDaysAgo(365 - expDays), expiryDate: isoDaysAhead(expDays),
    status: expDays < 0 ? 'Expired' : expDays <= 20 ? 'Expiring Soon' : 'Valid',
    cost: type === 'Insurance' ? int(25000, 120000) : type === 'Road License' ? 31000 : int(2000, 8000),
  });
}

// ---------------- Insurance policies (25) ----------------
const INSURERS = ['Britam', 'Jubilee', 'UAP Old Mutual', 'APA', 'Kenindia', 'CIC'];
const INSURANCE_POLICIES: InsurancePolicy[] = [];
for (let i = 0; i < 25; i++) {
  const vehicle = VEHICLES[i % VEHICLES.length];
  const expDays = i % 6 === 0 ? int(-15, 0) : i % 5 === 0 ? int(1, 25) : int(40, 360);
  INSURANCE_POLICIES.push({
    id: `ins-${i}`, vehicleId: vehicle.id, provider: INSURERS[i % INSURERS.length],
    policyNo: `POL-${String(3000000 + i * 77)}`,
    type: rnd() > 0.25 ? 'Comprehensive' : 'Third Party',
    premium: int(40000, 220000), startDate: isoDaysAgo(365 - expDays),
    expiryDate: isoDaysAhead(expDays),
    status: expDays < 0 ? 'Expired' : expDays <= 25 ? 'Expiring Soon' : 'Active',
    coverAmount: int(4000000, 12000000),
  });
}

// ---------------- Compliance alerts (8) ----------------
const COMPLIANCE_ALERTS: ComplianceAlert[] = [];
for (let i = 0; i < 8; i++) {
  const vehicle = VEHICLES[i % VEHICLES.length];
  const severity: ComplianceAlert['severity'] = (['Critical', 'High', 'High', 'Medium', 'Medium', 'Low', 'Low', 'Critical'][i]);
  const types = ['Road License', 'Insurance', 'Fitness Test', 'Driver License', 'Speed Governor', 'NTSA'];
  const type = types[i % types.length];
  COMPLIANCE_ALERTS.push({
    id: `ca-${i}`, vehicleId: vehicle.id, type, severity,
    message: type === 'Road License' || type === 'Insurance'
      ? `${vehicle.name} (${vehicle.plate}) ${type.toLowerCase()} is expiring within 14 days.`
      : type === 'Speed Governor'
        ? `${vehicle.name} lacks a valid speed governor calibration certificate.`
        : type === 'NTSA'
          ? `NTSA inspection for ${vehicle.name} is overdue.`
          : `Driver license for ${vehicle.name}'s operator needs renewal.`,
    date: isoDaysAgo(int(0, 20)),
    status: (['Open', 'Open', 'Acknowledged', 'Open', 'Acknowledged', 'Resolved', 'Resolved', 'Open'][i]) as ComplianceAlert['status'],
    resolvedDate: i >= 5 ? isoDaysAgo(int(1, 15)) : undefined,
  });
}

// ---------------- Heavy equipment (5) ----------------
const HEAVY_EQUIPMENT: HeavyEquipment[] = EXCAVATOR_NAMES.map((name, i) => ({
  id: `eq-${i}`, name, model: EQUIPMENT_MODELS[i], category: 'Excavator' as const,
  serialNo: `CAT-${String(9000 + i * 111)}`, engineHours: int(2000, 15000),
  hourlyRate: int(12000, 20000), fuelType: 'Diesel' as FuelType, tankCapacity: int(400, 600),
  status: (['In Use', 'Available', 'Maintenance', 'Available', 'In Use'][i]) as HeavyEquipment['status'],
  depot: pick(DEPOTS), lastService: isoDaysAgo(int(2, 30)),
  acquisitionDate: isoDaysAgo(int(400, 2800)), purchaseCost: int(8000000, 22000000),
  operatorId: `d-${(i + 5) % 15}`,
}));

// ---------------- Engine hour logs ----------------
const ENGINE_HOUR_LOGS: EngineHourLog[] = [];
for (let i = 0; i < 25; i++) {
  const eq = HEAVY_EQUIPMENT[i % HEAVY_EQUIPMENT.length];
  ENGINE_HOUR_LOGS.push({
    id: `eh-${i}`, equipmentId: eq.id, date: isoDaysAgo(int(0, 40)),
    hours: Math.round(between(3, 16) * 10) / 10,
    fuelUsedL: Math.round(between(60, 320)),
    operatorId: eq.operatorId,
  });
}

// ---------------- Profitability (vehicles x months) ----------------
const PROFITABILITY: VehicleProfitability[] = [];
const PERIODS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
for (let i = 0; i < 120; i++) {
  const vehicle = VEHICLES[i % VEHICLES.length];
  const period = PERIODS[i % PERIODS.length];
  const revenue = int(120000, 900000);
  const fuelCost = Math.round(revenue * between(0.3, 0.45));
  const maintenanceCost = Math.round(revenue * between(0.05, 0.15));
  const tyresCost = Math.round(revenue * between(0.02, 0.08));
  const insuranceCost = Math.round(revenue * between(0.04, 0.08));
  const driverCost = Math.round(revenue * between(0.06, 0.12));
  const depreciationCost = Math.round(revenue * between(0.03, 0.06));
  const otherCost = Math.round(revenue * between(0.01, 0.04));
  const totalCost = fuelCost + maintenanceCost + tyresCost + insuranceCost + driverCost + depreciationCost + otherCost;
  const netProfit = revenue - totalCost;
  PROFITABILITY.push({
    id: `pf-${i}`, vehicleId: vehicle.id, period, revenue, fuelCost, maintenanceCost,
    tyresCost, insuranceCost, driverCost, depreciationCost, otherCost, totalCost,
    netProfit, marginPct: Math.round((netProfit / revenue) * 100 * 10) / 10,
    costPerKm: Math.round(between(35, 70)),
    revenuePerKm: Math.round(between(45, 90)),
  });
}

// ---------------- Driver scores ----------------
const GRADES: DriverScore['grade'][] = ['A', 'B', 'B', 'C', 'A', 'B', 'C', 'D', 'B', 'A'];
const DRIVER_SCORES: DriverScore[] = [];
for (let i = 0; i < 45; i++) {
  const driver = DRIVERS[i % DRIVERS.length];
  const score = int(55, 98);
  const grade: DriverScore['grade'] = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D';
  DRIVER_SCORES.push({
    id: `ds-${i}`, driverId: driver.id, period: PERIODS[i % PERIODS.length],
    fuelEfficiency: int(55, 98), idleTime: Math.round(between(0, 18) * 10) / 10,
    harshBraking: Math.round(between(0, 9) * 10) / 10, speeding: Math.round(between(0, 12) * 10) / 10,
    safety: int(60, 100), attendance: int(70, 100), tripsCompleted: int(4, 40),
    onTimePct: int(65, 100), score, grade,
  });
}

// Keep unused refs (GRADES is a fallback pool).
void GRADES;

export interface FleetDatabase {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  tripExpenses: TripExpense[];
  fuelTransactions: FuelTransaction[];
  fuelTanks: FuelTank[];
  maintenance: MaintenanceSchedule[];
  workOrders: WorkOrder[];
  spareParts: SparePart[];
  tyres: Tyre[];
  tyreMovements: TyreMovement[];
  breakdowns: Breakdown[];
  documents: VehicleDocument[];
  insurance: InsurancePolicy[];
  complianceAlerts: ComplianceAlert[];
  heavyEquipment: HeavyEquipment[];
  engineHourLogs: EngineHourLog[];
  profitability: VehicleProfitability[];
  driverScores: DriverScore[];
}

export const seedFleetData = (): FleetDatabase => ({
  vehicles: VEHICLES,
  drivers: DRIVERS,
  trips: TRIPS,
  tripExpenses: TRIP_EXPENSES,
  fuelTransactions: FUEL_TRANSACTIONS,
  fuelTanks: FUEL_TANKS,
  maintenance: MAINTENANCE,
  workOrders: WORK_ORDERS,
  spareParts: SPARE_PARTS,
  tyres: TYRES,
  tyreMovements: TYRE_MOVEMENTS,
  breakdowns: BREAKDOWNS,
  documents: VEHICLE_DOCUMENTS,
  insurance: INSURANCE_POLICIES,
  complianceAlerts: COMPLIANCE_ALERTS,
  heavyEquipment: HEAVY_EQUIPMENT,
  engineHourLogs: ENGINE_HOUR_LOGS,
  profitability: PROFITABILITY,
  driverScores: DRIVER_SCORES,
});

export const CURRENT_YEAR = currentYear;
