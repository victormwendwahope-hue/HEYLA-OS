import { useState } from 'react';
import { toast } from 'sonner';
import { useEhsStore } from '@/modules/ehs/store/ehsStore';
import { SITES, NAMES } from '@/modules/ehs/data/mockData';
import { iso } from '@/modules/ehs/utils/format';

const TYPES = ['Fatality', 'Lost Time Injury', 'Medical Treatment Injury', 'First Aid Case', 'Near Miss', 'Unsafe Condition', 'Unsafe Act', 'Property Damage', 'Vehicle Accident', 'Environmental Spill', 'Fire Incident', 'Security Incident', 'Occupational Illness'];

const empty = {
  type: 'Near Miss',
  severity: 'Medium' as const,
  status: 'Reported' as const,
  site: SITES[0],
  location: '',
  gps: '',
  reportedBy: NAMES[0],
  involved: [''],
  witnesses: [''],
  bodyPart: 'None',
  description: '',
  immediateActions: '',
  environmentalImpact: 'None',
  costImpact: 0,
  wibaApplicable: false,
  doshNotificationRequired: false,
  ownerId: 'emp-1',
};

export default function AddIncidentDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const store = useEhsStore();
  const [form, setForm] = useState(empty);
  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error('A description is required');
      return;
    }
    const id = `inc-${Date.now()}`;
    store.addIncident({ ...form, id, involved: form.involved.filter(Boolean), witnesses: form.witnesses.filter(Boolean) });
    toast.success('Incident reported');
    setForm(empty);
    onCreated(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Report Incident</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record a safety incident or near miss.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Type *</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Severity</label>
              <select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm dark:bg-zinc-800">
                {['Low', 'Medium', 'High', 'Critical'].map((s) => <option key={s}>{s}</option>)}
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
            <label className="text-xs font-medium mb-1 block">Location</label>
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" placeholder="e.g. Loading Bay — Sector A" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Description *</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Immediate Actions Taken</label>
            <input value={form.immediateActions} onChange={(e) => setForm((f) => ({ ...f, immediateActions: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm dark:bg-zinc-800" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Report Incident</button>
          </div>
        </form>
      </div>
    </div>
  );
}