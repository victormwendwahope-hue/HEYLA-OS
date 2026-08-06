import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Fuel, Droplet, Banknote, Wallet, Plus, ArrowUpRight, FlaskConical, Trash2 } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { FilterSelect, SearchInput, Badge, EmptyRow, SectionCard, BadgeVariant } from '@/modules/transport/components/Common';
import { formatCurrency, formatDate, formatKpl } from '@/modules/transport/utils/format';

type Tab = 'transactions' | 'tanks';

export default function FuelManagementPage() {
  const store = useFleetStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [tab, setTab] = useState<Tab>('transactions');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [flagFilter, setFlagFilter] = useState('');

  const vehicles = store.vehicles;
  const fuelSort = [...store.fuelTransactions].sort((a, b) => b.date.localeCompare(a.date));

  const filtered = useMemo(() => fuelSort.filter((f) => {
    if (flagFilter === 'flagged' && !f.flagged) return false;
    if (flagFilter === 'clean' && f.flagged) return false;
    const v = vehicles.find((x) => x.id === f.vehicleId);
    if (typeFilter && v?.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = [v?.name, v?.plate, f.station, f.driverId].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [fuelSort, search, typeFilter, flagFilter, vehicles]);

  const totalCost = store.fuelTransactions.reduce((a, f) => a + f.totalCost, 0);
  const totalLiters = store.fuelTransactions.reduce((a, f) => a + f.liters, 0);
  const flagged = store.fuelTransactions.filter((f) => f.flagged).length;
  const avgKpl = useMemo(() => {
    const k = store.fuelTransactions.filter((f) => f.kmPerLiter > 0);
    return k.length ? Math.round((k.reduce((a, f) => a + f.kmPerLiter, 0) / k.length) * 10) / 10 : 0;
  }, [store.fuelTransactions]);

  const tankLevel = store.fuelTanks.reduce((a, t) => a + t.currentLevelL, 0);
  const tankCap = store.fuelTanks.reduce((a, t) => a + t.capacityL, 0);

  const anomalyBadge = (a: string): BadgeVariant => a === 'concern' ? 'destructive' : a === 'watch' ? 'warning' : 'success';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Fuel Management" description="Transaction ledger, tank levels, and fleet consumption">
        <button onClick={() => navigate({ to: '/transport/fuel-analytics' })} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
          <FlaskConical className="w-4 h-4" /> Theft Analytics
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Spend (90d)" value={formatCurrency(totalCost)} change="all transactions" changeType="neutral" icon={Wallet} />
        <StatCard title="Total Volume" value={`${totalLiters.toLocaleString('en-KE')} L`} change={`avg ${avgKpl} km/L`} changeType="neutral" icon={Droplet} />
        <StatCard title="Anomalies" value={String(flagged)} change={flagged ? 'review analytics' : 'no flags'} changeType={flagged ? 'negative' : 'positive'} icon={Fuel} />
        <StatCard title="Depot Stock" value={`${tankLevel.toLocaleString('en-KE')} L`} change={`${Math.round((tankLevel / Math.max(1, tankCap)) * 100)}% of capacity`} changeType="neutral" icon={Banknote} />
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {(['transactions', 'tanks'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'transactions' ? 'Transactions' : 'Depot Tanks'}
          </button>
        ))}
      </div>

      {tab === 'transactions' && (
        <SectionCard title={`Fuel Transactions (${filtered.length})`}
          actions={
            <>
              <FilterSelect value={typeFilter} onChange={setTypeFilter} label="All vehicles"
                options={['Truck', 'Pickup', 'Van', 'Car'].map((t) => ({ value: t, label: t }))} />
              <FilterSelect value={flagFilter} onChange={setFlagFilter} label="All flags"
                options={[{ value: 'flagged', label: 'Flagged only' }, { value: 'clean', label: 'Clean only' }]} />
              <SearchInput value={search} onChange={setSearch} placeholder="Search vehicle, station..." />
            </>
          }>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                {['Date', 'Vehicle', 'Plate', 'Fuel', 'Liters', 'Cost/L', 'Total', 'km/L', 'Cost/km', 'Station', 'Flag'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.length ? filtered.slice(0, 60).map((f) => {
                  const v = vehicles.find((x) => x.id === f.vehicleId);
                  return (
                    <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(f.date)}</td>
                      <td className="px-3 py-3 font-medium">{v?.name || 'Unknown'}</td>
                      <td className="px-3 py-3 font-mono text-xs">{v?.plate}</td>
                      <td className="px-3 py-3 text-muted-foreground">{f.fuelType}</td>
                      <td className="px-3 py-3 font-medium">{f.liters.toLocaleString('en-KE')}</td>
                      <td className="px-3 py-3">{f.costPerLiter.toFixed(2)}</td>
                      <td className="px-3 py-3 font-medium">{formatCurrency(f.totalCost)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{f.kmPerLiter > 0 ? f.kmPerLiter.toFixed(1) : '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground">{f.costPerKm > 0 ? f.costPerKm.toFixed(2) : '—'}</td>
                      <td className="px-3 py-3 text-muted-foreground">{f.station}</td>
                      <td className="px-3 py-3"><Badge text={f.anomaly} variant={anomalyBadge(f.anomaly)} /></td>
                    </tr>
                  );
                }) : <EmptyRow colSpan={11} message="No transactions match the current filters." />}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {tab === 'tanks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {store.fuelTanks.map((t) => {
            const pct = Math.round((t.currentLevelL / Math.max(1, t.capacityL)) * 100);
            return (
              <div key={t.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.depot} · {t.fuelType}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary"><Droplet className="w-5 h-5" /></div>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold">{t.currentLevelL.toLocaleString('en-KE')} L</span>
                  <span className="text-xs text-muted-foreground">{pct}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${pct < 30 ? 'bg-destructive' : pct < 60 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Capacity: {t.capacityL.toLocaleString('en-KE')} L</span>
                  <span>Last: {formatDate(t.lastRestocked)}</span>
                </div>
                <div className="mt-2 text-xs font-medium text-muted-foreground">Stock value: {formatCurrency(t.currentLevelL * t.stockCost)}</div>
              </div>
            );
          })}
          <button onClick={() => navigate({ to: '/transport/fuel-analytics' })} className="glass rounded-xl border-dashed border-2 border-border p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors min-h-[160px]">
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Run Theft Analytics</span>
          </button>
        </div>
      )}
    </div>
  );
}