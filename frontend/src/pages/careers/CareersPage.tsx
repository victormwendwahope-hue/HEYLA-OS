import { useAuthStore } from '@/store/authStore';
import { Briefcase, MapPin, Clock, Search, Send, ChevronDown, LogOut, User, Loader2, Building2, GraduationCap, Star, Globe2, Filter, X, Check, Calendar, Video, Phone, ExternalLink, Eye, FileText, Upload, Linkedin, Globe, DollarSign, CalendarDays } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { StatusBadge } from '@/components/shared/CommonUI';
import { HeyleyBot } from '@/components/chat/HeyleyBot';
import { api } from '@/lib/api';
import type { CareerJob } from '@/types';

interface CustomField {
  label: string;
  type: 'text' | 'textarea' | 'file' | 'select';
  required: boolean;
  options?: string[];
}

interface JobDetail extends CareerJob {
  requirements: string[];
  roles: string[];
  benefits: string[];
  banner: string;
  photo: string;
  companyName: string;
  customFormFields: CustomField[];
  interviewInstructions: string;
  videoCallLink: string;
  netWorth?: string;
}

interface Application {
  id: string; jobId: string; name: string; email: string; phone: string;
  stage: string; appliedDate: string; coverLetter: string;
  interviewDate: string; interviewType: string; interviewLink: string; interviewNotes: string;
  formAnswers: Record<string, string>;
}

export default function CareersPage() {
  const user = useAuthStore(s => s.user);
  const isAuth = useAuthStore(s => s.isAuthenticated);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [tab, setTab] = useState<'jobs' | 'applications'>('jobs');
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState<Record<string, string>>({});
  const [applyFiles, setApplyFiles] = useState<{ resume?: File; coverLetter?: File }>({});
  const [uploadingResume, setUploadingResume] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const resumeRef = useRef<HTMLInputElement>(null);
  const coverLetterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    api.public.vacancies({ limit: 100 }).then((data) => {
      setJobs(data);
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error('Failed to load vacancies'); });
  }, []);

  useEffect(() => {
    if (isAuth) {
      api.get<Application[]>('/my-applications').then(setApplications).catch(() => {});
    }
  }, [isAuth]);

  const filteredJobs = jobs.filter(j => {
    const matchSearch = `${j.title} ${j.company} ${j.location} ${j.skills.join(' ')} ${j.description}`.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || j.type === typeFilter;
    return matchSearch && matchType;
  });

  const jobTypes = ['All', ...new Set(jobs.map(j => j.type))];

  const handleViewJob = async (job: CareerJob) => {
    if (job.source === 'company' && job.id.startsWith('job_')) {
      try {
        const realId = job.id.replace('job_', '');
        const detail = await api.get<JobDetail>(`/public/jobs/${realId}`);
        setSelectedJob(detail);
      } catch {
        setSelectedJob({ ...job, requirements: [], roles: [], benefits: [], banner: '', photo: '', companyName: job.company, customFormFields: [], interviewInstructions: '', videoCallLink: '' });
      }
    } else {
      setSelectedJob({ ...job, requirements: [], roles: [], benefits: [], banner: '', photo: '', companyName: job.company, customFormFields: [], interviewInstructions: '', videoCallLink: '' });
    }
  };

  const handleApply = () => {
    if (!isAuth) {
      navigate({ to: '/register/individual' });
      return;
    }
    if (!selectedJob) return;
    const fields = selectedJob.customFormFields || [];
    const initial: Record<string, string> = {
      name: user?.name || '', email: user?.email || '', phone: '',
      currentCompany: '', currentPosition: '', linkedinUrl: user?.linkedinProfile || '', portfolioUrl: '',
      netWorth: '', expectedSalary: '', noticePeriod: '', startDate: '', coverLetter: ''
    };
    fields.forEach((f) => { if (!initial[f.label]) initial[f.label] = ''; });
    setApplyForm(initial);
    setApplyFiles({});
    setShowApplyModal(true);
  };

  const importFromLinkedIn = () => {
    if (!user?.linkedinProfile && !user?.headline) {
      toast.error('No LinkedIn profile connected. Link your LinkedIn in Settings first.');
      return;
    }
    setApplyForm(prev => ({
      ...prev,
      name: user?.name || prev.name,
      linkedinUrl: user?.linkedinProfile || prev.linkedinUrl,
    }));
    if (user?.headline) {
      const coverText = `${user.headline}${user.skills ? '\n\nSkills: ' + user.skills : ''}`;
      setApplyForm(prev => ({ ...prev, coverLetter: prev.coverLetter || coverText }));
    }
    toast.success('LinkedIn profile imported');
  };

  const submitApplication = async () => {
    if (!selectedJob) return;
    const realId = selectedJob.id.replace('job_', '');
    const fields = selectedJob.customFormFields || [];
    const formAnswers: Record<string, string> = {};
    fields.forEach((f) => { formAnswers[f.label] = applyForm[f.label] || ''; });
    let resumeUrl = '';
    if (applyFiles.resume) {
      try {
        const uploadResult = await api.upload(applyFiles.resume);
        resumeUrl = uploadResult.url;
      } catch { toast.error('Resume upload failed'); return; }
    }
    let coverLetterUrl = '';
    if (applyFiles.coverLetter) {
      try {
        const uploadResult = await api.upload(applyFiles.coverLetter);
        coverLetterUrl = uploadResult.url;
      } catch { toast.error('Cover letter upload failed'); return; }
    }
    try {
      await api.post(`/jobs/${realId}/apply`, {
        name: applyForm.name || user?.name || '',
        email: applyForm.email || user?.email || '',
        phone: applyForm.phone || '',
        currentCompany: applyForm.currentCompany || '',
        currentPosition: applyForm.currentPosition || '',
        linkedinUrl: applyForm.linkedinUrl || '',
        portfolioUrl: applyForm.portfolioUrl || '',
        netWorth: applyForm.netWorth || '',
        expectedSalary: applyForm.expectedSalary || '',
        noticePeriod: applyForm.noticePeriod || '',
        startDate: applyForm.startDate || '',
        coverLetter: applyForm.coverLetter || '',
        resumeUrl,
        coverLetterUrl,
        formAnswers,
      });
      toast.success('Application submitted!');
      setShowApplyModal(false);
      if (isAuth) {
        const apps = await api.get<Application[]>('/my-applications');
        setApplications(apps);
      }
    } catch { toast.error('Failed to submit application'); }
  };

  const stageColor = (s: string) => {
    const m: Record<string, string> = { Applied: 'bg-blue-500/10 text-blue-500', Screening: 'bg-yellow-500/10 text-yellow-500', Interview: 'bg-purple-500/10 text-purple-500', Offer: 'bg-green-500/10 text-green-500', Hired: 'bg-emerald-500/10 text-emerald-500', Rejected: 'bg-red-500/10 text-red-500' };
    return m[s] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <PublicNavbar />
        {isAuth && (
          <div className="flex items-center justify-center gap-1 bg-muted/30 px-4 py-2 border-t border-border">
            <div className="flex gap-1 bg-muted p-0.5 rounded-lg">
              {(['jobs', 'applications'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {t === 'jobs' ? 'Browse Jobs' : 'My Applications'}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {tab === 'jobs' && (
          <>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 p-8 sm:p-12">
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                  <Globe2 className="w-4 h-4" /> Find Your Next Role
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">Browse Open Positions</h1>
                <p className="text-muted-foreground mb-6">Explore opportunities from companies hiring now.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, skills, companies..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                      className="pl-10 pr-8 py-2.5 rounded-xl border border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {jobTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{loading ? 'Loading...' : `${filteredJobs.length} position${filteredJobs.length !== 1 ? 's' : ''} found`}</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map(job => (
                  <div key={job.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewJob(job)}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                          {job.source === 'network' && <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">Network</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 shrink-0" /> {job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" /> {job.location || 'Remote'}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 shrink-0" /> {job.postedDate || 'Recent'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                        {job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-md text-xs bg-accent text-accent-foreground">{s}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
                        {job.salary && <p className="font-semibold text-primary">{job.salary}</p>}
                        <StatusBadge status={job.type} variant="info" />
                        <button onClick={(e) => { e.stopPropagation(); handleViewJob(job); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> View Job
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredJobs.length === 0 && (
                  <div className="text-center py-16">
                    <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">No positions found matching your criteria.</p>
                    <button onClick={() => { setSearch(''); setTypeFilter('All'); }} className="mt-3 text-sm text-primary hover:underline">Clear filters</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'applications' && isAuth && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">My Applications</h2>
            <p className="text-muted-foreground">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>
            {applications.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">No applications yet.</p>
                <button onClick={() => setTab('jobs')} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Browse Jobs</button>
              </div>
            ) : (
              applications.map(app => {
                const job = jobs.find(j => j.id === 'job_' + app.jobId);
                return (
                  <div key={app.id} className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{job?.title || 'Position'}</h3>
                        <p className="text-sm text-muted-foreground">{job?.company || ''} · {job?.location || ''}</p>
                        {app.coverLetter && <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">{app.coverLetter}</p>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColor(app.stage)}`}>{app.stage}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                      <span>Applied {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : ''}</span>
                      {app.interviewDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Interview: {new Date(app.interviewDate).toLocaleDateString()}
                        </span>
                      )}
                      {app.interviewLink && (
                        <a href={app.interviewLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <Video className="w-3 h-3" /> Join Interview
                        </a>
                      )}
                    </div>
                    {app.interviewNotes && <p className="text-xs text-muted-foreground mt-2 italic">Notes: {app.interviewNotes}</p>}
                  </div>
                );
              })
            )}
          </div>
        )}

        {!isAuth && (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <User className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Sign in to apply and track applications</h3>
            <p className="text-sm text-muted-foreground mb-4">Create an account or sign in to submit applications and track your progress.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate({ to: '/login' })} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Sign In</button>
              <button onClick={() => navigate({ to: '/register/individual' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Create Account</button>
            </div>
          </div>
        )}
      </main>

      {/* Job Detail Modal */}
      {selectedJob && !showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in overflow-y-auto py-8">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-3xl m-4">
            {selectedJob.banner && (
              <div className="relative group cursor-pointer" onClick={() => setPreviewImage(selectedJob.banner)}>
                <img src={selectedJob.banner} alt="Job banner" className="w-full h-48 object-cover rounded-t-2xl" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-t-2xl transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-4 py-1.5 rounded-full transition-opacity">Click to view full size</span>
                </div>
              </div>
            )}
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {selectedJob.photo ? (
                    <img src={selectedJob.photo} alt="Company logo" className="w-16 h-16 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewImage(selectedJob.photo)} />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="w-8 h-8 text-primary" /></div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                    <p className="text-muted-foreground">{selectedJob.companyName || selectedJob.company}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedJob.location || 'Remote'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedJob.postedDate || 'Recent'}</span>
                      {selectedJob.salary && <span className="font-semibold text-primary">{selectedJob.salary}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex gap-2">
                <StatusBadge status={selectedJob.type} variant="info" />
              </div>

              {selectedJob.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.roles && selectedJob.roles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Roles & Responsibilities</h3>
                  <ul className="space-y-1">
                    {selectedJob.roles.map((r, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />{r}</li>)}
                  </ul>
                </div>
              )}

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="space-y-1">
                    {selectedJob.requirements.map((r, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />{r}</li>)}
                  </ul>
                </div>
              )}

              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((b, i) => <span key={i} className="px-3 py-1 rounded-full bg-success/10 text-success text-sm">{b}</span>)}
                  </div>
                </div>
              )}

              {selectedJob.netWorth && (
                <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Minimum Net Worth Required</p>
                    <p className="text-sm text-muted-foreground">{selectedJob.netWorth}</p>
                  </div>
                </div>
              )}

              <button onClick={handleApply} className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {isAuth ? <><Send className="w-4 h-4" /> Apply Now</> : <><User className="w-4 h-4" /> Sign in to Apply</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
              <h2 className="text-lg font-bold">Apply for {selectedJob.title}</h2>
              <button onClick={() => setShowApplyModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <button type="button" onClick={importFromLinkedIn}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#0A66C2] bg-[#0A66C2]/5 text-[#0A66C2] text-sm font-medium hover:bg-[#0A66C2]/10 transition-colors">
                <Linkedin className="w-4 h-4" /> Import from LinkedIn
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
                  <input value={applyForm.name || ''} onChange={e => setApplyForm({ ...applyForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                  <input value={applyForm.email || ''} onChange={e => setApplyForm({ ...applyForm, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <input value={applyForm.phone || ''} onChange={e => setApplyForm({ ...applyForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="+254 712 345 678" />
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Current Employment</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Company</label>
                    <input value={applyForm.currentCompany || ''} onChange={e => setApplyForm({ ...applyForm, currentCompany: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Current Position</label>
                    <input value={applyForm.currentPosition || ''} onChange={e => setApplyForm({ ...applyForm, currentPosition: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Links & Documents</h4>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Upload className="w-3 h-3" /> Resume / CV</label>
                  <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setApplyFiles({ ...applyFiles, resume: f }); }} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => resumeRef.current?.click()}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-muted transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {applyFiles.resume ? applyFiles.resume.name : 'Upload Resume'}
                    </button>
                    {applyFiles.resume && <button type="button" onClick={() => setApplyFiles({ ...applyFiles, resume: undefined })} className="text-xs text-destructive hover:underline">Remove</button>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1 mt-3"><Upload className="w-3 h-3" /> Cover Letter File</label>
                  <input ref={coverLetterRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setApplyFiles({ ...applyFiles, coverLetter: f }); }} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => coverLetterRef.current?.click()}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-muted transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {applyFiles.coverLetter ? applyFiles.coverLetter.name : 'Upload Cover Letter'}
                    </button>
                    {applyFiles.coverLetter && <button type="button" onClick={() => setApplyFiles({ ...applyFiles, coverLetter: undefined })} className="text-xs text-destructive hover:underline">Remove</button>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Linkedin className="w-3 h-3" /> LinkedIn URL</label>
                    <input value={applyForm.linkedinUrl || ''} onChange={e => setApplyForm({ ...applyForm, linkedinUrl: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><Globe className="w-3 h-3" /> Portfolio URL</label>
                    <input value={applyForm.portfolioUrl || ''} onChange={e => setApplyForm({ ...applyForm, portfolioUrl: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financial & Availability</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Net Worth</label>
                    <input value={applyForm.netWorth || ''} onChange={e => setApplyForm({ ...applyForm, netWorth: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. 2,000,000" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Expected Salary</label>
                    <input value={applyForm.expectedSalary || ''} onChange={e => setApplyForm({ ...applyForm, expectedSalary: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. 120,000" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Notice Period</label>
                    <select value={applyForm.noticePeriod || ''} onChange={e => setApplyForm({ ...applyForm, noticePeriod: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select...</option>
                      <option value="Immediate">Immediate</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Available From</label>
                    <input type="date" value={applyForm.startDate || ''} onChange={e => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              </div>

              {(selectedJob.customFormFields || []).length > 0 && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Additional Questions</h4>
                  {(selectedJob.customFormFields || []).map((field) => (
                    <div key={field.label} className="mb-3">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}{field.required ? ' *' : ''}</label>
                      {field.type === 'textarea' ? (
                        <textarea value={applyForm[field.label] || ''} onChange={e => setApplyForm({ ...applyForm, [field.label]: e.target.value })} rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                      ) : field.type === 'select' ? (
                        <select value={applyForm[field.label] || ''} onChange={e => setApplyForm({ ...applyForm, [field.label]: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                          <option value="">Select...</option>
                          {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={applyForm[field.label] || ''} onChange={e => setApplyForm({ ...applyForm, [field.label]: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-border pt-4">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Cover Letter (optional — can upload file above instead)</label>
                <textarea value={applyForm.coverLetter || ''} onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })} rows={4}
                  placeholder="Tell us why you're a great fit..."
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <button onClick={submitApplication} className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User avatar FAB */}
      <div className="fixed bottom-6 right-6 z-40" onClick={(e) => { const t = e.target as HTMLElement; if (t.closest('[data-ignore-fab]')) return; setShowUserMenu(p => !p); }}>
        <div className="relative">
          <button className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-shadow">
            {(user?.name || 'U').charAt(0)}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              {isAuth && (
                <div className="px-4 py-3 border-b border-border bg-muted/20">
                  <p className="font-medium text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
              <div className="p-1">
                {isAuth && (
                  <button onClick={() => { setTab('applications'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-left">
                    <Briefcase className="w-4 h-4 text-muted-foreground" /> My Applications
                  </button>
                )}
                <hr className="my-1 border-border" />
                {isAuth ? (
                  <button onClick={() => { logout(); navigate({ to: '/login' }); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive text-left">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                ) : (
                  <>
                    <button onClick={() => { navigate({ to: '/login' }); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 text-left">
                      <LogOut className="w-4 h-4" /> Sign In
                    </button>
                    <button onClick={() => { navigate({ to: '/register/individual' }); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-primary/10 text-primary text-left">
                      <User className="w-4 h-4" /> Create Account
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] m-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain bg-white" />
          </div>
        </div>
      )}

      <HeyleyBot />
    </div>
  );
}
