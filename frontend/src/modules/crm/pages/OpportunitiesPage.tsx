import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Plus, Target, TrendingUp, ChevronRight, Trophy } from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge, Avatar, FilterSelect, SearchInput, EmptyRow, Money } from '@/modules/crm/components/Common';
import AddOpportunityDialog from '@/modules/crm/components/AddOpportunityDialog';
import { formatMoney, formatDate } from '@/modules/crm/utils/format';

const stageVariant = (s: string, won: boolean, lost: boolean): 'success' | 'warning' | 'info' | 'default' | 'destructive' =>
  won ? 'success' : lost ? 'destructive' : 'info';

export default function OpportunitiesPage() {
  const store = useCrmStore();
  const navigate = useNavigate();
  useEffect(() => { store.init(); }, []);

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');

  const opps = store.opportunities;
  const companies = store.companies;
  const reps = store.reps;

  const stats = useMemo(() => {
    const open = opps.filter((o) => o.status === 'Open');
    const won = opps.filter((o) => o.isClosedWon);
    return {
      open: open.length,
      openValue: open.reduce((s, o) => s + o.value, 0),
      won: won.length,
      wonValue: won.reduce((s, o) => s + o.value, 0),
      winRate: opps.length ? Math.round((won.length / opps.length) * 100) : 0,
    };
  }, [opps]);

  const filtered = opps.filter((o) => {
    if (stage && o.stage !== stage) return false;
    if (status && o.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      const company = companies.find((c) => c.id === o.companyId);
      return [o.title, company?.name || ''].join(' ').toLowerCase().includes(q);
    }
    return true;
  });

  const companyName = (id: string) => companies.find((c) => c.id === id)?.shortName || '—';
  const repName = (id: string) => reps.find((r) => r.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <PageHeader title="Opportunities" description="All deals across the pipeline">
        <button onClick={() => setAddOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Opportunity
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Deals" value={String(stats.open)} change="In pipeline" icon={Target} iconColor="bg-primary/10" />
        <StatCard title="Open Value" value={formatMoney(stats.openValue)} change="Potential revenue" icon={TrendingUp} iconColor="bg-success/10" />
        <StatCard title="Closed / Won" value={formatMoney(stats.wonValue)} change={`${stats.won} deals`} icon={Trophy} iconColor="bg-warning/10" />
        <StatCard title="Win Rate" value={`${stats.winRate}%`} change="All opportunities" icon={TrendingUp} iconColor="bg-info/10" />
      </div>

      <SectionCard title="Deal List" className="overflow-visible">
        <div className="flex flex-wrap gap-2 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search deal or company..." />
          <FilterSelect value={stage} onChange={setStage} label="Stage" options={['New Lead', 'Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Review', 'Contract Sent', 'Contracted', 'Onboarding', 'Closed - Won', 'Closed - Lost'].map((s) => ({ value: s, label: s }))} />
          <FilterSelect value={status} onChange={setStatus} label="Status" options={['Open', 'Won', 'Lost'].map((s) => ({ value: s, label: s }))} />
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2.5 pr-3 font-medium">Deal</th>
                <th className="py-2.5 pr-3 font-medium">Company</th>
                <th className="py-2.5 pr-3 font-medium">Stage</th>
                <th className="py-2.5 pr-3 font-medium">Prob.</th>
                <th className="py-2.5 pr-3 font-medium">Owner</th>
                <th className="py-2.5 pr-3 font-medium">Close</th>
                <th className="py-2.5 pr-3 font-medium text-right">Value</th>
                <th className="py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 40).map((o) => (
                <tr key={o.id} onClick={() => navigate({ to: '/crm/pipeline' })} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer">
                  <td className="py-3 pr-3 font-medium">{o.title}</td>
                  <td className="py-3 pr-3">{companyName(o.companyId)}</td>
                  <td className="py-3 pr-3"><Badge text={o.stage} variant={stageVariant(o.stage, o.isClosedWon, o.status === 'Lost')} /></td>
                  <td className="py-3 pr-3 tabular-nums">{o.probability}%</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={repName(o.ownerId)} size="sm" />
                      <span>{repName(o.ownerId)}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 tabular-nums">{formatDate(o.expectedCloseDate)}</td>
                  <td className="py-3 pr-3 text-right font-medium tabular-nums">{formatMoney(o.value)}</td>
                  <td className="py-3 text-right"><ChevronRight className="w-4 h-4 inline text-muted-foreground" /></td>
                </tr>
              ))}
              {filtered.length === 0 && <EmptyRow colSpan={8} message="No opportunities match." />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddOpportunityDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}