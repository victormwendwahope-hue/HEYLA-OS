import { useState } from 'react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';

const ACTIONS = ['Send Email', 'Assign', 'Create Task', 'Send SMS', 'Notify Team', 'Change Stage'];

export default function AddAutomationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useCrmStore();
  const [form, setForm] = useState({ name: '', description: '', triggerField: '', triggerCondition: '>', triggerValue: '', actionType: 'Notify Team', actionPayload: '' });

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.triggerField.trim()) {
      toast.error('Rule name and trigger are required');
      return;
    }
    store.addRule({
      name: form.name.trim(),
      description: form.description,
      trigger: form.triggerField,
      triggerField: form.triggerField,
      triggerCondition: form.triggerCondition,
      triggerValue: form.triggerValue,
      actionType: form.actionType,
      actionPayload: form.actionPayload,
      enabled: true,
      lastRunAt: '',
      ownerId: 'rep-4',
    });
    toast.success('Rule created');
    setForm({ name: '', description: '', triggerField: '', triggerCondition: '>', triggerValue: '', actionType: 'Notify Team', actionPayload: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">New Automation Rule</h3>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Rule Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Trigger Field</label>
              <select value={form.triggerField} onChange={(e) => setForm((f) => ({ ...f, triggerField: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm">
                <option value="">Select...</option>
                <option value="lead.score">lead.score</option>
                <option value="lead.status">lead.status</option>
                <option value="opp.lastActivity">opp.lastActivity</option>
                <option value="quote.validUntil">quote.validUntil</option>
                <option value="ticket.slaBreached">ticket.slaBreached</option>
                <option value="contract.endDate">contract.endDate</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Condition</label>
              <select value={form.triggerCondition} onChange={(e) => setForm((f) => ({ ...f, triggerCondition: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm">
                {['>', '<', '=', 'older_than', 'soon'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Value</label>
              <input value={form.triggerValue} onChange={(e) => setForm((f) => ({ ...f, triggerValue: e.target.value }))} className="w-full px-2 py-2 rounded-lg border border-border text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Action</label>
              <select value={form.actionType} onChange={(e) => setForm((f) => ({ ...f, actionType: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm">
                {ACTIONS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Payload</label>
              <input value={form.actionPayload} onChange={(e) => setForm((f) => ({ ...f, actionPayload: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="e.g. #leads or rep-2" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Create Rule</button>
          </div>
        </form>
      </div>
    </div>
  );
}