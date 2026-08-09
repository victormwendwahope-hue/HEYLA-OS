import { useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Users, HeartPulse, Sparkles, RefreshCcw, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, HealthBadge, Badge, Avatar } from '@/modules/crm/components/Common';
import { formatMoney } from '@/modules/crm/utils/format';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(210, 90%, 55%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function CustomerSuccessPage() {
  const store = useCrmStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const companies = store.companies;
  const tickets = store.tickets;
  const contracts = store.contracts;

  const bands = useMemo(() => {
    const b = { excellent: 0, good: 0, attention: 0, risk: 0 };
    companies.forEach((c) => { b[c.healthBand] = (b[c.healthBand] || 0) + 1; });
    return Object.entries(b).map(([name, value]) => ({ name, value }));
  }, [companies]);

  const avgHealth = companies.length ? Math.round(companies.reduce((s, c) => s + c.healthScore, 0) / companies.length) : 0;
  const csat = useMemo(() => {
    const rated = tickets.filter((t) => t.satisfaction > 0);
    return rated.length ? Math.round((rated.reduce((s, t) => s + t.satisfaction, 0) / rated.length) * 20) : 0;
  }, [tickets]);
  const expiring = contracts.filter((c) => c.status === 'Expiring');
  const churnAtRisk = companies.filter((c) => c.healthBand === 'risk').length;
  const open = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Success" description="Health, retention and satisfaction" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Health" value={`${avgHealth}/100`} icon={HeartPulse} iconColor="bg-success/10" />
        <StatCard title="CSAT" value={`${csat}%`} change="From rated tickets" icon={Star} iconColor="bg-warning/10" />
        <StatCard title="Churn Risk" value={String(churnAtRisk)} change="Health < 50" icon={Users} iconColor="bg-destructive/10" />
        <StatCard title="Contracts Expiring" value={String(expiring.length)} icon={RefreshCcw} iconColor="bg-info/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Portfolio Health" subtitle="Distribution across bands">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bands} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {bands.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-2 mt-2 text-center">
            {bands.map((b, i) => (
              <div key={b.name}>
                <div className="font-bold" style={{ color: COLORS[i] }}>{b.value}</div>
                <div className="text-[11px] capitalize text-muted-foreground">{b.name}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="At-Risk Customers" subtitle="Prioritised for intervention" className="lg:col-span-2">
          <div className="space-y-3">
            {companies.filter((c) => ['risk', 'attention'].includes(c.healthBand)).slice(0, 8).map((c) => (
              <button key={c.id} onClick={() => navigate({ to: '/crm/customers/$id', params: { id: c.id } })} className="w-full flex items-center justify-between border border-border rounded-lg p-3 hover:bg-muted/40 transition">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} />
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.industry} · {c.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge text={c.healthBand} variant={c.healthBand === 'risk' ? 'destructive' : 'warning'} />
                  <HealthBadge band={c.healthBand} score={c.healthScore} />
                </div>
              </button>
            ))}
            {companies.filter((c) => ['risk', 'attention'].includes(c.healthBand)).length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">All customers are healthy.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Renewal Watch" subtitle="Contracts ending within 90 days">
          <div className="space-y-3">
            {expiring.slice(0, 6).map((c) => {
              const company = companies.find((x) => x.id === c.companyId);
              return (
                <div key={c.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{company?.name || '—'}</p>
                    <Badge text="Expiring" variant="warning" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.reference} · ends {c.endDate}</p>
                  <p className="text-sm font-semibold mt-1 tabular-nums">{formatMoney(c.value)}</p>
                </div>
              );
            })}
            {expiring.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No contracts expiring soon.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Health Drivers" subtitle="What moves the score">
          <div className="space-y-4 text-sm">
            <Row label="Revenue (25%)" p={companies.length ? Math.round(companies.filter((c) => c.healthScore >= 70).length / companies.length * 100) : 0} />
            <Row label="Support resolution" p={csat} />
            <Row label="Open tickets ratio" p={100 - open * 4} />
            <Row label="Contract tenure" p={companies.reduce((s, c) => s + (c.healthBand === 'excellent' ? 1 : 0), 0) / Math.max(1, companies.length) * 100} />
          </div>
          <div className="mt-5 rounded-xl p-4 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="w-4 h-4 text-primary" /> AI Insight</div>
            <p className="text-xs text-muted-foreground mt-1">
              {churnAtRisk > 0
                ? `Focus on the ${churnAtRisk} at-risk accounts first — an upsell here can save ${formatMoney(churnAtRisk * 1500000)} ARR.`
                : 'Portfolio health is strong — look for expansion opportunities among good/excellent accounts.'}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Health Score Model" subtitle="How bands are computed">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between"><span>Revenue</span><span className="font-medium text-foreground">25%</span></li>
            <li className="flex justify-between"><span>Payment</span><span className="font-medium text-foreground">20%</span></li>
            <li className="flex justify-between"><span>Support</span><span className="font-medium text-foreground">20%</span></li>
            <li className="flex justify-between"><span>Engagement</span><span className="font-medium text-foreground">15%</span></li>
            <li className="flex justify-between"><span>Contract</span><span className="font-medium text-foreground">20%</span></li>
          </ul>
          <div className="mt-4 space-y-1.5">
            {[
              ['Excellent', '≥ 85', 'text-success'],
              ['Good', '70-84', 'text-primary'],
              ['Attention', '50-69', 'text-warning'],
              ['At Risk', '< 50', 'text-destructive'],
            ].map(([label, range, color]) => (
              <div key={label} className="flex justify-between text-sm border border-border rounded-lg px-3 py-2">
                <span className={`font-medium ${color}`}>{label}</span>
                <span className="text-muted-foreground">{range}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Row({ label, p }: { label: string; p: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, p))}%` }} />
      </div>
      <span className="font-semibold tabular-nums w-10 text-right">{Math.round(p)}%</span>
    </div>
  );
}