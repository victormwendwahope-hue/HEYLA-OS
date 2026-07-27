import { PageHeader } from '@/components/shared/CommonUI';
import { useNetworkStore, NetworkProfile } from '@/store/networkStore';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, X, MapPin, Globe, Phone, Save, Loader2 } from 'lucide-react';

export default function NetworkingProfilePage() {
  const { profile, profileLoading, fetchProfile, saveProfile } = useNetworkStore();
  const [form, setForm] = useState<Partial<NetworkProfile>>({});
  const [newSkill, setNewSkill] = useState('');
  const [newExp, setNewExp] = useState<{ title: string; company: string; startDate: string; endDate: string; current: boolean; description: string }>({ title: '', company: '', startDate: '', endDate: '', current: false, description: '' });
  const [newEdu, setNewEdu] = useState<{ school: string; degree: string; field: string; startDate: string; endDate: string }>({ school: '', degree: '', field: '', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await saveProfile(form);
    setSaving(false);
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    setForm((f) => ({ ...f, skills: [...(f.skills || []), { id: '', name: s, endorsements: 0 }] }));
    setNewSkill('');
  };
  const removeSkill = (idx: number) => {
    setForm((f) => ({ ...f, skills: (f.skills || []).filter((_, i) => i !== idx) }));
  };
  const addExperience = () => {
    if (!newExp.title) { toast.error('Title is required'); return; }
    setForm((f) => ({ ...f, experience: [...(f.experience || []), { ...newExp, id: '', location: '' }] }));
    setNewExp({ title: '', company: '', startDate: '', endDate: '', current: false, description: '' });
    setShowExpForm(false);
  };
  const removeExp = (idx: number) => {
    setForm((f) => ({ ...f, experience: (f.experience || []).filter((_, i) => i !== idx) }));
  };
  const addEducation = () => {
    if (!newEdu.school) { toast.error('School is required'); return; }
    setForm((f) => ({ ...f, education: [...(f.education || []), { ...newEdu, id: '', description: '' }] }));
    setNewEdu({ school: '', degree: '', field: '', startDate: '', endDate: '' });
    setShowEduForm(false);
  };
  const removeEdu = (idx: number) => {
    setForm((f) => ({ ...f, education: (f.education || []).filter((_, i) => i !== idx) }));
  };

  if (profileLoading) return (
    <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <PageHeader title="My Profile" description="Build your professional profile" />
        <button onClick={handleSave} disabled={saving}
          className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Basic Info */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Headline</label>
            <input value={form.headline || ''} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Full Stack Developer at XYZ"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Nairobi, Kenya"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 7XX XXX XXX"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">About</label>
          <textarea value={form.about || ''} onChange={(e) => setForm({ ...form, about: e.target.value })} rows={4} placeholder="Tell your professional story..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
      </div>

      {/* Skills */}
      <div className="glass rounded-xl p-6 space-y-3">
        <h3 className="font-semibold">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {(form.skills || []).map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {s.name}
              <button onClick={() => removeSkill(i)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="Add a skill..."
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={addSkill} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Experience */}
      <div className="glass rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Experience</h3>
          <button onClick={() => setShowExpForm(!showExpForm)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Plus className="w-4 h-4" /></button>
        </div>
        {(form.experience || []).map((e, i) => (
          <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="font-medium text-sm">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.company} · {e.startDate}{e.current ? ' - Present' : e.endDate ? ` - ${e.endDate}` : ''}</p>
              {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
            </div>
            <button onClick={() => removeExp(i)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {showExpForm && (
          <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/20">
            <input value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })} placeholder="Title*"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} placeholder="Company"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="grid grid-cols-2 gap-2">
              <input value={newExp.startDate} onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })} placeholder="Start date"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={newExp.endDate} onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })} disabled={newExp.current} placeholder="End date"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newExp.current} onChange={(e) => setNewExp({ ...newExp, current: e.target.checked })} className="rounded" />
              I currently work here
            </label>
            <textarea value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} rows={2} placeholder="Description"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowExpForm(false)} className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted">Cancel</button>
              <button onClick={addExperience} className="px-3 py-1.5 text-xs gradient-primary text-primary-foreground rounded-lg">Add</button>
            </div>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="glass rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Education</h3>
          <button onClick={() => setShowEduForm(!showEduForm)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Plus className="w-4 h-4" /></button>
        </div>
        {(form.education || []).map((e, i) => (
          <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <p className="font-medium text-sm">{e.school}</p>
              <p className="text-xs text-muted-foreground">{e.degree}{e.field ? ` in ${e.field}` : ''} · {e.startDate}{e.endDate ? ` - ${e.endDate}` : ''}</p>
            </div>
            <button onClick={() => removeEdu(i)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {showEduForm && (
          <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/20">
            <input value={newEdu.school} onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })} placeholder="School*"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="grid grid-cols-2 gap-2">
              <input value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} placeholder="Degree"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={newEdu.field} onChange={(e) => setNewEdu({ ...newEdu, field: e.target.value })} placeholder="Field of study"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={newEdu.startDate} onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })} placeholder="Start date"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={newEdu.endDate} onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })} placeholder="End date"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEduForm(false)} className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted">Cancel</button>
              <button onClick={addEducation} className="px-3 py-1.5 text-xs gradient-primary text-primary-foreground rounded-lg">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
