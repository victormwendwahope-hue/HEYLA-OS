import { useEffect } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { FileCheck2, Calendar, TriangleAlert, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Money } from '@/modules/ehs/components/Common';
import { formatDate } from '@/modules/ehs/utils/format';

export default function ComplianceCenterPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const wiba = store.wibaClaims;
  const incidents = store.incidents;
  const dosh = incidents.filter((i) => i.doshNotificationRequired && (i.status === 'Reported' || i.status === 'Investigating'));
  const totalClaim = wiba.reduce((s, c) => s + c.medicalCost + c.compensation, 0);

  const pending = wiba.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const settled = wiba.filter((c) => c.status === 'Settled' || c.status === 'Approved').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance Center" description="DOSH notifications & WIBA claims" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">DOSH Notifications</p><p className="text-lg font-bold">{dosh.length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <FileCheck2 className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">WIBA Claims</p><p className="text-lg font-bold">{wiba.length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">Pending</p><p className="text-lg font-bold">{pending}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Settled</p><p className="text-lg font-bold">{settled}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="DOSH / WIBA Notifications" subtitle="Statutory filings">
          <div className="space-y-3">
            {dosh.slice(0, 5).map((i) => (
              <div key={i.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{i.number} · {i.type}</span>
                  <Badge text="DOSH" variant="destructive" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{i.site} · {formatDate(i.createdAt)}</p>
                <p className="text-xs text-warning mt-2 flex items-center gap-1"><TriangleAlert className="w-3 h-3" /> Notify DOSH within 24 hours</p>
              </div>
            ))}
            {dosh.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No pending notifications.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Corporative Insurance & WIBA Claims" subtitle="Indemnify against claims" className="lg:col-span-2">
          <div className="space-y-3">
            {wiba.map((c) => (
              <div key={c.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.reference} — {c.injury}</span>
                  <Badge text={c.status} variant={c.status === 'Settled' || c.status === 'Approved' ? 'success' : c.status === 'Under Review' ? 'info' : 'default'} />
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-muted-foreground">
                  <span>Incident: {c.incidentNumber}</span>
                  <span>Policy: {c.policyNumber}</span>
                  <span>Claim date: {formatDate(c.claimDate)}</span>
                  <span>Medical: <Money amount={c.medicalCost} /></span>
                  <span>Compensation: <Money amount={c.compensation} /></span>
                </div>
              </div>
            ))}
            {wiba.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No WIBA claims.</p>}
          </div>
          <div className="border-t border-border pt-3 mt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Total exposure</span>
            <strong><Money amount={totalClaim} /></strong>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}