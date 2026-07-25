import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { Shield, Users, DollarSign, FileText, Plus, X, AlertTriangle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/countries';
import { useWibaStore, type WIBAClaim } from '@/store/wibaStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { useEffect, useState } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const statusVariant = (s: string) => {
  const m: Record<string, 'success' | 'warning' | 'info' | 'destructive'> = { Approved: 'success', Pending: 'warning', Processing: 'info', Rejected: 'destructive' };
  return m[s] || 'warning';
};

export default function WIBAPage() {
  const { claims, loading, fetchClaims, addClaim, updateClaim, removeClaim } = useWibaStore();
  const employees = useEmployeeStore((s) => s.employees);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: '', department: '', claimType: 'Medical' as WIBAClaim['claimType'], description: '', amount: 0, dateOfIncident: '', insurerRef: '' });

  useEffect(() => { fetchEmployees(); fetchClaims(); }, []);

  const totalClaimed = claims.reduce((s, c) => s + c.amount, 0);
  const approved = claims.filter(c => c.status === 'Approved');
  const totalApproved = approved.reduce((s, c) => s + c.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.description) { toast.error('Employee and description required'); return; }
    addClaim(form);
    setShowForm(false);
    setForm({ employee: '', department: '', claimType: 'Medical', description: '', amount: 0, dateOfIncident: '', insurerRef: '' });
  };

  const handleProcess = (id: string) => updateClaim(id, { status: 'Processing' });

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="WIBA Claims" description="Work Injury Benefits Act — 2007" icon={Shield} actions={
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> File WIBA Claim</button>
      }>
        <div className="mt-3 flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div><strong>WIBA Compliance:</strong> All workplace injuries must be reported within 24 hours. Claims must be filed with the insurer within 7 days of the incident as per the WIBA 2007 Act.</div>
        </div>
      </PageHeader>

      {loading && <div className="flex items-center justify-center py-4 text-muted-foreground">Loading...</div>}

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Claims" value={claims.length.toString()} icon={FileText} />
        <StatCard title="Total Claimed" value={formatCurrency(totalClaimed)} icon={DollarSign} />
        <StatCard title="Approved Amount" value={formatCurrency(totalApproved)} icon={Shield} />
        <StatCard title="Coverage Rate" value={claims.length ? `${((approved.length / claims.length) * 100).toFixed(0)}%` : '0%'} icon={Users} />
      </div>
      <div className="rounded-xl bg-card border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-muted/50"><th className="text-left p-3 text-sm font-medium">Ref</th><th className="text-left p-3 text-sm font-medium">Employee</th><th className="text-left p-3 text-sm font-medium">Dept</th><th className="text-left p-3 text-sm font-medium">Type</th><th className="text-left p-3 text-sm font-medium">Description</th><th className="text-right p-3 text-sm font-medium">Amount</th><th className="text-left p-3 text-sm font-medium">Incident Date</th><th className="text-left p-3 text-sm font-medium">Status</th><th className="text-left p-3 text-sm font-medium">Action</th></tr></thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 text-xs font-mono">{c.insurerRef}</td>
                <td className="p-3">{c.employee}</td>
                <td className="p-3 text-sm">{c.department}</td>
                <td className="p-3">{c.claimType}</td>
                <td className="p-3 text-sm max-w-xs truncate">{c.description}</td>
                <td className="p-3 text-right font-medium">{formatCurrency(c.amount)}</td>
                <td className="p-3 text-sm">{c.dateOfIncident}</td>
                <td className="p-3"><StatusBadge status={c.status} variant={statusVariant(c.status)} /></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {c.status === 'Pending' && <button onClick={() => handleProcess(c.id)} className="text-xs text-blue-600 hover:underline">Process</button>}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-xs text-destructive hover:underline"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete WIBA Claim</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete this claim? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeClaim(c.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">File WIBA Claim</h2><button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Employee *</label>
                  <select value={form.employee} onChange={(e) => { const emp = employees.find(em => em.id === e.target.value); setForm({ ...form, employee: emp ? `${emp.firstName} ${emp.lastName}` : '', department: emp?.department || '' }); }} className="w-full rounded-lg border p-2.5 text-sm bg-background">
                    <option value="">Select employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-background" /></div>
              </div>
              <select value={form.claimType} onChange={(e) => setForm({ ...form, claimType: e.target.value as any })} className="w-full rounded-lg border p-2.5 text-sm bg-background">
                {['Medical', 'Disability', 'Death', 'Rehabilitation'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description of injury/incident *" className="w-full rounded-lg border p-2.5 text-sm bg-background" rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Amount (KES)</label><input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full rounded-lg border p-2.5 text-sm bg-background" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Date of Incident</label><input type="date" value={form.dateOfIncident} onChange={(e) => setForm({ ...form, dateOfIncident: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-background" /></div>
              </div>
              <button type="submit" className="btn-primary w-full">Submit Claim</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
