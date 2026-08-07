import { useState } from 'react';
import { toast } from 'sonner';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { NAMES } from '@/modules/ehs/data/mockData';
import { iso, addDays } from '@/modules/ehs/utils/format';

const SOURCES = ['Investigation', 'Inspection', 'Audit', 'Hazard', 'Incident'];

const empty = {
  title: '',
  description: '',
  source: 'Inspection' as 'Investigation' | 'Inspection' | 'Audit' | 'Hazard' | 'Incident',
  sourceRef: '',
  priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
  status: 'Open' as 'Open' | 'In Progress' | 'Completed' | 'Verified',
  assignedTo: NAMES[0],
  dueDate: iso(addDays(new Date(), 7)),
  completedAt: '',
  verification: '',
};

export default function AddCorrectiveActionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useEhsStore();
  const [form, setForm] = useState(empty);
  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Action title is required');
      return;
    }
    store.addCorrectiveAction(form);
    toast.success('Corrective action raised');
    setForm(empty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Raise Corrective Action</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track CAPA to closure.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Action Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" placeholder="e.g. Install interlock guard" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Source</label>
              <select value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {['Low', 'Medium', 'High', 'Critical'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Assigned To</label>
              <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {NAMES.slice(0, 20).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Raise Action</button>
          </div>
        </form>
      </div>
    </div>
  );
}