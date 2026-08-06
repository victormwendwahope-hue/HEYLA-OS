import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, BadgeCheck, XCircle, Clock, Plus } from 'lucide-react'

const PB = '#0A66FF'
const DN = '#071B4D'

const docTypes = ['government_id', 'passport', 'face', 'email', 'phone', 'employer', 'company', 'education', 'nita', 'trade_test', 'professional_membership', 'driving_licence', 'work_permit', 'tax_registration', 'other']
const fmt = (s: string) => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const statusBadge = (s: string) => {
  if (s === 'verified') return <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50"><BadgeCheck className="w-3.5 h-3.5" />Verified</span>
  if (s === 'pending') return <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50"><Clock className="w-3.5 h-3.5" />Pending</span>
  if (s === 'rejected') return <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-red-700 bg-red-50"><XCircle className="w-3.5 h-3.5" />Rejected</span>
  return <span className="rounded-full px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100">{fmt(s) || 'Draft'}</span>
}

export default function VerificationsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({ verificationType: 'government_id' })

  useEffect(() => { fetchVerifications() }, [])

  const fetchVerifications = async () => {
    setLoading(true)
    try {
      const res: any = await api.network.verifications.list()
      setItems(Array.isArray(res) ? res : res?.verifications || [])
    } catch { }
    finally { setLoading(false) }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.network.verifications.create(form)
      toast.success('Verification submitted')
      setShowForm(false)
      setForm({ verificationType: 'government_id' })
      fetchVerifications()
    } catch { toast.error('Failed to submit verification') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><ShieldCheck className="w-6 h-6" style={{ color: PB }} /> Verifications</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Documents and credentials Heyla has verified for you</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2" style={{ background: PB }}><Plus className="w-4 h-4" /> New Verification</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl border p-6 shadow-sm flex flex-wrap items-end gap-4" style={{ borderColor: '#E2E8F0' }}>
          <div className="min-w-[200px] flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Verification Type</label>
            <select value={form.verificationType} onChange={e => setForm({ ...form, verificationType: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }}>
              {docTypes.map(d => <option key={d} value={d}>{fmt(d)}</option>)}
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Issuer Name</label>
            <input value={form.issuerName || ''} onChange={e => setForm({ ...form, issuerName: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Document Reference</label>
            <input value={form.documentRef || ''} onChange={e => setForm({ ...form, documentRef: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Submit</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: '#64748B' }}>No verifications yet. Submit your first document to build trust.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((v: any) => (
            <div key={v.id} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold" style={{ color: DN }}>{fmt(v.type || v.docType)}</span>
                {statusBadge(v.status)}
              </div>
              {v.documentRef && <p className="text-xs mb-1" style={{ color: '#64748B' }}>Ref: <span className="font-medium" style={{ color: DN }}>{v.documentRef}</span></p>}
              {v.issuerName && <p className="text-xs" style={{ color: '#64748B' }}>Issued by: <span className="font-medium" style={{ color: DN }}>{v.issuerName}</span></p>}
              {v.note && <p className="text-[11px] mt-2 italic" style={{ color: '#94A3B8' }}>{v.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}