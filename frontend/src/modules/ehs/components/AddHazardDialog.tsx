import { useState } from 'react';
import { toast } from 'sonner';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SITES, NAMES } from '@/modules/ehs/data/mockData';

const CATS = ['Physical', 'Chemical', 'Biological', 'Ergonomic', 'Electrical', 'Mechanical', 'Fire & Explosion', 'Environmental', 'Psychosocial', 'Traffic & Transport', 'Working at Height', 'Confined Space', 'Excavation', 'Lifting Operations'];

const empty = {
  title: '',
  category: 'Physical',
  location: SITES[0],
  source: 'Operations',
  likelyHarm: '',
  controls: '',
  likelihood: 3 as 1 | 2 | 3 | 4 | 5,
  severity: 3 as 1 | 2 | 3 | 4 | 5,
  status: 'Open' as 'Open' | 'Mitigating' | 'Closed',
  ownerId: 'emp-1',
};

export default function AddHazardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useEhsStore();
  const [form, setForm] = useState(empty);
  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Hazard title is required');
      return;
    }
    store.addHazard(form);
    toast.success('Hazard registered');
    setForm(empty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Register Hazard</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Add to the workplace hazard register.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Hazard Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" placeholder="e.g. Unguarded hydraulic press" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Location</label>
              <select value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {SITES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Likelihood (1–5)</label>
              <select value={form.likelihood} onChange={(e) => setForm((f) => ({ ...f, likelihood: Number(e.target.value) as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} — {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][n - 1]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Severity (1–5)</label>
              <select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: Number(e.target.value) as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ({['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'][n - 1]})</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Likely Harm</label>
            <input value={form.likelyHarm} onChange={(e) => setForm((f) => ({ ...f, likelyHarm: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" placeholder="e.g. Crush / amputation" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Existing / Planned Controls</label>
            <input value={form.controls} onChange={(e) => setForm((f) => ({ ...f, controls: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" placeholder="e.g. Guard fitted, LOTO procedure" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Register Hazard</button>
          </div>
        </form>
      </div>
    </div>
  );
}