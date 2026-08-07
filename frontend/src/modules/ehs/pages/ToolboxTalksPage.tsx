import { useEffect } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { Plus, MessageSquare, Users, Clock } from 'lucide-react';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SectionCard, Badge, Avatar } from '@/modules/ehs/components/Common';
import AddToolboxTalkDialog from '@/modules/ehs/components/AddToolboxTalkDialog';
import { formatDate } from '@/modules/ehs/utils/format';
import { useState } from 'react';

export default function ToolboxTalksPage() {
  const store = useEhsStore();
  useEffect(() => { store.init(); }, []);
  const [open, setOpen] = useState(false);

  const talks = store.toolboxTalks;
  const total = talks.reduce((s, t) => s + t.attendees, 0);
  const avgMins = talks.length ? Math.round(talks.reduce((s, t) => s + t.durationMins, 0) / talks.length) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Toolbox Talks" description="Pre-task safety briefings" actions={
        <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Log Talk</button>
      } />

      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div><p className="text-xs text-muted-foreground">Talks</p><p className="text-lg font-bold">{talks.length}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Users />
          <div><p className="text-xs text-muted-foreground">Attendees</p><p className="text-lg font-bold">{total}</p></div>
        </div>
        <div className="glass rounded-xl px-5 py-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-warning" />
          <div><p className="text-xs text-muted-foreground">Avg Duration</p><p className="text-lg font-bold">{avgMins}m</p></div>
        </div>
      </div>

      <SectionCard title="Recent Toolbox Talks" subtitle={`${talks.length} briefings`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talks.map((t) => (
            <div key={t.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{t.topic}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.reference} · {t.site}</p>
                </div>
                <Badge text={`${t.durationMins}m`} variant="info" />
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Avatar name={t.leader} size="sm" />{t.leader}</span>
                <span>{t.attendees} attendees · {formatDate(t.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <AddToolboxTalkDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}