import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { ShieldCheck, FileText, ScrollText, AlertTriangle, BadgeCheck, Eye } from 'lucide-react';
import { useFleetStore } from '@/modules/transport/store/fleetStore';
import { Badge, FilterSelect, SearchInput, EmptyRow, SectionCard, statusVariantMap, BadgeVariant } from '@/modules/transport/components/Common';
import { formatDate, daysUntil, formatCurrency } from '@/modules/transport/utils/format';
import { ComplianceAlert } from '@/modules/transport/types';

type Tab = 'alerts' | 'documents' | 'insurance';

const docVariant = (s: string): BadgeVariant => s === 'Valid' ? 'success' : s === 'Expiring Soon' ? 'warning' : 'destructive';
const insVariant = (s: string): BadgeVariant => s === 'Active' ? 'success' : s === 'Expiring Soon' ? 'warning' : 'destructive';

export default function ComplianceCenterPage() {
  const store = useFleetStore();
  useEffect(() => { store.init(); }, []);

  const [tab, setTab] = useState<Tab>('alerts');
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('');

  const openAlerts = store.complianceAlerts.filter((a) => a.status === 'Open' || a.status === 'Acknowledged');
  const filteredAlerts = openAlerts.filter((a) => {
    if (sevFilter && a.severity !== sevFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const v = store.vehicles.find((x) => x.id === a.vehicleId);
      return [a.type, a.message, v?.name, v?.plate].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const expiringDocs = store.documents.filter((d) => d.status !== 'Valid');
  const activeIns = store.insurance.filter((i) => i.status === 'Active' || i.status === 'Expiring Soon');
  const expiringIns = store.insurance.filter((i) => i.status === 'Expiring Soon');
  const expiredIns = store.insurance.filter((i) => i.status === 'Expired');

  const totalPremium = store.insurance.reduce((a, i) => a + i.premium, 0);
  const criticalAlerts = store.complianceAlerts.filter((a) => a.severity === 'Critical' && a.status !== 'Resolved').length;
  const expiringCount = expiringDocs.length + expiringIns.length;
  const expiredCount = store.documents.filter((d) => d.status === 'Expired').length + expiredIns.length;

  const rowsForVehicle = (vehicleId: string) => {
    return [
      ...store.documents.filter((d) => d.vehicleId === vehicleId),
      ...store.insurance.filter((i) => i.vehicleId === vehicleId).map((i) => ({ ...i, type: i.type, referenceNo: i.policyNo, issueDate: i.startDate, cost: i.premium })),
    ].sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));
  };

  const allTracked = useMemo(() => {
    const byVeh = store.vehicles.filter((v) => v.type !== 'Excavator').map((v) => ({ vehicle: v, rows: rowsForVehicle(v.id) }));
    return byVeh;
  }, [store.vehicles, store.documents, store.insurance]);
  void allTracked;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Compliance Center" description="Licenses, insurance, and inspection status across the fleet" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Alerts" value={String(openAlerts.length)} change={`${criticalAlerts} critical`} changeType={criticalAlerts ? 'negative' : 'positive'} icon={AlertTriangle} />
        <StatCard title="Expiring (60d)" value={String(expiringCount)} change="docs + insurance" changeType={expiringCount ? 'warning' : 'positive'} icon={ScrollText} />
        <StatCard title="Expired" value={String(expiredCount)} change="needs action" changeType={expiredCount ? 'negative' : 'positive'} icon={ShieldCheck} />
        <StatCard title="Annual Premium" value={formatCurrency(totalPremium)} change="all policies" changeType="neutral" icon={BadgeCheck} />
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {([['alerts', 'Alerts'], ['documents', 'Documents & Insurance']] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'alerts' && (
        <SectionCard title={`Compliance Alerts (${filteredAlerts.length})`}
          actions={
            <>
              <FilterSelect value={sevFilter} onChange={setSevFilter} label="All severities"
                options={['Critical', 'High', 'Medium', 'Low'].map((s) => ({ value: s, label: s }))} />
              <SearchInput value={search} onChange={setSearch} placeholder="Search alert, vehicle..." />
            </>
          }>
          <div className="space-y-3">
            {filteredAlerts.length ? filteredAlerts.map((a: ComplianceAlert) => {
              const v = store.vehicles.find((x) => x.id === a.vehicleId);
              return (
                <div key={a.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge text={a.severity} variant={statusVariantMap.severity[a.severity]} />
                      <span className="font-semibold text-sm">{a.type}</span>
                      <span className="text-xs text-muted-foreground">· {a.status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Vehicle: {v?.name} ({v?.plate})</span>
                    <button className="text-primary font-medium hover:underline ml-auto">Acknowledge</button>
                  </div>
                </div>
              );
            }) : <EmptyRow colSpan={1} message="No open compliance alerts — everything is up to date." />}
          </div>
        </SectionCard>
      )}

      {tab === 'documents' && (
        <div className="space-y-6">
          <SectionCard title="Expiring Documents" subtitle="Documents and licenses within 60 days of expiry">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Vehicle', 'Document', 'Ref', 'Expires', 'Days Left', 'Status'].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {expiringDocs.length ? expiringDocs.map((d) => {
                    const v = store.vehicles.find((x) => x.id === d.vehicleId);
                    const delta = daysUntil(d.expiryDate);
                    return (
                      <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-3 font-medium">{v?.name} <span className="font-mono text-xs">({v?.plate})</span></td>
                        <td className="px-3 py-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-muted-foreground" />{d.type}</td>
                        <td className="px-3 py-3 font-mono text-xs">{d.referenceNo}</td>
                        <td className="px-3 py-3 text-muted-foreground">{formatDate(d.expiryDate)}</td>
                        <td className="px-3 py-3"><Badge text={delta < 0 ? `${Math.abs(delta)}d past` : `${delta}d`} variant={delta < 0 ? 'destructive' : delta <= 20 ? 'warning' : 'success'} /></td>
                        <td className="px-3 py-3"><Badge text={d.status} variant={docVariant(d.status)} /></td>
                      </tr>
                    );
                  }) : <EmptyRow colSpan={6} message="No expiring documents." />}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Insurance Policies" subtitle="Coverage status and premiums">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  {['Vehicle', 'Provider', 'Policy No', 'Type', 'Premium', 'Expiry', 'Cover', 'Status'].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {store.insurance.map((i) => {
                    const v = store.vehicles.find((x) => x.id === i.vehicleId);
                    return (
                      <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-3 font-medium">{v?.name} <span className="font-mono text-xs">({v?.plate})</span></td>
                        <td className="px-3 py-3">{i.provider}</td>
                        <td className="px-3 py-3 font-mono text-xs">{i.policyNo}</td>
                        <td className="px-3 py-3">{i.type}</td>
                        <td className="px-3 py-3">{formatCurrency(i.premium)}</td>
                        <td className="px-3 py-3 text-muted-foreground">{formatDate(i.expiryDate)}</td>
                        <td className="px-3 py-3 text-muted-foreground">{formatCurrency(i.coverAmount)}</td>
                        <td className="px-3 py-3"><Badge text={i.status} variant={insVariant(i.status)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}