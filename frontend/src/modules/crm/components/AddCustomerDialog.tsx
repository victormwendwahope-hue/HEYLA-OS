import { useState } from 'react';
import { toast } from 'sonner';
import { useCrmStore } from '@/modules/crm/store/crmStore';

const INDUSTRIES = ['Retail', 'Telecom', 'Banking', 'Logistics', 'Agriculture', 'Manufacturing', 'Healthcare', 'Construction', 'Technology', 'Hospitality', 'Energy', 'Government'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const STATUSES = ['Lead', 'Prospect', 'Active', 'VIP', 'Dormant'];

const empty = {
  name: '', industry: 'Technology', size: '11-50', status: 'Lead' as const,
  email: '', phone: '', website: '', address: '', city: '', country: 'Kenya',
  annualRevenue: 500000, employees: 10, ownerId: 'rep-1',
};

export default function AddCustomerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useCrmStore();
  const [form, setForm] = useState(empty);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    store.addCompany({
      name: form.name.trim(),
      industry: form.industry,
      size: form.size,
      status: form.status,
      email: form.email,
      phone: form.phone,
      website: form.website,
      address: form.address,
      city: form.city,
      country: form.country,
      annualRevenue: form.annualRevenue,
      employees: form.employees,
      ownerId: form.ownerId,
    });
    toast.success('Customer created');
    setForm(empty);
    onClose();
  };

  const set = (k: keyof typeof empty, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4 pt-10" onClick={onClose}>
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-elevated max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">Add Customer</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Create a new account. Health starts neutral.</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Account Name *</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Safaricom" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Industry</label>
              <select value={form.industry} onChange={(e) => set('industry', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm">
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Company Size</label>
              <select value={form.size} onChange={(e) => set('size', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-white text-sm">
                {SIZES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" required />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">City</label>
              <input value={form.city} onChange={(e) => set('city', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Website</label>
              <input value={form.website} onChange={(e) => set('website', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Annual Revenue (KES)</label>
              <input type="number" value={form.annualRevenue} onChange={(e) => set('annualRevenue', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Employees</label>
              <input type="number" value={form.employees} onChange={(e) => set('employees', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">Create Customer</button>
          </div>
        </form>
      </div>
    </div>
  );
}