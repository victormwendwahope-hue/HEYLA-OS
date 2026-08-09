import { useState } from 'react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { iso } from '@/modules/crm/utils/format';

const STAGES = ['New Lead', 'Qualified', 'Meeting', 'Proposal', 'Negotiation', 'Review', 'Contract Sent', 'Contracted', 'Onboarding'];

const empty = { companyId: '', title: '', stage: 'New Lead' as const, value: 500000, currency: 'KES', expectedCloseDate: iso(new Date(Date.now() + 40 * 86400000)), priority: 'Medium' as const };

export default function AddOpportunityDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useCrmStore();
  const [form, setForm] = useState(empty);
  if (!open) return null;

  const companies = store.companies;
  const probs: Record<string, number> = { 'New Lead': 10, 'Qualified': 20, 'Meeting': 30, 'Proposal': 45, 'Negotiation': 60, 'Review': 70, 'Contract Sent': 80, 'Contracted': 85, 'Onboarding': 90 };

const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyId || !form.title.trim()) {
      toast.error('Company and deal title are required');
      return;
    }
    store.addOpportunity({
      companyId: form.companyId,
      leadId: '',
      title: form.title.trim(),
      stage: form.stage,
      status: 'Open',
      value: form.value,
      currency: form.currency,
      probability: probs[form.stage],
      ownerId: 'rep-1',
      expectedCloseDate: form.expectedCloseDate,
      forecastMonth: '2026-03',
      forecastable: true,
      amountTotal: 0,
      isClosedWon: false,
      priority: form.priority,
      reason: '',
      activities: [],
      comments: '',
    });
    toast.success('Opportunity added');
    setForm(empty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Add Opportunity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">New deal enters the pipeline.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Company *</label>
            <select value={form.companyId} onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm" required>
              <option value="">Select account...</option>
              {companies.slice(0, 300).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Deal Title *</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Stage</label>
              <select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm">
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Value (KES)</label>
              <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} className="w-full px-2 py-2 rounded-lg border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as never }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm">
                {['Low', 'Medium', 'High', 'Critical'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Expected Close</label>
            <input type="date" value={form.expectedCloseDate} onChange={(e) => setForm((f) => ({ ...f, expectedCloseDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Add Opportunity</button>
          </div>
        </form>
      </div>
    </div>
  );
}