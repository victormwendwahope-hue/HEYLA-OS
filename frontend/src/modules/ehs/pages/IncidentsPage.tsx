import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/shared/CommonUI';
import { Plus, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, SeverityBadge, Avatar, SearchInput, FilterSelect, EmptyRow } from '@/modules/ehs/components/Common';
import AddIncidentDialog from '@/modules/ehs/components/AddIncidentDialog';
import { formatDate } from '@/modules/ehs/utils/format';

export default function IncidentsPage() {
  const store = useEhsStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);

  const types = [...new Set(store.incidents.map((i) => i.type))];
  const statuses = [...new Set(store.incidents.map((i) => i.status))];

  const rows = useMemo(() =>
    store.incidents
      .filter((i) => !query || `${i.type} ${i.number} ${i.site}`.toLowerCase().includes(query.toLowerCase()))
      .filter((i) => !status || i.status === status)
      .filter((i) => !type || i.type === type)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [store.incidents, query, status, type]);

  const openCount = store.incidents.filter((i) => i.status === 'Reported' || i.status === 'Investigating').length;
  const resolvedCount = store.incidents.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
  const wilbaCount = store.incidents.filter((i) => i.wibaApplicable).length;
  const doshCount = store.incidents.filter((i) => i.doshNotificationRequired).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Incidents" description="Report and track workplace incidents">
        <button onClick={() => setOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">Open</p><p className="text-lg font-bold">{openCount}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Resolved</p><p className="text-lg font-bold">{resolvedCount}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">WIBA Applicable</p><p className="text-lg font-bold">{wilbaCount}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">DOSH Reportable</p><p className="text-lg font-bold">{doshCount}</p></div>
        </div>
      </div>

      <SectionCard title="All Incidents" subtitle={`${rows.length} records`} actions={
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput value={query} onChange={setQuery} placeholder="Search incidents..." />
          <FilterSelect value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s, label: s }))} label="Status" />
          <FilterSelect value={type} onChange={setType} options={types.map((s) => ({ value: s, label: s }))} label="Type" />
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Reported By</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} onClick={() => navigate({ to: '/ehs/incidents/$id', params: { id: i.id } })} className="border-b border-border hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-3 font-medium">{i.number}</td>
                  <td className="px-4 py-3">{i.type}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={i.severity} /></td>
                  <td className="px-4 py-3">{i.site}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={i.reportedBy} size="sm" /><span>{i.reportedBy}</span></div></td>
                  <td className="px-4 py-3"><Badge text={i.status} variant={i.status === 'Closed' ? 'success' : i.status === 'Investigating' ? 'warning' : 'default'} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(i.createdAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && <EmptyRow colSpan={7} message="No incidents found." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddIncidentDialog open={open} onClose={() => setOpen(false)} onCreated={(id) => navigate({ to: '/ehs/incidents/$id', params: { id } })} />
    </div>
  );
}