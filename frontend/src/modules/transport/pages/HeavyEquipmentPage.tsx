import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Construction, Gauge, Banknote, Clock, Filter, Wrench } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, SectionCard, EmptyRow, BadgeVariant } from '@/modules/transport/components/Common';
import AddEquipmentDialog from '@/modules/transport/components/AddEquipmentDialog';
import { formatCurrency, formatDate } from '@/modules/transport/utils/format';

const eqStatusVariant = (s: string): BadgeVariant => s === 'Available' ? 'success' : s === 'In Use' ? 'info' : s === 'Maintenance' ? 'warning' : 'default';

export default function HeavyEquipmentPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const equipment = store.heavyEquipment;
  const filtered = equipment.filter((e) => {
    if (statusFilter && e.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const op = store.drivers.find((d) => d.id === e.operatorId);
      return [e.name, e.model, e.category, e.serialNo, op?.name].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const inUse = equipment.filter((e) => e.status === 'In Use').length;
  const available = equipment.filter((e) => e.status === 'Available').length;
  const totalEngineHours = equipment.reduce((a, e) => a + e.engineHours, 0);
  const assetValue = equipment.reduce((a, e) => a + e.purchaseCost, 0);

  const utilization = useMemo(() => {
    return equipment.map((e) => {
      const logs = store.engineHourLogs.filter((l) => l.equipmentId === e.id);
      const hours = logs.reduce((a, l) => a + l.hours, 0);
      const fuel = logs.reduce((a, l) => a + l.fuelUsedL, 0);
      return { ...e, billedHours: Math.round(hours * 10) / 10, revenue: Math.round(hours * e.hourlyRate), fuel: fuel };
    }).sort((a, b) => b.billedHours - a.billedHours);
  }, [equipment, store.engineHourLogs]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Heavy Equipment" description="Excavators and plant — hours, utilization, and billing">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add Equipment</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Equipment" value={String(equipment.length)} change={`${available} available`} changeType="positive" icon={Construction} />
        <StatCard title="In Use" value={String(inUse)} change="deployed on site" changeType="neutral" icon={Gauge} />
        <StatCard title="Total Engine Hours" value={totalEngineHours.toLocaleString('en-KE')} change="across fleet" changeType="neutral" icon={Clock} />
        <StatCard title="Asset Value" value={formatCurrency(assetValue)} change="at purchase cost" changeType="neutral" icon={Banknote} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SectionCard title={`Equipment (${filtered.length})`}
            actions={
              <>
                <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All statuses"
                  options={['Available', 'In Use', 'Maintenance', 'Idle'].map((s) => ({ value: s, label: s }))} />
                <SearchInput value={search} onChange={setSearch} placeholder="Search name, model, serial..." />
              </>
            }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((e) => {
                const op = store.drivers.find((d) => d.id === e.operatorId);
                const util = utilization.find((u) => u.id === e.id);
                return (
                  <div key={e.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{e.name}</h3>
                        <p className="text-xs text-muted-foreground">{e.category} · {e.model} · {e.serialNo}</p>
                      </div>
                      <Badge text={e.status} variant={eqStatusVariant(e.status)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/40 rounded-lg p-2"><p className="text-xs text-muted-foreground">Engine Hours</p><p className="font-semibold">{e.engineHours.toLocaleString('en-KE')} h</p></div>
                      <div className="bg-muted/40 rounded-lg p-2"><p className="text-xs text-muted-foreground">Hourly Rate</p><p className="font-semibold">{formatCurrency(e.hourlyRate)}</p></div>
                      <div className="bg-muted/40 rounded-lg p-2"><p className="text-xs text-muted-foreground">Billed (30d)</p><p className="font-semibold">{util?.billedHours || 0} h</p></div>
                      <div className="bg-muted/40 rounded-lg p-2"><p className="text-xs text-muted-foreground">30d Revenue</p><p className="font-semibold text-success">{formatCurrency(util?.revenue || 0)}</p></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>Operator: {op?.name || '—'}</span>
                      <span>Depot: {e.depot}</span>
                      <span>Last service: {formatDate(e.lastService)}</span>
                    </div>
                  </div>
                );
              })}
              {!filtered.length && <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No equipment matches the filters.</div>}
            </div>
          </SectionCard>
        </div>
        <div className="space-y-4">
          <SectionCard title="Utilization & Revenue">
            <div className="space-y-3">
              {utilization.map((u) => (
                <div key={u.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium truncate">{u.name}</span>
                    <span className="text-xs text-muted-foreground">{u.billedHours}h · {formatCurrency(u.revenue)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (u.billedHours / Math.max(1, utilization[0].billedHours)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <div className="rounded-xl border-l-4 border-warning bg-warning/5 p-4 flex items-start gap-2">
            <Wrench className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">Maintenance windows should be scheduled during downtime to protect utilization and billing hours.</p>
          </div>
        </div>
      </div>

      <AddEquipmentDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}