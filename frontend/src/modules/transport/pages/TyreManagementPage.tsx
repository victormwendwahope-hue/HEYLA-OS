import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Disc, RotateCw, Wrench, CircleDollarSign, TrendingDown } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, EmptyRow, SectionCard, BadgeVariant } from '@/modules/transport/components/Common';
import { formatCurrency, formatDate } from '@/modules/transport/utils/format';

const tyreStatusVariant = (s: string): BadgeVariant => s === 'Good' ? 'success' : s === 'Worn' ? 'warning' : s === 'Retread' ? 'info' : s === 'Punctured' ? 'destructive' : 'default';

export default function TyreManagementPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const tyres = useMemo(() => [...store.tyres].sort((a, b) => a.currentTreadMm / a.initialTreadMm - b.currentTreadMm / b.initialTreadMm), [store.tyres]);

  const filtered = tyres.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (typeFilter) {
      const v = store.vehicles.find((x) => x.id === t.vehicleId);
      if (v?.type !== typeFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const v = store.vehicles.find((x) => x.id === t.vehicleId);
      return [t.serialNo, t.brand, t.size, v?.name, v?.plate].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const totalValue = store.tyres.reduce((a, t) => a + t.purchaseCost, 0);
  const worn = store.tyres.filter((t) => t.status === 'Worn').length;
  const punctured = store.tyres.filter((t) => t.status === 'Punctured').length;
  const avgWear = store.tyres.length ? store.tyres.reduce((a, t) => a + (t.initialTreadMm ? 100 - (t.currentTreadMm / t.initialTreadMm) * 100 : 0), 0) / store.tyres.length : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Tyre Management" description="Tread wear, lifecycle cost, and rotation tracking per asset">
        <div className="flex gap-2">
          <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Fit Tyre</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tyres in Fleet" value={String(store.tyres.length)} change={`${store.tyres.filter((t) => t.status === 'Good').length} healthy`} changeType="positive" icon={Disc} />
        <StatCard title="Worn / Punctured" value={String(worn + punctured)} change={`${punctured} punctured`} changeType={worn + punctured ? 'negative' : 'positive'} icon={Wrench} />
        <StatCard title="Fleet Tyre Value" value={formatCurrency(totalValue)} change="at purchase cost" changeType="neutral" icon={CircleDollarSign} />
        <StatCard title="Avg Wear" value={`${avgWear.toFixed(0)}%`} change="tread consumed" changeType={avgWear > 70 ? 'negative' : 'neutral'} icon={TrendingDown} />
      </div>

      <SectionCard title={`Tyres (${filtered.length})`}
        actions={
          <>
            <FilterSelect value={typeFilter} onChange={setTypeFilter} label="All vehicles"
              options={['Truck', 'Pickup', 'Van', 'Excavator', 'Car'].map((t) => ({ value: t, label: t }))} />
            <FilterSelect value={statusFilter} onChange={setStatusFilter} label="All statuses"
              options={['Good', 'Worn', 'Punctured', 'Retread', 'Scrapped'].map((s) => ({ value: s, label: s }))} />
            <SearchInput value={search} onChange={setSearch} placeholder="Search serial, brand, vehicle..." />
          </>
        }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {['Serial', 'Brand', 'Size', 'Vehicle', 'Position', 'Tread', 'Wear %', 'Km Driven', 'Status'].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length ? filtered.slice(0, 50).map((t) => {
                const v = store.vehicles.find((x) => x.id === t.vehicleId);
                const wear = t.initialTreadMm ? Math.round((1 - t.currentTreadMm / t.initialTreadMm) * 100) : 0;
                return (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-3 font-mono text-xs">{t.serialNo}</td>
                    <td className="px-3 py-3 font-medium">{t.brand}</td>
                    <td className="px-3 py-3 text-muted-foreground">{t.size}</td>
                    <td className="px-3 py-3 text-muted-foreground">{v?.name || '—'} <span className="font-mono text-xs">({v?.plate})</span></td>
                    <td className="px-3 py-3">{t.position}</td>
                    <td className="px-3 py-3 text-muted-foreground">{t.currentTreadMm} mm</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${wear > 70 ? 'bg-destructive' : wear > 45 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(100, wear)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{wear}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{t.kmDriven.toLocaleString('en-KE')}</td>
                    <td className="px-3 py-3"><Badge text={t.status} variant={tyreStatusVariant(t.status)} /></td>
                  </tr>
                );
              }) : <EmptyRow colSpan={9} message="No tyres match the filters." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Recent Rotations & Fits" subtitle="Tyre movement history">
          <div className="space-y-3">
            {store.tyreMovements.length ? [...store.tyreMovements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((m) => {
              const t = store.tyres.find((x) => x.id === m.tyreId);
              const from = store.vehicles.find((x) => x.id === m.fromVehicleId);
              const to = store.vehicles.find((x) => x.id === m.toVehicleId);
              return (
                <div key={m.id} className="flex items-center gap-3 text-sm border-b border-border last:border-0 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><RotateCw className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{t?.brand || 'Tyre'} · {t?.serialNo}</p>
                    <p className="text-xs text-muted-foreground">{from?.plate || '—'} → {to?.plate || '—'} · {m.reason} · {formatDate(m.date)}</p>
                  </div>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground py-6 text-center">No movements recorded.</p>}
          </div>
        </SectionCard>
        <SectionCard title="Tyres Needing Replacement" subtitle="Wear ≥ 75% or punctured">
          <div className="space-y-3">
            {tyres.filter((t) => t.status === 'Punctured' || (t.initialTreadMm && t.currentTreadMm / t.initialTreadMm <= 0.25)).slice(0, 8).map((t) => {
              const v = store.vehicles.find((x) => x.id === t.vehicleId);
              return (
                <div key={t.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 py-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{t.serialNo} · {t.brand}</p>
                    <p className="text-xs text-muted-foreground">{v?.name} · {t.position}</p>
                  </div>
                  <Badge text={t.status} variant={t.status === 'Punctured' ? 'destructive' : 'warning'} />
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}