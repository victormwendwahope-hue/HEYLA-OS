import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/CommonUI';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Users, UserPlus, X, Loader2, Key, Shield, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface FacilityUser {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
  accountType: string;
  createdAt: string;
}

export default function ManageUsersPage() {
  const user = useAuthStore((s) => s.user);
  const isSuper = useAuthStore((s) => s.isSuperAdmin)();
  const [users, setUsers] = useState<FacilityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [saving, setSaving] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const facilityName = user?.facilityName || user?.company || '';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.admin.users();
      const filtered = data.filter((u: any) => {
        const uFacility = u.facilityName || u.facility_name || u.company || '';
        return uFacility.toLowerCase() === facilityName.toLowerCase();
      });
      setUsers(filtered);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await api.admin.createUser({
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        role: newUser.role,
        facilityName,
        company: facilityName,
      });
      toast.success('User created successfully');
      setShowAdd(false);
      setNewUser({ name: '', email: '', password: '', role: 'employee' });
      fetchUsers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    }
    setSaving(false);
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    if (newRole === 'admin' && !isSuper) {
      toast.error('You cannot grant admin rights');
      return;
    }
    setSaving(true);
    try {
      await api.admin.setRole(id, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed to update role'); }
    setSaving(false);
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !resetPassword) return;
    if (resetPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.admin.resetPassword(resetUserId, resetPassword);
      toast.success('Password reset');
      setResetUserId(null);
      setResetPassword('');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed to reset password'); }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Manage Users"
        description={facilityName ? `${facilityName} — manage your facility users` : 'Manage your users'}
      >
        <button onClick={() => setShowAdd(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
        <button onClick={fetchUsers}
          className="border border-border px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors">
          <RotateCcw className="w-4 h-4" /> Refresh
        </button>
      </PageHeader>

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" /> Users ({users.length})
          </h3>
        </div>
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No users found for your facility.</p>
            <p className="text-sm mt-1">Click "Add User" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 rounded border border-input bg-background text-xs font-medium text-center"
                      >
                        {['manager', 'employee', 'individual', ...(isSuper ? ['admin'] : [])].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => { setResetUserId(u.id); setResetPassword(''); }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        <Key className="w-3 h-3" /> Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Add User to {facilityName}</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
                <input type="text" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Min 8 chars" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="individual">Individual</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Reset Password</h2>
              <button onClick={() => { setResetUserId(null); setResetPassword(''); }} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">Set a new password for <strong>{users.find((u) => u.id === resetUserId)?.email}</strong>.</p>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
                <input type="text" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Min 8 chars" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setResetUserId(null); setResetPassword(''); }}
                  className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleResetPassword} disabled={saving || !resetPassword}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50">
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
