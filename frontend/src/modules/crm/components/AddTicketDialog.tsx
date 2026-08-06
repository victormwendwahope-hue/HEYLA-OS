import { useState } from 'react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { iso, addDays } from '@/modules/crm/utils/format';

export default function AddTicketDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useCrmStore();
  const [form, setForm] = useState({ companyId: '', subject: '', description: '', priority: 'Medium', category: 'Support' });

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyId || !form.subject.trim()) {
      toast.error('Company and subject are required');
      return;
    }
    const dueDays = form.priority === 'Critical' ? 1 : form.priority === 'High' ? 2 : 5;
    store.addTicket({
      companyId: form.companyId,
      contactId: '',
      subject: form.subject.trim(),
      description: form.description,
      status: 'Open',
      priority: form.priority as never,
      category: form.category as never,
      assignedTo: 'rep-1',
      tags: [form.priority],
      slaDue: iso(addDays(new Date(), dueDays)),
      resolvedAt: '',
      satisfaction: 0,
      channel: 'email',
      escalationLevel: 0,
      linkedOrderId: '',
      internalNotes: '',
    });
    toast.success('Ticket created');
    setForm({ companyId: '', subject: '', description: '', priority: 'Medium', category: 'Support' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Create Ticket</h3>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Company *</label>
            <select value={form.companyId} onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm" required>
              <option value="">Select account...</option>
              {store.companies.slice(0, 300).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Subject *</label>
            <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm">
                {['Low', 'Medium', 'High', 'Critical'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm">
                {['Billing', 'Technical', 'Complaint', 'Request', 'Feature', 'Support'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Create Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
}