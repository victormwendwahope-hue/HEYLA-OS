import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { useNetworkStore, Applicant } from '@/store/networkStore';
import { Briefcase, MapPin, Clock, Star, Send, Users, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const freelancers = [
  { id: '1', name: 'Grace Wambui', title: 'Mobile Developer', rating: 4.9, rate: 5000, skills: ['Flutter', 'React Native'], jobs: 34 },
  { id: '2', name: 'Kevin Odhiambo', title: 'Data Analyst', rating: 4.7, rate: 4000, skills: ['Python', 'SQL', 'Tableau'], jobs: 28 },
  { id: '3', name: 'Fatuma Ali', title: 'Content Writer', rating: 4.8, rate: 2500, skills: ['SEO', 'Copywriting', 'Blogging'], jobs: 56 },
  { id: '4', name: 'Brian Kimani', title: 'DevOps Engineer', rating: 4.6, rate: 6000, skills: ['AWS', 'Docker', 'CI/CD'], jobs: 19 },
];

export default function MarketplacePage() {
  const { jobs, updateApplicant } = useNetworkStore();
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [tab, setTab] = useState<'jobs' | 'freelancers'>('jobs');

  const statusVariant = (s: string) => {
    const m: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'default'> = {
      Applied: 'info', Screening: 'warning', Interview: 'default', Offered: 'success', Hired: 'success', Rejected: 'destructive',
    };
    return m[s] || 'default';
  };

  const handleStatusChange = (jobId: string, applicantId: string, newStatus: Applicant['status']) => {
    updateApplicant(jobId, applicantId, { status: newStatus });
    toast.success(`Applicant moved to ${newStatus}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Marketplace" description="Find talent, manage applicants, and hire" />

      <div className="flex gap-1 bg-muted rounded-lg p-1 max-w-sm">
        {(['jobs', 'freelancers'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            {t === 'jobs' ? '💼 Job Listings' : '👥 Freelancers'}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="glass rounded-xl overflow-hidden">
              <div className="p-5 hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.posted}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-primary">{job.salary}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" /> {job.applicants.length} applicants
                      </div>
                      <StatusBadge status={job.type} variant="info" />
                    </div>
                    {expandedJob === job.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>

              {expandedJob === job.id && (
                <div className="border-t border-border p-5 bg-muted/5">
                  <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Applicants ({job.applicants.length})</h4>
                  {job.applicants.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No applicants yet</p>
                  ) : (
                    <div className="space-y-2">
                      {job.applicants.map((applicant) => (
                        <div key={applicant.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">{applicant.avatar}</div>
                            <div>
                              <p className="font-medium text-sm">{applicant.name}</p>
                              <p className="text-xs text-muted-foreground">{applicant.email} · Applied {applicant.appliedDate}</p>
                              {applicant.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{applicant.notes}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={applicant.status} variant={statusVariant(applicant.status)} />
                            <select
                              value={applicant.status}
                              onChange={(e) => handleStatusChange(job.id, applicant.id, e.target.value as Applicant['status'])}
                              className="px-2 py-1 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              {['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'freelancers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {freelancers.map((f) => (
            <div key={f.id} className="glass rounded-xl p-5 text-center hover:shadow-elevated transition-shadow">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-lg font-bold mx-auto mb-3">
                {f.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-semibold">{f.name}</h3>
              <p className="text-xs text-muted-foreground">{f.title}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span className="text-sm font-medium">{f.rating}</span>
                <span className="text-xs text-muted-foreground">· {f.jobs} jobs</span>
              </div>
              <p className="text-sm font-semibold text-primary mt-2">KSh {f.rate.toLocaleString()}/hr</p>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {f.skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs">{s}</span>
                ))}
              </div>
              <button className="w-full mt-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-accent transition-colors flex items-center justify-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Hire
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
