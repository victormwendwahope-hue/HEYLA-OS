import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Plus, ChevronRight, Users, Building2, TrendingUp, HeartPulse } from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, HealthBadge, Avatar, FilterSelect, SearchInput, EmptyRow } from '@/modules/crm/components/Common';
import AddCustomerDialog from '@/modules/crm/components/AddCustomerDialog';
import { formatMoney } from '@/modules/crm/utils/format';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  VIP: 'warning', Active: 'success', Prospect: 'info', Lead: 'default', Dormant: 'default', Blacklisted: 'destructive',
};

export default function CustomersPage() {
  const store = useCrmStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState('');
  const [health, setHealth] = useState('');

  const companies = store.companies;
  const contacts = store.contacts;

  const stats = useMemo(() => {
    const active = companies.filter((c) => ['Active', 'VIP'].includes(c.status));
    const revenue = active.reduce((s, c) => s + c.annualRevenue, 0);
    return {
      total: companies.length,
      active: active.length,
      revenue,
      atRisk: companies.filter((c) => c.healthBand === 'risk').length,
    };
  }, [companies]);

  const filtered = companies.filter((c) => {
    if (industry && c.industry !== industry) return false;
    if (status && c.status !== status) return false;
    if (health && c.healthBand !== health) return false;
    if (search) {
      const q = search.toLowerCase();
      return [c.name, c.city, c.industry, c.email].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const contactCount = (cid: string) => contacts.filter((c) => c.companyId === cid).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description={`${stats.total} accounts across ${companies.filter((c, i, a) => a.findIndex((x) => x.industry === c.industry) === i).length} industries`}>
        <button onClick={() => setAddOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Accounts" value={String(stats.total)} change={`${stats.active} active / VIP`} icon={Users} iconColor="bg-primary/10" />
        <StatCard title="Annual Revenue" value={formatMoney(stats.revenue)} change="Across active accounts" icon={TrendingUp} iconColor="bg-success/10" />
        <StatCard title="At Risk" value={String(stats.atRisk)} change="Health below 50" icon={HeartPulse} iconColor="bg-destructive/10" />
        <StatCard title="Total Contacts" value={String(contacts.length)} change="Linked people" icon={Building2} iconColor="bg-info/10" />
      </div>

      <SectionCard title="Customer Directory" subtitle="Search, filter and open an account" className="overflow-visible">
        <div className="flex flex-wrap gap-2 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, city, industry..." />
          <FilterSelect value={industry} onChange={setIndustry} label="Industry" options={[...new Set(companies.map((c) => c.industry))].map((i) => ({ value: i, label: i }))} />
          <FilterSelect value={status} onChange={setStatus} label="Status" options={['Lead', 'Prospect', 'Active', 'VIP', 'Dormant', 'Blacklisted'].map((s) => ({ value: s, label: s }))} />
          <FilterSelect value={health} onChange={setHealth} label="Health" options={['excellent', 'good', 'attention', 'risk'].map((h) => ({ value: h, label: h.charAt(0).toUpperCase() + h.slice(1) }))} />
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2.5 pr-3 font-medium">Account</th>
                <th className="py-2.5 pr-3 font-medium">Industry</th>
                <th className="py-2.5 pr-3 font-medium">Status</th>
                <th className="py-2.5 pr-3 font-medium">Health</th>
                <th className="py-2.5 pr-3 font-medium">Contacts</th>
                <th className="py-2.5 pr-3 font-medium text-right">Annual Revenue</th>
                <th className="py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 40).map((c) => (
                <tr key={c.id} onClick={() => navigate({ to: '/crm/customers/$id', params: { id: c.id } })} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.city} · {c.size} employees</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3"><Badge text={c.industry} /></td>
                  <td className="py-3 pr-3"><Badge text={c.status} variant={statusVariant[c.status] || 'default'} /></td>
                  <td className="py-3 pr-3"><HealthBadge band={c.healthBand} score={c.healthScore} /></td>
                  <td className="py-3 pr-3">{contactCount(c.id)}</td>
                  <td className="py-3 pr-3 text-right font-medium tabular-nums">{formatMoney(c.annualRevenue)}</td>
                  <td className="py-3 text-right"><ChevronRight className="w-4 h-4 inline text-muted-foreground" /></td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow colSpan={7} message="No customers match your filters." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddCustomerDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}