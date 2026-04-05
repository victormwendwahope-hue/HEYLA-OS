import { useState } from 'react';
import { useLeadStore } from '@/store/leadStore';
import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { Plus, Search, GripVertical, X, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Lead } from '@/types';

const statusOrder = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'] as const;
const statusVariant = (s: string) => {
  const map: Record<string, 'info' | 'warning' | 'success' | 'destructive' | 'default'> = {
    New: 'info', Contacted: 'warning', Qualified: 'default', Proposal: 'warning', Won: 'success', Lost: 'destructive',
  };
  return map[s] || 'default';
};

const emptyForm = { name: '', email: '', phone: '', company: '', status: 'New' as Lead['status'], value: 0, source: '', assignedTo: '', notes: '' };

export default function CRMPage() {
  const { leads, addLead, updateLead } = useLeadStore();
  const [view, setView] = useState<'table' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = leads.filter((l) => `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (lead: Lead) => { setForm({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, status: lead.status, value: lead.value, source: lead.source, assignedTo: lead.assignedTo, notes: lead.notes }); setEditId(lead.id); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.company) { toast.error('Name and company required'); return; }
    if (editId) {
      updateLead(editId, form);
      toast.success('Lead updated');
    } else {
      addLead({ ...form, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] });
      toast.success('Lead added');
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="CRM" description={`${leads.length} leads in pipeline — ${formatCurrency(leads.reduce((s, l) => s + l.value, 0))} total value`}>
        <button onClick={openAdd} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['kanban', 'table'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${view === v ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
          {statusOrder.map((status) => {
            const items = filtered.filter((l) => l.status === status);
            return (
              <div key={status} className="min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <StatusBadge status={status} variant={statusVariant(status)} />
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((l) => (
                    <div key={l.id} onClick={() => openEdit(l)} className="glass rounded-lg p-3 hover:shadow-elevated transition-shadow cursor-pointer">
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{l.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{l.company}</p>
                          <p className="text-xs font-semibold text-primary mt-1">{formatCurrency(l.value)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Lead', 'Company', 'Status', 'Value', 'Source', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.company}</td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} variant={statusVariant(l.status)} /></td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(l.value)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(l)} className="text-primary text-xs font-medium hover:underline flex items-center gap-1">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
              <h2 className="text-lg font-bold">{editId ? 'Edit Lead' : 'Add Lead'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {[
                { label: 'Contact Name*', field: 'name' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Phone', field: 'phone' },
                { label: 'Company*', field: 'company' },
                { label: 'Source', field: 'source' },
                { label: 'Assigned To', field: 'assignedTo' },
              ].map((f) => (
                <div key={f.field}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                  <input type={f.type || 'text'} value={(form as any)[f.field]} onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Value (KES)</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Lead['status'] })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {statusOrder.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">{editId ? 'Update' : 'Add Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
