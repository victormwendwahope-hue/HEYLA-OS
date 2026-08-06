import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, Briefcase, Globe, Wallet, Plane, Save, X } from 'lucide-react'

const PB = '#0A66FF'
const DN = '#071B4D'

const TRADE_CATEGORIES = ['welder', 'plumber', 'carpenter', 'electrician', 'mechanic', 'excavator_operator', 'crane_operator', 'driver', 'security_guard', 'machine_operator', 'mason', 'painter', 'steel_fixer', 'surveyor', 'foreman', 'site_engineer', 'nurse', 'caregiver', 'chef', 'hospitality_staff', 'cleaner', 'farmer', 'fisherman', 'miner', 'logistics', 'technician', 'hr', 'finance', 'ict', 'lawyer', 'doctor', 'teacher', 'engineer', 'researcher', 'entrepreneur', 'consultant']
const AVAILABILITY = ['open_to_work', 'employed', 'freelance', 'internship', 'student', 'daily_labour', 'seasonal']

const fmt = (s: string) => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function PassportPage() {
  const user = useAuthStore((s) => s.user)
  const [passport, setPassport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => { fetchPassport() }, [])

  const fetchPassport = async () => {
    setLoading(true)
    try {
      const p = await api.network.passport.get()
      setPassport(p)
      setForm({ ...p, languages: Array.isArray(p.languages) ? p.languages.join(', ') : (p.languages || '') })
    } catch { }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...form, languages: form.languages }
      const updated = await api.network.passport.update(payload)
      setPassport(updated)
      setEditing(false)
      toast.success('Passport updated')
    } catch { toast.error('Failed to update passport') }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading skills passport...</p>
      </div>
    </div>
  )

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="p-4 rounded-xl" style={{ background: '#F4F8FF' }}>
      <p className="text-[11px] font-medium mb-0.5" style={{ color: '#64748B' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: DN }}>{value || '—'}</p>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><ShieldCheck className="w-6 h-6" style={{ color: PB }} /> Digital Skills Passport</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Your lifelong verified skills record — owned by you, verified by Heyla</p>
        </div>
        <button onClick={() => setEditing(!editing)} className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2" style={{ background: PB }}>
          {editing ? <><X className="w-4 h-4" /> Cancel</> : <><Save className="w-4 h-4" /> Edit Passport</>}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Trade Category" value={passport?.tradeCategory ? fmt(passport.tradeCategory) : ''} />
        <Field label="Years Experience" value={passport?.yearsOfExperience ? `${passport.yearsOfExperience} yrs` : ''} />
        <Field label="Availability" value={passport?.availability ? fmt(passport.availability) : ''} />
        <Field label="Expected Salary" value={passport?.expectedSalary ? `KSh ${Number(passport.expectedSalary).toLocaleString()}` : ''} />
        <Field label="Nationality" value={passport?.nationality} />
        <Field label="Languages" value={Array.isArray(passport?.languages) ? passport.languages.join(', ') : passport?.languages} />
        <Field label="Passport Status" value={passport?.passportStatus} />
        <Field label="Visa Status" value={passport?.visaStatus} />
        <Field label="Relocate" value={passport?.willingToRelocate ? 'Willing' : 'No'} />
        <Field label="Relocation Countries" value={Array.isArray(passport?.relocationCountries) ? passport.relocationCountries.join(', ') : passport?.relocationCountries} />
        <Field label="Notice Period" value={passport?.noticePeriod ? `${passport.noticePeriod} days` : ''} />
        <Field label="ID Verified" value={passport?.idVerified ? '✓ Verified' : 'Not verified'} />
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <h2 className="font-semibold mb-4" style={{ color: DN }}>Edit Passport</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Trade Category</label>
              <select value={form.tradeCategory || ''} onChange={e => setForm({ ...form, tradeCategory: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }}>
                <option value="">Select trade</option>
                {TRADE_CATEGORIES.map(c => <option key={c} value={c}>{fmt(c)}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Availability</label>
              <select value={form.availability || ''} onChange={e => setForm({ ...form, availability: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }}>
                <option value="">Select</option>
                {AVAILABILITY.map(a => <option key={a} value={a}>{fmt(a)}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Years of Experience</label>
              <input type="number" value={form.yearsOfExperience || ''} onChange={e => setForm({ ...form, yearsOfExperience: +e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Expected Salary (KES)</label>
              <input type="number" value={form.expectedSalary || ''} onChange={e => setForm({ ...form, expectedSalary: +e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Notice Period (days)</label>
              <input type="number" value={form.noticePeriod || ''} onChange={e => setForm({ ...form, noticePeriod: +e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Nationality</label>
              <input value={form.nationality || ''} onChange={e => setForm({ ...form, nationality: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Languages (comma separated)</label>
              <input value={form.languages || ''} onChange={e => setForm({ ...form, languages: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Passport Status</label>
              <input value={form.passportStatus || ''} onChange={e => setForm({ ...form, passportStatus: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Visa Status</label>
              <input value={form.visaStatus || ''} onChange={e => setForm({ ...form, visaStatus: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
            <div><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Relocation Countries</label>
              <input value={form.relocationCountries || ''} onChange={e => setForm({ ...form, relocationCountries: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm font-medium" style={{ color: DN }}>
                <input type="checkbox" checked={!!form.willingToRelocate} onChange={e => setForm({ ...form, willingToRelocate: e.target.checked })} className="w-4 h-4" />
                Willing to relocate
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Save Passport</button>
          </div>
        </form>
      )}
    </div>
  )
}
