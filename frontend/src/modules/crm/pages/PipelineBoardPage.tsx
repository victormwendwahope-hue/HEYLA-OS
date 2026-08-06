import { useEffect, useMemo } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Target, TrendingUp, Trophy, Gauge } from 'lucide-react';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { Badge, Avatar } from '@/modules/crm/components/Common';
import { formatMoney, formatDateShort } from '@/modules/crm/utils/format';

const STAGES = ['New Lead', 'Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Review', 'Contract Sent', 'Contracted', 'Onboarding'];

const STAGE_COLOR: Record<string, string> = {
  'New Lead': 'bg-slate-500', Qualified: 'bg-info', Meeting: 'bg-primary',
  Proposal: 'bg-indigo-500', Negotiation: 'bg-warning', Review: 'bg-purple-500',
  'Contract Sent': 'bg-cyan-500', Contracted: 'bg-teal-500', Onboarding: 'bg-success',
};

export default function PipelineBoardPage() {
  const store = useCrmStore();
  useEffect(() => { store.init(); }, []);

  const opps = useMemo(() => store.opportunities.filter((o) => o.status === 'Open'), [store.opportunities]);
  const companies = store.companies;
  const reps = store.reps;

  const stats = useMemo(() => {
    const won = store.opportunities.filter((o) => o.isClosedWon);
    const committed = opps.filter((o) => o.probability >= 70).reduce((s, o) => s + o.value, 0);
    return {
      open: opps.length,
      value: opps.reduce((s, o) => s + o.value, 0),
      committed,
      won: won.reduce((s, o) => s + o.value, 0),
    };
  }, [opps, store.opportunities]);

  const companyName = (id: string) => companies.find((c) => c.id === id)?.shortName || '—';
  const repName = (id: string) => reps.find((r) => r.id === id)?.name || '—';

  const move = (id: string, dir: 1 | -1) => {
    const o = store.opportunities.find((x) => x.id === id);
    if (!o) return;
    const i = STAGES.indexOf(o.stage);
    let next = i + dir;
    if (next < 0) next = 0;
    if (next >= STAGES.length) {
      // Won / Lost handled in board columns header separately
      return;
    }
    store.moveStage(id, STAGES[next] as never);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Pipeline Board" description="Drag-free kanban — click arrows to advance deals">
        <div className="text-xs text-muted-foreground">Committed = Probability ≥ 70%</div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Deals" value={String(stats.open)} icon={Target} iconColor="bg-primary/10" />
        <StatCard title="Pipeline Value" value={formatMoney(stats.value)} icon={TrendingUp} iconColor="bg-success/10" />
        <StatCard title="Committed" value={formatMoney(stats.committed)} icon={Gauge} iconColor="bg-warning/10" />
        <StatCard title="Closed / Won" value={formatMoney(stats.won)} icon={Trophy} iconColor="bg-warning/10" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const column = opps.filter((o) => o.stage === stage);
          const total = column.reduce((s, o) => s + o.value, 0);
          return (
            <div key={stage} className="min-w-[260px] flex-1 glass rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${STAGE_COLOR[stage]}`} />
                  <span className="text-sm font-semibold">{stage}</span>
                  <span className="text-xs text-muted-foreground">{column.length}</span>
                </div>
                <span className="text-xs font-medium tabular-nums">{formatMoney(total)}</span>
              </div>
              <div className="space-y-2">
                {column.slice(0, 12).map((o) => (
                  <div key={o.id} className="border border-border rounded-lg p-3 bg-background hover:shadow-elevated transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{o.title}</p>
                      <span className="text-xs font-semibold tabular-nums">{o.probability}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{companyName(o.companyId)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={repName(o.ownerId)} size="sm" />
                        <span className="text-xs text-muted-foreground">{repName(o.ownerId)}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums">{formatMoney(o.value)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">Close {formatDateShort(o.expectedCloseDate)}</span>
                      <div className="flex gap-1">
                        <button onClick={() => move(o.id, -1)} className="w-6 h-6 rounded border border-border text-xs hover:bg-muted">‹</button>
                        <button onClick={() => move(o.id, 1)} className="w-6 h-6 rounded border border-border text-xs hover:bg-muted">›</button>
                      </div>
                    </div>
                  </div>
                ))}
                {column.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Empty</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}