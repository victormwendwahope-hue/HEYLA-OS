import { PageHeader, StatCard, StatusBadge } from '@/components/shared/CommonUI';
import { useJobStore } from '@/store/jobStore';
import { Briefcase, Users, Calendar, FileText, Plus, X, Star, ChevronRight, Clock, Image, Link as LinkIcon, List, Gift, Settings, Upload, Loader2, DollarSign } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

type Tab = 'jobs' | 'applicants' | 'interviews' | 'compliance';

const stageVariant = (s: string) => {
  const m: Record<string, 'default' | 'info' | 'warning' | 'success' | 'destructive'> = { Applied: 'default', Screening: 'info', Interview: 'warning', Offer: 'info', Hired: 'success', Rejected: 'destructive' };
  return m[s] || 'default';
};

const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'] as const;

interface CustomField { label: string; type: 'text' | 'textarea' | 'select'; required: boolean; options?: string[]; }

export default function JobsPage() {
  const { jobs, applicants, interviews, addJob, updateJob, updateApplicant, addInterview } = useJobStore();
  const [tab, setTab] = useState<Tab>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [jForm, setJForm] = useState({
    title: '', department: '', location: '', type: 'Full-time' as any, salary: '', description: '',
    requirements: '', roles: '', benefits: '', banner: '', photo: '',
    netWorth: '', linkedinJobId: '', interviewInstructions: '', videoCallLink: '',
    customFormFields: [] as CustomField[],
  });
  const [newCustomField, setNewCustomField] = useState<CustomField>({ label: '', type: 'text', required: false, options: [] });
  const [newReq, setNewReq] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const bannerRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, target: 'banner' | 'photo') => {
    if (!file) return;
    const setLoading = target === 'banner' ? setUploadingBanner : setUploadingPhoto;
    setLoading(true);
    try {
      const result = await api.upload(file);
      setJForm({ ...jForm, [target]: result.url });
      toast.success(`${target === 'banner' ? 'Banner' : 'Photo'} uploaded`);
    } catch {
      toast.error('Upload failed');
    }
    setLoading(false);
  };

  const openJobs = jobs.filter((j) => j.status === 'Open').length;
  const totalApplicants = applicants.length;
  const scheduledInterviews = interviews.filter((i) => i.status === 'Scheduled').length;
  const hired = applicants.filter((a) => a.stage === 'Hired').length;

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jForm.title) { toast.error('Title required'); return; }
    const payload: any = {
      id: Date.now().toString(),
      title: jForm.title, department: jForm.department, location: jForm.location,
      type: jForm.type, status: 'Open', salary: jForm.salary,
      description: jForm.description,
      requirements: jForm.requirements.split('\n').filter(Boolean),
      postedDate: new Date().toISOString().split('T')[0], applicants: 0,
      roles: jForm.roles.split('\n').filter(Boolean),
      benefits: jForm.benefits.split('\n').filter(Boolean),
      netWorth: jForm.netWorth,
      banner: jForm.banner, photo: jForm.photo,
      linkedinJobId: jForm.linkedinJobId,
      interviewInstructions: jForm.interviewInstructions,
      videoCallLink: jForm.videoCallLink,
      customFormFields: jForm.customFormFields,
    };
    addJob(payload);
    setShowJobForm(false);
    setJForm({ title: '', department: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '', roles: '', benefits: '', banner: '', photo: '', netWorth: '', linkedinJobId: '', interviewInstructions: '', videoCallLink: '', customFormFields: [] });
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

  const addCustomField = () => {
    if (!newCustomField.label) { toast.error('Field label required'); return; }
    setJForm({ ...jForm, customFormFields: [...jForm.customFormFields, { ...newCustomField }] });
    setNewCustomField({ label: '', type: 'text', required: false, options: [] });
  };

  const removeCustomField = (idx: number) => {
    setJForm({ ...jForm, customFormFields: jForm.customFormFields.filter((_, i) => i !== idx) });
  };

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
              {(j as any).banner && (
                <div className="relative group mb-3">
                  <img src={(j as any).banner} alt="Job banner" className="w-full h-32 object-cover rounded-lg cursor-pointer" onClick={() => setPreviewImage((j as any).banner)} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center cursor-pointer" onClick={() => setPreviewImage((j as any).banner)}>
                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full transition-opacity">View full size</span>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {(j as any).photo
                    ? <img src={(j as any).photo} alt="Company logo" className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewImage((j as any).photo)} />
                    : <Briefcase className="w-10 h-10 text-primary p-2 bg-primary/10 rounded-lg" />}
                  <div>
                    <h3 className="font-semibold text-lg">{j.title}</h3>
                    <p className="text-sm text-muted-foreground">{j.department} • {j.location}</p>
                  </div>
                </div>
                <StatusBadge status={j.status} variant={j.status === 'Open' ? 'success' : 'default'} />
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{j.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {j.requirements.slice(0, 3).map((r, i) => (
                  <span key={i} className="px-2 py-0.5 bg-muted rounded-full text-xs">{r}</span>
                ))}
                {j.requirements.length > 3 && <span className="px-2 py-0.5 bg-muted rounded-full text-xs">+{j.requirements.length - 3}</span>}
              </div>
              {(j as any).roles && (j as any).roles.length > 0 && (
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><List className="w-3 h-3" /> { (j as any).roles.length } roles listed</div>
              )}
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
                        {(a as any).coverLetter && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{(a as any).coverLetter}</p>}
                        {a.rating > 0 && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < a.rating ? 'text-warning fill-warning' : 'text-muted'}`} />
                            ))}
                          </div>
                        )}
                        {a.notes && <p className="text-xs text-muted-foreground mt-1 italic">{a.notes}</p>}
                        {(a as any).interviewDate && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date((a as any).interviewDate).toLocaleDateString()}
                          </div>
                        )}
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4 text-sm">
                <div><span className="text-muted-foreground block text-xs">Date</span><span className="font-medium">{iv.date}</span></div>
                <div><span className="text-muted-foreground block text-xs">Time</span><span className="font-medium">{iv.time}</span></div>
                <div><span className="text-muted-foreground block text-xs">Type</span><span className="font-medium">{iv.type}</span></div>
                <div><span className="text-muted-foreground block text-xs">Interviewer</span><span className="font-medium">{iv.interviewer}</span></div>
                <div><span className="text-muted-foreground block text-xs">Link</span>{iv.type === 'Video' ? <a href="#" className="text-primary text-xs hover:underline">Join</a> : <span className="font-medium">—</span>}</div>
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

      {/* Add/Edit Job Modal */}
      {showJobForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-2xl z-10">
              <h2 className="text-lg font-bold">Post New Job</h2>
              <button onClick={() => setShowJobForm(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddJob} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-medium text-muted-foreground mb-1 block">Job Title*</label>
                  <input value={jForm.title} onChange={(e) => setJForm({ ...jForm, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
                  <input value={jForm.department} onChange={(e) => setJForm({ ...jForm, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                  <input value={jForm.location} onChange={(e) => setJForm({ ...jForm, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <select value={jForm.type} onChange={(e) => setJForm({ ...jForm, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {['Full-time', 'Part-time', 'Contract', 'Remote'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Salary Range</label>
                  <input value={jForm.salary} onChange={(e) => setJForm({ ...jForm, salary: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="e.g. KSh 80,000 - 120,000" /></div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block"><Image className="w-3 h-3 inline" /> Banner Image</label>
                  <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'banner'); }} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => bannerRef.current?.click()} disabled={uploadingBanner}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50">
                      {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {jForm.banner ? 'Change Banner' : 'Upload Banner'}
                    </button>
                    {jForm.banner && <img src={jForm.banner} alt="" className="h-10 w-20 object-cover rounded" />}
                    {jForm.banner && <button type="button" onClick={() => setJForm({ ...jForm, banner: '' })} className="text-xs text-destructive hover:underline">Remove</button>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block"><Image className="w-3 h-3 inline" /> Company Photo / Logo</label>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'photo'); }} />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50">
                      {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {jForm.photo ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {jForm.photo && <img src={jForm.photo} alt="" className="h-10 w-10 object-cover rounded" />}
                    {jForm.photo && <button type="button" onClick={() => setJForm({ ...jForm, photo: '' })} className="text-xs text-destructive hover:underline">Remove</button>}
                  </div>
                </div>
              </div>

              <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea value={jForm.description} onChange={(e) => setJForm({ ...jForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" /></div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Requirements (one per line)</label>
                <textarea value={jForm.requirements} onChange={(e) => setJForm({ ...jForm, requirements: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" placeholder="BSc in Computer Science&#10;3+ years experience&#10;..."/>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Minimum Net Worth Required</label>
                <input value={jForm.netWorth} onChange={(e) => setJForm({ ...jForm, netWorth: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" placeholder="e.g. KSh 500,000 or Not specified" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Roles & Responsibilities (one per line)</label>
                <textarea value={jForm.roles} onChange={(e) => setJForm({ ...jForm, roles: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" placeholder="Lead development team&#10;Design architecture&#10;..."/>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Benefits (one per line)</label>
                <textarea value={jForm.benefits} onChange={(e) => setJForm({ ...jForm, benefits: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" placeholder="Health insurance&#10;Remote work&#10;..."/>
              </div>

              {/* Custom Form Fields */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5"><Settings className="w-4 h-4" /> Application Form Fields</h4>
                {jForm.customFormFields.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-lg">
                    <span className="flex-1">{f.label} {f.required && <span className="text-destructive">*</span>} <span className="text-xs text-muted-foreground">({f.type})</span></span>
                    <button onClick={() => removeCustomField(i)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  <input value={newCustomField.label} onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })} placeholder="Field label"
                    className="px-2 py-1.5 rounded-lg border border-input bg-background text-xs" />
                  <select value={newCustomField.type} onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value as any })}
                    className="px-2 py-1.5 rounded-lg border border-input bg-background text-xs">
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="select">Select</option>
                  </select>
                  <div className="flex gap-1">
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={newCustomField.required} onChange={(e) => setNewCustomField({ ...newCustomField, required: e.target.checked })} /> Required</label>
                    <button onClick={addCustomField} className="px-2 py-1 bg-primary text-primary-foreground rounded-lg text-xs">Add</button>
                  </div>
                </div>
              </div>

              {/* LinkedIn & Interview */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5"><LinkIcon className="w-4 h-4" /> LinkedIn & Interview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-muted-foreground mb-1 block">LinkedIn Job ID</label>
                    <input value={jForm.linkedinJobId} onChange={(e) => setJForm({ ...jForm, linkedinJobId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Video Call Link</label>
                    <input value={jForm.videoCallLink} onChange={(e) => setJForm({ ...jForm, videoCallLink: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div>
                </div>
                <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Interview Instructions</label>
                  <textarea value={jForm.interviewInstructions} onChange={(e) => setJForm({ ...jForm, interviewInstructions: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none" /></div>
              </div>

              <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-card pb-2">
                <button type="button" onClick={() => setShowJobForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    </div>
  );
}
