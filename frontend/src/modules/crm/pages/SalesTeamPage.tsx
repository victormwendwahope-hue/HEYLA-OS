import { useEffect, useMemo } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Users, Trophy, Target, TrendingUp } from 'lucide-react';
import { BarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, Avatar, Bar } from '@/modules/crm/components/Common';
import { formatMoney, formatCompact } from '@/modules/crm/utils/format';

const quotaV = (pct: number): 'success' | 'warning' | 'destructive' => (pct >= 100 ? 'success' : pct >= 70 ? 'warning' : 'destructive');
const quotaPct = (achieved: number, quota: number) => (quota ? Math.round((achieved / quota) * 100) : 0);

function Money({ v }: { v: number }) { return <span className="tabular-nums">{formatMoney(v)}</span>; }

export default function SalesTeamPage() {
  const store = useCrmStore();
  useEffect(() => { store.init(); }, []);

  const reps = store.reps;
  const opps = store.opportunities;
  const companies = store.companies;

  const stats = useMemo(() => {
    const won = opps.filter((o) => o.isClosedWon);
    const open = opps.filter((o) => o.status === 'Open');
    return {
      teamAchieved: reps.reduce((s, r) => s + r.achieved, 0),
      teamQuota: reps.reduce((s, r) => s + r.quota, 0),
      won: won.reduce((s, o) => s + o.value, 0),
      openValue: open.reduce((s, o) => s + o.value, 0),
      winRate: opps.length ? Math.round((won.length / opps.length) * 100) : 0,
    };
  }, [reps, opps]);

  const chart = reps.map((r) => ({ name: r.name.split(' ')[0], Achieved: r.achieved, Target: r.target }));

  const companyName = (id: string) => companies.find((c) => c.id === id)?.shortName || '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Team" description="Performance, quotas and activity" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Team Achieved" value={formatMoney(stats.teamAchieved)} change={`of ${formatMoney(stats.teamQuota)} quota`} icon={Target} iconColor="bg-primary/10" />
        <StatCard title="Closed Value" value={formatMoney(stats.won)} change="Closed / won" icon={Trophy} iconColor="bg-success/10" />
        <StatCard title="Open Pipeline" value={formatMoney(stats.openValue)} icon={TrendingUp} iconColor="bg-warning/10" />
        <StatCard title="Win Rate" value={`${stats.winRate}%`} icon={Users} iconColor="bg-info/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Achieved vs Target" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000000)}M`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Legend />
              <RechartsBar dataKey="Achieved" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <RechartsBar dataKey="Target" fill="#0A66FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Reps" subtitle="Quota attainment">
          <div className="space-y-4">
            {reps.map((r) => {
              const pct = quotaPct(r.achieved, r.quota);
              return (
                <div key={r.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} color={r.avatarColor} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.role} · {r.region}</p>
                    </div>
                    <Badge text={`${pct}%`} variant={quotaV(pct)} />
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{formatCompact(r.achieved)}</span>
                      <span className="text-muted-foreground">of {formatCompact(r.quota)}</span>
                    </div>
                    <Bar pct={pct} color={pct >= 100 ? 'bg-success' : pct >= 70 ? 'bg-warning' : 'bg-destructive'} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Rep Leaderboard" subtitle="Ranked by pipeline value">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">Rep</th>
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 pr-3 font-medium text-right">Deals Won</th>
                <th className="py-2 pr-3 font-medium text-right">Win Rate</th>
                <th className="py-2 pr-3 font-medium text-right">Pipeline</th>
                <th className="py-2 pr-3 font-medium text-right">Revenue</th>
                <th className="py-2 font-medium text-right">Quota</th>
              </tr>
            </thead>
            <tbody>
              {[...reps].sort((a, b) => b.pipelineValue - a.pipelineValue).map((r, i) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-3 text-muted-foreground">{i + 1}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.name} color={r.avatarColor} size="sm" />
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">{r.role}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{r.dealsWon}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{r.winRate}%</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums"><Money v={r.pipelineValue} /></td>
                  <td className="py-2.5 pr-3 text-right tabular-nums"><Money v={r.revenue} /></td>
                  <td className="py-2.5 text-right tabular-nums">
                    <span className={r.achieved >= r.quota ? 'text-success' : 'text-warning'}>{quotaPct(r.achieved, r.quota)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}