import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Plus, CheckCircle2, Clock3, ShieldX } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar } from '@/modules/ehs/components/Common';
import AddCorrectiveActionDialog from '@/modules/ehs/components/AddCorrectiveActionDialog';
import { formatDate, daysUntil } from '@/modules/ehs/utils/format';

const PRIORITY_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'default' | 'destructive'> = {
  Low: 'default', Medium: 'info', High: 'warning', Critical: 'destructive',
};

const COLUMNS = ['Open', 'In Progress', 'Completed', 'Verified'];

export default function CorrectiveActionsPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);

  const [open, setOpen] = useState(false);
  const actions = store.correctiveActions;

  const overdue = actions.filter((a) => (a.status === 'Open' || a.status === 'In Progress') && daysUntil(a.dueDate) < 0).length;
  const done = actions.filter((a) => a.status === 'Completed' || a.status === 'Verified').length;
  const total = actions.length;

  const move = (id: string, source: string) => {
    const order = ['Open', 'In Progress', 'Completed', 'Verified'];
    const next = order[Math.min(order.indexOf(source) + 1, order.length - 1)];
    store.updateCorrectiveAction(id, { status: next as never });
  };

  const columns = COLUMNS.map((col) => ({
    name: col,
    items: actions
      .filter((a) => a.status === col)
      .sort((a, b) => ({ Low: 0, Medium: 1, High: 2, Critical: 3 }[b.priority] - { Low: 0, Medium: 1, High: 2, Critical: 3 }[a.priority])),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Corrective Actions" description="CAPA tracking to closure" actions={
        <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Raise Action</button>
      } />

      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <ShieldX className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{total}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <div><p className="text-xs text-muted-foreground">Closed</p><p className="text-lg font-bold">{done}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Clock3 className="w-5 h-5 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Overdue</p><p className="text-lg font-bold">{overdue}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <SectionCard key={col.name} title={col.name} subtitle={`${col.items.length} actions`}>
            <div className="space-y-3">
              {col.items.map((a) => (
                <div key={a.id} onClick={() => move(a.id, a.status)} className={`border rounded-lg p-3 cursor-pointer transition hover:bg-muted/30 ${a.status === 'Completed' || a.status === 'Verified' ? 'border-success/30 bg-success/5' : 'border-border'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <Badge text={a.priority} variant={PRIORITY_VARIANT[a.priority]} />
                    <span className="text-xs text-muted-foreground">{a.reference}</span>
                  </div>
                  <p className="font-medium text-sm mt-2">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">Source: {a.source}</p>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><Avatar name={a.assignedTo} size="sm" />{a.assignedTo}</span>
                    <span className={daysUntil(a.dueDate) < 0 && (a.status === 'Open' || a.status === 'In Progress') ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      Due {formatDate(a.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
              {col.items.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No actions.</p>}
            </div>
          </SectionCard>
        ))}
      </div>

      <AddCorrectiveActionDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}