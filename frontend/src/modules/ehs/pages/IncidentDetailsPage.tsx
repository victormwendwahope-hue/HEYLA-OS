import { useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { PageHeader } from '@/components/shared/CommonUI';
import { ArrowLeft, MapPin, User, Calendar, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, SeverityBadge, Avatar } from '@/modules/ehs/components/Common';
import { formatDate, formatMoney, timeAgo } from '@/modules/ehs/utils/format';
import { incidentTypeMeta } from '@/modules/ehs/utils/format';

export default function IncidentDetailsPage() {
  const { id } = useParams({ strict: false });
  const store = useEhsStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const inc = store.incidents.find((i) => i.id === id);
  if (!inc) {
    return (
      <div className="p-8">
        <button onClick={() => navigate({ to: '/ehs/incidents' })} className="text-sm text-primary flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back to incidents</button>
        <p className="text-muted-foreground">Incident not found.</p>
      </div>
    );
  }

  const meta = incidentTypeMeta[inc.type];
  const investigations = store.investigations.filter((x) => x.incidentId === inc.id);

  return (
    <div className="space-y-6">
      <PageHeader title={`${inc.number}`} description={`${inc.type} · ${inc.site}`} >
        <button onClick={() => navigate({ to: '/ehs/incidents' })} className="btn btn-outline"><ArrowLeft className="w-4 h-4" /> Back</button>
        <SeverityBadge severity={inc.severity} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Incident Summary">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{meta.emoji}</span>
                <div>
                  <p className="font-semibold">{inc.type}</p>
                  <p className="text-xs text-muted-foreground">Status: <Badge text={inc.status} variant={inc.status === 'Closed' ? 'success' : inc.status === 'Investigating' ? 'warning' : 'default'} /></p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{inc.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{inc.location} <span className="text-xs text-muted-foreground">({inc.gps})</span></span></div>
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span>Reported by {inc.reportedBy}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>{formatDate(inc.createdAt)}</span></div>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /><span>Cost impact: {formatMoney(inc.costImpact)}</span></div>
              </div>
              {inc.bodyPart !== 'None' && <p className="text-sm"><span className="text-muted-foreground">Body part affected:</span> <strong>{inc.bodyPart}</strong></p>}
              <p className="text-xs text-muted-foreground">Updated {timeAgo(inc.updatedAt)}</p>
            </div>
          </SectionCard>

          <SectionCard title="Immediate Actions">
            <p className="text-sm text-muted-foreground">{inc.immediateActions}</p>
          </SectionCard>

          <SectionCard title="Environmental & Statutory">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Environmental Impact</p>
                <p className="font-medium">{inc.environmentalImpact}</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">WIBA Applicable</p>
                <p className="font-medium">{inc.wibaApplicable ? 'Yes — claim advisable' : 'No'}</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">DOSH Notification</p>
                <p className="font-medium">{inc.doshNotificationRequired ? 'Required (24h)' : 'Not required'}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="People Involved">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground w-24">Involved:</span>
                {inc.involved.map((n) => <div key={n} className="flex items-center gap-2 border border-border rounded-full pl-1 pr-3 py-1"><Avatar name={n} size="sm" /><span className="text-sm">{n}</span></div>)}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-muted-foreground w-24">Witnesses:</span>
                {inc.witnesses.map((n) => <div key={n} className="flex items-center gap-2 border border-border rounded-full pl-1 pr-3 py-1"><Avatar name={n} size="sm" /><span className="text-sm">{n}</span></div>)}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Investigations" subtitle={`${investigations.length} linked`}>
            <div className="space-y-3">
              {investigations.map((inv) => (
                <button key={inv.id} onClick={() => navigate({ to: '/ehs/investigations' })} className="w-full text-left border border-border rounded-lg p-3 hover:bg-muted/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{inv.method}</span>
                    <Badge text={inv.status} variant={inv.status === 'Closed' ? 'success' : inv.status === 'In Progress' ? 'warning' : 'default'} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Root cause: {inv.rootCause}</p>
                </button>
              ))}
              {investigations.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No investigation yet — start one from the Investigations module.</p>}
            </div>
          </SectionCard>

          <SectionCard title="AI Insight" className="bg-gradient-to-br from-primary/10 to-transparent">
            <Sparkles className="w-6 h-6 text-primary mb-2" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {inc.severity === 'Critical' || inc.severity === 'High'
                ? `This ${inc.type.toLowerCase()} is ${inc.severity.toLowerCase()} severity. Open an investigation with root-cause analysis and assign a corrective action within 48 hours.`
                : `Reported near-misses like this one are leading indicators — record it in the hazard register and share at the next toolbox talk.`}
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}