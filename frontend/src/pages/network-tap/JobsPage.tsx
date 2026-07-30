import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

const PB = '#0A66FF'
const DN = '#071B4D'

const JOB_CATEGORIES = [
  { name: 'Carpentry', icon: '🔨', keywords: 'carpentry,wood,joinery' },
  { name: 'Electrical', icon: '⚡', keywords: 'electrical,wiring,solar' },
  { name: 'Plumbing', icon: '🔧', keywords: 'plumbing,pipe,plumber' },
  { name: 'Welding', icon: '🔥', keywords: 'welding,weld,fabrication' },
  { name: 'Construction', icon: '🏗️', keywords: 'construction,masonry,building' },
  { name: 'Solar Technician', icon: '☀️', keywords: 'solar,pv,renewable' },
  { name: 'Mechanical', icon: '⚙️', keywords: 'mechanical,machine,engine' },
  { name: 'Automotive', icon: '🚗', keywords: 'automotive,auto,mechanic' },
  { name: 'ICT Support', icon: '💻', keywords: 'ict,computer,network,tech' },
  { name: 'Refrigeration & AC', icon: '❄️', keywords: 'refrigeration,ac,cooling' },
  { name: 'Painting & Finishing', icon: '🎨', keywords: 'painting,paint,finishing' },
  { name: 'Driver & Operator', icon: '🚛', keywords: 'driver,machine operator,logistics' },
  { name: 'Attachment', icon: '📎', keywords: 'attachment,industrial attachment' },
  { name: 'Internship', icon: '🎓', keywords: 'internship,intern,trainee' },
  { name: 'Graduate Trainee', icon: '📋', keywords: 'graduate trainee,graduate' },
  { name: 'Apprenticeship', icon: '🔨', keywords: 'apprenticeship,apprentice' },
]

const EMPLOYMENT_TYPES = ['all', 'full_time', 'part_time', 'contract', 'freelance', 'internship', 'attachment', 'graduate_trainee']

const EMPLOYMENT_LABELS: Record<string, string> = {
  all: 'All Types', full_time: 'Full-Time', part_time: 'Part-Time',
  contract: 'Contract', freelance: 'Freelance', internship: 'Internship',
  attachment: 'Attachment', graduate_trainee: 'Graduate Trainee',
}

function PostJobModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '', employmentType: 'full_time', location: '', isRemote: false,
    county: '', industry: '', salaryRange: '', duration: '',
    experienceLevel: 'entry', requiredSkills: '', description: '',
    responsibilities: '', requirements: '', deadline: '',
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'candidates'>('form')

  const handleSubmit = async () => {
    if (!form.title) { toast.error('Job title is required'); return }
    setLoading(true)
    try {
      const job = await api.ntv.job.create(form)
      toast.success('Job posted!')
      onCreated()
      setStep('candidates')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to post job')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {step === 'form' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: DN }}>Post a Vacancy</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Job Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} placeholder="e.g. Plumber, Electrician, Welder" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Employment Type</label>
                <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }}>
                  {Object.entries(EMPLOYMENT_LABELS).filter(([k]) => k !== 'all').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Experience Level</label>
                <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }}>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="graduate">Graduate</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} placeholder="e.g. Nairobi" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Salary Range</label>
                <input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} placeholder="e.g. KES 30,000 - 50,000" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Industry / Trade</label>
                <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} placeholder="e.g. Plumbing, Electrical" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Required Skills (comma separated)</label>
                <input value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} placeholder="e.g. pipe fitting, welding, leak repair" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-xl border text-sm resize-none" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Requirements</label>
                <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border text-sm resize-none" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-700 mb-1 block">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t" style={{ borderColor: '#E2E8F0' }}>
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 rounded-xl text-sm font-medium shadow-sm text-white disabled:opacity-50" style={{ background: PB }}>
                {loading ? 'Posting...' : 'Post Vacancy'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#DCFCE7' }}>
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: DN }}>Vacancy Posted!</h2>
            <p className="text-sm text-slate-500 mb-4">Candidates with matching skills will be suggested to you automatically.</p>
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-medium shadow-sm text-white" style={{ background: PB }}>View Job Listings</button>
          </div>
        )}
      </div>
    </div>
  )
}

function CandidatesModal({ jobId, onClose }: { jobId: number; onClose: () => void }) {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)

  useEffect(() => {
    api.ntv.job.candidates(String(jobId)).then((res: any) => {
      setJob(res.job)
      setCandidates(res.candidates || [])
    }).catch(() => toast.error('Failed to load candidates')).finally(() => setLoading(false))
  }, [jobId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: DN }}>Suggested Candidates</h2>
              {job && <p className="text-sm text-slate-500">For: {job.title}</p>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-sm text-slate-500">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-medium text-slate-600">No matching candidates found</p>
              <p className="text-xs text-slate-400 mt-1">Candidates with matching skills will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((c: any, i: number) => {
                const p = c.profile
                return (
                  <div key={p.id || i} className="p-4 rounded-xl border hover:shadow-sm transition-shadow" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white" style={{ background: PB }}>
                        {(p.name || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm" style={{ color: DN }}>{p.name}</p>
                            <p className="text-xs text-slate-500">{p.headline || 'Skilled Professional'}</p>
                            <p className="text-xs text-slate-400">{p.location || ''} {p.availability ? `· ${p.availability}` : ''}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold" style={{ color: c.matchCount > 0 ? PB : '#94A3B8' }}>
                              {c.score}%
                            </div>
                            <div className="text-xs text-slate-400">match</div>
                          </div>
                        </div>
                        {c.matchedSkills && c.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.matchedSkills.map((s: string) => (
                              <span key={s} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#EEF2FF', color: PB }}>{s}</span>
                            ))}
                          </div>
                        )}
                        {p.skills && p.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.skills.filter((s: any) => !c.matchedSkills?.includes(s.name)).slice(0, 5).map((s: any) => (
                              <span key={s.id || s.name} className="px-2 py-0.5 rounded text-xs" style={{ background: '#F1F5F9', color: '#64748B' }}>{s.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NetworkTapJobs() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [showPostJob, setShowPostJob] = useState(false)
  const [showCandidates, setShowCandidates] = useState<number | null>(null)
  const [showApply, setShowApply] = useState<any>(null)
  const [applyNote, setApplyNote] = useState('')

  const isCompany = user?.accountType === 'company' || !!user?.company

  const fetchJobs = () => {
    setLoading(true)
    api.ntv.job.list({ type: activeType !== 'all' ? activeType : undefined, search: search || undefined })
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchJobs() }, [activeType])

  const handleApply = async () => {
    if (!showApply) return
    try {
      await api.ntv.job.apply(String(showApply.id), { coverNote: applyNote })
      toast.success('Application submitted!')
      setShowApply(null)
      setApplyNote('')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to apply')
    }
  }

  const EMP_TYPE_LABEL: Record<string, string> = {
    full_time: 'Full-Time', part_time: 'Part-Time', contract: 'Contract',
    freelance: 'Freelance', internship: 'Internship', attachment: 'Attachment',
    graduate_trainee: 'Graduate Trainee',
  }

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: DN }}>Skilled Jobs & Technical Opportunities</h1>
            <p className="text-sm text-slate-500">Find internships, attachments, and skilled jobs worldwide</p>
          </div>
          <div className="flex gap-2">
            {isCompany && (
              <button onClick={() => setShowPostJob(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm hover:opacity-90" style={{ background: DN }}>
                + Post a Vacancy
              </button>
            )}
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchJobs()} placeholder="Search jobs..." className="w-full sm:w-56 px-4 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2" style={{ borderColor: '#E2E8F0', '--tw-ring-color': PB } as React.CSSProperties} />
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {EMPLOYMENT_TYPES.map((t) => (
            <button key={t} onClick={() => setActiveType(t)} className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeType === t ? 'text-white shadow-sm' : 'bg-white border hover:bg-gray-50'}`} style={{ background: activeType === t ? PB : 'white', borderColor: '#E2E8F0', color: activeType === t ? 'white' : '#475569' }}>
              {EMPLOYMENT_LABELS[t] || t}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-sm text-slate-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-medium text-slate-500">No jobs found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting filters or check back later</p>
              {isCompany && (
                <button onClick={() => setShowPostJob(true)} className="mt-4 px-5 py-2 rounded-xl text-sm font-medium text-white shadow-sm" style={{ background: PB }}>
                  Post the First Vacancy
                </button>
              )}
            </div>
          ) : jobs.map((job: any) => {
            const skills = (job.requiredSkills || '').split(',').map((s: string) => s.trim()).filter(Boolean)
            const c = job.company || {}
            return (
              <div key={job.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0" style={{ background: PB }}>{(c.name || 'J')[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold" style={{ color: DN }}>{job.title}</h3>
                        <p className="text-sm text-slate-600">{c.name || 'Company'} · {job.location || 'Various'}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: '#EEF2FF', color: PB }}>{EMP_TYPE_LABEL[job.employmentType] || job.employmentType}</span>
                          {job.salaryRange && <span>{job.salaryRange}</span>}
                          {job.experienceLevel && <span>Level: {job.experienceLevel}</span>}
                          {job.postedDate && <span>{new Date(job.postedDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {isCompany ? (
                          <button onClick={() => setShowCandidates(job.id)} className="px-4 py-2 rounded-xl text-sm font-medium border hover:bg-gray-50" style={{ borderColor: PB, color: PB }}>
                            Find Candidates
                          </button>
                        ) : (
                          <button onClick={() => setShowApply(job)} className="px-5 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 shadow-sm" style={{ background: PB }}>
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {skills.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#F1F5F9', color: '#475569' }}>{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onCreated={() => { setShowPostJob(false); fetchJobs() }} />}
      {showCandidates && <CandidatesModal jobId={showCandidates} onClose={() => setShowCandidates(null)} />}

      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowApply(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold text-lg mb-2" style={{ color: DN }}>Apply with Profile</h2>
            <p className="text-sm mb-4 text-slate-500">Applying for: <span className="font-medium" style={{ color: DN }}>{showApply.title}</span></p>
            <div className="space-y-3 mb-4">
              {['Professional Profile', 'Skills Summary', 'Availability Status', 'CV'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ background: '#10B981' }}>✓</div>
                  <span style={{ color: DN }}>{item}</span>
                </div>
              ))}
            </div>
            <textarea value={applyNote} onChange={(e) => setApplyNote(e.target.value)} placeholder="Add a message to the employer (optional)..." rows={3} className="w-full px-3 py-2 rounded-xl border text-sm resize-none mb-4" style={{ borderColor: '#E2E8F0' }} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowApply(null)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
              <button onClick={handleApply} className="px-5 py-2 rounded-xl text-sm font-medium text-white shadow-sm" style={{ background: PB }}>Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
