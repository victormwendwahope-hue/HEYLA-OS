import { useEffect, useMemo } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { TrendingUp, Target, DollarSign, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge } from '@/modules/crm/components/Common';
import { formatMoney, formatCompact } from '@/modules/crm/utils/format';
import { buildForecast } from '@/modules/crm/utils/forecast';
import { monthKey } from '@/modules/crm/utils/format';

export default function ForecastingPage() {
  const store = useCrmStore();
  useEffect(() => { store.init(); }, []);

  const months = useMemo(() => {
    const now = new Date(2026, 2, 1); // Mar 2026
    const arr: string[] = [];
    for (let i = -5; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      arr.push(monthKey(d));
    }
    return arr;
  }, []);

  const summary = useMemo(() => buildForecast(store.opportunities, months), [store.opportunities, months]);
  const opps = store.opportunities;

  const committed = summary.overall.committed;
  const forecast = summary.overall.forecast;
  const best = summary.overall.bestCase;
  const worst = summary.overall.worstCase;

  const openCount = opps.filter((o) => o.status === 'Open').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Forecasting" description="Weighted best / expected / worst revenue" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Expected" value={formatMoney(forecast)} change="Weighted forecast" icon={Target} iconColor="bg-primary/10" />
        <StatCard title="Committed" value={formatMoney(committed)} change="Probability ≥ 80%" icon={DollarSign} iconColor="bg-success/10" />
        <StatCard title="Best Case" value={formatMoney(best)} change={`${openCount} open deals`} icon={TrendingUp} iconColor="bg-warning/10" />
        <StatCard title="Worst Case" value={formatMoney(worst)} icon={Gauge} iconColor="bg-destructive/10" />
      </div>

      <SectionCard title="Forecast vs Actual" subtitle="Expected (weighted) versus actual booked">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={summary.periods}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tickFormatter={(m: string) => m.slice(5) + '/' + m.slice(2, 4)} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000000)}M`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip formatter={(v: number) => formatMoney(v)} />
            <Legend />
            <Bar dataKey="forecast" name="Forecast" fill="#0A66FF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" name="Actual" fill="#16A34A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Best / Expected / Worst" subtitle="Confidence ranges">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={summary.periods}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tickFormatter={(m: string) => m.slice(5)} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000000)}M`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Legend />
              <Line type="monotone" dataKey="bestCase" name="Best" stroke="#16A34A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="forecast" name="Expected" stroke="#0A66FF" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="worstCase" name="Worst" stroke="#DC2626" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Monthly Breakdown" subtitle="Committed vs confidence">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-medium">Month</th>
                  <th className="py-2 pr-3 font-medium text-right">Forecast</th>
                  <th className="py-2 pr-3 font-medium text-right">Committed</th>
                  <th className="py-2 pr-3 font-medium text-right">Best</th>
                  <th className="py-2 font-medium text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {summary.periods.map((p) => (
                  <tr key={p.month} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{p.month}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{formatCompact(p.forecast)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{formatCompact(p.committed)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{formatCompact(p.bestCase)}</td>
                    <td className="py-2.5 text-right">
                      <Badge text={`${p.confidence}%`} variant={p.confidence >= 70 ? 'success' : p.confidence >= 50 ? 'warning' : 'destructive'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="How Forecast Is Computed">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">Expected</p>
            <p className="text-xs text-muted-foreground mt-1">Sum of (deal value × stage probability). Weighted confidence in the pipeline.</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">Best case</p>
            <p className="text-xs text-muted-foreground mt-1">Full value of every open deal — if all close at 100%.</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">Worst case</p>
            <p className="text-xs text-muted-foreground mt-1">Conservative 10% capture across the pipeline.</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="font-semibold">Committed</p>
            <p className="text-xs text-muted-foreground mt-1">Deals at Contract Sent / Contracted / Onboarding (probability ≥ 80%).</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}