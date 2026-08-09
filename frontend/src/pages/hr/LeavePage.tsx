import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { useEmployeeStore } from '@/store/employeeStore';
import { useLeaveStore, type LeaveRequest } from '@/store/leaveStore';
import { useEffect, useState } from 'react';
import { Plus, X, Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const statusVariant = (s: string) => s === 'Approved' ? 'success' : s === 'Rejected' ? 'destructive' : 'warning';

export default function LeavePage() {
  const employees = useEmployeeStore((s) => s.employees);
  const { leaves, loading, fetchLeaves, addLeave, updateLeave, removeLeave } = useLeaveStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: '', leaveType: 'Annual' as LeaveRequest['leaveType'], startDate: '', endDate: '', reason: '' });

  const fetchEmployees = useEmployeeStore((s) => s.fetchEmployees);

  useEffect(() => { fetchLeaves(); fetchEmployees(); }, []);

  const handleApprove = (id: string) => updateLeave(id, { status: 'Approved' });
  const handleReject = (id: string) => updateLeave(id, { status: 'Rejected' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.startDate || !form.endDate) { toast.error('Fill all fields'); return; }
    addLeave(form);
    setShowAdd(false);
    setForm({ employeeId: '', leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
  };

  const pending = leaves.filter((l) => l.status === 'Pending').length;
  const approved = leaves.filter((l) => l.status === 'Approved').length;
  const rejected = leaves.filter((l) => l.status === 'Rejected').length;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Leave Management" description="Manage employee leave requests" icon={Calendar} actions={
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus className="w-4 h-4" /> Request Leave</button>
      } />
      {loading && <div className="flex items-center justify-center py-4 text-muted-foreground">Loading...</div>}

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border p-4"><div className="text-2xl font-bold text-yellow-600">{pending}</div><div className="text-sm text-muted-foreground">Pending</div></div>
        <div className="rounded-xl bg-card border p-4"><div className="text-2xl font-bold text-green-600">{approved}</div><div className="text-sm text-muted-foreground">Approved</div></div>
        <div className="rounded-xl bg-card border p-4"><div className="text-2xl font-bold text-red-600">{rejected}</div><div className="text-sm text-muted-foreground">Rejected</div></div>
      </div>
      <div className="rounded-xl bg-card border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-muted/50"><th className="text-left p-3 text-sm font-medium">Employee</th><th className="text-left p-3 text-sm font-medium">Type</th><th className="text-left p-3 text-sm font-medium">Dates</th><th className="text-left p-3 text-sm font-medium">Days</th><th className="text-left p-3 text-sm font-medium">Status</th><th className="text-left p-3 text-sm font-medium">Actions</th></tr></thead>
          <tbody>
            {leaves.map((l) => {
              const emp = employees.find((e) => String(e.id) === String(l.employeeId));
              return (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">{emp ? `${emp.firstName} ${emp.lastName}` : l.employeeName || 'Unknown'}</td>
                  <td className="p-3"><StatusBadge status={l.leaveType} /></td>
                  <td className="p-3 text-sm">{l.startDate} → {l.endDate}</td>
                  <td className="p-3">{l.days}</td>
                  <td className="p-3"><StatusBadge status={l.status} variant={statusVariant(l.status)} /></td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {l.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(l.id)} className="btn-icon text-green-600 hover:bg-green-50"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleReject(l.id)} className="btn-icon text-red-600 hover:bg-red-50"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="btn-icon text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Leave</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this leave request? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeLeave(l.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Request Leave</h2><button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-background">
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value as LeaveRequest['leaveType'] })} className="w-full rounded-lg border p-2.5 text-sm bg-background">
                {['Annual', 'Sick', 'Maternity', 'Paternity', 'Compassionate', 'Study'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-background" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-background" /></div>
              </div>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason" className="w-full rounded-lg border p-2.5 text-sm bg-background" rows={3} />
              <button type="submit" className="btn-primary w-full">Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
