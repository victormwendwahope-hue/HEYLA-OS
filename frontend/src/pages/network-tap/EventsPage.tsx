import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, CalendarDays, MapPin, CheckCircle2, Plus } from 'lucide-react'

const PB = '#0A66FF'
const DN = '#071B4D'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res: any = await api.network.events.list()
      setEvents(Array.isArray(res) ? res : res?.events || [])
    } catch { }
    finally { setLoading(false) }
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.network.events.create({ ...form, startTime: new Date(form.date).toISOString() })
      toast.success('Event created')
      setShowForm(false)
      setForm({})
      fetchEvents()
    } catch { toast.error('Failed to create event') }
  }

  const register = async (id: string) => {
    try {
      await api.network.events.register(id)
      toast.success('Registered for event')
      fetchEvents()
    } catch { toast.error('Failed to register') }
  }

  const checkin = async (id: string) => {
    try {
      await api.network.events.checkin(id)
      toast.success('Checked in')
      fetchEvents()
    } catch { toast.error('Check-in failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><CalendarDays className="w-6 h-6" style={{ color: PB }} /> Events</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Workshops, job fairs and networking meetups</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2" style={{ background: PB }}><Plus className="w-4 h-4" /> Create Event</button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-2xl border p-6 shadow-sm grid sm:grid-cols-2 gap-4" style={{ borderColor: '#E2E8F0' }}>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Event Title</label>
            <input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Location</label>
            <input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Date</label>
            <input required type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Description</label>
            <input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Create Event</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: '#64748B' }}>No events scheduled yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev: any) => (
            <div key={ev.id} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
              <h3 className="font-semibold" style={{ color: DN }}>{ev.name || ev.title}</h3>
              <div className="flex items-center gap-1 text-xs mt-2" style={{ color: '#64748B' }}><CalendarDays className="w-3.5 h-3.5" />{ev.startTime || ev.date ? new Date(ev.startTime || ev.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
              {ev.location && <div className="flex items-center gap-1 text-xs mt-1" style={{ color: '#64748B' }}><MapPin className="w-3.5 h-3.5" />{ev.location}</div>}
              {ev.description && <p className="text-xs mt-3 line-clamp-3" style={{ color: '#94A3B8' }}>{ev.description}</p>}
              <div className="mt-4">
                {ev.myStatus ? (
                  <button onClick={() => checkin(ev.id)} className="w-full flex items-center justify-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-xl py-2"><CheckCircle2 className="w-4 h-4" />Registered — Check in (capacity {ev.attendeeCount || 0})</button>
                ) : (
                  <button onClick={() => register(ev.id)} style={{ background: PB }} className="w-full text-xs font-medium text-white rounded-lg py-2">Register</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}