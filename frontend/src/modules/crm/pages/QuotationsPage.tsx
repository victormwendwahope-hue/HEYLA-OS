import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Plus, FileText, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, Avatar, FilterSelect, SearchInput, EmptyRow, Money } from '@/modules/crm/components/Common';
import AddQuotationDialog from '@/modules/crm/components/AddQuotationDialog';
import { formatDate, formatMoney } from '@/modules/crm/utils/format';

const qv: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  Accepted: 'success', Approved: 'success', Sent: 'info', Draft: 'default', Expired: 'warning', Rejected: 'destructive',
};

export default function QuotationsPage() {
  const store = useCrmStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const quotes = store.quotations;
  const companies = store.companies;

  const stats = useMemo(() => {
    const pending = quotes.filter((q) => ['Draft', 'Sent'].includes(q.status));
    const accepted = quotes.filter((q) => q.status === 'Accepted');
    return {
      total: quotes.length,
      pending: pending.length,
      pendingValue: pending.reduce((s, q) => s + q.total, 0),
      accepted: accepted.reduce((s, q) => s + q.total, 0),
    };
  }, [quotes]);

  const filtered = quotes.filter((q) => {
    if (status && q.status !== status) return false;
    if (search) {
      const qq = search.toLowerCase();
      const company = companies.find((c) => c.id === q.companyId);
      return [q.number, company?.name || '', q.title].join(' ').toLowerCase().includes(qq);
    }
    return true;
  });

  const companyName = (id: string) => companies.find((c) => c.id === id)?.shortName || '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Quotations" description="Create, send and track proposals">
        <button onClick={() => setAddOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Quotations" value={String(stats.total)} icon={FileText} iconColor="bg-primary/10" />
        <StatCard title="Awaiting Decision" value={String(stats.pending)} change={`${stats.pendingValue} in flight`} icon={Clock} iconColor="bg-warning/10" />
        <StatCard title="Accepted Value" value={formatMoney(stats.accepted)} icon={CheckCircle2} iconColor="bg-success/10" />
        <StatCard title="Rejected" value={formatMoney(quotes.filter((q) => q.status === 'Rejected').reduce((s, q) => s + q.total, 0))} icon={XCircle} iconColor="bg-destructive/10" />
      </div>

      <SectionCard title="Quotation List" className="overflow-visible">
        <div className="flex flex-wrap gap-2 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search number, company..." />
          <FilterSelect value={status} onChange={setStatus} label="Status" options={['Draft', 'Sent', 'Approved', 'Accepted', 'Rejected', 'Expired'].map((s) => ({ value: s, label: s }))} />
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2.5 pr-3 font-medium">Number</th>
                <th className="py-2.5 pr-3 font-medium">Company</th>
                <th className="py-2.5 pr-3 font-medium">Title</th>
                <th className="py-2.5 pr-3 font-medium">Status</th>
                <th className="py-2.5 pr-3 font-medium">Valid Until</th>
                <th className="py-2.5 pr-3 font-medium text-right">Total</th>
                <th className="py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 40).map((q) => (
                <tr key={q.id} onClick={() => navigate({ to: '/crm/quotations/builder' })} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer">
                  <td className="py-3 pr-3 font-mono text-xs">{q.number}</td>
                  <td className="py-3 pr-3 font-medium">{companyName(q.companyId)}</td>
                  <td className="py-3 pr-3">{q.title}</td>
                  <td className="py-3 pr-3"><Badge text={q.status} variant={qv[q.status] || 'default'} /></td>
                  <td className="py-3 pr-3 tabular-nums">{formatDate(q.validUntil)}</td>
                  <td className="py-3 pr-3 text-right font-semibold tabular-nums"><Money amount={q.total} /></td>
                  <td className="py-3 text-right"><ChevronRight className="w-4 h-4 inline text-muted-foreground" /></td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow colSpan={7} message="No quotations found." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddQuotationDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}