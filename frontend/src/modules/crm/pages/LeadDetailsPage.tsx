import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Mail, Phone, Building2, DollarSign, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, LeadScoreBadge, Avatar, Bar } from '@/modules/crm/components/Common';
import { formatMoney, formatDate, timeAgo } from '@/modules/crm/utils/format';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  New: 'info', Contacted: 'warning', Qualified: 'success', Disqualified: 'destructive',
};

export default function LeadDetailsPage() {
  const store = useCrmStore();
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const lead = store.leads.find((l) => l.id === id);
  const rep = lead ? store.reps.find((r) => r.id === lead.assignedTo) : null;

  if (!lead) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={() => navigate({ to: '/crm/leads' })} className="text-sm text-primary hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to leads</button>
        <div className="glass rounded-xl p-16 text-center"><p className="text-sm text-muted-foreground">Lead not found.</p></div>
      </div>
    );
  }

  const parts = lead.scoreParts;
  const dimensions = [
    { label: 'Industry Fit (20)', v: parts.industryFit, w: 20 },
    { label: 'Budget (25)', v: parts.budget, w: 25 },
    { label: 'Engagement (20)', v: parts.engagement, w: 20 },
    { label: 'Response (10)', v: parts.response, w: 10 },
    { label: 'Company Size (15)', v: parts.companySize, w: 15 },
    { label: 'History (10)', v: parts.history, w: 10 },
  ];

  const qualify = () => {
    store.updateLead(lead.id, { status: 'Qualified', rating: 'Hot' });
    toast.success('Lead qualified');
  };
  const disqualify = () => {
    store.updateLead(lead.id, { status: 'Disqualified', rating: 'Cold' });
    toast.success('Lead disqualified');
  };
  const remove = () => {
    if (!window.confirm('Delete this lead?')) return;
    store.removeLead(lead.id);
    toast.success('Lead deleted');
    navigate({ to: '/crm/leads' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate({ to: '/crm/leads' })} className="text-sm text-primary hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to leads</button>
        <div className="flex gap-2">
          <button onClick={disqualify} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium">Disqualify</button>
          <button onClick={qualify} className="px-3 py-1.5 rounded-lg bg-success text-white text-sm font-medium flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Qualify</button>
          <button onClick={remove} className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium"><Trash2 className="w-4 h-4 inline" /></button>
        </div>
      </div>

      <div className="glass rounded-xl p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Avatar name={lead.name} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold">{lead.name}</h1>
            <Badge text={lead.status} variant={statusVariant[lead.status] || 'default'} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{lead.ref} · {lead.companyName} · Assigned to {rep?.name || '—'}</p>
        </div>
        <LeadScoreBadge score={lead.score} color={lead.scoreColor} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Lead Score" subtitle="Weighted qualification">
          <div className="mb-5 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold" style={{ color: scoreText(lead.score) }}><span>{lead.score}</span></div>
          </div>
          <div className="space-y-3">
            {dimensions.map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-semibold">{d.v}</span>
                </div>
                <Bar pct={d.v} color={scoreBar(d.v)} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Details" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Info label="Email" value={<a href={`mailto:${lead.email}`} className="text-primary hover:underline text-sm inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {lead.email}</a>} />
            <Info label="Phone" value={<span className="inline-flex items-center gap-1 text-sm"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>} />
            <Info label="Company" value={<span className="inline-flex items-center gap-1 text-sm"><Building2 className="w-3.5 h-3.5" /> {lead.companyName}</span>} />
            <Info label="Industry" value={lead.industry as string} />
            <Info label="Company Size" value={lead.companySize} />
            <Info label="Source" value={lead.source} />
            <Info label="Budget" value={`${lead.budgetRange} · ${formatMoney(lead.value)}`} />
            <Info label="Decision Role" value={lead.decisionRole} />
            <Info label="Urgency" value={`${lead.urgency}/10`} />
            <Info label="Engagement" value={`${lead.engagement}/100`} />
            <Info label="Needs" value={lead.needs || '—'} />
            <Info label="Created" value={formatDate(lead.createdAt)} />
          </div>
          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-2">Recommendation</h4>
            <div className="rounded-xl p-4 bg-gradient-to-br from-primary/10 to-transparent text-sm">
              {lead.scoreColor === 'green' && 'High-priority lead — reach out within 24h, route to senior AE.'}
              {lead.scoreColor === 'yellow' && 'Promising lead — nurture with a value-pack and demo.'}
              {lead.scoreColor === 'orange' && 'Moderate lead — qualify budget authority before investing time.'}
              {lead.scoreColor === 'red' && 'Low-priority lead — place on nurture sequences, re-score later.'}
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Last contact: {timeAgo(lead.lastContact)} · Score ref: {lead.ref}</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5 break-words">{value}</p>
    </div>
  );
}

function scoreText(s: number) {
  return s >= 80 ? '#16A34A' : s >= 60 ? '#CA8A04' : s >= 40 ? '#EA580C' : '#DC2626';
}
function scoreBar(s: number) {
  return s >= 70 ? 'bg-success' : s >= 50 ? 'bg-warning' : 'bg-destructive';
}