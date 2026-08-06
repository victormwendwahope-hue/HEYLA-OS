import { useEffect, useState } from 'react';
import { PageHeader, StatCard } from '@/components/shared/CommonUI';
import { Plus, Zap, Play, MousePointerClick, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { SectionCard, Badge } from '@/modules/crm/components/Common';
import AddAutomationDialog from '@/modules/crm/components/AddAutomationDialog';
import { timeAgo } from '@/modules/crm/utils/format';

const actionVariant: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  'Send Email': 'info', Assign: 'success', 'Create Task': 'warning', 'Send SMS': 'default', 'Notify Team': 'destructive', 'Change Stage': 'warning',
};

export default function AutomationsPage() {
  const store = useCrmStore();
  useEffect(() => { store.init(); }, []);

  const [addOpen, setAddOpen] = useState(false);
  const rules = store.automationRules;

  const enabled = rules.filter((r) => r.enabled).length;
  const totalRuns = rules.reduce((s, r) => s + r.runCount, 0);
  const todayRuns = rules.reduce((s, r) => s + r.runsToday, 0);

  const run = (id: string) => { store.acknowledgeRule(id); toast.success('Rule executed'); };

  return (
    <div className="space-y-6">
      <PageHeader title="Automations" description="Rules that fire on CRM events">
        <button onClick={() => setAddOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Rules" value={String(enabled)} change={`of ${rules.length} total`} icon={Zap} iconColor="bg-primary/10" />
        <StatCard title="Total Runs" value={String(totalRuns)} icon={Play} iconColor="bg-success/10" />
        <StatCard title="Runs Today" value={String(todayRuns)} icon={MousePointerClick} iconColor="bg-warning/10" />
        <StatCard title="Disabled" value={String(rules.length - enabled)} icon={AlertCircle} iconColor="bg-muted/40" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((r) => (
          <SectionCard key={r.id} title={r.name} subtitle={r.description} actions={
            <div className="flex items-center gap-2">
              <Badge text={r.enabled ? 'Active' : 'Disabled'} variant={r.enabled ? 'success' : 'default'} />
              <button onClick={() => run(r.id)} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium flex items-center gap-1"><Play className="w-3 h-3" /> Run</button>
            </div>
          }>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg border border-border p-2.5">
                <p className="text-[11px] text-muted-foreground">Trigger</p>
                <p className="font-medium text-xs mt-0.5">{r.triggerField} {r.triggerCondition} {r.triggerValue}</p>
              </div>
              <div className="rounded-lg border border-border p-2.5">
                <p className="text-[11px] text-muted-foreground">Action</p>
                <p className="mt-1"><Badge text={r.actionType} variant={actionVariant[r.actionType] || 'default'} /></p>
              </div>
              <div className="rounded-lg border border-border p-2.5">
                <p className="text-[11px] text-muted-foreground">Target</p>
                <p className="font-medium text-xs mt-0.5 break-words">{r.actionPayload || '—'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Ran {r.runCount} times · {r.runsToday} today · last {timeAgo(r.lastRunAt)}</span>
              <button
                onClick={() => { store.toggleRule(r.id); toast.success(r.enabled ? 'Rule disabled' : 'Rule enabled'); }}
                className="text-primary hover:underline font-medium"
              >
                {r.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </SectionCard>
        ))}
      </div>

      <AddAutomationDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}