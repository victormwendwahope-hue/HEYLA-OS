import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { useJobStore } from '@/store/jobStore';
import { Briefcase, Users, Calendar, FileText, Plus, X, Star, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Tab = 'jobs' | 'applicants' | 'interviews' | 'compliance';

const stageVariant = (s: string) => {
  const m: Record<string, 'default' | 'info' | 'warning' | 'success' | 'destructive'> = { Applied: 'default', Screening: 'info', Interview: 'warning', Offer: 'info', Hired: 'success', Rejected: 'destructive' };
  return m[s] || 'default';
};

const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'] as const;

export default function JobsPage() {
  const { jobs, applicants, interviews, addJob, updateJob, updateApplicant, addInterview } = useJobStore();
  const [tab, setTab] = useState<Tab>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jForm, setJForm] = useState({ title: '', department: '', location: '', type: 'Full-time' as any, salary: '', description: '' });

  const openJobs = jobs.filter((j) => j.status === 'Open').length;
  const totalApplicants = applicants.length;
  const scheduledInterviews = interviews.filter((i) => i.status === 'Scheduled').length;
  const hired = applicants.filter((a) => a.stage === 'Hired').length;

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jForm.title) { toast.error('Title required'); return; }
    addJob({ id: Date.now().toString(), ...jForm, status: 'Open', requirements: [], postedDate: new Date().toISOString().split('T')[0], applicants: 0 });
    setShowJobForm(false);
    setJForm({ title: '', department: '', location: '', type: 'Full-time', salary: '', description: '' });
    toast.success('Job posted');
  };

  const moveApplicant = (id: string, stage: typeof stages[number]) => {
    updateApplicant(id, { stage });
    toast.success(`Moved to ${stage}`);
  };

  const filteredApplicants = selectedJob ? applicants.filter((a) => a.jobId === selectedJob) : applicants;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'jobs', label: 'Job Listings' }, { key: 'applicants', label: 'Applicants' },
    { key: 'interviews', label: 'Interviews' }, { key: 'compliance', label: 'Compliance' },
  ];

  const complianceData = [
    { country: '🇰🇪 Kenya', items: ['Employment Act 2007 compliance', 'NSSF/NHIF deductions mandatory', 'Probation max 6 months', 'Notice period: 1 month minimum'] },
    { country: '🇺🇸 USA', items: ['At-will employment default', 'I-9 verification required', 'EEO compliance', 'ADA accommodations'] },
    { country: '🇬🇧 UK', items: ['Right to work check', 'National minimum wage', 'GDPR data handling', 'Statutory sick pay'] },
    { country: '🇮🇳 India', items: ['PF/ESI registration', 'Gratuity after 5 years', 'Shop & Establishment Act', 'Sexual Harassment Prevention Act'] },
    { country: '🇦🇪 UAE', items: ['WPS salary payment', 'End of service gratuity', 'Emirates ID mandatory', 'Labor card required'] },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Jobs & Recruitment" description="Post vacancies, track applicants, and manage hiring">
        <button onClick={() => setShowJobForm(true)} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Post Job
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open Positions" value={String(openJobs)} icon={Briefcase} iconColor="gradient-primary" />
        <StatCard title="Total Applicants" value={String(totalApplicants)} change={`${hired} hired`} changeType="positive" icon={Users} />
        <StatCard title="Scheduled Interviews" value={String(scheduledInterviews)} icon={Calendar} />
        <StatCard title="Hired This Month" value={String(hired)} change="conversion rate" changeType="positive" icon={Star} />
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <div key={j.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">{j.department} • {j.location}</p>
                </div>
                <StatusBadge status={j.status} variant={j.status === 'Open' ? 'success' : 'default'} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">{j.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {j.requirements.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 bg-muted rounded-full text-xs">{r}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{j.type}</span>
                  <span>{j.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{j.applicants} applicants</span>
                  <button onClick={() => { setSelectedJob(j.id); setTab('applicants'); }} className="text-primary text-xs font-medium hover:underline flex items-center gap-0.5">
                    View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {j.status === 'Open' && (
                <button onClick={() => updateJob(j.id, { status: 'Closed' })} className="mt-3 text-xs text-destructive hover:underline">Close Position</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'applicants' && (
        <div className="space-y-4">
          {selectedJob && (
            <button onClick={() => setSelectedJob(null)} className="text-sm text-primary hover:underline">← Show all applicants</button>
          )}
          {/* Kanban Board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stages.map((stage) => {
              const stageApplicants = filteredApplicants.filter((a) => a.stage === stage);
              return (
                <div key={stage} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{stage}</h4>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{stageApplicants.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageApplicants.map((a) => (
                      <div key={a.id} className="glass rounded-lg p-3 hover:shadow-elevated transition-shadow">
                        <p className="font-medium text-sm">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.email}</p>
                        {a.rating > 0 && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < a.rating ? 'text-warning fill-warning' : 'text-muted'}`} />
                            ))}
                          </div>
                        )}
                        {a.notes && <p className="text-xs text-muted-foreground mt-1 italic">{a.notes}</p>}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {stages.filter((s) => s !== a.stage).slice(0, 2).map((s) => (
                            <button key={s} onClick={() => moveApplicant(a.id, s)} className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                              → {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'interviews' && (
        <div className="space-y-4">
          {interviews.map((iv) => (
            <div key={iv.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{iv.applicantName}</h3>
                  <p className="text-sm text-muted-foreground">{iv.jobTitle}</p>
                </div>
                <StatusBadge status={iv.status} variant={iv.status === 'Scheduled' ? 'info' : iv.status === 'Completed' ? 'success' : 'destructive'} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
                <div><span className="text-muted-foreground block text-xs">Date</span><span className="font-medium">{iv.date}</span></div>
                <div><span className="text-muted-foreground block text-xs">Time</span><span className="font-medium">{iv.time}</span></div>
                <div><span className="text-muted-foreground block text-xs">Type</span><span className="font-medium">{iv.type}</span></div>
                <div><span className="text-muted-foreground block text-xs">Interviewer</span><span className="font-medium">{iv.interviewer}</span></div>
              </div>
              {iv.notes && <p className="text-sm text-muted-foreground mt-3 italic">Notes: {iv.notes}</p>}
            </div>
          ))}
          {interviews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No interviews scheduled</p>
            </div>
          )}
        </div>
      )}

      {tab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceData.map((c) => (
            <div key={c.country} className="glass rounded-xl p-5">
              <h3 className="font-semibold text-lg mb-3">{c.country}</h3>
              <ul className="space-y-2">
                {c.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {showJobForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg m-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Post New Job</h2>
              <button onClick={() => setShowJobForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddJob} className="p-5 space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Job Title*</label>
                <input value={jForm.title} onChange={(e) => setJForm({ ...jForm, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
                  <input value={jForm.department} onChange={(e) => setJForm({ ...jForm, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                  <input value={jForm.location} onChange={(e) => setJForm({ ...jForm, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <select value={jForm.type} onChange={(e) => setJForm({ ...jForm, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Full-time', 'Part-time', 'Contract', 'Remote'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Salary Range</label>
                  <input value={jForm.salary} onChange={(e) => setJForm({ ...jForm, salary: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. KSh 80,000 - 120,000" /></div>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea value={jForm.description} onChange={(e) => setJForm({ ...jForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowJobForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
