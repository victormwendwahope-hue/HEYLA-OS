import { useState } from 'react';
import { toast } from 'sonner';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SITES, NAMES } from '@/modules/ehs/data/mockData';

const TOPICS = ['Lifting safety', 'Confined space', 'Fire evacuation', 'Hand safety', 'PPE', 'Vehicle movement', 'Working at height'];

const empty = {
  topic: TOPICS[0],
  site: SITES[0],
  leader: NAMES[0],
  date: new Date().toISOString().slice(0, 10),
  attendees: 12,
  topics: [TOPICS[0]],
  durationMins: 15,
};

export default function AddToolboxTalkDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useEhsStore();
  const [form, setForm] = useState(empty);
  const [customTopic, setCustomTopic] = useState('');
  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addToolboxTalk({ ...form, topic: customTopic.trim() || form.topic });
    toast.success('Toolbox talk recorded');
    setForm(empty);
    setCustomTopic('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Log Toolbox Talk</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record a pre-task safety briefing.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Topic</label>
              <select value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
                <option>Other...</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">When Other, Specify</label>
              <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} className="w-full px-2 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Site</label>
              <select value={form.site} onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {SITES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Leader</label>
              <select value={form.leader} onChange={(e) => setForm((f) => ({ ...f, leader: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {NAMES.slice(0, 20).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Attendees</label>
              <input type="number" value={form.attendees} onChange={(e) => setForm((f) => ({ ...f, attendees: Number(e.target.value) }))} className="w-full px-2 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Log Talk</button>
          </div>
        </form>
      </div>
    </div>
  );
}