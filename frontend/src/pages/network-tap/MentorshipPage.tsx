import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, GraduationCap, Check, X, Send } from 'lucide-react'

const PB = '#0A66FF'
const DN = '#071B4D'

export default function MentorshipPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [goal, setGoal] = useState('')

  useEffect(() => { fetchMentorship() }, [])

  const fetchMentorship = async () => {
    setLoading(true)
    try {
      const [s, m]: any = await Promise.all([
        api.network.mentorship.list(),
        api.network.mentorship.mentors(),
      ])
      const sessions = (Array.isArray(s) ? s : [...(s?.asMentor || []), ...(s?.asMentee || [])])
        .map((x: any) => ({ ...x, requiresAction: x.status === 'pending' && !!x.isMentor }))
      setSessions(sessions)
      setMentors(Array.isArray(m) ? m : m?.mentors || [])
    } catch { }
    finally { setLoading(false) }
  }

  const request = async (mentorId: string) => {
    try {
      await api.network.mentorship.request({ mentorId, goal })
      toast.success('Mentorship request sent')
      setGoal('')
      fetchMentorship()
    } catch { toast.error('Failed to send request') }
  }

  const respond = async (id: string, accept: boolean) => {
    try {
      await api.network.mentorship.respond(id, accept)
      toast.success(accept ? 'Session accepted' : 'Session declined')
      fetchMentorship()
    } catch { toast.error('Failed to respond') }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><GraduationCap className="w-6 h-6" style={{ color: PB }} /> Mentorship</h1>
        <p className="text-sm" style={{ color: '#64748B' }}>Learn from experienced tradespeople and professionals</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>What are you working toward? (optional)</label>
              <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Master welding certification, start a contracting business" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
            </div>
            {mentors.length === 0 && <div className="sm:col-span-2 text-center py-10 text-sm" style={{ color: '#64748B' }}>No mentors available yet.</div>}
            {mentors.map((m: any) => (
              <div key={m.userId || m.id} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: PB }}>{(m.name || '?').charAt(0)}</div>
                  <div>
                    <span className="font-semibold" style={{ color: DN }}>{m.name}</span>
                    {m.headline && <p className="text-xs" style={{ color: '#64748B' }}>{m.headline}</p>}
                  </div>
                </div>
                {m.mentorBio && <p className="text-xs mt-3 line-clamp-3" style={{ color: '#94A3B8' }}>{m.mentorBio}</p>}
                {m.mentorAreas && <p className="text-[11px] mt-2" style={{ color: PB }}>{m.mentorAreas}</p>}
                <button onClick={() => request(m.userId)} style={{ background: PB }} className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-medium text-white rounded-lg py-2"><Send className="w-3.5 h-3.5" /> Request Session</button>
              </div>
            ))}
          </div>

          <div>
            <h2 className="font-bold mb-3" style={{ color: DN }}>Your Sessions</h2>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-sm bg-white rounded-2xl border" style={{ color: '#64748B', borderColor: '#E2E8F0' }}>No mentorship sessions yet.</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s: any) => (
                  <div key={s.id} className="bg-white rounded-2xl border p-5 shadow-sm flex items-center justify-between flex-wrap gap-3" style={{ borderColor: '#E2E8F0' }}>
                    <div>
                      <span className="font-semibold" style={{ color: DN }}>{s.mentorName || s.menteeName || 'Session'}</span>
                      {s.goal && <p className="text-xs mt-1" style={{ color: '#64748B' }}>{s.goal}</p>}
                      <span className="text-[11px] mt-1 inline-block rounded-full px-2 py-0.5 bg-slate-100 font-medium" style={{ color: DN }}>{(s.status || 'pending').toUpperCase()}</span>
                    </div>
                    {s.status === 'pending' && s.requiresAction && (
                      <div className="flex gap-2">
                        <button onClick={() => respond(s.id, true)} style={{ background: PB }} className="flex items-center gap-1 text-xs text-white rounded-lg px-3 py-1.5"><Check className="w-3.5 h-3.5" /> Accept</button>
                        <button onClick={() => respond(s.id, false)} className="flex items-center gap-1 text-xs border rounded-lg px-3 py-1.5 text-red-500"><X className="w-3.5 h-3.5" /> Decline</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}