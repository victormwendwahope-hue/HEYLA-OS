import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { AlertTriangle, Fuel, ShieldAlert, Eye, EyeOff, TrendingDown } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, EmptyRow, SectionCard, BadgeVariant } from '@/modules/transport/components/Common';
import { formatCurrency, formatDate } from '@/modules/transport/utils/format';

// Fuel theft detection:
// 1. Over-fill vs tank capacity  2. kpl below floor  3. Odometer gap  4. Price above tolerance

export default function FuelAnalyticsPage() {
  const store = useFleetStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('');
  const [showNotes, setShowNotes] = useState(true);

  const vehicles = store.vehicles;

  const anomalies = useMemo(() => {
    const out = store.fuelTransactions.filter((f) => f.flagged).map((f) => {
      const v = vehicles.find((x) => x.id === f.vehicleId);
      const reasons: string[] = [];
      const priceCap = (f.fuelType === 'Diesel' ? 232 : 222) * 1.05;
      if (f.liters > f.tankCapacity * 0.85) reasons.push(`Over-fill: ${f.liters}L into ${f.tankCapacity}L tank`);
      if (f.kmPerLiter > 0 && f.kmPerLiter < 2.5) reasons.push(`Very poor economy: ${f.kmPerLiter} km/L`);
      if (f.varianceLiters > f.tankCapacity * 0.5) reasons.push(`Variance +${f.varianceLiters}L vs expected`);
      if (f.costPerLiter > priceCap) reasons.push(`Price ${f.costPerLiter} above tolerance`);
      if (!reasons.length) reasons.push('Flagged by variance rules');
      return { ...f, vehicleName: v?.name || 'Unknown', plate: v?.plate || '', type: v?.type || '', reasons, severity: f.anomaly };
    }).sort((a, b) => {
      const rank = { concern: 0, watch: 1, none: 2 };
      return rank[a.severity] - rank[b.severity];
    });
    return out;
  }, [store.fuelTransactions, vehicles]);

  const filtered = anomalies.filter((a) => {
    if (sevFilter && a.severity !== sevFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return [a.vehicleName, a.plate, a.station].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const concerns = anomalies.filter((a) => a.severity === 'concern').length;
  const estLoss = anomalies.filter((a) => a.severity === 'concern').reduce((acc, a) => acc + Math.max(0, a.varianceLiters) * a.costPerLiter, 0);
  const vehiclesAffected = new Set(anomalies.map((a) => a.vehicleId)).size;
  const flaggedCost = anomalies.reduce((a, x) => a + x.totalCost, 0);

  const byVehicle = useMemo(() => {
    const m: Record<string, { id: string; count: number; cost: number; liters: number }> = {};
    for (const a of anomalies) {
      if (!m[a.vehicleId]) m[a.vehicleId] = { id: a.vehicleId, count: 0, cost: 0, liters: 0 };
      m[a.vehicleId].count++;
      m[a.vehicleId].cost += a.totalCost;
      m[a.vehicleId].liters += a.liters;
    }
    return Object.values(m).sort((x, y) => y.count - x.count);
  }, [anomalies]);

  const sevBadge = (s: string): BadgeVariant => s === 'concern' ? 'destructive' : 'warning';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Advanced Fuel Analytics & Theft Detection" description="Anomaly detection across the fleet — over-fills, odometer gaps, poor economy, and price variance">
        <button onClick={() => navigate({ to: '/transport/fuel' })} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
          <Fuel className="w-4 h-4" /> Fuel Ledger
        </button>
      </PageHeader>

      {concerns > 0 && (
        <div className="rounded-xl border-l-4 border-destructive bg-destructive/5 p-4 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-destructive">{concerns} high-risk fuel anomalies detected</p>
            <p className="text-muted-foreground">Estimated variance loss ≈ {formatCurrency(estLoss)}. Review the flagged transactions below and investigate drivers/vehicles.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Flagged Transactions" value={String(anomalies.length)} change={`${concerns} high risk`} changeType={concerns ? 'negative' : 'positive'} icon={AlertTriangle} />
        <StatCard title="Vehicles Affected" value={String(vehiclesAffected)} change="flagged vehicles" changeType="neutral" icon={ShieldAlert} />
        <StatCard title="Est. Variance Loss" value={formatCurrency(estLoss)} change="high-risk only" changeType="negative" icon={TrendingDown} />
        <StatCard title="Flagged Spend" value={formatCurrency(flaggedCost)} change="total flagged value" changeType="neutral" icon={Fuel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SectionCard title={`Anomaly Ledger (${filtered.length})`}
            actions={
              <>
                <FilterSelect value={sevFilter} onChange={setSevFilter} label="All severities"
                  options={[{ value: 'concern', label: 'High risk' }, { value: 'watch', label: 'Watch' }]} />
                <SearchInput value={search} onChange={setSearch} placeholder="Search vehicle, plate..." />
                <button onClick={() => setShowNotes(!showNotes)} className="px-3 py-2 rounded-lg border border-input text-sm flex items-center gap-1.5">
                  {showNotes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showNotes ? 'Hide' : 'Show'} reasons
                </button>
              </>
            }>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Date', 'Vehicle', 'Plate', 'Liters', 'Total', 'km/L', 'Variance', 'Severity', 'Reasons'].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.length ? filtered.slice(0, 50).map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors align-top">
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(a.date)}</td>
                      <td className="px-3 py-3 font-medium">{a.vehicleName}</td>
                      <td className="px-3 py-3 font-mono text-xs">{a.plate}</td>
                      <td className="px-3 py-3">{a.liters.toLocaleString('en-KE')} L</td>
                      <td className="px-3 py-3 font-medium">{formatCurrency(a.totalCost)}</td>
                      <td className="px-3 py-3 text-muted-foreground">{a.kmPerLiter > 0 ? a.kmPerLiter.toFixed(1) : '—'}</td>
                      <td className="px-3 py-3">{a.varianceLiters > 0 ? `+${a.varianceLiters} L` : `${a.varianceLiters} L`}</td>
                      <td className="px-3 py-3"><Badge text={a.severity} variant={sevBadge(a.severity)} /></td>
                      <td className="px-3 py-3">
                        {showNotes && a.reasons.map((r) => (
                          <p key={r} className="text-xs text-muted-foreground flex items-start gap-1">
                            <span className="text-warning">•</span>{r}
                          </p>
                        ))}
                      </td>
                    </tr>
                  )) : <EmptyRow colSpan={9} message="No flagged anomalies — the fleet is running clean." />}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Vehicles by Anomaly Count">
            <div className="space-y-3">
              {byVehicle.length ? byVehicle.slice(0, 8).map((v) => {
                const vehicle = vehicles.find((x) => x.id === v.id);
                const max = byVehicle[0].count;
                return (
                  <div key={v.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium truncate">{vehicle?.name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">{v.count} flags · {formatCurrency(v.cost)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${v.count >= 4 ? 'bg-destructive' : 'bg-warning'}`} style={{ width: `${(v.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground py-6 text-center">No flagged vehicles</p>}
            </div>
          </SectionCard>
          <SectionCard title="Detection Rules">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Fill &gt; 85% of tank capacity</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Fuel economy &lt; 2.5 km/L</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-warning" /> Variance &gt; 50% of tank vs expected</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-warning" /> Pump price &gt; 5% above market cap</p>
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-muted" /> Odometer gaps vs trip distance</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}