import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { Shield, Users, DollarSign, FileText, Plus, X, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/countries';
import { useState } from 'react';
import { toast } from 'sonner';

interface WIBAClaim {
  id: string;
  employee: string;
  department: string;
  claimType: 'Medical' | 'Disability' | 'Death' | 'Rehabilitation';
  description: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing';
  dateOfIncident: string;
  dateFiled: string;
  insurerRef: string;
}

const mockClaims: WIBAClaim[] = [
  { id: '1', employee: 'James Mwangi', department: 'Logistics', claimType: 'Medical', description: 'Workplace injury - back strain from heavy lifting', amount: 85000, status: 'Approved', dateOfIncident: '2024-01-15', dateFiled: '2024-01-18', insurerRef: 'WIBA-2024-001' },
  { id: '2', employee: 'Grace Wanjiku', department: 'Engineering', claimType: 'Medical', description: 'Repetitive strain injury - carpal tunnel', amount: 45000, status: 'Processing', dateOfIncident: '2024-01-28', dateFiled: '2024-02-01', insurerRef: 'WIBA-2024-002' },
  { id: '3', employee: 'Peter Oduor', department: 'Logistics', claimType: 'Disability', description: 'Temporary disability from vehicle accident on duty', amount: 250000, status: 'Pending', dateOfIncident: '2024-02-05', dateFiled: '2024-02-08', insurerRef: 'WIBA-2024-003' },
  { id: '4', employee: 'Alice Kamau', department: 'Manufacturing', claimType: 'Rehabilitation', description: 'Physiotherapy for workplace fall injury', amount: 32000, status: 'Approved', dateOfIncident: '2023-12-10', dateFiled: '2023-12-15', insurerRef: 'WIBA-2024-004' },
];

const statusVariant = (s: string) => {
  const m: Record<string, 'success' | 'warning' | 'info' | 'destructive'> = { Approved: 'success', Pending: 'warning', Processing: 'info', Rejected: 'destructive' };
  return m[s] || 'warning';
};

export default function WIBAPage() {
  const [claims, setClaims] = useState(mockClaims);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: '', department: '', claimType: 'Medical' as WIBAClaim['claimType'], description: '', amount: 0, dateOfIncident: '' });

  const totalClaimed = claims.reduce((s, c) => s + c.amount, 0);
  const approved = claims.filter(c => c.status === 'Approved');
  const totalApproved = approved.reduce((s, c) => s + c.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.description) { toast.error('Employee and description required'); return; }
    setClaims(prev => [...prev, { ...form, id: Date.now().toString(), status: 'Pending', dateFiled: new Date().toISOString().split('T')[0], insurerRef: `WIBA-${Date.now().toString().slice(-7)}` }]);
    setShowForm(false);
    setForm({ employee: '', department: '', claimType: 'Medical', description: '', amount: 0, dateOfIncident: '' });
    toast.success('WIBA claim filed');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="WIBA Benefits" description="Work Injury Benefits Act — manage claims and insurance coverage">
        <button onClick={() => setShowForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> File Claim
        </button>
      </PageHeader>

      <div className="glass rounded-xl p-5 border-l-4 border-info">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-info" /> WIBA Compliance Note</h3>
        <p className="text-sm text-muted-foreground">Under the Work Injury Benefits Act (WIBA) 2007, employers in Kenya are required to compensate employees for work-related injuries, diseases, and death. All employees must be covered regardless of contract type. Employer must report injuries to DOSH within 24 hours.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Claims" value={String(claims.length)} change="This year" changeType="neutral" icon={FileText} />
        <StatCard title="Total Claimed" value={formatCurrency(totalClaimed)} change={`${claims.filter(c => c.status === 'Pending').length} pending`} changeType="neutral" icon={DollarSign} iconColor="gradient-primary" />
        <StatCard title="Approved Amount" value={formatCurrency(totalApproved)} change={`${approved.length} claims`} changeType="positive" icon={Shield} />
        <StatCard title="Coverage Rate" value="100%" change="All employees" changeType="positive" icon={Users} />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h3 className="font-semibold">Claims History</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              {['Ref', 'Employee', 'Dept', 'Type', 'Description', 'Amount', 'Status', 'Incident Date', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{c.insurerRef}</td>
                  <td className="px-4 py-3 font-medium">{c.employee}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.department}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-muted rounded-full text-xs">{c.claimType}</span></td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{c.description}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(c.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} variant={statusVariant(c.status)} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.dateOfIncident}</td>
                  <td className="px-4 py-3">
                    {c.status === 'Pending' && (
                      <button onClick={() => { setClaims(p => p.map(x => x.id === c.id ? { ...x, status: 'Processing' } : x)); toast.success('Claim processing started'); }} className="text-xs text-primary font-medium hover:underline">Process</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">File WIBA Claim</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Employee Name*</label>
                  <input value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
                  <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Claim Type</label>
                  <select value={form.claimType} onChange={e => setForm({ ...form, claimType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Medical', 'Disability', 'Death', 'Rehabilitation'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Incident Date</label>
                  <input type="date" value={form.dateOfIncident} onChange={e => setForm({ ...form, dateOfIncident: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description*</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Claim Amount (KES)</label>
                <input type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: +e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">File Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
