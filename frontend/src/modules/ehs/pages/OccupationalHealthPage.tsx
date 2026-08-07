import { useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { HeartPulse, Activity, Ear, Lock } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar, SearchInput, EmptyRow } from '@/modules/ehs/components/Common';
import { formatDate } from '@/modules/ehs/utils/format';
import { useState } from 'react';

export default function OccupationalHealthPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const records = store.occupationalHealth;

  const rows = useMemo(() =>
    records
      .filter((r) => !query || `${r.employeeId} ${r.exam} ${r.provider}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date)),
  [records, query]);

  const fit = records.filter((r) => r.result === 'Fit').length;
  const restricted = records.filter((r) => r.result !== 'Fit').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Occupational Health" description="Confidential medical surveillance" >
        <SearchInput value={query} onChange={setQuery} placeholder="Search records..." />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <HeartPulse className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Examinations</p><p className="text-lg font-bold">{records.length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Fit</p><p className="text-lg font-bold">{fit}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Ear className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">Restricted / Action</p><p className="text-lg font-bold">{restricted}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Confidential Notes" subtitle="Anonymised insight" >
          <div className="space-y-4">
            <div className="flex justify-between text-sm mb-1"><span>Fit rate</span><strong>{Math.round((fit / (records.length || 1)) * 100)}%</strong></div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-success" style={{ width: `${(fit / (records.length || 1)) * 100}%` }} />
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• All records are confidential under the Health Act.</li>
              <li>• {records.filter((r) => r.exam === 'Hearing').length} hearing tests performed — monitor noise exposure.</li>
              <li>• Re-examinations due within the next 12 months.</li>
            </ul>
          </div>
        </SectionCard>

        <SectionCard title="Medical Surveillance Records" subtitle={`${rows.length} records`} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Exam</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Privacy</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={r.employeeId} size="sm" /><span className="text-xs">{r.employeeId}</span></div></td>
                    <td className="px-4 py-3">{r.exam}</td>
                    <td className="px-4 py-3"><Badge text={r.result} variant={r.result === 'Fit' ? 'success' : 'warning'} /></td>
                    <td className="px-4 py-3">{r.provider}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.date)}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="w-3 h-3" /> Confidential</div></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}