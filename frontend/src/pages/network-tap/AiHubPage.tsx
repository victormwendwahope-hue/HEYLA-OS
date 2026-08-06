import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Sparkles, Briefcase, FileText, TrendingUp, RefreshCw } from 'lucide-react'

const PB = '#0A66FF'
const DN = '#071B4D'

export default function AiHubPage() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])
  const [coach, setCoach] = useState<any>(null)
  const [resume, setResume] = useState<any>(null)
  const [tab, setTab] = useState<'jobs' | 'coach' | 'resume'>('jobs')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [j, c] = await Promise.all([
        api.network.matchedJobs().catch(() => []),
        api.network.careerCoach().catch(() => null),
      ])
      setJobs(Array.isArray(j) ? j : j?.jobs || [])
      setCoach(c)
    } catch { }
    finally { setLoading(false) }
  }

  const generateResume = async () => {
    try {
      const r = await api.network.resume('ats')
      setResume(r)
      toast.success('Resume generated')
    } catch { toast.error('Failed to generate resume') }
  }

  const Tabs = () => (
    <div className="flex gap-2 flex-wrap">
      {([
        ['jobs', 'Matched Jobs', Briefcase],
        ['coach', 'Career Coach', TrendingUp],
        ['resume', 'CV / Resume', FileText],
      ] as const).map(([key, label, Icon]) => (
        <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${tab === key ? 'text-white' : 'bg-white border'}`} style={tab === key ? { background: PB } : { borderColor: '#E2E8F0', color: DN }}>
          <Icon className="w-4 h-4" />{label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><Sparkles className="w-6 h-6" style={{ color: PB }} /> AI Career Hub</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Your personal AI career coach, matched jobs and resume generator</p>
        </div>
        <Tabs />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          {tab === 'jobs' && (
            jobs.length === 0 ? (
              <div className="text-center py-16 text-sm bg-white rounded-2xl border" style={{ color: '#64748B', borderColor: '#E2E8F0' }}>No matched jobs yet. Complete your passport to unlock AI job matching.</div>
            ) : (
              <div className="space-y-3">
                {jobs.map((j: any) => (
                  <div key={j.id} className="bg-white rounded-2xl border p-5 shadow-sm flex items-center justify-between flex-wrap gap-3" style={{ borderColor: '#E2E8F0' }}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold" style={{ color: DN }}>{j.title}</span>
                        {j.matchScore && <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">{j.matchScore}% match</span>}
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{j.company} {j.location && `· ${j.location}`}</p>
                      {j.salary && <p className="text-xs mt-1 font-medium" style={{ color: PB }}>{j.salary}</p>}
                    </div>
                    <a href="/network-tap/jobs" style={{ background: PB }} className="px-4 py-2 rounded-xl text-xs font-medium text-white">View Job</a>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'coach' && (
            coach ? (
              <div className="bg-gradient-to-br rounded-2xl border p-8 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${DN} 0%, ${PB} 100%)` }}>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="font-bold text-lg">Your Career Recommendations</h2>
                </div>
                {coach.roadmap && coach.roadmap.length > 0 ? (
                  <div className="grid gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Advice</span>
                      <p className="text-sm mt-1 opacity-95">{coach.advice}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Career Roadmap — {coach.tradeLabel}</span>
                      <div className="mt-2 space-y-1.5">
                        {coach.roadmap.map((r: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${r.reached ? 'bg-emerald-400' : 'bg-white/40'}`} />
                            <span className={r.currentStep ? 'font-semibold' : 'opacity-90'}>{r.role} {r.reached && '✓'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {coach.skillGaps && coach.skillGaps.length > 0 && (
                      <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Skill Gaps to Close</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {coach.skillGaps.slice(0, 8).map((s: any, i: number) => (
                            <span key={i} className="text-xs bg-white/15 rounded-full px-3 py-1">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {coach.currentSalaryRange && (
                      <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Salary Benchmark</span>
                        <p className="text-sm mt-1 opacity-95">Current: KSh {Number(coach.currentSalaryRange.low).toLocaleString()} – {Number(coach.currentSalaryRange.high).toLocaleString()}{coach.nextSalaryRange && <span> · Next: KES {Number(coach.nextSalaryRange.low).toLocaleString()} – {Number(coach.nextSalaryRange.high).toLocaleString()}</span>}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm opacity-90">{coach.advice}</p>
                )}
                <button onClick={loadAll} className="mt-6 flex items-center gap-2 text-xs font-medium bg-white text-blue-700 rounded-xl px-4 py-2"><RefreshCw className="w-3.5 h-3.5" /> Refresh Advice</button>
              </div>
            ) : (
              <div className="text-center py-16 text-sm bg-white rounded-2xl border" style={{ color: '#64748B', borderColor: '#E2E8F0' }}>Career coach insights will appear here once your profile has enough data.</div>
            )
          )}

          {tab === 'resume' && (
            <div className="bg-white rounded-2xl border p-8 shadow-sm space-y-5" style={{ borderColor: '#E2E8F0' }}>
              <div className="text-center space-y-3">
                <FileText className="w-10 h-10 mx-auto" style={{ color: PB }} />
                <h2 className="font-bold text-lg" style={{ color: DN }}>Generate a professional CV</h2>
                <p className="text-sm max-w-md mx-auto" style={{ color: '#64748B' }}>We'll build a recruiter-ready resume from your passport, worklog, references and verified credentials.</p>
              </div>
              {resume?.resume ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-emerald-600">✓ Resume generated ({resume.format})</p>
                    <button onClick={() => setResume(null)} style={{ color: PB }} className="text-sm font-medium">Regenerate</button>
                  </div>
                  <pre className="text-xs leading-relaxed whitespace-pre-wrap bg-slate-50 border rounded-xl p-4 max-h-[480px] overflow-auto" style={{ borderColor: '#E2E8F0' }}>{resume.resume}</pre>
                </div>
              ) : (
                <div className="text-center">
                  <button onClick={generateResume} style={{ background: PB }} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Generate My Resume</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}