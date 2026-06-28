import { useState, useEffect } from 'react';
import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Shield, Users, RotateCcw, Key, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  accountType: string;
  trialStartedAt: string | null;
  trialDurationDays: number;
  createdAt: string;
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [roleChangeId, setRoleChangeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.admin.users();
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    setSaving(true);
    try {
      await api.admin.setRole(id, newRole);
      toast.success('Role updated — user sessions revoked');
      fetchUsers();
    } catch (e: any) { toast.error(e?.message || 'Failed to update role'); }
    setSaving(false);
    setRoleChangeId(null);
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !resetPassword) return;
    if (resetPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.admin.resetPassword(resetUserId, resetPassword);
      toast.success('Password reset — user sessions revoked');
      setResetUserId(null);
      setResetPassword('');
    } catch (e: any) { toast.error(e?.message || 'Failed to reset password'); }
    setSaving(false);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Admin Panel" description="Administration" />
        <div className="glass rounded-xl p-12 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">Only admin users can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Admin Panel" description="Manage users, roles, and passwords">
        <button onClick={fetchUsers} className="border border-border px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
          <RotateCcw className="w-4 h-4" /> Refresh
        </button>
      </PageHeader>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4" /> Users ({users.length})</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Account Type</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Trial</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const trialEnd = u.trialStartedAt
                    ? new Date(Date.parse(u.trialStartedAt) + (u.trialDurationDays || 7) * 86400000)
                    : null;
                  const trialExpired = trialEnd && trialEnd < new Date();

                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-center">
                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 rounded border border-input bg-background text-xs font-medium text-center">
                          {['admin', 'manager', 'employee', 'individual'].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center text-xs">{u.accountType || 'company'}</td>
                      <td className="px-4 py-3 text-center">
                        {trialEnd ? (
                          <span className={`text-xs font-medium ${trialExpired ? 'text-destructive' : 'text-success'}`}>
                            {trialExpired ? 'Expired' : `${Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)}d left`}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">No trial</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => { setResetUserId(u.id); setResetPassword(''); }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          <Key className="w-3 h-3" /> Reset Password
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Reset Password</h2>
              <button onClick={() => { setResetUserId(null); setResetPassword(''); }} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">Set a new password for <strong>{users.find((u) => u.id === resetUserId)?.email}</strong>. The user will be logged out.</p>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
                <input type="text" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Min 8 chars, uppercase, lowercase, number" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setResetUserId(null); setResetPassword(''); }}
                  className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleResetPassword} disabled={saving || !resetPassword}
                  className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}