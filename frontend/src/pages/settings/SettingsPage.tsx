import { PageHeader } from '@/components/shared/CommonUI';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import { User, Building2, Bell, Shield, Palette, Check, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', company: user?.company || '', phone: '+254 712 345 678' });
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false, weeklyReport: true });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('heyla-theme');
    if (stored === 'dark' || (!stored && document.documentElement.classList.contains('dark'))) return 'dark';
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('heyla-theme', theme);
  }, [theme]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
    };
    reader.readAsDataURL(f);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: profile.name, company: profile.company, avatar: avatarPreview || undefined });
    } catch { toast.error('Failed to save profile'); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.newPass) { toast.error('Fill all password fields'); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
    if (passwordForm.newPass.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setChangingPassword(true);
    try {
      await changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to change password');
    }
    setChangingPassword(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="glass rounded-xl p-2 md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.id ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}>
                <t.icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 glass rounded-xl p-6">
          {tab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Profile Settings</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile.name.charAt(0)
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  <button onClick={() => photoInputRef.current?.click()} className="text-sm text-primary font-medium hover:underline">Change Photo</button>
                  <p className="text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: profile.name, field: 'name' },
                  { label: 'Email', value: profile.email, field: 'email' },
                  { label: 'Company', value: profile.company, field: 'company' },
                  { label: 'Phone', value: profile.phone, field: 'phone' },
                ].map((f) => (
                  <div key={f.field}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                    <input value={f.value} onChange={(e) => setProfile({ ...profile, [f.field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveProfile} disabled={saving}
                className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          )}

          {tab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Company Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Company Name', value: 'Heyla Corp' },
                  { label: 'Industry', value: 'Technology' },
                  { label: 'Country', value: 'Kenya' },
                  { label: 'Tax ID (KRA PIN)', value: 'P051234567Z' },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                    <input defaultValue={f.value} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success('Company settings saved')}
                className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Save</button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Notification Preferences</h3>
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                { key: 'sms', label: 'SMS Notifications', desc: 'Text message alerts' },
                { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly summary emails' },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <button onClick={() => { setNotifications({ ...notifications, [n.key]: !(notifications as any)[n.key] }); toast.success('Preference updated'); }}
                    className={`w-10 h-6 rounded-full transition-colors relative ${(notifications as any)[n.key] ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-primary-foreground transition-transform ${(notifications as any)[n.key] ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">Change your password. If forgotten, contact your admin for a reset.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Password</label>
                  <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">New Password</label>
                  <input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Confirm Password</label>
                  <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={changingPassword}
                className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-50">
                {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Appearance</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setTheme('light')}
                  className={`glass rounded-xl p-4 text-center border-2 transition-all ${theme === 'light' ? 'border-primary' : 'border-transparent hover:border-primary'}`}>
                  <div className="w-full h-20 bg-background rounded-lg mb-2 border border-border relative flex items-center justify-center">
                    {theme === 'light' && <Check className="w-6 h-6 text-primary" />}
                  </div>
                  <p className="text-sm font-medium">Light</p>
                </button>
                <button onClick={() => setTheme('dark')}
                  className={`glass rounded-xl p-4 text-center border-2 transition-all ${theme === 'dark' ? 'border-primary' : 'border-transparent hover:border-primary'}`}>
                  <div className="w-full h-20 bg-foreground rounded-lg mb-2 relative flex items-center justify-center">
                    {theme === 'dark' && <Check className="w-6 h-6 text-background" />}
                  </div>
                  <p className="text-sm font-medium">Dark</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}