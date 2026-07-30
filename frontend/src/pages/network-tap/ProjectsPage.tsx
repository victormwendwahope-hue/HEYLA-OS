import { useState } from 'react'

const PB = '#0A66FF'
const DN = '#071B4D'

const MOCK_PROJECTS = [
  {
    id: 1, title: 'House Wiring Installation', category: 'Electrical',
    desc: 'Complete electrical wiring for a 3-bedroom residential house including lighting, power sockets, and distribution board installation.',
    images: ['🏠'], materials: ['Cables', 'MCBs', 'Conduit Pipes', 'Sockets & Switches'],
    duration: '2 weeks', client: 'Mr. Kamau, Nairobi', likes: 34, comments: 8, views: 512,
  },
  {
    id: 2, title: 'Custom Welding Gate', category: 'Welding',
    desc: 'Designed and fabricated a custom steel gate with decorative patterns. Includes powder coating finish.',
    images: ['🚪'], materials: ['Steel Bars', 'Welding Rods', 'Paint'],
    duration: '1 week', client: 'Green Valley Estate', likes: 28, comments: 5, views: 389,
  },
  {
    id: 3, title: 'Solar Panel Installation', category: 'Solar',
    desc: 'Installed 3kW solar PV system with battery backup for off-grid home. System powers lights, fridge, and TV.',
    images: ['☀️'], materials: ['Solar Panels', 'Inverter', 'Batteries', 'Charge Controller'],
    duration: '3 days', client: 'Mrs. Wanjiku, Kiambu', likes: 45, comments: 12, views: 723,
  },
  {
    id: 4, title: 'Bathroom Plumbing Renovation', category: 'Plumbing',
    desc: 'Full bathroom plumbing renovation including new PPR pipe installation, toilet, sink, and shower fitting.',
    images: ['🚿'], materials: ['PPR Pipes', 'Fittings', 'WC Suite', 'Basin'],
    duration: '5 days', client: 'Nairobi West Residence', likes: 19, comments: 3, views: 267,
  },
  {
    id: 5, title: 'Office Partition & Ceiling', category: 'Construction',
    desc: 'Installed gypsum ceiling boards and office partition walls for a commercial office space.',
    images: ['🏢'], materials: ['Gypsum Boards', 'Metal Framing', 'Joint Compound'],
    duration: '1 week', client: 'TechStart Hub, Nairobi', likes: 22, comments: 6, views: 445,
  },
  {
    id: 6, title: 'AC Installation & Ducting', category: 'Refrigeration',
    desc: 'Installed split AC units with ducting for a 4-room office. System cooling capacity: 24,000 BTU.',
    images: ['❄️'], materials: ['AC Units', 'Copper Pipes', 'Ducts', 'Insulation'],
    duration: '2 days', client: 'Prime Office Solutions', likes: 15, comments: 4, views: 201,
  },
]

const CATEGORIES = ['All', 'Electrical', 'Welding', 'Solar', 'Plumbing', 'Construction', 'Refrigeration']

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [showUpload, setShowUpload] = useState(false)

  const filtered = activeCategory === 'All' ? MOCK_PROJECTS : MOCK_PROJECTS.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen" style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: DN }}>Project Portfolio</h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Showcase your work to impress employers</p>
          </div>
          <button onClick={() => setShowUpload(!showUpload)} className="px-5 py-2 rounded-xl text-sm font-medium shadow-sm" style={{ background: PB }}>
            + New Project
          </button>
        </div>

        {showUpload && (
          <div className="bg-white rounded-2xl border p-6 mb-6 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="font-semibold mb-4" style={{ color: DN }}>Add New Project</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Project Title</label>
                <input placeholder="e.g. House Wiring Installation" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Category</label>
                <select className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }}>
                  {CATEGORIES.filter(c => c !== 'All').map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Duration</label>
                <input placeholder="e.g. 2 weeks" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Description</label>
                <textarea rows={3} placeholder="Describe the project, tools used, and results achieved..." className="w-full px-3 py-2 rounded-xl border text-sm resize-none" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Project Photos</label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: '#CBD5E1' }}>
                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Drag & drop photos or click to browse</p>
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Show before/after images for best results</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
              <button className="px-5 py-2 rounded-xl text-sm font-medium" style={{ background: PB }}>Save Project</button>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === c ? 'text-white shadow-sm' : 'border hover:bg-gray-50'}`} style={{ background: activeCategory === c ? PB : 'white', borderColor: '#E2E8F0', color: activeCategory === c ? 'white' : '#475569' }}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: '#E2E8F0' }}>
              <div className="h-40 flex items-center justify-center text-5xl" style={{ background: '#F8FAFC' }}>
                {project.images[0]}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: PB }}>{project.category}</span>
                  <span className="text-xs" style={{ color: '#64748B' }}>{project.duration}</span>
                </div>
                <h3 className="font-semibold text-sm" style={{ color: DN }}>{project.title}</h3>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: '#64748B' }}>{project.desc}</p>
                {project.client && (
                  <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Client: {project.client}</p>
                )}
                <div className="flex items-center gap-3 mt-3 pt-2 border-t text-xs" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                  <span>👍 {project.likes}</span>
                  <span>💬 {project.comments}</span>
                  <span>👁️ {project.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
