import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'

const PB = '#0A66FF'
const DN = '#071B4D'

const MOCK_SKILLS = ['Domestic Wiring', 'Solar Installation', 'Fault Diagnosis', 'Multimeter Use', 'Circuit Testing', 'Electrical Safety']
const MOCK_EXPERIENCES = [
  { title: 'Electrical Intern', company: 'PowerGen Solutions', period: 'Jan 2025 - Apr 2025', desc: 'Assisted in residential wiring projects. Conducted safety inspections and maintained electrical tools.' },
  { title: 'Freelance Electrician', company: 'Self-Employed', period: 'Jun 2024 - Present', desc: 'Completed 15+ residential wiring and repair jobs across Nairobi.' },
]
const MOCK_EDUCATION = [
  { school: 'Nairobi Technical Training Institute', degree: 'Diploma in Electrical Engineering', period: '2024 - 2026', grade: 'Credit' },
]
const MOCK_PROJECTS = [
  { title: '3-Bedroom House Wiring', desc: 'Complete electrical installation for a residential house', items: ['Cables', 'MCBs', 'Sockets'] },
  { title: 'Solar Panel Installation', desc: '3kW solar PV system with battery backup', items: ['Panels', 'Inverter', 'Batteries'] },
]
const MOCK_CERTS = [
  'NITA Electrical Installation Level 3', 'First Aid Certificate', 'Solar PV Installation Training',
]

export default function NetworkTapProfile() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>('about')

  useEffect(() => {
    const u = localStorage.getItem('heyla_user')
    if (u) setUser(JSON.parse(u))
  }, [])

  const tabs = ['about', 'experience', 'projects', 'certifications']

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border overflow-hidden mb-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <div className="h-32 sm:h-40" style={{ background: 'linear-gradient(135deg, #071B4D, #0A66FF)' }} />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 gap-4 mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white flex items-center justify-center font-bold text-2xl shadow-md" style={{ background: PB }}>
                {user?.name?.[0] || 'U'}
              </div>
              <div className="sm:pb-1">
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: DN }}>{user?.name || 'John Mwangi'}</h1>
                <p className="text-sm" style={{ color: '#64748B' }}>Electrical Installation Student | Solar Technician Trainee</p>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>📍 Nairobi Technical Training Institute · 🎓 Class of 2026</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: '#EEF2FF', color: PB }}>
                <span className="w-2 h-2 rounded-full bg-green-500" /> Available for Attachment
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#FEF3C7', color: '#B45309' }}>Open to Internships</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button className="px-5 py-2 rounded-xl text-sm font-medium shadow-sm" style={{ background: PB }}>Edit Profile</button>
              <Link to="/network-tap/cv" className="px-5 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: PB, color: PB }}>Generate CV</Link>
              <button className="px-5 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0', color: '#475569' }}>Share Profile</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border mb-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex border-b overflow-x-auto" style={{ borderColor: '#E2E8F0' }}>
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors relative ${activeTab === tab ? '' : 'hover:bg-gray-50'}`} style={{ color: activeTab === tab ? PB : '#64748B' }}>
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: PB }} />}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'about' && (
              <div>
                <h3 className="font-semibold mb-2" style={{ color: DN }}>About</h3>
                <p className="text-sm mb-6" style={{ color: '#475569' }}>Dedicated electrical engineering student at Nairobi Technical Training Institute with hands-on experience in domestic wiring, solar panel installation, and fault diagnosis. Seeking industrial attachment to apply practical skills in a professional environment.</p>

                <h3 className="font-semibold mb-3" style={{ color: DN }}>Skills & Trade Competencies</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {MOCK_SKILLS.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: '#F1F5F9', color: '#475569' }}>{s}</span>
                  ))}
                </div>

                <h3 className="font-semibold mb-3" style={{ color: DN }}>Education</h3>
                {MOCK_EDUCATION.map((e) => (
                  <div key={e.school} className="mb-3 p-3 rounded-xl border" style={{ borderColor: '#E2E8F0' }}>
                    <p className="font-medium text-sm" style={{ color: DN }}>{e.degree}</p>
                    <p className="text-sm" style={{ color: '#475569' }}>{e.school}</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{e.period} · Grade: {e.grade}</p>
                  </div>
                ))}

                <h3 className="font-semibold mb-3" style={{ color: DN }}>Availability</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { status: 'Industrial Attachment', period: 'Jan 2026 - Apr 2026', icon: '📎' },
                    { status: 'Internship', period: 'May 2026 - Aug 2026', icon: '🎓' },
                    { status: 'Part-Time Work', period: 'Weekends', icon: '🔧' },
                  ].map((a) => (
                    <div key={a.status} className="p-3 rounded-xl border text-center" style={{ borderColor: '#E2E8F0' }}>
                      <span className="text-lg">{a.icon}</span>
                      <p className="font-medium text-xs mt-1" style={{ color: DN }}>{a.status}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>{a.period}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'experience' && (
              <div>
                {MOCK_EXPERIENCES.map((exp, i) => (
                  <div key={i} className="mb-6 pb-6 border-b last:border-0 last:mb-0 last:pb-0" style={{ borderColor: '#E2E8F0' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0" style={{ background: PB }}>{exp.company[0]}</div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: DN }}>{exp.title}</p>
                        <p className="text-sm" style={{ color: '#475569' }}>{exp.company}</p>
                        <p className="text-xs mb-2" style={{ color: '#64748B' }}>{exp.period}</p>
                        <p className="text-sm" style={{ color: '#475569' }}>{exp.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'projects' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {MOCK_PROJECTS.map((p) => (
                  <div key={p.title} className="p-4 rounded-xl border" style={{ borderColor: '#E2E8F0' }}>
                    <p className="font-medium text-sm mb-1" style={{ color: DN }}>{p.title}</p>
                    <p className="text-sm mb-2" style={{ color: '#475569' }}>{p.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.items.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#EEF2FF', color: PB }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
                <Link to="/network-tap/projects" className="p-4 rounded-xl border-2 border-dashed flex items-center justify-center text-sm font-medium" style={{ borderColor: '#CBD5E1', color: '#64748B' }}>
                  + Add More Projects
                </Link>
              </div>
            )}
            {activeTab === 'certifications' && (
              <div>
                {MOCK_CERTS.map((c) => (
                  <div key={c} className="flex items-center gap-3 p-3 rounded-xl border mb-3" style={{ borderColor: '#E2E8F0' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#10B981' }}>✓</div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: DN }}>{c}</p>
                      <p className="text-xs" style={{ color: '#64748B' }}>Verified Credential</p>
                    </div>
                  </div>
                ))}
                <button className="px-4 py-2 rounded-xl border border-dashed text-sm font-medium" style={{ borderColor: '#CBD5E1', color: '#64748B' }}>+ Add Certification</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
