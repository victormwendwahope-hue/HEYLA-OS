// Fleet & Transport Intelligence (FTI) — domain types.

export type VehicleType = 'Truck' | 'Pickup' | 'Excavator' | 'Van' | 'Car' | 'Motorcycle';
export type VehicleStatus = 'Active' | 'Maintenance' | 'Idle' | 'Out of Service';
export type FuelType = 'Diesel' | 'Petrol' | 'Electric';

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: VehicleType;
  status: VehicleStatus;
  driverId: string;
  mileage: number;
  fuelType: FuelType;
  tankCapacity: number;
  lastService: string;
  nextServiceKm: number;
  acquisitionDate: string;
  depot: string;
  engineHours?: number;
  costPerKm: number;
}

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  licenseExpiry: string;
  status: DriverStatus;
  trips: number;
  rating: number;
  avatar?: string;
  hiredDate: string;
  assignedVehicleId?: string;
  scores: { fuelEfficiency: number; maintenance: number; breakdowns: number; tyres: number; behavior: number };
}

export type TripStatus = 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  reference: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  status: TripStatus;
  distanceKm: number;
  loadWeightT: number;
  revenue: number;
  plannedDistanceKm: number;
  actualCost: number;
  notes?: string;
}

export type TripExpenseCategory = 'Fuel' | 'Tolls' | 'Parking' | 'Food' | 'Accommodation' | 'Repairs' | 'Fines' | 'Other';

export interface TripExpense {
  id: string;
  tripId: string;
  category: TripExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
}

export type LoadState = 'Loaded' | 'Unloaded';

export interface FuelTransaction {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  mileage: number;
  station: string;
  fuelType: FuelType;
  driverId: string;
  loadState: LoadState;
  cargoWeightT: number;
  tripDistanceKm: number;
  tankCapacity: number;
  kmPerLiter: number;
  costPerKm: number;
  expectedLiters: number;
  varianceLiters: number;
  anomaly: 'none' | 'watch' | 'concern';
  flagged: boolean;
  notes?: string;
}

export interface FuelTank {
  id: string;
  name: string;
  depot: string;
  capacityL: number;
  currentLevelL: number;
  fuelType: FuelType;
  lastRestocked: string;
  stockCost: number;
}

export type MaintenanceType = 'Oil Change' | 'Filter' | 'Brakes' | 'Tyre Rotation' | 'Full Service' | 'Inspection' | 'Coolant' | 'Battery';

export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  intervalKm: number;
  lastCompletedKm: number;
  lastCompletedDate: string;
  nextDueKm: number;
  nextDueDate: string;
  status: 'Up to Date' | 'Due Soon' | 'Overdue';
  costEstimate: number;
  assignedTo: string;
  notes?: string;
}

export type WorkOrderStatus = 'Open' | 'In Progress' | 'Waiting on Parts' | 'Completed' | 'Cancelled';
export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface WorkOrder {
  id: string;
  reference: string;
  vehicleId: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  createdDate: string;
  scheduledDate: string;
  completedDate?: string;
  assignedTo: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  parts: WorkOrderPart[];
  notes?: string;
}

export interface WorkOrderPart {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number;
  supplier: string;
  location: string;
}

export type TyrePosition = 'Front Left' | 'Front Right' | 'Rear Left' | 'Rear Right' | 'Spare';
export type TyreStatus = 'Good' | 'Worn' | 'Punctured' | 'Retread' | 'Scrapped';

export interface Tyre {
  id: string;
  serialNo: string;
  brand: string;
  size: string;
  vehicleId: string;
  position: TyrePosition;
  purchaseDate: string;
  purchaseCost: number;
  initialTreadMm: number;
  currentTreadMm: number;
  kmDriven: number;
  status: TyreStatus;
  lastInspection: string;
  notes?: string;
}

export interface TyreMovement {
  id: string;
  tyreId: string;
  fromVehicleId: string;
  toVehicleId: string;
  date: string;
  reason: string;
  position: TyrePosition;
  notes?: string;
}

export type BreakdownType = 'Mechanical' | 'Electrical' | 'Tyres' | 'Accident' | 'Other';

export interface Breakdown {
  id: string;
  reference: string;
  vehicleId: string;
  driverId: string;
  date: string;
  location: string;
  type: BreakdownType;
  description: string;
  cost: number;
  downtimeHours: number;
  status: 'Reported' | 'In Progress' | 'Resolved';
  resolvedDate?: string;
  notes?: string;
}

export type DocumentType = 'Insurance' | 'Road License' | 'Inspection' | 'PCO' | 'Fitness' | 'Logbook' | 'NTSA';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: DocumentType;
  referenceNo: string;
  issueDate: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  cost: number;
  notes?: string;
}

export type PolicyType = 'Comprehensive' | 'Third Party' | 'Fire & Theft';

export interface InsurancePolicy {
  id: string;
  vehicleId: string;
  provider: string;
  policyNo: string;
  type: PolicyType;
  premium: number;
  startDate: string;
  expiryDate: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  coverAmount: number;
}

export type ComplianceSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ComplianceAlert {
  id: string;
  vehicleId: string;
  type: string;
  severity: ComplianceSeverity;
  message: string;
  date: string;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  resolvedDate?: string;
}

export type EquipmentCategory = 'Excavator' | 'Loader' | 'Crane' | 'Forklift' | 'Grader' | 'Dozer' | 'Compactor';

export interface HeavyEquipment {
  id: string;
  name: string;
  model: string;
  category: EquipmentCategory;
  serialNo: string;
  engineHours: number;
  hourlyRate: number;
  fuelType: FuelType;
  tankCapacity: number;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Idle';
  depot: string;
  lastService: string;
  acquisitionDate: string;
  purchaseCost: number;
  operatorId: string;
}

export interface EngineHourLog {
  id: string;
  equipmentId: string;
  date: string;
  hours: number;
  fuelUsedL: number;
  operatorId: string;
  notes?: string;
}

export interface VehicleProfitability {
  id: string;
  vehicleId: string;
  period: string;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  tyresCost: number;
  insuranceCost: number;
  driverCost: number;
  depreciationCost: number;
  otherCost: number;
  totalCost: number;
  netProfit: number;
  marginPct: number;
  costPerKm: number;
  revenuePerKm: number;
}

export interface DriverScore {
  id: string;
  driverId: string;
  period: string;
  fuelEfficiency: number;
  idleTime: number;
  harshBraking: number;
  speeding: number;
  safety: number;
  attendance: number;
  tripsCompleted: number;
  onTimePct: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
}

// FTI helper — combined health view for a vehicle.
export interface VehicleHealth {
  vehicle: Vehicle;
  score: number;
  band: 'excellent' | 'good' | 'fair' | 'critical';
  fuelEfficiencyScore: number;
  maintenanceScore: number;
  breakdownScore: number;
  tyreScore: number;
  driverScore: number;
  lastServiceDays: number;
  upcomingMaintenance: number;
  openWorkOrders: number;
}
