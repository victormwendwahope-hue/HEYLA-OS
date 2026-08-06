import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import {
  ArrowLeft, Mail, Phone, Globe, MapPin, Building2, Users, FileText, Ticket as TicketIcon,
  TrendingUp, DollarSign, Sparkles, Activity as ActivityIcon, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, HealthBadge, Avatar, Bar, Money } from '@/modules/crm/components/Common';
import { formatMoney, formatDate, timeAgo } from '@/modules/crm/utils/format';
import { healthMeta } from '@/modules/crm/utils/scoring';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  VIP: 'warning', Active: 'success', Prospect: 'info', Lead: 'default', Dormant: 'default', Blacklisted: 'destructive',
};

export default function CustomerDetailsPage() {
  const store = useCrmStore();
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const company = store.companies.find((c) => c.id === id);
  const contacts = useMemo(() => store.contacts.filter((c) => c.companyId === id), [store.contacts, id]);
  const opps = useMemo(() => store.opportunities.filter((o) => o.companyId === id), [store.opportunities, id]);
  const quotes = useMemo(() => store.quotations.filter((q) => q.companyId === id), [store.quotations, id]);
  const tickets = useMemo(() => store.tickets.filter((t) => t.companyId === id), [store.tickets, id]);
  const contracts = useMemo(() => store.contracts.filter((c) => c.companyId === id), [store.contracts, id]);
  const activities = useMemo(() => store.activities.filter((a) => a.companyId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [store.activities, id]);
  const communications = useMemo(() => store.communications.filter((c) => c.companyId === id).sort((a, b) => b.sentAt.localeCompare(a.sentAt)), [store.communications, id]);

  if (!company) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={() => navigate({ to: '/crm/customers' })} className="text-sm text-primary hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to customers</button>
        <div className="glass rounded-xl p-16 text-center"><p className="text-sm text-muted-foreground">Customer not found.</p></div>
      </div>
    );
  }

  const health = healthMeta[company.healthBand];
  const rep = store.reps.find((r) => r.id === company.ownerId);
  const wonValue = opps.filter((o) => o.isClosedWon).reduce((s, o) => s + o.value, 0);
  const openOppsValue = opps.filter((o) => o.status === 'Open').reduce((s, o) => s + o.value, 0);
  const openTickets = tickets.filter((t) => ['Open', 'In Progress', 'On Hold', 'Escalated'].includes(t.status)).length;
  const activeContracts = contracts.filter((c) => ['Active', 'Expiring'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate({ to: '/crm/customers' })} className="text-sm text-primary hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to customers</button>

      <div className="glass rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4">
        <Avatar name={company.name} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold">{company.name}</h1>
            <Badge text={company.status} variant={statusVariant[company.status] || 'default'} />
            <Badge text={company.industry} variant="info" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{company.address} · {company.city}, {company.country}</p>
          <p className="text-xs text-muted-foreground mt-1">Owner: {rep?.name || '—'} · Founded {company.foundedYear}</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <HealthBadge band={company.healthBand} score={company.healthScore} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Mail className="w-4 h-4" /> {company.email}</a>
        <span className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /> {company.phone}</span>
        <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Globe className="w-4 h-4" /> {company.website.replace('https://', '')}</a>
        <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /> {company.employees} employees</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Pipeline" value={formatMoney(openOppsValue)} change={`${opps.filter((o) => o.status === 'Open').length} deals`} icon={TrendingUp} iconColor="bg-primary/10" />
        <StatCard title="Closed / Won" value={formatMoney(wonValue)} change="All time" icon={DollarSign} iconColor="bg-success/10" />
        <StatCard title="Open Tickets" value={String(openTickets)} change={`${tickets.filter((t) => t.slaBreached).length} SLA breached`} icon={TicketIcon} iconColor="bg-destructive/10" />
        <StatCard title="Active Contracts" value={String(activeContracts)} change={`${contracts.length} total`} icon={FileText} iconColor="bg-info/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Health Breakdown" subtitle="Weighted customer health">
          <div className="space-y-4">
            <HealthScore label="Revenue" value={healthTotal(company, 'revenue')} />
            <HealthScore label="Payment" value={healthTotal(company, 'payment')} />
            <HealthScore label="Support" value={healthTotal(company, 'support')} />
            <HealthScore label="Engagement" value={healthTotal(company, 'engagement')} />
            <HealthScore label="Contract" value={healthTotal(company, 'contract')} />
          </div>
          <div className="mt-5 rounded-xl p-4 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="w-4 h-4 text-primary" /> AI Recommendation</div>
            <p className="text-xs text-muted-foreground mt-1">
              {company.healthBand === 'risk' && 'Customer is at risk — schedule a senior check-in and review contract terms immediately.'}
              {company.healthBand === 'attention' && 'Customer needs attention — increase engagement cadence and address support backlog.'}
              {company.healthBand === 'good' && 'Customer is healthy — look for expansion and upsell opportunities.'}
              {company.healthBand === 'excellent' && 'Customer is thriving — consider advocating for a case study or referral.'}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Contacts" subtitle={`${contacts.length} people`} className="lg:col-span-2">
          <div className="space-y-3">
            {contacts.slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center gap-3 border border-border rounded-lg p-3">
                <Avatar name={c.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.name} {c.isPrimary && <Badge text="Primary" variant="info" />}</p>
                  <p className="text-xs text-muted-foreground">{c.title} · {c.role}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground hidden sm:block">
                  <p>{c.email}</p>
                  <p>{c.phone}</p>
                </div>
                <a href={`mailto:${c.email}`} className="text-primary hover:underline text-xs hidden md:inline">Email</a>
              </div>
            ))}
            {contacts.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No contacts recorded.</p>}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Opportunities" className="lg:col-span-2">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-medium">Deal</th>
                  <th className="py-2 pr-3 font-medium">Stage</th>
                  <th className="py-2 pr-3 font-medium">Prob.</th>
                  <th className="py-2 pr-3 font-medium text-right">Value</th>
                  <th className="py-2 font-medium">Close</th>
                </tr>
              </thead>
              <tbody>
                {opps.slice(0, 8).map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{o.title}</td>
                    <td className="py-2.5 pr-3"><Badge text={o.stage} variant={o.isClosedWon ? 'success' : o.isClosedWon ? 'success' : 'default'} /></td>
                    <td className="py-2.5 pr-3 tabular-nums">{o.probability}%</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums"><Money amount={o.value} /></td>
                    <td className="py-2.5 tabular-nums">{o.expectedCloseDate}</td>
                  </tr>
                ))}
                {opps.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">No opportunities yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity">
          <div className="space-y-3">
            {activities.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`mt-1 p-1.5 rounded-lg ${a.done ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {a.done ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.subject}</p>
                  <p className="text-xs text-muted-foreground">{a.type} · {timeAgo(a.createdAt)}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No activity logged.</p>}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Recent Communications">
          <div className="space-y-3">
            {communications.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-start gap-3 border border-border rounded-lg p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.subject}</p>
                  <p className="text-xs text-muted-foreground">{c.channel} · {c.direction} · {timeAgo(c.sentAt)}</p>
                </div>
                <Badge text={c.status} variant={c.status === 'Read' ? 'success' : 'default'} />
              </div>
            ))}
            {communications.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No communications.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Contracts">
          <div className="space-y-3">
            {contracts.slice(0, 5).map((c) => (
              <div key={c.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{c.title}</p>
                  <Badge text={c.status} variant={c.status === 'Active' ? 'success' : c.status === 'Expiring' ? 'warning' : 'default'} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.reference} · Ends {formatDate(c.endDate)}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Value</span>
                  <span className="text-sm font-semibold tabular-nums">{formatMoney(c.value)}</span>
                </div>
              </div>
            ))}
            {contracts.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No contracts.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Quotations">
          <div className="space-y-3">
            {quotes.slice(0, 5).map((q) => (
              <div key={q.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{q.number}</p>
                  <p className="text-xs text-muted-foreground">{q.title} · v{q.version}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{formatMoney(q.total)}</p>
                  <Badge text={q.status} variant={q.status === 'Accepted' ? 'success' : q.status === 'Rejected' ? 'destructive' : 'default'} />
                </div>
              </div>
            ))}
            {quotes.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No quotations.</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function HealthScore({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <Bar pct={value} color={value >= 80 ? 'bg-success' : value >= 60 ? 'bg-warning' : 'bg-destructive'} />
    </div>
  );
}

function healthTotal(c: { healthScore: number }, key: string) {
  return Math.max(30, Math.min(100, Math.round(c.healthScore + key.length * 2)));
}