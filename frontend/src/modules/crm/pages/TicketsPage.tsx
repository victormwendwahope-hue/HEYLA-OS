import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Plus, Ticket as TicketIcon, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, Avatar, FilterSelect, SearchInput, EmptyRow } from '@/modules/crm/components/Common';
import AddTicketDialog from '@/modules/crm/components/AddTicketDialog';
import { timeAgo } from '@/modules/crm/utils/format';

const tv: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  Open: 'warning', 'In Progress': 'info', 'On Hold': 'default', Escalated: 'destructive', Resolved: 'success', Closed: 'default',
};
const pv: Record<string, 'success' | 'warning' | 'info' | 'destructive'> = {
  Critical: 'destructive', High: 'warning', Medium: 'info', Low: 'success',
};

export default function TicketsPage() {
  const store = useCrmStore();
  useEffect(() => { store.init(); }, []);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [prio, setPrio] = useState('');

  const tickets = store.tickets;
  const companies = store.companies;

  const stats = useMemo(() => {
    const open = tickets.filter((t) => ['Open', 'In Progress'].includes(t.status));
    const breached = tickets.filter((t) => t.slaBreached);
    const resolved = tickets.filter((t) => ['Resolved', 'Closed'].includes(t.status));
    const avg = resolved.length ? Math.round(resolved.reduce((s, t) => s + t.satisfaction, 0) / resolved.length) : 0;
    return { open: open.length, breached: breached.length, resolved: resolved.length, csat: avg };
  }, [tickets]);

  const filtered = tickets.filter((t) => {
    if (status && t.status !== status) return false;
    if (prio && t.priority !== prio) return false;
    if (search) {
      const q = search.toLowerCase();
      const company = companies.find((c) => c.id === t.companyId);
      return [t.number, t.subject, company?.name || ''].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const companyName = (id: string) => companies.find((c) => c.id === id)?.shortName || '—';
  const repName = (id: string) => store.reps.find((r) => r.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Tickets" description="Customer service with SLA tracking">
        <button onClick={() => setAddOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open" value={String(stats.open)} icon={TicketIcon} iconColor="bg-primary/10" />
        <StatCard title="SLA Breached" value={String(stats.breached)} change="Needs attention" icon={AlertTriangle} iconColor="bg-destructive/10" />
        <StatCard title="Resolved" value={String(stats.resolved)} icon={CheckCircle2} iconColor="bg-success/10" />
        <StatCard title="Avg CSAT" value={stats.csat ? `${stats.csat}/5` : '—'} icon={Clock} iconColor="bg-warning/10" />
      </div>

      <SectionCard title="Ticket Queue" className="overflow-visible">
        <div className="flex flex-wrap gap-2 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search ticket, company..." />
          <FilterSelect value={status} onChange={setStatus} label="Status" options={['Open', 'In Progress', 'On Hold', 'Escalated', 'Resolved', 'Closed'].map((s) => ({ value: s, label: s }))} />
          <FilterSelect value={prio} onChange={setPrio} label="Priority" options={['Low', 'Medium', 'High', 'Critical'].map((s) => ({ value: s, label: s }))} />
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2.5 pr-3 font-medium">Ticket</th>
                <th className="py-2.5 pr-3 font-medium">Company</th>
                <th className="py-2.5 pr-3 font-medium">Priority</th>
                <th className="py-2.5 pr-3 font-medium">Status</th>
                <th className="py-2.5 pr-3 font-medium">Assignee</th>
                <th className="py-2.5 pr-3 font-medium">SLA Due</th>
                <th className="py-2.5 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 40).map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="py-3 pr-3">
                    <div>
                      <p className="font-medium">{t.subject}</p>
                      <p className="text-xs font-mono text-muted-foreground">{t.number} {t.slaBreached && <span className="text-destructive ml-1">● SLA breach</span>}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-3">{companyName(t.companyId)}</td>
                  <td className="py-3 pr-3"><Badge text={t.priority} variant={pv[t.priority] || 'default'} /></td>
                  <td className="py-3 pr-3"><Badge text={t.status} variant={tv[t.status] || 'default'} /></td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={repName(t.assignedTo)} size="sm" />
                      <span>{repName(t.assignedTo)}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground tabular-nums">{t.slaDue}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{timeAgo(t.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow colSpan={7} message="No tickets match." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

<AddTicketDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}