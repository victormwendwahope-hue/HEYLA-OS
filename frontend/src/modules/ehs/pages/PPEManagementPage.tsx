import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { HardHat, CheckCircle2, RefreshCcw, TriangleAlert } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar, SearchInput, FilterSelect, EmptyRow } from '@/modules/ehs/components/Common';
import { formatDate, daysUntil, pct } from '@/modules/ehs/utils/format';

export default function PPEManagementPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');

  const ppe = store.ppe;

  const rows = useMemo(() =>
    ppe
      .filter((p) => !query || `${p.type} ${p.employeeId} ${p.size}`.toLowerCase().includes(query.toLowerCase()))
      .filter((p) => !filter || p.inspectionStatus === filter || p.compliance === filter)
      .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate)),
  [ppe, query, filter]);

  const good = ppe.filter((p) => p.inspectionStatus === 'Good').length;
  const replace = ppe.filter((p) => p.inspectionStatus === 'Needs Replacement').length;
  const expired = ppe.filter((p) => p.inspectionStatus === 'Expired').length;
  const expiring = ppe.filter((p) => daysUntil(p.expiryDate) >= 0 && daysUntil(p.expiryDate) <= 30).length;

  const filters = [
    { value: 'Good', label: 'Good' },
    { value: 'Needs Replacement', label: 'Needs Replacement' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Action Required', label: 'Action Required' },
    { value: 'Compliant', label: 'Compliant' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="PPE Management" description="Issue, inspect and track personal protective equipment" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <HardHat className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Good</p><p className="text-lg font-bold">{good}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <RefreshCcw className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">Needs Replacement</p><p className="text-lg font-bold">{replace}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <TriangleAlert className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Expired</p><p className="text-lg font-bold">{expired}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Compliant</p><p className="text-lg font-bold">{pct(good, ppe.length)}%</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SectionCard title="Issue Summary" subtitle={`${ppe.length} items issued`}>
          <div className="space-y-4">
            <div className="flex justify-between text-sm mb-1"><span>Compliance</span><strong>{pct(ppe.filter((p) => p.compliance === 'Compliant').length, ppe.length)}%</strong></div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-success" style={{ width: `${pct(ppe.filter((p) => p.compliance === 'Compliant').length, ppe.length)}%` }} />
            </div>
            <div className="text-sm space-y-2">
              <p className="flex justify-between"><span>Expiring ≤30d</span><strong>{expiring}</strong></p>
              <p className="flex justify-between"><span>Total items</span><strong>{ppe.length}</strong></p>
              <p className="flex justify-between"><span>Avg stock per type</span><strong>{Math.round(ppe.reduce((s, p) => s + p.stockAvailable, 0) / ppe.length)}</strong></p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="PPE Records" subtitle={`${rows.length} items`} className="lg:col-span-3" actions={
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput value={query} onChange={setQuery} placeholder="Search PPE..." />
            <FilterSelect value={filter} onChange={setFilter} options={filters} label="Status" />
          </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Expiry</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={p.employeeId} size="sm" /><span className="text-xs">{p.employeeId}</span></div></td>
                    <td className="px-4 py-3">{p.type}</td>
                    <td className="px-4 py-3">{p.size}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.expiryDate)}</td>
                    <td className="px-4 py-3">{p.stockAvailable}</td>
                    <td className="px-4 py-3"><Badge text={p.inspectionStatus} variant={p.inspectionStatus === 'Good' ? 'success' : p.inspectionStatus === 'Needs Replacement' ? 'warning' : 'destructive'} /></td>
                    <td className="px-4 py-3"><Badge text={p.compliance} variant={p.compliance === 'Compliant' ? 'info' : 'destructive'} /></td>
                  </tr>
                ))}
                {rows.length === 0 && <EmptyRow colSpan={7} message="No PPE records found." />}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}