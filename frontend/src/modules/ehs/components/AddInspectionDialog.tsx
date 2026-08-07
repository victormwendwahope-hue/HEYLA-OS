import { useState } from 'react';
import { toast } from 'sonner';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SITES, NAMES } from '@/modules/ehs/data/mockData';

const TYPES = ['Daily Site', 'Vehicle', 'Workshop', 'Warehouse', 'Office', 'Environmental', 'Fire Safety', 'Electrical', 'Lifting Equipment', 'Contractor', 'ISO 45001 Audit', 'DOSH Compliance'];
const CHECKLIST = ['PPE worn correctly', 'Housekeeping clear', 'Fire extinguisher charged', 'Emergency exit accessible', 'Guarding in place', 'Electrical cables safe', 'Permit valid', 'Spill kit available'];

const empty = {
  type: 'Daily Site',
  site: SITES[0],
  inspector: NAMES[0],
  date: new Date().toISOString().slice(0, 10),
  status: 'Scheduled' as 'Scheduled' | 'In Progress' | 'Completed',
  result: 'Pass' as 'Pass' | 'Fail' | 'Conditional',
  score: 100,
  checklist: CHECKLIST.map((item) => ({ item, result: 'Pass' as 'Pass' | 'Fail' | 'N/A', comment: '' })),
  signature: '',
};

export default function AddInspectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useEhsStore();
  const [form, setForm] = useState(empty);
  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const fails = form.checklist.filter((c) => c.result === 'Fail').length;
    const passed = form.checklist.filter((c) => c.result === 'Pass').length;
    store.addInspection({
      ...form,
      result: fails === 0 ? 'Pass' : fails <= 1 ? 'Conditional' : 'Fail',
      score: Math.max(20, Math.round((passed / form.checklist.length) * 100)),
    });
    toast.success('Inspection scheduled');
    setForm(empty);
    onClose();
  };

  const setAnswer = (idx: number, result: 'Pass' | 'Fail' | 'N/A') => setForm((f) => ({
    ...f,
    checklist: f.checklist.map((c, i) => (i === idx ? { ...c, result } : c)),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Schedule Inspection</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Plan or record an inspection checklist.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Type</label>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Inspector</label>
              <select value={form.inspector} onChange={(e) => setForm((f) => ({ ...f, inspector: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {NAMES.slice(0, 20).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {['Scheduled', 'In Progress', 'Completed'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block">Checklist</label>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {form.checklist.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2">
                  <span className="text-sm">{c.item}</span>
                  <select value={c.result} onChange={(e) => setAnswer(idx, e.target.value as 'Pass' | 'Fail' | 'N/A')} className="px-2 py-1 rounded-lg border border-input bg-white text-xs dark:bg-zinc-800">
                    <option>Pass</option>
                    <option>Fail</option>
                    <option>N/A</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Save Inspection</button>
          </div>
        </form>
      </div>
    </div>
  );
}