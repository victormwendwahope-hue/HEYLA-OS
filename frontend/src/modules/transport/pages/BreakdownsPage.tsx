import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { AlarmClock, Wrench, CircleDollarSign, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, EmptyRow, SectionCard, BadgeVariant } from '@/modules/transport/components/Common';
import { formatCurrency, formatDate, timeAgo } from '@/modules/transport/utils/format';

const bdStatusVariant = (s: string): BadgeVariant => s === 'Resolved' ? 'success' : s === 'In Progress' ? 'warning' : 'destructive';

export default function BreakdownPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const breakdowns = useMemo(() => [...store.breakdowns].sort((a, b) => b.date.localeCompare(a.date)), [store.breakdowns]);

  const filtered = breakdowns.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const v = store.vehicles.find((x) => x.id === b.vehicleId);
      const d = store.drivers.find((x) => x.id === b.driverId);
      return [b.reference, b.location, b.type, v?.name, v?.plate, d?.name].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const openCount = breakdowns.filter((b) => b.status !== 'Resolved').length;
  const totalDowntime = breakdowns.filter((b) => b.status !== 'Resolved').reduce((a, b) => a + b.downtimeHours, 0);
  const totalCost = breakdowns.reduce((a, b) => a + b.cost, 0);
  const vehicleShare = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of breakdowns) map[b.vehicleId] = (map[b.vehicleId] || 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [breakdowns]);

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of breakdowns) map[b.type] = (map[b.type] || 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [breakdowns]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Breakdown Management" description="Downtime, root causes, and repair cost tracking" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Breakdowns" value={String(openCount)} change="need resolution" changeType={openCount ? 'negative' : 'positive'} icon={AlarmClock} />
        <StatCard title="Pending Downtime" value={`${totalDowntime} h`} change="lost hours (open)" changeType="negative" icon={Clock} />
        <StatCard title="Total Repair Cost" value={formatCurrency(totalCost)} change="all breakdowns" changeType="neutral" icon={CircleDollarSign} />
        <StatCard title="Breakdown Types" value={String(byType.length)} change={byType[0]?.[0] || '—'} changeType="neutral" icon={Wrench} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SectionCard title={`Breakdown Log (${filtered.length})`}
            actions={
              <>
                <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All statuses"
                  options={['Reported', 'In Progress', 'Resolved'].map((s) => ({ value: s, label: s }))} />
                <SearchInput value={search} onChange={setSearch} placeholder="Search ref, vehicle, location..." />
              </>
            }>
            <div className="space-y-3">
              {filtered.length ? filtered.slice(0, 20).map((b) => {
                const v = store.vehicles.find((x) => x.id === b.vehicleId);
                const d = store.drivers.find((x) => x.id === b.driverId);
                return (
                  <div key={b.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{b.reference}</span>
                        <Badge text={b.type} variant="default" />
                        <Badge text={b.status} variant={bdStatusVariant(b.status)} />
                      </div>
                      <span className="text-xs text-muted-foreground">{timeAgo(b.date)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{b.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" /> {b.location}</span>
                      <span>Vehicle: {v ? `${v.name} (${v.plate})` : '—'}</span>
                      <span>Driver: {d?.name || '—'}</span>
                      <span>Downtime: {b.downtimeHours} h</span>
                      <span className="ml-auto font-medium text-foreground">Repair: {b.cost ? formatCurrency(b.cost) : '—'}</span>
                    </div>
                  </div>
                );
              }) : <EmptyRow colSpan={1} message="No breakdowns match the filters." />}
            </div>
          </SectionCard>
        </div>
        <div className="space-y-4">
          <SectionCard title="Most Affected Vehicles">
            <div className="space-y-3">
              {vehicleShare.map(([vid, count]) => {
                const v = store.vehicles.find((x) => x.id === vid);
                const max = vehicleShare[0][1];
                const open = breakdowns.filter((b) => b.vehicleId === vid && b.status !== 'Resolved').length;
                return (
                  <div key={vid}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium truncate">{v?.name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">{count} × {open ? `${open} open` : 'resolved'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${count >= 3 ? 'bg-destructive' : 'bg-warning'}`} style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
          <SectionCard title="Breakdowns by Type">
            <div className="space-y-2">
              {byType.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <div className="rounded-xl border-l-4 border-warning bg-warning/5 p-4">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              Vehicles with 3+ breakdowns this period exceed the fleet norm — flag for full inspection before further dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}