import { useState } from 'react'

const PB = '#0A66FF'
const DN = '#071B4D'

const templates = [
  { id: 'modern', name: 'Modern Professional', desc: 'Clean two-column layout with skills sidebar' },
  { id: 'classic', name: 'Classic ATS', desc: 'Traditional single-column, ATS-optimized' },
  { id: 'skilled', name: 'Skilled Trades', desc: 'Emphasizes projects, certifications, and tools' },
]

const MOCK_CV = {
  name: 'John Mwangi',
  headline: 'Electrical Installation Student | Solar Technician Trainee',
  phone: '0700 123 456',
  email: 'john.mwangi@email.com',
  location: 'Nairobi, Kenya',
  about: 'Dedicated electrical engineering student at Nairobi Technical Training Institute with hands-on experience in domestic wiring, solar panel installation, and fault diagnosis. Seeking industrial attachment to apply practical skills.',
  skills: ['Domestic Wiring', 'Solar Installation', 'Fault Diagnosis', 'Multimeter Use', 'Circuit Testing', 'Electrical Safety'],
  education: [
    { school: 'Nairobi Technical Training Institute', degree: 'Diploma in Electrical Engineering', year: '2024 - 2026', grade: 'Credit' },
    { school: 'St. Mary\'s High School', degree: 'KCSE', year: '2020 - 2023', grade: 'B-' },
  ],
  experience: [
    { title: 'Electrical Intern', company: 'PowerGen Solutions', period: 'Jan 2025 - Apr 2025', desc: 'Assisted in residential wiring projects. Conducted safety inspections and maintained electrical tools.' },
  ],
  projects: [
    { title: 'Solar Panel Installation', desc: 'Installed 3kW solar system for a residential home including panel mounting, inverter connection, and battery setup.' },
    { title: 'School Workshop Wiring', desc: 'Complete rewiring of electrical workshop including 3-phase power distribution and lighting installation.' },
  ],
  certs: ['NITA Electrical Installation Level 3', 'First Aid Certificate', 'Solar PV Installation Training'],
}

export default function CVBuilderPage() {
  const [activeTemplate, setActiveTemplate] = useState('modern')
  const [showPreview, setShowPreview] = useState(false)
  const [name, setName] = useState(MOCK_CV.name)
  const [headline, setHeadline] = useState(MOCK_CV.headline)
  const [phone, setPhone] = useState(MOCK_CV.phone)
  const [email, setEmail] = useState(MOCK_CV.email)
  const [about, setAbout] = useState(MOCK_CV.about)

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: DN }}>Build Your CV</h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Create a professional, ATS-friendly CV from your profile</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0', color: DN }}>
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button className="px-5 py-2 rounded-xl text-sm font-medium shadow-sm" style={{ background: PB }}>
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {!showPreview ? (
              <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                <h2 className="font-semibold mb-4" style={{ color: DN }}>Personal Information</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Full Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Professional Headline</label>
                    <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Location</label>
                    <input defaultValue={MOCK_CV.location} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Professional Summary</label>
                    <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-xl border text-sm resize-none" style={{ borderColor: '#E2E8F0' }} />
                  </div>
                </div>

                <h2 className="font-semibold mb-3" style={{ color: DN }}>Skills & Competencies</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {MOCK_CV.skills.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5" style={{ background: '#EEF2FF', color: PB }}>
                      {s} <button className="hover:text-red-500">✕</button>
                    </span>
                  ))}
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed" style={{ borderColor: '#CBD5E1', color: '#64748B' }}>+ Add Skill</button>
                </div>

                <h2 className="font-semibold mb-3" style={{ color: DN }}>Work Experience</h2>
                {MOCK_CV.experience.map((exp, i) => (
                  <div key={i} className="p-4 rounded-xl border mb-3" style={{ borderColor: '#E2E8F0' }}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input defaultValue={exp.title} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E2E8F0' }} />
                      <input defaultValue={exp.company} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E2E8F0' }} />
                      <input defaultValue={exp.period} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E2E8F0' }} />
                    </div>
                    <textarea defaultValue={exp.desc} rows={2} className="w-full mt-2 px-3 py-2 rounded-lg border text-sm resize-none" style={{ borderColor: '#E2E8F0' }} />
                  </div>
                ))}
                <button className="px-4 py-2 rounded-xl border border-dashed text-sm font-medium mb-6" style={{ borderColor: '#CBD5E1', color: '#64748B' }}>+ Add Experience</button>

                <h2 className="font-semibold mb-3" style={{ color: DN }}>Education</h2>
                {MOCK_CV.education.map((edu, i) => (
                  <div key={i} className="p-4 rounded-xl border mb-3" style={{ borderColor: '#E2E8F0' }}>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input defaultValue={edu.school} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E2E8F0' }} />
                      <input defaultValue={edu.degree} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E2E8F0' }} />
                      <input defaultValue={edu.year} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E2E8F0' }} />
                      <input defaultValue={edu.grade} className="px-3 py-2 rounded-lg border text-sm" style={{ borderColor: '#E2E8F0' }} />
                    </div>
                  </div>
                ))}
                <button className="px-4 py-2 rounded-xl border border-dashed text-sm font-medium mb-6" style={{ borderColor: '#CBD5E1', color: '#64748B' }}>+ Add Education</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border p-8 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                <div className="max-w-[210mm] mx-auto" style={{ fontFamily: 'serif' }}>
                  <div className="text-center border-b pb-4 mb-4" style={{ borderColor: '#E2E8F0' }}>
                    <h1 className="text-2xl font-bold" style={{ color: DN }}>{name}</h1>
                    <p className="text-sm mt-1" style={{ color: PB }}>{headline}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>{phone} | {email} | Nairobi, Kenya</p>
                  </div>
                  <div className="mb-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: DN }}>Professional Summary</h2>
                    <p className="text-sm" style={{ color: '#475569' }}>{about}</p>
                  </div>
                  <div className="mb-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: DN }}>Skills</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_CV.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs font-medium border" style={{ borderColor: '#E2E8F0', color: '#475569' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: DN }}>Work Experience</h2>
                    {MOCK_CV.experience.map((exp, i) => (
                      <div key={i} className="mb-3">
                        <p className="font-medium text-sm" style={{ color: DN }}>{exp.title}</p>
                        <p className="text-xs" style={{ color: PB }}>{exp.company} | {exp.period}</p>
                        <p className="text-xs mt-1" style={{ color: '#64748B' }}>{exp.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mb-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: DN }}>Education</h2>
                    {MOCK_CV.education.map((edu, i) => (
                      <div key={i} className="mb-2">
                        <p className="font-medium text-sm" style={{ color: DN }}>{edu.degree}</p>
                        <p className="text-xs" style={{ color: '#64748B' }}>{edu.school} | {edu.year} | {edu.grade}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: DN }}>Certifications</h2>
                    {MOCK_CV.certs.map((c) => (
                      <p key={c} className="text-xs" style={{ color: '#64748B' }}>• {c}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm sticky top-20" style={{ borderColor: '#E2E8F0' }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: DN }}>CV Template</h3>
              <div className="space-y-3">
                {templates.map((t) => (
                  <button key={t.id} onClick={() => setActiveTemplate(t.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${activeTemplate === t.id ? 'ring-2' : ''}`} style={{ borderColor: activeTemplate === t.id ? PB : '#E2E8F0', '--tw-ring-color': PB } as React.CSSProperties}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold`} style={{ background: activeTemplate === t.id ? PB : '#94A3B8' }}>{t.id[0].toUpperCase()}</div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: DN }}>{t.name}</p>
                        <p className="text-xs" style={{ color: '#64748B' }}>{t.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t" style={{ borderColor: '#E2E8F0' }}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: DN }}>CV Tips</h3>
                <ul className="space-y-1.5 text-xs" style={{ color: '#64748B' }}>
                  <li>• Keep it to 1-2 pages</li>
                  <li>• Use action words for experience</li>
                  <li>• Highlight trade certifications</li>
                  <li>• Add project photos URLs</li>
                  <li>• Keep contact info updated</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
