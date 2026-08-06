import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, ClipboardList, UserCheck, Plus, Trash2, Send, CheckCircle2 } from 'lucide-react'

const PB = '#0A66FF'
const DN = '#071B4D'

const fmt = (s: string) => (s || '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function WorklogPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => { fetchWorklog() }, [])

  const fetchWorklog = async () => {
    setLoading(true)
    try {
      const res: any = await api.network.worklog.list()
      if (Array.isArray(res)) setEntries(res)
      else setEntries(res?.entries || [])
    } catch { }
    finally { setLoading(false) }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.network.worklog.create(form)
      toast.success('Worklog entry added')
      setShowForm(false)
      setForm({})
      fetchWorklog()
    } catch { toast.error('Failed to add entry') }
  }

  const remove = async (id: string) => {
    try {
      await api.network.worklog.remove(id)
      setEntries(entries.filter(e => e.id !== id))
      toast.success('Entry removed')
    } catch { toast.error('Failed to remove entry') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><ClipboardList className="w-6 h-6" style={{ color: PB }} /> Worklog</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Every job you complete builds your verified record</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2" style={{ background: PB }}><Plus className="w-4 h-4" /> Add Entry</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl border p-6 shadow-sm grid sm:grid-cols-2 gap-4" style={{ borderColor: '#E2E8F0' }}>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Employer / Company</label>
            <input required value={form.employer || ''} onChange={e => setForm({ ...form, employer: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Role</label>
            <input value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Project Name</label>
            <input value={form.projectName || ''} onChange={e => setForm({ ...form, projectName: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Location</label>
            <input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Start Date</label>
            <input type="date" value={form.startDate || ''} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>End Date</label>
            <input type="date" value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Hours Worked</label>
            <input type="number" value={form.hoursWorked || ''} onChange={e => setForm({ ...form, hoursWorked: +e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Output / Deliverables</label>
            <input value={form.output || ''} onChange={e => setForm({ ...form, output: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="sm:col-span-2"><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Supervisor Review</label>
            <textarea value={form.supervisorReview || ''} onChange={e => setForm({ ...form, supervisorReview: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm min-h-[70px]" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Save Entry</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: '#64748B' }}>No worklog entries yet. Add your first job to start building your record.</div>
      ) : (
        <div className="space-y-3">
          {entries.map((e: any) => (
            <div key={e.id} className="bg-white rounded-2xl border p-5 shadow-sm flex items-start justify-between" style={{ borderColor: '#E2E8F0' }}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold" style={{ color: DN }}>{e.role || e.projectName || 'Position'}</span>
                  {e.verified && <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5"><CheckCircle2 className="w-3.5 h-3.5" />Verified by employer</span>}
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>{e.employer} {e.projectName && `· ${e.projectName}`} {e.location && `· ${e.location}`}</p>
                {e.startDate && <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{e.startDate} — {e.endDate || 'Present'}</p>}
                {e.hoursWorked ? <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{e.hoursWorked} hours</p> : null}
                {e.output && <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>{e.output}</p>}
                {e.supervisorReview && <p className="text-xs mt-2 italic" style={{ color: '#94A3B8' }}>“{e.supervisorReview}”</p>}
              </div>
              <button onClick={() => remove(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}