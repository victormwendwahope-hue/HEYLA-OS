import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Wallet, TrendingUp, TrendingDown, Percent, Filter, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { FilterSelect, SectionCard, Badge, EmptyRow } from '@/modules/transport/components/Common';
import { formatCurrency, formatCompact } from '@/modules/transport/utils/format';

export default function ProfitabilityPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [period, setPeriod] = useState('latest');
  const [sortKey, setSortKey] = useState('netProfit');

  const periods = useMemo(() => [...new Set(store.profitability.map((p) => p.period))].sort(), [store.profitability]);
  const currentPeriod = period === 'latest' ? periods[periods.length - 1] : period;

  const rows = useMemo(() => {
    const data = store.profitability.filter((p) => p.period === currentPeriod);
    const sorted = [...data].sort((a, b) => Number(b[sortKey as keyof typeof b]) - Number(a[sortKey as keyof typeof a]));
    return sorted;
  }, [store.profitability, currentPeriod, sortKey]);

  const totals = useMemo(() => {
    return rows.reduce((acc, p) => ({
      revenue: acc.revenue + p.revenue,
      cost: acc.cost + p.totalCost,
      profit: acc.profit + p.netProfit,
    }), { revenue: 0, cost: 0, profit: 0 });
  }, [rows]);

  const margin = totals.revenue ? (totals.profit / totals.revenue) * 100 : 0;

  const chartData = useMemo(() => rows.slice(0, 15).map((p) => {
    const v = store.vehicles.find((x) => x.id === p.vehicleId);
    return { name: v?.name || 'Unknown', revenue: p.revenue, cost: p.totalCost, profit: p.netProfit, margin: p.marginPct };
  }), [rows, store.vehicles]);

  const profitable = rows.filter((p) => p.netProfit > 0).length;
  const lossMaking = rows.length - profitable;

  const best = rows[0];
  const worst = rows[rows.length - 1];

  const costBreakdown = useMemo(() => {
    const labels = ['fuelCost', 'maintenanceCost', 'tyresCost', 'insuranceCost', 'driverCost', 'depreciationCost', 'otherCost'];
    return labels.map((k) => ({
      name: k.replace('Cost', '').replace(/^\w/, (c) => c.toUpperCase()),
      value: rows.reduce((a, p) => a + Number(p[k as keyof typeof p]), 0),
    })).sort((a, b) => b.value - a.value);
  }, [rows]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Vehicle Profitability" description="Per-asset P&L — revenue, direct costs, and margin by period">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <FilterSelect value={period} onChange={setPeriod}
            options={[{ value: 'latest', label: `Latest (${periods[periods.length - 1]})` }, ...periods.map((p) => ({ value: p, label: p }))]} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenue" value={formatCompact(totals.revenue)} change={`${rows.length} vehicles`} changeType="positive" icon={Wallet} />
        <StatCard title="Total Cost" value={formatCompact(totals.cost)} change="all cost lines" changeType="neutral" icon={TrendingDown} />
        <StatCard title="Net Profit" value={formatCompact(totals.profit)} change={`${margin.toFixed(1)}% margin`} changeType={totals.profit >= 0 ? 'positive' : 'negative'} icon={TrendingUp} />
        <StatCard title="Profitable" value={`${profitable}/${rows.length}`} change={`${lossMaking} loss-making`} changeType={lossMaking ? 'negative' : 'positive'} icon={Percent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Revenue vs Cost by Vehicle ({currentPeriod})</h3>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} tickFormatter={(v) => formatCompact(v)} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} formatter={(value, name) => [formatCurrency(Number(value)), name]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="cost" fill="hsl(0, 40%, 60%)" radius={[4, 4, 0, 0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-muted-foreground py-12 text-center">No profitability data for this period.</p>}
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Cost Structure</h3>
          <div className="space-y-3">
            {costBreakdown.map((c) => {
              const max = costBreakdown[0].value;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{c.name}</span>
                    <span className="font-medium">{formatCompact(c.value)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(c.value / Math.max(1, max)) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Best performer</span>
              {best && <span className="font-semibold text-success">{store.vehicles.find((v) => v.id === best.vehicleId)?.name || '—'} ({best.marginPct}%)</span>}
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Worst performer</span>
              {worst && <span className="font-semibold text-destructive">{store.vehicles.find((v) => v.id === worst.vehicleId)?.name || '—'} ({worst.marginPct}%)</span>}
            </div>
          </div>
        </div>
      </div>

      <SectionCard title={`Per-Vehicle P&L — ${currentPeriod}`} subtitle="Click a row to see cost lines">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {['Vehicle', 'Plate', 'Revenue', 'Total Cost', 'Net Profit', 'Margin', 'Cost/km', 'Revenue/km', ''].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.length ? rows.slice(0, 30).map((p) => {
                const v = store.vehicles.find((x) => x.id === p.vehicleId);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-3 font-medium">{v?.name || 'Unknown'}</td>
                    <td className="px-3 py-3 font-mono text-xs">{v?.plate}</td>
                    <td className="px-3 py-3">{formatCurrency(p.revenue)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{formatCurrency(p.totalCost)}</td>
                    <td className={`px-3 py-3 font-medium ${p.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(p.netProfit)}</td>
                    <td className="px-3 py-3"><Badge text={`${p.marginPct}%`} variant={p.marginPct >= 20 ? 'success' : p.marginPct >= 10 ? 'warning' : p.marginPct >= 0 ? 'info' : 'destructive'} /></td>
                    <td className="px-3 py-3 text-muted-foreground">KSh {p.costPerKm}</td>
                    <td className="px-3 py-3 text-muted-foreground">KSh {p.revenuePerKm}</td>
                    <td className="px-3 py-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                );
              }) : <EmptyRow colSpan={9} message="No profitability data for this period." />}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}