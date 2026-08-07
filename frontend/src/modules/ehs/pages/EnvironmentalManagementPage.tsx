import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Recycle, Droplets, TriangleAlert, Leaf } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar, SearchInput, FilterSelect, EmptyRow } from '@/modules/ehs/components/Common';
import { formatDate, pct } from '@/modules/ehs/utils/format';

export default function EnvironmentalManagementPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');

  const records = store.environmental;
  const statuses = ['Compliant', 'At Limit', 'Exceeded'];

  const rows = useMemo(() =>
    records
      .filter((r) => !query || `${r.reference} ${r.category} ${r.site}`.toLowerCase().includes(query.toLowerCase()))
      .filter((r) => !status || r.status === status)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
  [records, query, status]);

  const exceeded = records.filter((r) => r.status === 'Exceeded').length;
  const atLimit = records.filter((r) => r.status === 'At Limit').length;
  const compliant = records.filter((r) => r.status === 'Compliant').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Environmental Management" description="Emissions, waste and compliance monitoring" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Recycle className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Compliant</p><p className="text-lg font-bold">{compliant}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Droplets className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">At Limit</p><p className="text-lg font-bold">{atLimit}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <TriangleAlert className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Exceeded</p><p className="text-lg font-bold">{exceeded}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Leaf className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Compliance Rate</p><p className="text-lg font-bold">{pct(compliant, records.length)}%</p></div>
        </div>
      </div>

      <SectionCard title="Monitoring Records" subtitle={`${rows.length} records`} actions={
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput value={query} onChange={setQuery} placeholder="Search records..." />
          <FilterSelect value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s, label: s }))} label="Status" />
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">Reading</th>
                <th className="px-4 py-3 font-medium">Threshold</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Recorded</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pctV = Math.min(100, (r.value / r.threshold) * 100);
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.reference}</td>
                    <td className="px-4 py-3">{r.category}</td>
                    <td className="px-4 py-3">{r.site}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${r.status === 'Exceeded' ? 'bg-destructive' : r.status === 'At Limit' ? 'bg-warning' : 'bg-success'}`} style={{ width: `${pctV}%` }} />
                        </div>
                        <span className="text-xs tabular-nums">{r.value} {r.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.threshold} {r.unit}</td>
                    <td className="px-4 py-3"><Badge text={r.status} variant={r.status === 'Exceeded' ? 'destructive' : r.status === 'At Limit' ? 'warning' : 'success'} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.recordedAt)}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && <EmptyRow colSpan={7} message="No environmental records found." />}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}