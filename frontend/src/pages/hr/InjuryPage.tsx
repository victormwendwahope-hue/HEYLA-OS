import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { useInjuryStore, type Injury } from '@/store/injuryStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { HeartPulse, AlertTriangle, Clock, CheckCircle, Plus, X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const COLORS = ['hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(24, 95%, 53%)', 'hsl(0, 84%, 60%)'];
const typeVariant = (t: string) => ({ Minor: 'success' as const, Moderate: 'warning' as const, Severe: 'destructive' as const, Critical: 'destructive' as const }[t] || 'default' as const);
const statusVariant = (s: string) => ({ Open: 'warning' as const, 'Under Investigation': 'info' as const, Resolved: 'success' as const, Closed: 'default' as const }[s] || 'default' as const);

export default function InjuryPage() {
  const { injuries, loading, fetchInjuries, addInjury, updateInjury, removeInjury } = useInjuryStore();
  const employees = useEmployeeStore((s) => s.employees);
  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ employee: '', department: '', injuryType: 'Minor' as Injury['injuryType'], bodyPart: '', cause: '', location: '', daysLost: 0, correctiveAction: '' });

  useEffect(() => { fetchEmployees(); fetchInjuries(); }, []);

  const totalDaysLost = injuries.reduce((s, i) => s + i.daysLost, 0);
  const byType = [
    { name: 'Minor', value: injuries.filter(i => i.injuryType === 'Minor').length },
    { name: 'Moderate', value: injuries.filter(i => i.injuryType === 'Moderate').length },
    { name: 'Severe', value: injuries.filter(i => i.injuryType === 'Severe').length },
    { name: 'Critical', value: injuries.filter(i => i.injuryType === 'Critical').length },
  ];
  const byDept: Record<string, number> = {};
  injuries.forEach(i => { byDept[i.department] = (byDept[i.department] || 0) + 1; });
  const deptData = Object.entries(byDept).map(([dept, count]) => ({ dept, count }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.cause) { toast.error('Employee and cause required'); return; }
    addInjury(form);
    setShowForm(false);
    setForm({ employee: '', department: '', injuryType: 'Minor', bodyPart: '', cause: '', location: '', daysLost: 0, correctiveAction: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Injury Management" description="Track workplace injuries, investigate incidents, and manage corrective actions">
        <button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Report Injury
        </button>
      </PageHeader>

      {loading && <div className="flex items-center justify-center py-4 text-muted-foreground">Loading...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Incidents" value={String(injuries.length)} change="This year" changeType="neutral" icon={HeartPulse} iconColor="gradient-primary" />
        <StatCard title="Days Lost" value={String(totalDaysLost)} change="Total work days" changeType="negative" icon={Clock} />
        <StatCard title="Open Cases" value={String(injuries.filter(i => i.status === 'Open' || i.status === 'Under Investigation').length)} change="Require attention" changeType="negative" icon={AlertTriangle} />
        <StatCard title="Resolved" value={String(injuries.filter(i => i.status === 'Resolved' || i.status === 'Closed').length)} change="Closed cases" changeType="positive" icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Incidents by Severity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byType.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {byType.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Incidents by Department</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="dept" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        {injuries.map(inj => (
          <div key={inj.id} className="glass rounded-xl overflow-hidden">
            <div className="p-5 cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => setExpanded(expanded === inj.id ? null : inj.id)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inj.injuryType === 'Minor' ? 'bg-success/10' : inj.injuryType === 'Moderate' ? 'bg-warning/10' : 'bg-destructive/10'}`}>
                    <HeartPulse className={`w-5 h-5 ${inj.injuryType === 'Minor' ? 'text-success' : inj.injuryType === 'Moderate' ? 'text-warning' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{inj.employee}</p>
                    <p className="text-xs text-muted-foreground">{inj.department} · {inj.date} · {inj.bodyPart}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={inj.injuryType} variant={typeVariant(inj.injuryType)} />
                  <StatusBadge status={inj.status} variant={statusVariant(inj.status)} />
                  <span className="text-xs text-muted-foreground">{inj.daysLost}d lost</span>
                </div>
              </div>
            </div>
            {expanded === inj.id && (
              <div className="border-t border-border p-5 bg-muted/5 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-muted-foreground">Cause:</span> <span className="font-medium">{inj.cause}</span></div>
                  <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{inj.location}</span></div>
                  <div><span className="text-muted-foreground">Reported by:</span> <span className="font-medium">{inj.reportedBy}</span></div>
                  <div><span className="text-muted-foreground">Days lost:</span> <span className="font-medium">{inj.daysLost}</span></div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Corrective Action</p>
                  <p>{inj.correctiveAction}</p>
                </div>
                <div className="flex items-center gap-2">
                  {inj.status === 'Open' && (
                    <button onClick={() => updateInjury(inj.id, { status: 'Under Investigation' })} className="text-sm text-primary font-medium hover:underline">Start Investigation →</button>
                  )}
                  {inj.status === 'Under Investigation' && (
                    <button onClick={() => updateInjury(inj.id, { status: 'Resolved' })} className="text-sm text-success font-medium hover:underline">Mark Resolved →</button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-sm text-destructive font-medium hover:underline ml-auto">Delete</button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Injury Record</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete this injury record for {inj.employee}? This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeInjury(inj.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
              <h2 className="text-lg font-bold">Report Workplace Injury</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Employee*</label>
                  <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option value="">Select employee</option>
                    {employees.map(emp => <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>{emp.firstName} {emp.lastName}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    <option value="">Select department</option>
                    {[...new Set(employees.map(e => e.department).filter(Boolean))].map(d => <option key={d} value={d}>{d}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Severity</label>
                  <select value={form.injuryType} onChange={e => setForm({ ...form, injuryType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Minor', 'Moderate', 'Severe', 'Critical'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Body Part</label>
                  <input value={form.bodyPart} onChange={e => setForm({ ...form, bodyPart: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Cause*</label>
                <input value={form.cause} onChange={e => setForm({ ...form, cause: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Days Lost</label>
                  <input type="number" value={form.daysLost || ''} onChange={e => setForm({ ...form, daysLost: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Corrective Action</label>
                <textarea value={form.correctiveAction} onChange={e => setForm({ ...form, correctiveAction: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Report Injury</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
