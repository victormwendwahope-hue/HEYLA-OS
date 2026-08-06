import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, UserCheck, Send, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'

const PB = '#0A66FF'
const DN = '#071B4D'

export default function ReferencesPage() {
  const [refs, setRefs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({})
  const [responses, setResponses] = useState<Record<string, string>>({})

  useEffect(() => { fetchRefs() }, [])

  const fetchRefs = async () => {
    setLoading(true)
    try {
      const res: any = await api.network.references.list()
      if (Array.isArray(res)) setRefs(res)
      else setRefs([...(res?.mine || []).map((r: any) => ({ ...r })), ...(res?.toReview || []).map((r: any) => ({ ...r, pendingMe: true }))])
    } catch { }
    finally { setLoading(false) }
  }

  const request = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.network.references.request(form)
      toast.success('Reference request sent')
      setShowForm(false)
      setForm({})
      fetchRefs()
    } catch { toast.error('Failed to send request') }
  }

  const submit = async (id: string) => {
    try {
      await api.network.references.submit(id, { comment: responses[id] })
      toast.success('Reference submitted')
      fetchRefs()
    } catch { toast.error('Failed to submit reference') }
  }

  const verify = async (id: string) => {
    try {
      await api.network.references.verify(id)
      toast.success('Reference verified')
      fetchRefs()
    } catch { toast.error('Failed to verify') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><UserCheck className="w-6 h-6" style={{ color: PB }} /> References</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Request and give verified references with past employers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2" style={{ background: PB }}><Send className="w-4 h-4" /> Request Reference</button>
      </div>

      {showForm && (
        <form onSubmit={request} className="bg-white rounded-2xl border p-6 shadow-sm grid sm:grid-cols-2 gap-4" style={{ borderColor: '#E2E8F0' }}>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Referee Name</label>
            <input required value={form.reviewerName || ''} onChange={e => setForm({ ...form, reviewerName: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Referee Email</label>
            <input required type="email" value={form.reviewerEmail || ''} onChange={e => setForm({ ...form, reviewerEmail: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="sm:col-span-2"><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Relationship (e.g. Former Supervisor)</label>
            <input value={form.relationship || ''} onChange={e => setForm({ ...form, relationship: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Send Request</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : refs.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: '#64748B' }}>No references yet. Request one from a past employer or colleague.</div>
      ) : (
        <div className="space-y-3">
          {refs.map((r: any) => (
            <div key={r.id} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-semibold" style={{ color: DN }}>{r.reviewerName}</span>
                  <span className="text-xs ml-2" style={{ color: '#94A3B8' }}>{r.reviewerRole || r.relationship}</span>
                </div>
                <div className="flex items-center gap-2">
                  {r.status === 'requested' && <span className="text-[11px] text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">Awaiting response</span>}
                  {r.status === 'verified' && <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5"><CheckCircle2 className="w-3.5 h-3.5" />Verified</span>}
                  {r.status === 'declined' && <span className="flex items-center gap-1 text-[11px] text-red-700 bg-red-50 rounded-full px-2 py-0.5"><XCircle className="w-3.5 h-3.5" />Declined</span>}
                </div>
              </div>
              {r.company && <p className="text-xs mt-1" style={{ color: '#64748B' }}>{r.company}</p>}
              {r.comment && <p className="text-sm mt-3 italic" style={{ color: '#64748B' }}>“{r.comment}”</p>}
              {r.rating && <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>Rating: {r.rating}/5 · {r.averageRating}/5 avg</p>}
              {r.status === 'submitted' && (
                <button onClick={() => verify(r.id)} style={{ color: PB }} className="mt-3 text-sm font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Accept & verify this reference</button>
              )}
              {r.pendingMe && (
                <div className="mt-3">
                  <textarea value={responses[r.id] || ''} onChange={e => setResponses({ ...responses, [r.id]: e.target.value })} placeholder="Write your recommendation..." className="w-full px-3 py-2 rounded-xl border text-sm min-h-[70px]" style={{ borderColor: '#E2E8F0' }} />
                  <button onClick={() => submit(r.id)} style={{ background: PB }} className="mt-2 px-4 py-2 rounded-xl text-xs font-medium text-white">Submit Reference</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}