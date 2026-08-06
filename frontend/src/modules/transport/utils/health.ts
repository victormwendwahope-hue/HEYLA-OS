import { Vehicle, VehicleHealth, MaintenanceSchedule, WorkOrder, FuelTransaction, Tyre, Breakdown, Driver } from '@/modules/transport/types';

// Vehicle Health Score formula:
// Fuel Efficiency 30% + Maintenance Compliance 25% + Breakdown Frequency 20% + Tyre Condition 15% + Driver Behavior 10%
// Bands: 🟢 90-100 / 🟡 70-89 / 🟠 50-69 / 🔴 <50

export type HealthBand = 'excellent' | 'good' | 'fair' | 'critical';

export function bandOf(score: number): HealthBand {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'critical';
}

export const bandMeta: Record<HealthBand, { label: string; color: string; bg: string; emoji: string }> = {
  excellent: { label: 'Excellent', color: 'text-success', bg: 'bg-success/10', emoji: '🟢' },
  good: { label: 'Good', color: 'text-warning', bg: 'bg-warning/10', emoji: '🟡' },
  fair: { label: 'Fair', color: 'text-orange-500', bg: 'bg-orange-500/10', emoji: '🟠' },
  critical: { label: 'Critical', color: 'text-destructive', bg: 'bg-destructive/10', emoji: '🔴' },
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export interface HealthInputs {
  fuelEfficiency: number;
  maintenanceScore: number;
  breakdownScore: number;
  tyreScore: number;
  driverScore: number;
}

export function computeHealthScore(inputs: HealthInputs): number {
  return Math.round(
    inputs.fuelEfficiency * 0.3 +
      inputs.maintenanceScore * 0.25 +
      inputs.breakdownScore * 0.2 +
      inputs.tyreScore * 0.15 +
      inputs.driverScore * 0.1,
  );
}

// Fuel efficiency: compare avg km/L against a type baseline (5 km/L for trucks, 9 for vans/cars, 12 for pickups).
export function fuelEfficiencyScore(avgKpl: number | null, vehicleType: string): number {
  if (avgKpl == null) return 60;
  const baseline: Record<string, number> = { Truck: 5, Pickup: 12, Excavator: 3, Van: 9, Car: 9, Motorcycle: 22 };
  const target = baseline[vehicleType] || 8;
  return clamp(Math.round((avgKpl / target) * 100));
}

export function daysAgo(dateStr: string): number {
  if (!dateStr) return 999;
  const d = new Date(dateStr).getTime();
  if (Number.isNaN(d)) return 999;
  return Math.max(0, Math.floor((Date.now() - d) / 86400000));
}

export interface FleetHealthContext {
  fuelTransactions: FuelTransaction[];
  maintenance: MaintenanceSchedule[];
  workOrders: WorkOrder[];
  tyres: Tyre[];
  breakdowns: Breakdown[];
  drivers: Driver[];
}

// Composite per-vehicle health score built from real module data.
export function buildVehicleHealth(
  vehicle: Vehicle,
  ctx: FleetHealthContext,
): VehicleHealth {
  const vehicleFuels = ctx.fuelTransactions.filter((f) => f.vehicleId === vehicle.id);
  const kplValues = vehicleFuels.filter((f) => f.kmPerLiter > 0).map((f) => f.kmPerLiter);
  const avgKpl = kplValues.length ? kplValues.reduce((a, b) => a + b, 0) / kplValues.length : null;
  const fuelEff = fuelEfficiencyScore(avgKpl, vehicle.type);

  // Maintenance compliance: share of maintenance items that are not overdue.
  const maintItems = ctx.maintenance.filter((m) => m.vehicleId === vehicle.id);
  const overdueCount = maintItems.filter((m) => m.status === 'Overdue' || m.status === 'Due Soon').length;
  const maintenanceScore = maintItems.length ? clamp(100 - (overdueCount / maintItems.length) * 100) : 70;

  // Breakdown frequency: 100 minus penalty per breakdown in last 90 days.
  const recentBreakdowns = ctx.breakdowns.filter((b) => b.vehicleId === vehicle.id && daysAgo(b.date) <= 90).length;
  const breakdownScore = clamp(100 - recentBreakdowns * 15);

  // Tyre condition: avg remaining tread as % of initial.
  const vehicleTyres = ctx.tyres.filter((t) => t.vehicleId === vehicle.id);
  const tyreScore = vehicleTyres.length
    ? clamp(
        Math.round(
          (vehicleTyres.reduce((a, t) => a + (t.initialTreadMm ? t.currentTreadMm / t.initialTreadMm : 0.6), 0) /
            vehicleTyres.length) *
            100,
        ),
      )
    : 65;

  // Driver behaviour: from assigned driver scores, default 75.
  const driver = ctx.drivers.find((d) => d.id === vehicle.driverId);
  const driverScore = driver
    ? clamp(Math.round((driver.scores.behavior + driver.scores.fuelEfficiency) / 2))
    : 75;

  const score = computeHealthScore({ fuelEfficiency: fuelEff, maintenanceScore, breakdownScore, tyreScore, driverScore });

  const lastServiceDays = daysAgo(vehicle.lastService);
  const upcomingMaintenance = ctx.maintenance.filter(
    (m) => m.vehicleId === vehicle.id && m.status === 'Due Soon',
  ).length;
  const openWorkOrders = ctx.workOrders.filter(
    (w) => w.vehicleId === vehicle.id && w.status !== 'Completed' && w.status !== 'Cancelled',
  ).length;

  return {
    vehicle,
    score,
    band: bandOf(score),
    fuelEfficiencyScore: fuelEff,
    maintenanceScore,
    breakdownScore,
    tyreScore,
    driverScore,
    lastServiceDays,
    upcomingMaintenance,
    openWorkOrders,
  };
}
