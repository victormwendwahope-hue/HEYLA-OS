import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Printer, Lock, CheckCircle2, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, Avatar } from '@/modules/crm/components/Common';
import { formatMoney, formatDate } from '@/modules/crm/utils/format';

const STATUS: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  Accepted: 'success', Approved: 'success', Sent: 'info', Draft: 'default', Expired: 'warning', Rejected: 'destructive',
};

export default function QuotationBuilderPage() {
  const store = useCrmStore();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('');
  useEffect(() => { store.init(); }, []);

  const quotes = store.quotations;
  const companies = store.companies;
  const reps = store.reps;

  const active = useMemo(() => {
    if (activeId) return quotes.find((q) => q.id === activeId);
    return quotes.find((q) => ['Draft', 'Sent'].includes(q.status)) || quotes[0];
  }, [quotes, activeId]);

  if (!active) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate({ to: '/crm/quotations' })} className="text-sm text-primary hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to quotations</button>
        <div className="glass rounded-xl p-16 text-center text-sm text-muted-foreground">No quotations yet. Create one to begin building.</div>
      </div>
    );
  }

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name || 'Account';
  const repName = (id: string) => reps.find((r) => r.id === id)?.name || '—';

  const approve = () => { store.updateQuotation(active.id, { status: 'Approved', approvalState: 'Approved' }); toast.success('Quotation approved'); };
  const reject = () => { store.updateQuotation(active.id, { status: 'Rejected', approvalState: 'Rejected' }); toast.success('Quotation rejected'); };
  const send = () => { store.updateQuotation(active.id, { status: 'Sent' }); toast.success('Quotation sent to customer'); };
  const print = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate({ to: '/crm/quotations' })} className="text-sm text-primary hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to quotations</button>
        <div className="flex flex-wrap gap-2">
          <button onClick={print} className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print</button>
          {active.status === 'Draft' && (
            <button onClick={send} className="px-3 py-1.5 rounded-lg bg-info text-white text-sm font-medium flex items-center gap-1.5"><Send className="w-4 h-4" /> Send</button>
          )}
          {(active.status === 'Sent' || active.status === 'Draft') && (
            <>
              <button onClick={approve} className="px-3 py-1.5 rounded-lg bg-success text-white text-sm font-medium flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Approve</button>
              <button onClick={reject} className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Reject</button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-72 space-y-3 order-2 lg:order-1">
          <SectionCard title="Quotations" subtitle="Select to edit" className="print:hidden">
            <div className="space-y-2">
              {quotes.slice(0, 20).map((q) => (
                <button key={q.id} onClick={() => setActiveId(q.id)} className={`w-full text-left rounded-lg border p-3 hover:bg-muted/40 transition ${q.id === active.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono">{q.number}</span>
                    <Badge text={q.status} variant={STATUS[q.status] || 'default'} />
                  </div>
                  <p className="text-sm font-medium mt-1">{companyName(q.companyId)}</p>
                  <p className="text-sm font-semibold mt-1 tabular-nums">{formatMoney(q.total)}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="flex-1" id="quotation-print">
          <SectionCard>
            <div className="flex items-center justify-between border-b border-border pb-5 mb-5">
              <div>
                <h2 className="text-xl font-bold">{active.number}</h2>
                <p className="text-sm text-muted-foreground">{active.title} · v{active.version}</p>
              </div>
              <div className="text-right">
                <Badge text={active.status} variant={STATUS[active.status] || 'default'} />
                <p className="text-xs text-muted-foreground mt-1">Issued {formatDate(active.issueDate)}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Bill To</p>
                <p className="font-semibold">{companyName(active.companyId)}</p>
                <p className="text-sm text-muted-foreground">{companies.find((c) => c.id === active.companyId)?.city || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase">Terms</p>
                <p className="text-sm">{active.terms}</p>
                <p className="text-xs text-muted-foreground mt-1">Valid until {formatDate(active.validUntil)}</p>
              </div>
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-medium">Description</th>
                  <th className="py-2 pr-3 font-medium text-right">Qty</th>
                  <th className="py-2 pr-3 font-medium text-right">Unit</th>
                  <th className="py-2 pr-3 font-medium text-right">Disc%</th>
                  <th className="py-2 font-medium text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {active.lines.map((l, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3">{l.description}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{l.quantity}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{formatMoney(l.unitPrice)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{l.discountPct}%</td>
                    <td className="py-2.5 text-right font-medium tabular-nums">{formatMoney(l.quantity * l.unitPrice * (1 - l.discountPct / 100))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-72 space-y-1.5">
                <Row label="Subtotal" v={active.subtotal} />
                <Row label="Discount" v={-active.discountTotal} />
                <Row label="Tax (16%)" v={active.taxTotal} />
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total {active.currency}</span>
                  <span className="tabular-nums">{formatMoney(active.total)}</span>
                </div>
              </div>
            </div>

            <div className={`mt-8 rounded-xl p-4 flex items-center gap-3 ${active.approvalState === 'Approved' ? 'bg-success/10 text-success' : active.approvalState === 'Rejected' ? 'bg-destructive/10 text-destructive' : 'bg-muted/40 text-muted-foreground'}`}>
              <Lock className="w-4 h-4" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Approval: {active.approvalState}</p>
                <p className="text-xs">Created by {repName(active.createdBy)} · Approved by {active.approvedBy ? repName(active.approvedBy) : 'pending'}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Row({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{formatMoney(v)}</span>
    </div>
  );
}