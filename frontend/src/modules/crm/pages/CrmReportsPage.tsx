import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { TrendingUp, Users, DollarSign, FileText, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, FilterSelect } from '@/modules/crm/components/Common';
import { formatMoney, formatCompact } from '@/modules/crm/utils/format';
import { toast } from 'sonner';

const COLORS = ['#0A66FF', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED', '#0891B2'];

export default function CrmReportsPage() {
  const store = useCrmStore();
  useEffect(() => { store.init(); }, []);

  const [period, setPeriod] = useState('12m');

  const leads = store.leads;
  const opps = store.opportunities;
  const quotes = store.quotations;
  const tickets = store.tickets;
  const companies = store.companies;
  const revenue = store.revenue;

  const revenueByMonth = useMemo(() => {
    const m: Record<string, number> = {};
    revenue.forEach((r) => { m[r.month] = (m[r.month] || 0) + r.amount; });
    const months = Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
    const take = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    return months.slice(-take).map(([month, amount]) => ({ month: month.slice(5) + '/' + month.slice(2, 4), amount }));
  }, [revenue, period]);

  const leadsByMonth = useMemo(() => {
    const m: Record<string, number> = {};
    leads.forEach((l) => { const k = l.createdAt.slice(0, 7); m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])).slice(-12).map(([month, count]) => ({ month: month.slice(5) + '/' + month.slice(2, 4), count }));
  }, [leads]);

  const byIndustry = useMemo(() => {
    const m: Record<string, number> = {};
    companies.forEach((c) => { m[c.industry] = (m[c.industry] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [companies]);

  const byStage = useMemo(() => {
    const stages = ['New Lead', 'Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Review', 'Contract Sent', 'Contracted', 'Onboarding', 'Closed - Won', 'Closed - Lost'];
    return stages.map((s) => ({ stage: s, value: opps.filter((o) => o.stage === s).reduce((acc, o) => acc + o.value, 0) })).filter((x) => x.value > 0);
  }, [opps]);

  const wonCount = opps.filter((o) => o.isClosedWon).length;
  const convRate = opps.length ? Math.round((wonCount / opps.length) * 100) : 0;
  const avgDeal = opps.length ? Math.round(opps.reduce((s, o) => s + o.value, 0) / opps.length) : 0;
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const openTickets = tickets.filter((t) => ['Open', 'In Progress', 'On Hold', 'Escalated'].includes(t.status)).length;

  const exportCsv = () => {
    const rows = [['Section', 'Metric', 'Value'],
      ['Pipeline', 'Open deals', String(opps.filter((o) => o.status === 'Open').length)],
      ['Pipeline', 'Open value', String(opps.filter((o) => o.status === 'Open').reduce((s, o) => s + o.value, 0))],
      ['Revenue', 'Total (period)', String(totalRevenue)],
      ['Leads', 'Total', String(leads.length)],
      ['Tickets', 'Open', String(openTickets)],
      ['Quotes', 'Total', String(quotes.length)],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'heylaos-crm-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="CRM Reports" description="Pipeline, revenue and performance analytics">
        <div className="flex items-center gap-2">
          <FilterSelect value={period} onChange={setPeriod} options={[{ value: '3m', label: 'Last 3 months' }, { value: '6m', label: 'Last 6 months' }, { value: '12m', label: 'Last 12 months' }]} />
          <button onClick={exportCsv} className="btn btn-primary flex items-center gap-1.5"><Download className="w-4 h-4" /> Export CSV</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pipeline Value" value={formatMoney(opps.filter((o) => o.status === 'Open').reduce((s, o) => s + o.value, 0))} change={`${convRate}% conversion`} icon={TrendingUp} iconColor="bg-primary/10" />
        <StatCard title="Avg Deal Size" value={formatMoney(avgDeal)} icon={DollarSign} iconColor="bg-success/10" />
        <StatCard title="Total Revenue" value={formatMoney(totalRevenue)} change="12 months" icon={DollarSign} iconColor="bg-warning/10" />
        <StatCard title="Open Tickets" value={String(openTickets)} icon={Users} iconColor="bg-destructive/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Revenue Trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis tickFormatter={(v: number) => `${Math.round(v / 1000000)}M`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Line type="monotone" dataKey="amount" stroke="#0A66FF" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Revenue by Industry">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byIndustry} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {byIndustry.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {byIndustry.map((s, i) => (
              <span key={s.name} className="text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Leads Acquired" subtitle="Monthly lead generation">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={leadsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Pipeline Value by Stage">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byStage} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tickFormatter={(v: number) => `${Math.round(v / 1000000)}M`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis type="category" dataKey="stage" width={110} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="value" fill="#0A66FF" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Leads', String(leads.length)],
          ['Opportunities', String(opps.length)],
          ['Quotations', String(quotes.length)],
          ['Contracts', String(store.contracts.length)],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}