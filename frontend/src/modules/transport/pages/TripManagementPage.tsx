import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Route, MapPin, Package, CheckCircle2, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, EmptyRow, SectionCard, BadgeVariant } from '@/modules/transport/components/Common';
import AddTripDialog from '@/modules/transport/components/AddTripDialog';
import { formatCurrency, formatDate, formatKm } from '@/modules/transport/utils/format';

const tripStatusVariant = (s: string): BadgeVariant => s === 'Completed' ? 'success' : s === 'In Transit' ? 'info' : s === 'Pending' ? 'warning' : 'destructive';

export default function TripManagementPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);
  const [addOpen, setAddOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const trips = useMemo(() => [...store.trips].sort((a, b) => b.startTime.localeCompare(a.startTime)), [store.trips]);

  const filtered = trips.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const v = store.vehicles.find((x) => x.id === t.vehicleId);
      const d = store.drivers.find((x) => x.id === t.driverId);
      return [t.reference, t.origin, t.destination, v?.name, d?.name].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const inTransit = trips.filter((t) => t.status === 'In Transit').length;
  const completed = trips.filter((t) => t.status === 'Completed').length;
  const revenue = trips.filter((t) => t.status === 'Completed').reduce((a, t) => a + t.revenue, 0);
  const totalDist = trips.filter((t) => t.status === 'Completed').reduce((a, t) => a + t.distanceKm, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Trip Management" description="Track shipments from dispatch to delivery">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Route className="w-4 h-4" /> Dispatch Trip
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Trips" value={String(inTransit)} change="in transit now" changeType="positive" icon={Loader2} />
        <StatCard title="Completed" value={String(completed)} change="total delivered" changeType="positive" icon={CheckCircle2} />
        <StatCard title="Trip Revenue" value={formatCurrency(revenue)} change="from completed trips" changeType="positive" icon={Package} />
        <StatCard title="Distance Covered" value={formatKm(totalDist)} change="completed trips" changeType="neutral" icon={MapPin} />
      </div>

      <SectionCard title={`Trips (${filtered.length})`}
        actions={
          <>
            <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All statuses"
              options={['Pending', 'In Transit', 'Completed', 'Cancelled'].map((s) => ({ value: s, label: s }))} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search ref, route, vehicle..." />
          </>
        }>
        <div className="space-y-3">
          {filtered.length ? filtered.slice(0, 30).map((t) => {
            const v = store.vehicles.find((x) => x.id === t.vehicleId);
            const d = store.drivers.find((x) => x.id === t.driverId);
            return (
              <div key={t.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold font-mono text-sm">{t.reference}</span>
                    <Badge text={t.status} variant={tripStatusVariant(t.status)} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(t.startTime)}</span>
                    <span>·</span>
                    <span>{t.distanceKm} km</span>
                    <span>·</span>
                    <span>{t.loadWeightT} t</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /><span>{t.origin}</span></div>
                  <div className="flex-1 border-t-2 border-dashed border-border relative">
                    {t.status === 'In Transit' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"><ArrowRight className="w-4 h-4 text-primary" /></div>}
                  </div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-destructive" /><span>{t.destination}</span></div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Vehicle: {v ? `${v.name} (${v.plate})` : '—'}</span>
                  <span className="flex items-center gap-1">Driver: {d?.name || '—'}</span>
                  <span className="ml-auto font-medium text-foreground">Revenue: {formatCurrency(t.revenue)}</span>
                </div>
              </div>
            );
          }) : <EmptyRow colSpan={1} message="No trips match the current filters." />}
        </div>
      </SectionCard>

      <AddTripDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}