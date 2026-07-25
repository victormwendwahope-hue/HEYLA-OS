import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { useBlacklistStore, type BlacklistEntry } from '@/store/blacklistStore';
import { useEffect, useState } from 'react';
import { Plus, X, AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function BlacklistPage() {
  const { entries, loading, fetchEntries, addEntry, removeEntry } = useBlacklistStore();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', reason: '', severity: 'Medium' as BlacklistEntry['severity'] });

  useEffect(() => { fetchEntries(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.reason) { toast.error('Fill required fields'); return; }
    addEntry(form);
    setShowAdd(false);
    setForm({ name: '', email: '', reason: '', severity: 'Medium' });
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

      {loading && <div className="flex items-center justify-center py-4 text-muted-foreground">Loading...</div>}

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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from Blacklist</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to remove {entry.name} from the blacklist? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeEntry(entry.id)}>Remove</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
