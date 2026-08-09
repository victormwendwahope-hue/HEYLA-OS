import { useState } from 'react';
import { toast } from 'sonner';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SITES, NAMES } from '@/modules/ehs/data/mockData';
import { iso, addDays } from '@/modules/ehs/utils/format';
import type { PermitType } from '@/modules/ehs/types';

const TYPES = ['Hot Work', 'Confined Space', 'Working at Height', 'Excavation', 'Electrical Isolation', 'Lifting', 'Radiation Work', 'Chemical Handling', 'Environmental Discharge'];
const CONTROLS = ['Isolate energy', 'Gas test', 'Standby person', 'Full PPE'];

const empty = {
  type: 'Hot Work',
  site: SITES[0],
  task: '',
  requester: NAMES[0],
  holder: NAMES[0],
  approver: NAMES[0],
  status: 'Requested' as 'Requested' | 'Risk Review' | 'Approved' | 'Active' | 'Suspended' | 'Closed',
  startAt: iso(new Date()),
  endAt: iso(addDays(new Date(), 1)),
  controls: [...CONTROLS],
  createdById: 'emp-1',
};

export default function AddPermitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useEhsStore();
  const [form, setForm] = useState(empty);
  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.task.trim()) {
      toast.error('Task description is required');
      return;
    }
    store.addPermit({ ...form, type: form.type as PermitType });
    toast.success('Permit request submitted');
    setForm(empty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Request Permit to Work</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Start a permit workflow request.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Permit Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Site</label>
              <select value={form.site} onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {SITES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Task Description *</label>
            <input value={form.task} onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" placeholder="e.g. Welding on roof frame" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Requester</label>
              <select value={form.requester} onChange={(e) => setForm((f) => ({ ...f, requester: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {NAMES.slice(0, 20).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Holder</label>
              <select value={form.holder} onChange={(e) => setForm((f) => ({ ...f, holder: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {NAMES.slice(0, 20).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Approver</label>
              <select value={form.approver} onChange={(e) => setForm((f) => ({ ...f, approver: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {NAMES.slice(0, 20).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Start</label>
              <input type="date" value={form.startAt} onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">End</label>
              <input type="date" value={form.endAt} onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Request Permit</button>
          </div>
        </form>
      </div>
    </div>
  );
}