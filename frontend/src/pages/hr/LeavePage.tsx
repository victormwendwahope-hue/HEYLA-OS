import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { useEmployeeStore } from '@/store/employeeStore';
import { useState } from 'react';
import { Plus, X, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Compassionate' | 'Study';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  days: number;
}

const mockLeaves: LeaveRequest[] = [
  { id: '1', employeeId: '4', type: 'Annual', startDate: '2024-02-10', endDate: '2024-02-17', reason: 'Family vacation', status: 'Approved', days: 5 },
  { id: '2', employeeId: '1', type: 'Sick', startDate: '2024-02-20', endDate: '2024-02-21', reason: 'Medical appointment', status: 'Pending', days: 2 },
  { id: '3', employeeId: '3', type: 'Study', startDate: '2024-03-01', endDate: '2024-03-03', reason: 'CPA exam preparation', status: 'Pending', days: 3 },
  { id: '4', employeeId: '2', type: 'Compassionate', startDate: '2024-01-15', endDate: '2024-01-17', reason: 'Family emergency', status: 'Approved', days: 3 },
];

export default function LeavePage() {
  const employees = useEmployeeStore((s) => s.employees);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: '', type: 'Annual' as LeaveRequest['type'], startDate: '', endDate: '', reason: '' });

  const statusVariant = (s: string) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'destructive' : 'warning';

  const handleApprove = (id: string) => {
    setLeaves((prev) => prev.map((l) => l.id === id ? { ...l, status: 'Approved' as const } : l));
    toast.success('Leave approved');
  };

  const handleReject = (id: string) => {
    setLeaves((prev) => prev.map((l) => l.id === id ? { ...l, status: 'Rejected' as const } : l));
    toast.success('Leave rejected');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.startDate || !form.endDate) { toast.error('Fill all fields'); return; }
    const days = Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    setLeaves((prev) => [...prev, { ...form, id: Date.now().toString(), status: 'Pending', days }]);
    setShowAdd(false);
    setForm({ employeeId: '', type: 'Annual', startDate: '', endDate: '', reason: '' });
    toast.success('Leave request submitted');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Leave Management" description={`${leaves.filter((l) => l.status === 'Pending').length} pending requests`}>
        <button onClick={() => setShowAdd(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Request Leave
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: leaves.filter((l) => l.status === 'Pending').length, color: 'text-warning' },
          { label: 'Approved', count: leaves.filter((l) => l.status === 'Approved').length, color: 'text-success' },
          { label: 'Rejected', count: leaves.filter((l) => l.status === 'Rejected').length, color: 'text-destructive' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Dates</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Days</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const emp = employees.find((e) => e.id === leave.employeeId);
                return (
                  <tr key={leave.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{leave.reason}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{leave.type}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{leave.startDate} → {leave.endDate}</td>
                    <td className="px-4 py-3 font-medium">{leave.days}</td>
                    <td className="px-4 py-3"><StatusBadge status={leave.status} variant={statusVariant(leave.status)} /></td>
                    <td className="px-4 py-3">
                      {leave.status === 'Pending' && (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleApprove(leave.id)} className="p-1 rounded hover:bg-success/10 text-success"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleReject(leave.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><XCircle className="w-4 h-4" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Request Leave</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Employee</label>
                <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select employee</option>
                  {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Leave Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LeaveRequest['type'] })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['Annual', 'Sick', 'Maternity', 'Paternity', 'Compassionate', 'Study'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
