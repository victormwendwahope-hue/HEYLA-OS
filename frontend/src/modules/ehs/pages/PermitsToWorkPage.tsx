import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Plus, FileSignature, CheckCircle2, Clock3, Ban } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar, SearchInput, FilterSelect, EmptyRow } from '@/modules/ehs/components/Common';
import AddPermitDialog from '@/modules/ehs/components/AddPermitDialog';
import { formatDate, daysUntil } from '@/modules/ehs/utils/format';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  Requested: 'default', 'Risk Review': 'info', Approved: 'info', Active: 'success', Suspended: 'destructive', Closed: 'default',
};

export default function PermitsToWorkPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);

  const permits = store.permits;
  const statuses = ['Requested', 'Risk Review', 'Approved', 'Active', 'Suspended', 'Closed'];

  const rows = useMemo(() =>
    permits
      .filter((p) => !query || `${p.reference} ${p.type} ${p.task} ${p.site}`.toLowerCase().includes(query.toLowerCase()))
      .filter((p) => !status || p.status === status)
      .sort((a, b) => b.startAt.localeCompare(a.startAt)),
  [permits, query, status]);

  const counts: Record<string, number> = {};
  statuses.forEach((s) => { counts[s] = permits.filter((p) => p.status === s).length; });

  const advance = (id: string) => {
    const order = ['Requested', 'Risk Review', 'Approved', 'Active', 'Suspended', 'Closed'];
    const p = store.permits.find((x) => x.id === id);
    if (!p) return;
    const idx = order.indexOf(p.status);
    const next = order[Math.min(idx + 1, order.length - 1)];
    store.updatePermit(id, { status: next as never });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Permits to Work" description="Control high-risk work authorisation">
        <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Request Permit</button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatus(status === s ? '' : s)} className="glass rounded-xl px-4 py-3 text-left hover:bg-muted/40">
            <p className="text-xs text-muted-foreground">{s}</p>
            <p className="text-lg font-bold">{counts[s]}</p>
          </button>
        ))}
      </div>

      <SectionCard title="Permit Register" subtitle={`${rows.length} permits`} actions={
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput value={query} onChange={setQuery} placeholder="Search permits..." />
          <FilterSelect value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s, label: s }))} label="Status" />
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Task</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Holder</th>
                <th className="px-4 py-3 font-medium">Valid Until</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{p.reference}</td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3 max-w-[220px] truncate">{p.task}</td>
                  <td className="px-4 py-3">{p.site}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={p.holder} size="sm" /><span>{p.holder}</span></div></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.endAt)} {daysUntil(p.endAt) < 0 && <Badge text="expired" variant="destructive" />}</td>
                  <td className="px-4 py-3"><Badge text={p.status} variant={STATUS_VARIANT[p.status]} /></td>
                  <td className="px-4 py-3">
                    {p.status !== 'Closed' && (
                      <button onClick={() => advance(p.id)} className="text-xs text-primary font-medium hover:underline">
                        {p.status === 'Requested' ? 'Start review' : p.status === 'Risk Review' ? 'Approve' : p.status === 'Approved' ? 'Activate' : p.status === 'Active' ? 'Close' : p.status === 'Suspended' ? 'Resume' : 'Close'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <EmptyRow colSpan={8} message="No permits found." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddPermitDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}