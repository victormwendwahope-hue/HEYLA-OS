import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { CalendarClock, CheckCircle2, AlertTriangle, FileText, CalendarDays, Camera } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, EmptyRow, SectionCard, BadgeVariant } from '@/modules/transport/components/Common';
import { formatDate, daysUntil, formatKm } from '@/modules/transport/utils/format';
import { daysAgo } from '@/modules/transport/utils/health';

const mStatusVariant = (s: string): BadgeVariant => s === 'Overdue' ? 'destructive' : s === 'Due Soon' ? 'warning' : 'info';

export default function PreventiveMaintenancePage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const schedules = useMemo(() => [...store.maintenance].sort((a, b) => daysUntil(a.nextDueDate) - daysUntil(b.nextDueDate)), [store.maintenance]);

  const filtered = schedules.filter((m) => {
    if (typeFilter && m.type !== typeFilter) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  const overdue = schedules.filter((m) => m.status === 'Overdue').length;
  const dueSoon = schedules.filter((m) => m.status === 'Due Soon').length;
  const upToDate = schedules.filter((m) => m.status === 'Up to Date').length;
  const estCost = schedules.filter((m) => m.status !== 'Up to Date').reduce((a, m) => a + m.costEstimate, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Preventive Maintenance" description="Scheduled service intervals to prevent costly breakdowns">
        <div className="flex flex-wrap gap-2">
          <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Camera className="w-4 h-4" /> Log Service
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Up to Date" value={String(upToDate)} change="service schedules" changeType="positive" icon={CheckCircle2} />
        <StatCard title="Due Soon (14d)" value={String(dueSoon)} change="book a service window" changeType="warning" icon={CalendarClock} />
        <StatCard title="Overdue" value={String(overdue)} change="requires immediate action" changeType="negative" icon={AlertTriangle} />
        <StatCard title="Pending Cost" value={`KSh ${estCost.toLocaleString('en-KE')}`} change="due + overdue" changeType="neutral" icon={FileText} />
      </div>

      {overdue > 0 && (
        <div className="rounded-xl border-l-4 border-destructive bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-destructive">{overdue} maintenance intervals are overdue.</span> Running vehicles beyond service windows raises breakdown risk and may void warranties.
          </p>
        </div>
      )}

      <SectionCard title={`Maintenance Schedules (${filtered.length})`}
        actions={
          <>
            <FilterSelect value={typeFilter} onChange={setTypeFilter} label="All types"
              options={store.maintenance.map((m) => m.type).filter((v, i, a) => a.indexOf(v) === i).map((t) => ({ value: t, label: t }))} />
            <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All statuses"
              options={['Up to Date', 'Due Soon', 'Overdue'].map((s) => ({ value: s, label: s }))} />
          </>
        }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {['Vehicle', 'Plate', 'Type', 'Interval', 'Last Done', 'Next Due', 'Due In', 'Est. Cost', 'Status'].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length ? filtered.map((m) => {
                const v = store.vehicles.find((x) => x.id === m.vehicleId);
                const delta = daysUntil(m.nextDueDate);
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-3 font-medium">{v?.name || 'Unknown'}</td>
                    <td className="px-3 py-3 font-mono text-xs">{v?.plate}</td>
                    <td className="px-3 py-3">{m.type}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatKm(m.intervalKm)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{daysAgo(m.lastCompletedDate)}d ago</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatDate(m.nextDueDate)}</td>
                    <td className="px-3 py-3"><Badge text={delta < 0 ? `${Math.abs(delta)}d overdue` : delta === 0 ? 'today' : `${delta}d`} variant={delta < 0 ? 'destructive' : delta <= 14 ? 'warning' : 'success'} /></td>
                    <td className="px-3 py-3">{formatCurrency(m.costEstimate)}</td>
                    <td className="px-3 py-3"><Badge text={m.status} variant={mStatusVariant(m.status)} /></td>
                  </tr>
                );
              }) : <EmptyRow colSpan={9} message="No maintenance schedules found." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Upcoming This Week</h3>
          <div className="space-y-2">
            {schedules.filter((m) => m.status !== 'Up to Date' && daysUntil(m.nextDueDate) <= 7).slice(0, 6).map((m) => {
              const v = store.vehicles.find((x) => x.id === m.vehicleId);
              return (
                <div key={m.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2">
                  <div><p className="font-medium">{m.type}</p><p className="text-xs text-muted-foreground">{v?.name} · {v?.plate}</p></div>
                  <span className="text-xs text-warning font-medium">{daysUntil(m.nextDueDate) <= 0 ? 'now' : `${daysUntil(m.nextDueDate)}d`}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">Vehicles Needing Service</h3>
          <div className="space-y-2">
            {store.maintenance.filter((m) => m.status !== 'Up to Date')
              .reduce((acc: Record<string, number>, m) => { acc[m.vehicleId] = (acc[m.vehicleId] || 0) + 1; return acc; }, {})
              && null}
            {Object.entries(store.maintenance.filter((m) => m.status !== 'Up to Date')
              .reduce((acc: Record<string, number>, m) => { acc[m.vehicleId] = (acc[m.vehicleId] || 0) + 1; return acc; }, {}))
              .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([vid, count]) => {
                const v = store.vehicles.find((x) => x.id === vid);
                return (
                  <div key={vid} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2">
                    <span className="font-medium">{v?.name || 'Unknown'} ({v?.plate})</span>
                    <Badge text={`${count} pending`} variant={count > 1 ? 'destructive' : 'warning'} />
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}