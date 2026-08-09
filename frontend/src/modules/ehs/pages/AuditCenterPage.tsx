import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { ClipboardCheck, CheckCircle2, TriangleAlert, ScrollText } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar, FilterSelect, EmptyRow, Bar } from '@/modules/ehs/components/Common';
import { formatDate, pct } from '@/modules/ehs/utils/format';

export default function AuditCenterPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [type, setType] = useState('');
  const audits = store.inspections.filter((i) =>
    i.type === 'ISO 45001 Audit' || i.type === 'DOSH Compliance' || i.type === 'Contractor' || i.type === 'Fire Safety');
  const types = ['ISO 45001 Audit', 'DOSH Compliance', 'Contractor', 'Fire Safety'];

  const rows = useMemo(() =>
    audits.filter((a) => !type || a.type === type).sort((a, b) => b.date.localeCompare(a.date)),
  [audits, type]);

  const passed = audits.filter((a) => a.result === 'Pass').length;
  const ave = audits.length ? Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Center" description="ISO 45001, DOSH and compliance audits" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <ScrollText className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Audits</p><p className="text-lg font-bold">{audits.length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Passed</p><p className="text-lg font-bold">{passed}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <TriangleAlert className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Failed</p><p className="text-lg font-bold">{audits.filter((a) => a.result === 'Fail').length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <ClipboardCheck className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">Avg Score</p><p className="text-lg font-bold">{ave}%</p></div>
        </div>
      </div>

      <SectionCard title="Audit Records" subtitle={`${rows.length} audits · ${pct(passed, audits.length)}% pass`} actions={
        <FilterSelect value={type} onChange={setType} options={types.map((t) => ({ value: t, label: t }))} label="Audit type" />
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Audit</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Auditor</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{a.reference}</td>
                  <td className="px-4 py-3">{a.type}</td>
                  <td className="px-4 py-3">{a.site}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={a.inspector} size="sm" /><span>{a.inspector}</span></div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${a.score >= 80 ? 'bg-success' : a.score >= 60 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${a.score}%` }} />
                      </div>
                      <span className="text-xs">{a.score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge text={a.result} variant={a.result === 'Pass' ? 'success' : a.result === 'Conditional' ? 'warning' : 'destructive'} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.date)}</td>
                </tr>
              ))}
              {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No audits found.</p>}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}