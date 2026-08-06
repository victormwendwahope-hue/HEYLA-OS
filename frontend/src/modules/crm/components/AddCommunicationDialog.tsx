import { useState } from 'react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';

export default function AddCommunicationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useCrmStore();
  const [form, setForm] = useState({ companyId: '', channel: 'email', direction: 'outbound', subject: '', body: '' });

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyId || !form.subject.trim()) {
      toast.error('Company and subject are required');
      return;
    }
    store.addCommunication({
      companyId: form.companyId,
      channel: form.channel,
      direction: form.direction,
      status: 'Sent',
      type: 'email',
      subject: form.subject.trim(),
      body: form.body,
      fromName: form.direction === 'outbound' ? 'HEYLAOS Sales' : '',
      toName: form.direction === 'inbound' ? 'HEYLAOS Sales' : '',
      ownerId: 'rep-1',
      attachments: [],
      hashtags: [],
      threadId: `thr-${Date.now()}`,
      isScheduled: false,
    });
    toast.success('Message logged');
    setForm({ companyId: '', channel: 'email', direction: 'outbound', subject: '', body: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Log Communication</h3>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Company *</label>
            <select value={form.companyId} onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm" required>
              <option value="">Select account...</option>
              {store.companies.slice(0, 300).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Channel</label>
              <select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm">
                {['email', 'phone', 'whatsapp', 'meeting', 'sms', 'linkedin'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Direction</label>
              <select value={form.direction} onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm">
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Subject *</label>
            <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Body / Notes</label>
            <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Log Message</button>
          </div>
        </form>
      </div>
    </div>
  );
}