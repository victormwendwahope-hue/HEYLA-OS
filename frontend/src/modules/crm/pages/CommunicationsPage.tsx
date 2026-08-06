import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Plus, Mail, Phone, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, Avatar, FilterSelect, SearchInput, EmptyRow } from '@/modules/crm/components/Common';
import AddCommunicationDialog from '@/modules/crm/components/AddCommunicationDialog';
import { timeAgo } from '@/modules/crm/utils/format';

const channelIcon = (c: string) => ({ email: Mail, phone: Phone, whatsapp: MessageSquare, meeting: MessageSquare, sms: MessageSquare, linkedin: MessageSquare })[c] || Mail;
const sv: Record<string, 'success' | 'warning' | 'info' | 'default'> = { Read: 'success', Delivered: 'info', Sent: 'default', Scheduled: 'warning', Failed: 'warning' };

export default function CommunicationsPage() {
  const store = useCrmStore();
  useEffect(() => { store.init(); }, []);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dir, setDir] = useState('');
  const [channel, setChannel] = useState('');

  const comms = store.communications;
  const companies = store.companies;

  const stats = useMemo(() => ({
    total: comms.length,
    outbound: comms.filter((c) => c.direction === 'outbound').length,
    inbound: comms.filter((c) => c.direction === 'inbound').length,
    read: comms.filter((c) => c.status === 'Read').length,
  }), [comms]);

  const filtered = comms.filter((c) => {
    if (dir && c.direction !== dir) return false;
    if (channel && c.channel !== channel) return false;
    if (search) {
      const q = search.toLowerCase();
      const company = companies.find((x) => x.id === c.companyId);
      return [c.subject, company?.name || c.fromName, c.toName].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const companyName = (id: string) => companies.find((c) => c.id === id)?.shortName || '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Communications" description="Every touchpoint with your accounts">
        <button onClick={() => setAddOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> New Message
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={String(stats.total)} icon={Mail} iconColor="bg-primary/10" />
        <StatCard title="Outbound" value={String(stats.outbound)} icon={Clock} iconColor="bg-success/10" />
        <StatCard title="Inbound" value={String(stats.inbound)} icon={CheckCircle2} iconColor="bg-info/10" />
        <StatCard title="Read" value={String(stats.read)} change={`${stats.total ? Math.round((stats.read / stats.total) * 100) : 0}% open rate`} icon={MessageSquare} iconColor="bg-warning/10" />
      </div>

      <SectionCard title="Activity Log" className="overflow-visible">
        <div className="flex flex-wrap gap-2 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search subject, company..." />
          <FilterSelect value={dir} onChange={setDir} label="Direction" options={[{ value: 'outbound', label: 'Outbound' }, { value: 'inbound', label: 'Inbound' }]} />
          <FilterSelect value={channel} onChange={setChannel} label="Channel" options={['email', 'phone', 'whatsapp', 'meeting', 'sms', 'linkedin'].map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2.5 pr-3 font-medium">Company</th>
                <th className="py-2.5 pr-3 font-medium">Subject</th>
                <th className="py-2.5 pr-3 font-medium">Channel</th>
                <th className="py-2.5 pr-3 font-medium">Direction</th>
                <th className="py-2.5 pr-3 font-medium">Status</th>
                <th className="py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((c) => {
                const Icon = channelIcon(c.channel);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-3 pr-3 font-medium">{companyName(c.companyId)}</td>
                    <td className="py-3 pr-3">{c.subject}</td>
                    <td className="py-3 pr-3"><span className="inline-flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-muted-foreground" /> {c.channel}</span></td>
                    <td className="py-3 pr-3"><Badge text={c.direction} variant={c.direction === 'outbound' ? 'info' : 'default'} /></td>
                    <td className="py-3 pr-3"><Badge text={c.status} variant={sv[c.status] || 'default'} /></td>
                    <td className="py-3 pr-3 text-muted-foreground">{timeAgo(c.sentAt)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <EmptyRow colSpan={6} message="No communications found." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddCommunicationDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}