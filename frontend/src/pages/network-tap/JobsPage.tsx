import { useState } from 'react'
import { Link } from '@tanstack/react-router'

const PB = '#0A66FF'
const DN = '#071B4D'

const JOB_CATEGORIES = [
  { name: 'Carpentry', icon: '🔨', count: 24 },
  { name: 'Electrical', icon: '⚡', count: 42 },
  { name: 'Plumbing', icon: '🔧', count: 18 },
  { name: 'Welding', icon: '🔥', count: 15 },
  { name: 'Construction', icon: '🏗️', count: 67 },
  { name: 'Solar Technician', icon: '☀️', count: 12 },
  { name: 'Mechanical', icon: '⚙️', count: 23 },
  { name: 'Automotive', icon: '🚗', count: 16 },
  { name: 'ICT Support', icon: '💻', count: 31 },
  { name: 'Refrigeration & AC', icon: '❄️', count: 9 },
  { name: 'Painting & Finishing', icon: '🎨', count: 14 },
  { name: 'Driver & Machine Operator', icon: '🚛', count: 19 },
  { name: 'Attachment', icon: '📎', count: 28 },
  { name: 'Internship', icon: '🎓', count: 35 },
  { name: 'Graduate Trainee', icon: '📋', count: 21 },
  { name: 'Apprenticeship', icon: '🔨', count: 11 },
]

const MOCK_JOBS = [
  { id: 1, title: 'Electrical Technician', company: 'PowerBuild Contractors Ltd', location: 'Nairobi', type: 'Full-Time', salary: 'KES 45,000 - 60,000', posted: '2d ago', logo: 'P', category: 'Electrical', experience: '1-2 Years', skills: ['Wiring', 'Solar Installation', 'Fault Diagnosis'] },
  { id: 2, title: 'Solar Installation Trainee', company: 'SunCulture Kenya', location: 'Nakuru', type: 'Internship', salary: 'KES 25,000', posted: '1w ago', logo: 'S', category: 'Solar Technician', experience: 'No experience needed', skills: ['Solar PV', 'Basic Electrical', 'Mounting'] },
  { id: 3, title: 'Welder / Fabricator', company: 'SteelMakers Ltd', location: 'Mombasa', type: 'Full-Time', salary: 'KES 50,000 - 70,000', posted: '3d ago', logo: 'M', category: 'Welding', experience: '2-3 Years', skills: ['MIG Welding', 'Arc Welding', 'Metal Cutting'] },
  { id: 4, title: 'Plumbing Assistant', company: 'AquaTech Solutions', location: 'Nairobi', type: 'Attachment', salary: 'Stipend', posted: '5d ago', logo: 'A', category: 'Plumbing', experience: 'Ongoing studies', skills: ['Pipe Fitting', 'PPR Welding', 'Leak Repair'] },
  { id: 5, title: 'Construction Supervisor', company: 'BuildRight Ltd', location: 'Kiambu', type: 'Contract', salary: 'KES 80,000 - 100,000', posted: '1w ago', logo: 'B', category: 'Construction', experience: '3-5 Years', skills: ['Site Management', 'Blueprint Reading', 'Safety Compliance'] },
  { id: 6, title: 'ICT Support Technician', company: 'TechNet Solutions', location: 'Nairobi', type: 'Full-Time', salary: 'KES 40,000 - 55,000', posted: '4d ago', logo: 'T', category: 'ICT Support', experience: '1 Year', skills: ['Networking', 'Hardware Repair', 'Windows/Linux'] },
  { id: 7, title: 'Carpentry Apprentice', company: 'WoodCraft Kenya', location: 'Nairobi', type: 'Apprenticeship', salary: 'KES 15,000', posted: '2d ago', logo: 'W', category: 'Carpentry', experience: 'Entry level', skills: ['Wood Joinery', 'Measuring', 'Tool Use'] },
  { id: 8, title: 'Auto Mechanic', company: 'AutoFix Garage', location: 'Thika', type: 'Full-Time', salary: 'KES 35,000 - 50,000', posted: '6d ago', logo: 'A', category: 'Automotive', experience: '2 Years', skills: ['Engine Repair', 'Diagnostics', 'Brake Systems'] },
  { id: 9, title: 'Graduate Trainee - Engineering', company: 'Kenya Power', location: 'Nairobi', type: 'Graduate Trainee', salary: 'KES 70,000', posted: '1w ago', logo: 'K', category: 'Graduate Trainee', experience: 'Fresh graduate', skills: ['Electrical Eng', 'Project Management', 'Analytical'] },
  { id: 10, title: 'AC Technician', company: 'CoolAir Ltd', location: 'Nairobi', type: 'Full-Time', salary: 'KES 45,000 - 65,000', posted: '3d ago', logo: 'C', category: 'Refrigeration & AC', experience: '2 Years', skills: ['AC Installation', 'Refrigerant Handling', 'Ducting'] },
]

const JOB_TYPES = ['All Types', 'Full-Time', 'Part-Time', 'Contract', 'Internship', 'Attachment', 'Apprenticeship', 'Graduate Trainee']

export default function NetworkTapJobs() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeType, setActiveType] = useState('All Types')
  const [showApply, setShowApply] = useState<number | null>(null)

  const filtered = MOCK_JOBS.filter(j => {
    if (activeCategory && j.category !== activeCategory) return false
    if (activeType !== 'All Types' && j.type !== activeType) return false
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: DN }}>Skilled Jobs & Technical Opportunities</h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Find internships, attachments, and skilled jobs across Kenya</p>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs, companies..." className="w-full sm:w-72 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white" style={{ borderColor: '#E2E8F0', '--tw-ring-color': PB } as React.CSSProperties} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {JOB_CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)} className={`flex items-center gap-3 p-3 rounded-xl border bg-white transition-all ${activeCategory === cat.name ? 'ring-2' : 'hover:shadow-sm'}`} style={{ borderColor: activeCategory === cat.name ? PB : '#E2E8F0', '--tw-ring-color': PB } as React.CSSProperties}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: '#F4F8FF' }}>{cat.icon}</div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: DN }}>{cat.name}</p>
                <p className="text-xs" style={{ color: PB }}>{cat.count} openings</p>
              </div>
            </button>
          ))}
        </div>

        {showApply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowApply(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-semibold text-lg mb-2" style={{ color: DN }}>Apply with Profile</h2>
              {(() => {
                const job = MOCK_JOBS.find(j => j.id === showApply)
                if (!job) return null
                return (
                  <>
                    <p className="text-sm mb-4" style={{ color: '#64748B' }}>Applying for: <span className="font-medium" style={{ color: DN }}>{job.title}</span> at {job.company}</p>
                    <div className="space-y-3 mb-4">
                      {[
                        { label: 'Professional Profile', checked: true },
                        { label: 'Generated CV', checked: true },
                        { label: 'Skills Summary', checked: true },
                        { label: 'Certifications', checked: true },
                        { label: 'Project Portfolio', checked: true },
                        { label: 'Work Photos', checked: true },
                        { label: 'Availability Status', checked: true },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ background: '#10B981' }}>✓</div>
                          <span style={{ color: DN }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <textarea placeholder="Add a cover letter or message to the employer (optional)..." rows={3} className="w-full px-3 py-2 rounded-xl border text-sm resize-none mb-4" style={{ borderColor: '#E2E8F0' }} />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowApply(null)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
                      <button className="px-5 py-2 rounded-xl text-sm font-medium shadow-sm" style={{ background: PB }}>Submit Application</button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {JOB_TYPES.map((t) => (
            <button key={t} onClick={() => setActiveType(t)} className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeType === t ? 'text-white shadow-sm' : 'bg-white border hover:bg-gray-50'}`} style={{ background: activeType === t ? PB : 'white', borderColor: '#E2E8F0', color: activeType === t ? 'white' : '#475569' }}>
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0" style={{ background: PB }}>{job.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold" style={{ color: DN }}>{job.title}</h3>
                      <p className="text-sm" style={{ color: '#475569' }}>{job.company} · {job.location}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs" style={{ color: '#64748B' }}>
                        <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: '#EEF2FF', color: PB }}>{job.type}</span>
                        <span>{job.salary}</span>
                        <span>Exp: {job.experience}</span>
                        <span>{job.posted}</span>
                      </div>
                    </div>
                    <button onClick={() => setShowApply(job.id)} className="px-5 py-2 rounded-xl text-sm font-medium shrink-0 hover:opacity-90 shadow-sm" style={{ background: PB }}>
                      Apply with Profile
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#F1F5F9', color: '#475569' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="font-medium" style={{ color: '#64748B' }}>No jobs found matching your criteria</p>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
