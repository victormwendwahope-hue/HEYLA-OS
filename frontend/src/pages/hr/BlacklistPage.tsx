import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { useState } from 'react';
import { Plus, X, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlacklistEntry {
  id: string;
  name: string;
  email: string;
  reason: string;
  addedDate: string;
  addedBy: string;
  severity: 'High' | 'Medium' | 'Low';
}

const mockBlacklist: BlacklistEntry[] = [
  { id: '1', name: 'James Maina', email: 'james.m@email.com', reason: 'Falsified employment records and qualifications', addedDate: '2024-01-10', addedBy: 'Njeri Kariuki', severity: 'High' },
  { id: '2', name: 'Lucy Wanjiru', email: 'lucy.w@email.com', reason: 'Gross misconduct - theft of company property', addedDate: '2023-11-20', addedBy: 'Njeri Kariuki', severity: 'High' },
  { id: '3', name: 'David Ongaro', email: 'david.o@email.com', reason: 'Repeated no-show without communication', addedDate: '2024-02-01', addedBy: 'Ochieng Otieno', severity: 'Medium' },
];

export default function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>(mockBlacklist);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', reason: '', severity: 'Medium' as BlacklistEntry['severity'] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.reason) { toast.error('Fill required fields'); return; }
    setEntries((prev) => [...prev, { ...form, id: Date.now().toString(), addedDate: new Date().toISOString().split('T')[0], addedBy: 'John Kamau' }]);
    setShowAdd(false);
    setForm({ name: '', email: '', reason: '', severity: 'Medium' });
    toast.success('Entry added to blacklist');
  };

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success('Removed from blacklist');
  };

  const severityVariant = (s: string) => s === 'High' ? 'destructive' : s === 'Medium' ? 'warning' : 'info';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Blacklist" description="Manage blacklisted individuals">
        <button onClick={() => setShowAdd(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </PageHeader>

      <div className="glass rounded-xl p-4 flex items-center gap-3 border-l-4 border-warning">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
        <p className="text-sm text-muted-foreground">This list contains individuals flagged for serious policy violations. Handle with confidentiality.</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date Added</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Severity</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground max-w-xs truncate">{entry.reason}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{entry.addedDate}<br />by {entry.addedBy}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.severity} variant={severityVariant(entry.severity)} /></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleRemove(entry.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Add to Blacklist</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name*</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason*</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Severity</label>
                <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as BlacklistEntry['severity'] })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['High', 'Medium', 'Low'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
