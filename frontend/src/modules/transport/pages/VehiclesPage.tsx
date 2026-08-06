import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Truck, Plus, ChevronRight, Fuel, Activity } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { HealthBadge, Badge, FilterSelect, SearchInput } from '@/modules/transport/components/Common';
import { formatKm, formatKpl } from '@/modules/transport/utils/format';

export default function VehiclesPage() {
  const store = useFleetStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const healthList = Object.values(store.health);
  const vehicles = store.vehicles;

  const filtered = vehicles.filter((v) => {
    if (typeFilter && v.type !== typeFilter) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return [v.name, v.plate, v.depot].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const avgHealth = healthList.length ? Math.round(healthList.reduce((a, h) => a + h.score, 0) / healthList.length) : 0;
  const activeCount = vehicles.filter((v) => v.status === 'Active').length;
  const criticalCount = healthList.filter((h) => h.score < 50).length;
  const byType = useMemo(() => {
    const m: Record<string, number> = {};
    vehicles.forEach((v) => (m[v.type] = (m[v.type] || 0) + 1));
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [vehicles]);

  const fleetEfficiency = useMemo(() => {
    const k = store.fuelTransactions.filter((f) => f.kmPerLiter > 0);
    return k.length ? k.reduce((a, f) => a + f.kmPerLiter, 0) / k.length : 0;
  }, [store.fuelTransactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Fleet Vehicles" description="Hover a vehicle to open its full health profile">
        <div className="flex gap-2">
          <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Vehicles" value={String(vehicles.length)} change={`${activeCount} active`} changeType="positive" icon={Truck} />
        <StatCard title="Avg Fleet Health" value={String(avgHealth)} change={`${criticalCount} critical`} changeType={criticalCount ? 'negative' : 'positive'} icon={Activity} />
        <StatCard title="Fleet Efficiency" value={formatKpl(fleetEfficiency)} change="avg km/L" changeType="neutral" icon={Fuel} />
        <StatCard title="Vehicle Classes" value={String(byType.length)} change={byType[0]?.[0] || '—'} changeType="neutral" icon={Truck} />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Vehicles ({filtered.length})</h3>
          <div className="flex flex-wrap gap-2">
            <FilterSelect value={typeFilter} onChange={setTypeFilter} label="All types"
              options={['Truck', 'Pickup', 'Van', 'Excavator', 'Car', 'Motorcycle'].map((t) => ({ value: t, label: t }))} />
            <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All statuses"
              options={['Active', 'Maintenance', 'Idle', 'Out of Service'].map((s) => ({ value: s, label: s }))} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search name, plate, depot..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {['Vehicle', 'Plate', 'Type', 'Status', 'Health', 'Mileage', 'Driver', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((v) => {
                const h = store.health[v.id];
                const d = store.drivers.find((x) => x.id === v.driverId);
                return (
                  <tr key={v.id} onClick={() => navigate({ to: '/transport/vehicles/$id', params: { id: v.id } })}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.plate}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.type}</td>
                    <td className="px-4 py-3">
                      <Badge text={v.status} variant={v.status === 'Active' ? 'success' : v.status === 'Maintenance' ? 'warning' : v.status === 'Idle' ? 'info' : 'destructive'} />
                    </td>
                    <td className="px-4 py-3">{h ? <HealthBadge band={h.band} score={h.score} size="sm" /> : '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatKm(v.mileage)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d?.name || '—'}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No vehicles match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}