import { useState } from 'react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';
import { Industry, CompanySize, LeadSource } from '@/modules/crm/types';

const SOURCES = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Partner', 'Inbound Email', 'Advertisement'];
const INDUSTRIES = ['Retail', 'Telecom', 'Banking', 'Logistics', 'Agriculture', 'Manufacturing', 'Healthcare', 'Construction', 'Technology', 'Hospitality', 'Energy', 'Government'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const empty = { name: '', email: '', phone: '', companyName: '', industry: 'Retail', companySize: '11-50', source: 'Website', needs: '', urgency: 5, engagement: 50, value: 100000 };

export default function AddLeadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useCrmStore();
  const [form, setForm] = useState(empty);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.companyName.trim()) {
      toast.error('Name, email and company are required');
      return;
    }
    store.addLead({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone,
      companyName: form.companyName.trim(),
      industry: form.industry as Industry,
      companySize: form.companySize as CompanySize,
      source: form.source as LeadSource,
      status: 'New',
      rating: 'Cold',
      value: form.value,
      budgetRange: form.value > 500000 ? '250K-1M' : '50K-250K',
      decisionRole: pickDecision(form.companyName),
      needs: form.needs,
      urgency: form.urgency,
      engagement: form.engagement,
      assignedTo: 'rep-1',
      lastContact: '',
      notes: '',
    });
    toast.success('Lead added');
    setForm(empty);
    onClose();
  };

  const set = (k: keyof typeof empty, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border shadow-elevated max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Add Lead</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Score is computed from qualified attributes.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Contact Name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Email *</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Company *</label>
              <input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Industry</label>
              <select value={form.industry} onChange={(e) => set('industry', e.target.value)} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm">
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Size</label>
              <select value={form.companySize} onChange={(e) => set('companySize', e.target.value)} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm">
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Source</label>
              <select value={form.source} onChange={(e) => set('source', e.target.value)} className="w-full px-2 py-2 rounded-lg border border-input bg-white text-sm">
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Needs</label>
            <input value={form.needs} onChange={(e) => set('needs', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" placeholder="e.g. Fleet telematics" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Value (KES)</label>
              <input type="number" value={form.value} onChange={(e) => set('value', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Urgency (0-10)</label>
              <input type="number" min={0} max={10} value={form.urgency} onChange={(e) => set('urgency', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Engagement (0-100)</label>
              <input type="number" min={0} max={100} value={form.engagement} onChange={(e) => set('engagement', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Add Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function pickDecision(company: string) {
  const roles = ['Owner', 'CFO', 'Procurement', 'COO', 'CTO'];
  return roles[company.length % roles.length];
}