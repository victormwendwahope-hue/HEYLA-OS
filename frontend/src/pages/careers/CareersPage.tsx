import { useNetworkStore } from '@/store/networkStore';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, MapPin, Clock, Search, Filter, Star, Send, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/CommonUI';
import { HeyleyBot } from '@/components/chat/HeyleyBot';

interface IndividualProfile {
  name: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  portfolio: string;
  availability: 'Immediately' | 'In 2 Weeks' | 'In 1 Month';
}

const defaultProfile: IndividualProfile = {
  name: '', email: '', phone: '', title: '', location: '', bio: '',
  skills: [], experience: '', education: '', portfolio: '',
  availability: 'Immediately',
};

export default function CareersPage() {
  const { jobs } = useNetworkStore();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [tab, setTab] = useState<'jobs' | 'profile' | 'applications'>('jobs');
  const [profile, setProfile] = useState<IndividualProfile>({ ...defaultProfile, name: user?.name || '', email: user?.email || '' });
  const [newSkill, setNewSkill] = useState('');
  const [applications, setApplications] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(p => ({ ...p, skills: [...p.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  const filteredJobs = jobs.filter(j => {
    const matchSearch = `${j.title} ${j.company} ${j.location} ${j.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || j.type === typeFilter;
    return matchSearch && matchType;
  });

  // Smart matching
  const matchedJobs = profile.skills.length > 0
    ? filteredJobs.sort((a, b) => {
        const aMatch = a.skills.filter(s => profile.skills.some(ps => ps.toLowerCase() === s.toLowerCase())).length;
        const bMatch = b.skills.filter(s => profile.skills.some(ps => ps.toLowerCase() === s.toLowerCase())).length;
        return bMatch - aMatch;
      })
    : filteredJobs;

  const getMatchScore = (jobSkills: string[]) => {
    if (profile.skills.length === 0) return 0;
    return jobSkills.filter(s => profile.skills.some(ps => ps.toLowerCase() === s.toLowerCase())).length;
  };

  const handleApply = (jobId: string) => {
    if (applications.includes(jobId)) { toast.info('Already applied'); return; }
    setApplications(prev => [...prev, jobId]);
    toast.success('Application submitted!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4 sm:px-8 gap-4 sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">H</div>
          <span className="text-lg font-bold">HEYLA<span className="text-primary"> Careers</span></span>
        </Link>
        <div className="flex-1" />
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {(['jobs', 'profile', 'applications'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative" ref={userRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
              {(user?.name || 'U').charAt(0)}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{user?.name || 'User'}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50">
              <div className="p-1">
                <button onClick={() => { setTab('profile'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-left">
                  <User className="w-4 h-4 text-muted-foreground" /> My Profile
                </button>
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive text-left">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {tab === 'jobs' && (
          <>
            <div className="text-center py-6">
              <h1 className="text-3xl font-bold mb-2">Find Your Next Opportunity</h1>
              <p className="text-muted-foreground">
                {profile.skills.length > 0
                  ? `🎯 Jobs are sorted by match to your skills: ${profile.skills.slice(0, 3).join(', ')}${profile.skills.length > 3 ? '...' : ''}`
                  : 'Complete your profile to get personalized job matches'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, skills, companies..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm">
                <option value="All">All Types</option>
                {['Full-time', 'Part-time', 'Contract', 'Freelance'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              {matchedJobs.map(job => {
                const matchScore = getMatchScore(job.skills);
                const applied = applications.includes(job.id);
                return (
                  <div key={job.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          {matchScore > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                              {matchScore} skill match{matchScore > 1 ? 'es' : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.posted}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.map(s => (
                            <span key={s} className={`px-2 py-0.5 rounded-md text-xs ${
                              profile.skills.some(ps => ps.toLowerCase() === s.toLowerCase())
                                ? 'bg-success/10 text-success font-medium'
                                : 'bg-accent text-accent-foreground'
                            }`}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="font-semibold text-primary text-lg">{job.salary}</p>
                        <StatusBadge status={job.type} variant="info" />
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={applied}
                          className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                            applied
                              ? 'bg-success/10 text-success cursor-default'
                              : 'gradient-primary text-primary-foreground hover:opacity-90'
                          }`}
                        >
                          {applied ? '✓ Applied' : <><Send className="w-3.5 h-3.5" /> Apply Now</>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {matchedJobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No jobs found matching your criteria.</div>
              )}
            </div>
          </>
        )}

        {tab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">My Profile</h2>
            <p className="text-muted-foreground">Complete your profile to get matched with relevant jobs.</p>

            <div className="glass rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {(profile.name || 'U').charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile.name || 'Your Name'}</h3>
                  <p className="text-sm text-muted-foreground">{profile.title || 'Add your job title'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', field: 'name' as const },
                  { label: 'Email', field: 'email' as const },
                  { label: 'Phone', field: 'phone' as const },
                  { label: 'Job Title', field: 'title' as const },
                  { label: 'Location', field: 'location' as const },
                  { label: 'Portfolio URL', field: 'portfolio' as const },
                ].map(f => (
                  <div key={f.field}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                    <input value={profile[f.field]} onChange={e => setProfile(p => ({ ...p, [f.field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bio</label>
                <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Skills (adds to job matching)</label>
                <div className="flex gap-2 mb-2">
                  <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Type a skill and press Enter"
                    className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={addSkill} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium flex items-center gap-1.5">
                      {s}
                      <button onClick={() => removeSkill(s)} className="text-muted-foreground hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Experience</label>
                  <textarea value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))} rows={3}
                    placeholder="e.g. 3 years at Safaricom as Software Engineer..."
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Education</label>
                  <textarea value={profile.education} onChange={e => setProfile(p => ({ ...p, education: e.target.value }))} rows={3}
                    placeholder="e.g. BSc Computer Science, University of Nairobi"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Availability</label>
                <select value={profile.availability} onChange={e => setProfile(p => ({ ...p, availability: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                  {['Immediately', 'In 2 Weeks', 'In 1 Month'].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <button onClick={() => toast.success('Profile saved!')} className="w-full gradient-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Save Profile
              </button>
            </div>
          </div>
        )}

        {tab === 'applications' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold">My Applications</h2>
            <p className="text-muted-foreground">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
            {applications.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applications yet. Browse jobs and apply!</p>
                <button onClick={() => setTab('jobs')} className="mt-4 px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
                  Browse Jobs
                </button>
              </div>
            ) : (
              applications.map(appId => {
                const job = jobs.find(j => j.id === appId);
                if (!job) return null;
                return (
                  <div key={appId} className="glass rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company} · {job.location}</p>
                      </div>
                      <StatusBadge status="Applied" variant="info" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <HeyleyBot />
    </div>
  );
}
