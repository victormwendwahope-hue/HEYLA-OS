import { useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import {
  Users, Target, FileText, Ticket as TicketIcon, TrendingUp, Trophy, AlertTriangle,
  Sparkles, ArrowRight, DollarSign, CheckCircle2,
} from 'lucide-react';
import { BarChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, HealthBadge, Avatar, Bar } from '@/modules/crm/components/Common';
import { formatCompact, formatMoney } from '@/modules/crm/utils/format';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(210, 90%, 55%)', 'hsl(0, 84%, 60%)', 'hsl(280, 70%, 55%)', 'hsl(24, 95%, 53%)', 'hsl(180, 70%, 45%)'];

export default function CrmDashboardPage() {
  const store = useCrmStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const { companies, leads, opportunities, quotations, tickets, contracts, reps } = store;

  const openOpps = opportunities.filter((o) => o.status === 'Open');
  const pipelineValue = openOpps.reduce((s, o) => s + o.value, 0);
  const wonOpps = opportunities.filter((o) => o.isClosedWon);
  const wonValue = wonOpps.reduce((s, o) => s + o.value, 0);
  const openTickets = tickets.filter((t) => ['Open', 'In Progress', 'On Hold', 'Escalated'].includes(t.status));
  const criticalTickets = tickets.filter((t) => t.priority === 'Critical' && ['Open', 'In Progress'].includes(t.status));
  const activeCustomers = companies.filter((c) => ['Active', 'VIP'].includes(c.status)).length;
  const atRisk = companies.filter((c) => c.healthBand === 'risk' || c.healthBand === 'attention');
  const activeContracts = contracts.filter((c) => ['Active', 'Expiring'].includes(c.status)).length;

  const leadScores = useMemo(() => {
    const buckets = { Hot: 0, Warm: 0, Cool: 0, Cold: 0 };
    leads.forEach((l) => {
      const c = l.scoreColor;
      if (c === 'green') buckets.Hot++;
      else if (c === 'yellow') buckets.Warm++;
      else if (c === 'orange') buckets.Cool++;
      else buckets.Cold++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const stageFunnel = useMemo(() => {
    const stages = ['New Lead', 'Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Review', 'Contract Sent', 'Contracted', 'Onboarding', 'Closed - Won'];
    return stages.map((s) => ({ name: s, value: opportunities.filter((o) => o.stage === s).length })).filter((x) => x.value > 0);
  }, [opportunities]);

  const repPerformance = useMemo(() => reps.slice(0, 6).map((r) => ({
    name: r.name.split(' ')[0],
    value: r.achieved,
    target: r.target,
  })), [reps]);

  const revenueByMonth = useMemo(() => {
    const m: Record<string, number> = {};
    store.revenue.forEach((r) => { m[r.month] = (m[r.month] || 0) + r.amount; });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])).slice(-12).map(([month, amount]) => ({
      month: month.slice(5) + '/' + month.slice(2, 4), amount,
    }));
  }, [store.revenue]);

  const recentActivity = [...store.activities]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const repName = (id: string) => reps.find((r) => r.id === id)?.name || '—';
  const companyName = (id: string) => companies.find((c) => c.id === id)?.shortName || '—';

  return (
    <div className="space-y-6">
      <PageHeader title="CRM Overview" description="Pipeline, customers and service at a glance">
        <button onClick={() => navigate({ to: '/crm/leads' })} className="btn btn-primary">
          <Target className="w-4 h-4" /> New Lead
        </button>
      </PageHeader>

      {/* Hero metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Pipeline" value={formatMoney(pipelineValue)} change={`${openOpps.length} open deals`} icon={TrendingUp} iconColor="bg-primary/10" />
        <StatCard title="Active Customers" value={String(activeCustomers)} change={`${companies.length} total accounts`} icon={Users} iconColor="bg-success/10" />
        <StatCard title="Closed / Won" value={formatMoney(wonValue)} change={`${wonOpps.length} deals closed`} icon={Trophy} iconColor="bg-warning/10" />
        <StatCard title="Open Tickets" value={String(openTickets.length)} change={`${criticalTickets.length} critical`} icon={TicketIcon} iconColor="bg-destructive/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Pipeline Funnel" subtitle="Opportunities by stage" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageFunnel} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis type="category" dataKey="name" width={110} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <RechartsBar dataKey="value" fill="#0A66FF" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Lead Quality" subtitle="Score bands">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={leadScores} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {leadScores.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {leadScores.map((s, i) => (
              <div key={s.name} className="text-center">
                <div className="text-lg font-bold" style={{ color: COLORS[i % COLORS.length] }}>{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.name}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Monthly Revenue" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueByMonth} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Line type="monotone" dataKey="amount" stroke="#0A66FF" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Rep Performance" subtitle="Achieved vs target">
          {repPerformance.map((r) => (
            <div key={r.name} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{r.name}</span>
                <span className="text-muted-foreground">{formatCompact(r.value)} / {formatCompact(r.target)}</span>
              </div>
              <Bar pct={(r.value / r.target) * 100} />
            </div>
          ))}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="At-Risk Customers" subtitle="Need engagement">
          <div className="space-y-3">
            {atRisk.slice(0, 5).map((c) => (
              <button key={c.id} onClick={() => navigate({ to: '/crm/customers/$id', params: { id: c.id } })} className="w-full text-left flex items-center justify-between border border-border rounded-lg p-3 hover:bg-muted/40 transition">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} />
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.industry} · {c.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HealthBadge band={c.healthBand} score={c.healthScore} />
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
            {atRisk.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No at-risk customers.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity">
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`mt-1 p-1.5 rounded-lg ${a.done ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {a.done ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.subject}</p>
                  <p className="text-xs text-muted-foreground">{companyName(a.companyId)} · {a.type}</p>
                </div>
                <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">{a.scheduledAt}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI Insights" className="bg-gradient-to-br from-primary/10 to-transparent">
          <Sparkles className="w-6 h-6 text-primary mb-2" />
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><span className="text-primary">•</span> <span>Pipeline value is <strong>{pctChange(pipelineValue)}</strong> vs last month — focus on the {stageFunnel[stageFunnel.length - 2]?.name || 'later'} stage to accelerate.</span></li>
            <li className="flex gap-2"><span className="text-primary">•</span> <span>{criticalTickets.length} critical tickets need immediate assignment to avoid SLA breach.</span></li>
            <li className="flex gap-2"><span className="text-primary">•</span> <span>{atRisk.length} customers are at risk — schedule a check-in call this week.</span></li>
            <li className="flex gap-2"><span className="text-primary">•</span> <span>{activeContracts} active contracts; renewals due soon should be added to pipeline.</span></li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

function pctChange(v: number) {
  return `KSh ${formatCompact(v)}`;
}