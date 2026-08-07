import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Plus, ClipboardCheck, CheckCircle2, TriangleAlert, CalendarClock } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar, SearchInput, FilterSelect, EmptyRow } from '@/modules/ehs/components/Common';
import AddInspectionDialog from '@/modules/ehs/components/AddInspectionDialog';
import { formatDate, pct } from '@/modules/ehs/utils/format';

export default function InspectionsPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);

  const inspections = store.inspections;
  const statuses = ['Scheduled', 'In Progress', 'Completed'];

  const rows = useMemo(() =>
    inspections
      .filter((i) => !query || `${i.reference} ${i.type} ${i.site} ${i.inspector}`.toLowerCase().includes(query.toLowerCase()))
      .filter((i) => !status || i.status === status)
      .sort((a, b) => b.date.localeCompare(a.date)),
  [inspections, query, status]);

  const passes = inspections.filter((i) => i.result === 'Pass').length;
  const fails = inspections.filter((i) => i.result === 'Fail').length;
  const avgScore = inspections.length ? Math.round(inspections.reduce((s, i) => s + i.score, 0) / inspections.length) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Inspections" description="Checklist inspections across all sites">
        <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Schedule Inspection</button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{inspections.length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Passed</p><p className="text-lg font-bold">{passes}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <TriangleAlert className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Failed</p><p className="text-lg font-bold">{fails}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <CalendarClock className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">Avg Score</p><p className="text-lg font-bold">{avgScore}%</p></div>
        </div>
      </div>

      <SectionCard title="Inspection Records" subtitle={`${rows.length} records · ${pct(passes, inspections.length)}% pass rate`} actions={
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput value={query} onChange={setQuery} placeholder="Search inspections..." />
          <FilterSelect value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s, label: s }))} label="Status" />
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Inspector</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{i.reference}</td>
                  <td className="px-4 py-3">{i.type}</td>
                  <td className="px-4 py-3">{i.site}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={i.inspector} size="sm" /><span>{i.inspector}</span></div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${i.score >= 80 ? 'bg-success' : i.score >= 60 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${i.score}%` }} />
                      </div>
                      <span className="text-xs">{i.score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge text={i.result} variant={i.result === 'Pass' ? 'success' : i.result === 'Conditional' ? 'warning' : 'destructive'} /></td>
                  <td className="px-4 py-3"><Badge text={i.status} variant={i.status === 'Completed' ? 'success' : 'default'} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(i.date)}</td>
                </tr>
              ))}
              {rows.length === 0 && <EmptyRow colSpan={8} message="No inspections found." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddInspectionDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}