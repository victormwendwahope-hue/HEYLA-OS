import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Plus, Target, Flame, ChevronRight, Users, TrendingUp } from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, LeadScoreBadge, Avatar, FilterSelect, SearchInput, EmptyRow } from '@/modules/crm/components/Common';
import AddLeadDialog from '@/modules/crm/components/AddLeadDialog';
import { formatMoney } from '@/modules/crm/utils/format';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  New: 'info', Contacted: 'warning', Qualified: 'success', Disqualified: 'destructive',
};

export default function LeadsPage() {
  const store = useCrmStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [band, setBand] = useState('');

  const leads = store.leads;
  const reps = store.reps;

  const stats = useMemo(() => {
    const qualified = leads.filter((l) => l.status === 'Qualified');
    const pipeline = leads.filter((l) => ['New', 'Contacted'].includes(l.status)).reduce((s, l) => s + l.value, 0);
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === 'New').length,
      qualified: qualified.length,
      hot: leads.filter((l) => l.scoreColor === 'green').length,
      pipeline,
    };
  }, [leads]);

  const filtered = leads.filter((l) => {
    if (status && l.status !== status) return false;
    if (source && l.source !== source) return false;
    if (band && l.scoreColor !== band) return false;
    if (search) {
      const q = search.toLowerCase();
      return [l.name, l.companyName, l.email, l.ref].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const repName = (id: string) => reps.find((r) => r.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Leads" description="Track, score and qualify inbound opportunities">
        <button onClick={() => setAddOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={String(stats.total)} change={`${stats.new} new this period`} icon={Users} iconColor="bg-primary/10" />
        <StatCard title="Qualified" value={String(stats.qualified)} change="Ready for pipeline" icon={Target} iconColor="bg-success/10" />
        <StatCard title="Hot Leads" value={String(stats.hot)} change="Score ≥ 80" icon={Flame} iconColor="bg-destructive/10" />
        <StatCard title="Open Value" value={formatMoney(stats.pipeline)} change="New + contacted" icon={TrendingUp} iconColor="bg-warning/10" />
      </div>

      <SectionCard title="Lead List" subtitle="Score, source and assignment" className="overflow-visible">
        <div className="flex flex-wrap gap-2 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, company, email..." />
          <FilterSelect value={status} onChange={setStatus} label="Status" options={['New', 'Contacted', 'Qualified', 'Disqualified'].map((s) => ({ value: s, label: s }))} />
          <FilterSelect value={source} onChange={setSource} label="Source" options={['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Partner', 'Inbound Email', 'Advertisement'].map((s) => ({ value: s, label: s }))} />
          <FilterSelect value={band} onChange={setBand} label="Score" options={[{ value: 'green', label: 'Hot (80+)' }, { value: 'yellow', label: 'Warm (60-79)' }, { value: 'orange', label: 'Cool (40-59)' }, { value: 'red', label: 'Cold (<40)' }]} />
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2.5 pr-3 font-medium">Lead</th>
                <th className="py-2.5 pr-3 font-medium">Score</th>
                <th className="py-2.5 pr-3 font-medium">Status</th>
                <th className="py-2.5 pr-3 font-medium">Source</th>
                <th className="py-2.5 pr-3 font-medium">Assigned To</th>
                <th className="py-2.5 pr-3 font-medium text-right">Value</th>
                <th className="py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map((l) => (
                <tr key={l.id} onClick={() => navigate({ to: '/crm/leads/$id', params: { id: l.id } })} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.name} />
                      <div>
                        <p className="font-medium">{l.name}</p>
                        <p className="text-xs text-muted-foreground">{l.companyName} · {l.ref}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3"><LeadScoreBadge score={l.score} color={l.scoreColor} /></td>
                  <td className="py-3 pr-3"><Badge text={l.status} variant={statusVariant[l.status] || 'default'} /></td>
                  <td className="py-3 pr-3 text-muted-foreground">{l.source}</td>
                  <td className="py-3 pr-3">{repName(l.assignedTo)}</td>
                  <td className="py-3 pr-3 text-right font-medium tabular-nums">{formatMoney(l.value)}</td>
                  <td className="py-3 text-right"><ChevronRight className="w-4 h-4 inline text-muted-foreground" /></td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow colSpan={7} message="No leads match your filters." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddLeadDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}