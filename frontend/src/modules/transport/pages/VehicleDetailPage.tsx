import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { ArrowLeft, Truck, Gauge, Fuel, Wrench, User, MapPin, History } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { HealthBadge, ScoreBar, Badge, SectionCard, EmptyRow } from '@/modules/transport/components/Common';
import { formatCurrency, formatDate, formatKm, formatKpl } from '@/modules/transport/utils/format';

export default function VehicleDetailPage() {
  const store = useFleetStore();
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const vehicle = store.vehicles.find((v) => v.id === id);
  const health = store.health[id];
  const driver = vehicle ? store.drivers.find((d) => d.id === vehicle.driverId) : null;

  const fuels = useMemo(() => store.fuelTransactions.filter((f) => f.vehicleId === id).sort((a, b) => b.date.localeCompare(a.date)), [store.fuelTransactions, id]);
  const trips = useMemo(() => store.trips.filter((t) => t.vehicleId === id).sort((a, b) => b.startTime.localeCompare(a.startTime)), [store.trips, id]);
  const maint = store.maintenance.filter((m) => m.vehicleId === id);
  const wos = store.workOrders.filter((w) => w.vehicleId === id);
  const tyres = store.tyres.filter((t) => t.vehicleId === id);
  const breakdowns = store.breakdowns.filter((b) => b.vehicleId === id);
  const profit = store.profitability.filter((p) => p.vehicleId === id).sort((a, b) => a.period.localeCompare(b.period));
  const docs = store.documents.filter((d) => d.vehicleId === id);

  if (!vehicle || !health) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={() => navigate({ to: '/transport/vehicles' })} className="text-sm text-primary hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to fleet</button>
        <div className="glass rounded-xl p-16 text-center"><p className="text-sm text-muted-foreground">Vehicle not found.</p></div>
      </div>
    );
  }

  const avgKpl = fuels.filter((f) => f.kmPerLiter > 0).length
    ? fuels.filter((f) => f.kmPerLiter > 0).reduce((a, f) => a + f.kmPerLiter, 0) / fuels.filter((f) => f.kmPerLiter > 0).length
    : null;
  const totalFuelCost = fuels.reduce((a, f) => a + f.totalCost, 0);
  const totalTrips = trips.length;
  const totalRevenue = trips.filter((t) => t.status === 'Completed').reduce((a, t) => a + t.revenue, 0);
  const openWos = wos.filter((w) => w.status !== 'Completed' && w.status !== 'Cancelled').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate({ to: '/transport/vehicles' })} className="text-sm text-primary hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to fleet</button>

      <PageHeader title={vehicle.name} description={`${vehicle.plate} · ${vehicle.type} · ${vehicle.depot}`}>
        <HealthBadge band={health.band} score={health.score} size="lg" />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Status" value={vehicle.status} change={driver ? `Driver: ${driver.name}` : 'No assigned driver'} changeType={vehicle.status === 'Active' ? 'positive' : vehicle.status === 'Maintenance' ? 'negative' : 'neutral'} icon={Truck} />
        <StatCard title="Odometer" value={formatKm(vehicle.mileage)} change={`Last service ${health.lastServiceDays}d ago`} changeType="neutral" icon={Gauge} />
        <StatCard title="Avg Efficiency" value={formatKpl(avgKpl)} change="fill-to-fill" changeType="neutral" icon={Fuel} />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} change={`${totalTrips} trips`} changeType="positive" icon={Wrench} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Health Score Breakdown</h3>
          <div className="space-y-3">
            <ScoreBar value={health.fuelEfficiencyScore} label="Fuel Efficiency (30%)" />
            <ScoreBar value={health.maintenanceScore} label="Maintenance Compliance (25%)" />
            <ScoreBar value={health.breakdownScore} label="Breakdown Frequency (20%)" />
            <ScoreBar value={health.tyreScore} label="Tyre Condition (15%)" />
            <ScoreBar value={health.driverScore} label="Driver Behaviour (10%)" />
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Assigned Driver</h3>
          {driver ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">{driver.name.charAt(0)}</div>
              <div>
                <p className="font-semibold">{driver.name}</p>
                <p className="text-xs text-muted-foreground">{driver.phone} · Rating {driver.rating}</p>
                <p className="text-xs text-muted-foreground">License: {driver.license}</p>
              </div>
            </div>
          ) : <p className="text-sm text-muted-foreground py-6 text-center">No driver assigned.</p>}
          <h3 className="font-semibold mt-5 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Location</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Depot: {vehicle.depot}</p>
            <p>Acquired: {formatDate(vehicle.acquisitionDate)}</p>
            <p>Tank: {vehicle.tankCapacity} L · {vehicle.fuelType}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><History className="w-4 h-4 text-primary" /> Quick Alerts</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm"><span className="text-muted-foreground">Upcoming maintenance</span><span className="font-bold">{health.upcomingMaintenance}</span></div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm"><span className="text-muted-foreground">Open work orders</span><span className="font-bold">{health.openWorkOrders}</span></div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm"><span className="text-muted-foreground">Breakdowns (90d)</span><span className="font-bold">{breakdowns.filter((b) => b.date > new Date(Date.now() - 90 * 86400000).toISOString()).length}</span></div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm"><span className="text-muted-foreground">Tyres fitted</span><span className="font-bold">{tyres.length}</span></div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm"><span className="text-muted-foreground">Fuel spend (90d)</span><span className="font-bold">{formatCurrency(totalFuelCost)}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Recent Fuel History">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Date', 'Liters', 'Cost', 'km/L', 'Station', 'Flag'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {fuels.length ? fuels.slice(0, 8).map((f) => (
                  <tr key={f.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(f.date)}</td>
                    <td className="px-3 py-3">{f.liters} L</td>
                    <td className="px-3 py-3">{formatCurrency(f.totalCost)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{f.kmPerLiter > 0 ? f.kmPerLiter.toFixed(1) : '—'}</td>
                    <td className="px-3 py-3 text-muted-foreground">{f.station}</td>
                    <td className="px-3 py-3"><Badge text={f.anomaly} variant={f.anomaly === 'concern' ? 'destructive' : f.anomaly === 'watch' ? 'warning' : 'success'} /></td>
                  </tr>
                )) : <EmptyRow colSpan={6} message="No fuel records." />}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <SectionCard title="Recent Trips">
          <div className="space-y-2">
            {trips.length ? trips.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2">
                <div>
                  <p className="font-medium">{t.origin} → {t.destination}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.startTime)} · {t.distanceKm} km</p>
                </div>
                <div className="text-right">
                  <Badge text={t.status} variant={t.status === 'Completed' ? 'success' : t.status === 'In Transit' ? 'info' : 'warning'} />
                  <p className="text-xs mt-1">{formatCurrency(t.revenue)}</p>
                </div>
              </div>
            )) : <EmptyRow colSpan={1} message="No trips recorded." />}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Maintenance Schedule">
          <div className="space-y-2">
            {maint.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2">
                <div>
                  <p className="font-medium">{m.type}</p>
                  <p className="text-xs text-muted-foreground">Due {formatDate(m.nextDueDate)}</p>
                </div>
                <Badge text={m.status} variant={m.status === 'Overdue' ? 'destructive' : m.status === 'Due Soon' ? 'warning' : 'success'} />
              </div>
            ))}
            {!maint.length && <p className="text-sm text-muted-foreground py-6 text-center">No maintenance schedules.</p>}
          </div>
        </SectionCard>
        <SectionCard title="Open Work Orders">
          <div className="space-y-2">
            {wos.filter((w) => w.status !== 'Completed' && w.status !== 'Cancelled').map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2">
                <div>
                  <p className="font-medium">{w.title}</p>
                  <p className="text-xs text-muted-foreground">{w.reference}</p>
                </div>
                <Badge text={w.priority} variant={w.priority === 'Critical' ? 'destructive' : w.priority === 'High' ? 'warning' : 'info'} />
              </div>
            ))}
            {!openWos && <p className="text-sm text-muted-foreground py-6 text-center">No open work orders.</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}