import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Play } from 'lucide-react'
import { MediaUploader } from './MediaUploader'

const PB = '#0A66FF'
const DN = '#071B4D'

interface Project {
  id: number; title: string; description: string; thumbnail: string
  video: string; mediaType: string
  technologies: string; githubUrl: string; liveUrl: string
  authorName: string; likes: number; comments: number
}

const CATEGORIES = ['All', 'Electrical', 'Welding', 'Solar', 'Plumbing', 'Construction', 'Refrigeration']

export default function ProjectsPage() {
  const user = useAuthStore((s) => s.user)
  const isCompany = user?.accountType === 'company' || user?.company

  const [projects, setProjects] = useState<Project[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' })
  const [media, setMedia] = useState<any>(null)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try { setProjects(await api.ntv.project.list()) }
    catch { setProjects([]) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { toast.error('Title is required'); return }
    try {
      await api.ntv.project.create({
        ...form,
        ...(media ? { thumbnail: media.mediaType === 'image' ? media.url : '', video: media.mediaType === 'video' ? media.url : '', mediaType: media.mediaType } : {}),
      })
      toast.success('Project added!')
      setShowUpload(false)
      setForm({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' })
      setMedia(null)
      fetchProjects()
    } catch { toast.error('Failed to add project') }
  }

  const filtered = activeCategory === 'All' ? projects : projects.filter(p =>
    (p.technologies || '').toLowerCase().includes(activeCategory.toLowerCase()) ||
    (p.title || '').toLowerCase().includes(activeCategory.toLowerCase())
  )

  return (
    <div style={{ background: '#F4F8FF', color: '#0F172A' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: DN }}>{isCompany ? 'Browse Projects' : 'My Portfolio'}</h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              {isCompany ? 'Explore projects by skilled tradespeople' : 'Showcase your work to impress employers'}
            </p>
          </div>
          {!isCompany && (
            <button onClick={() => setShowUpload(!showUpload)} className="px-5 py-2 rounded-xl text-sm font-medium shadow-sm text-white" style={{ background: PB }}>
              + New Project
            </button>
          )}
        </div>

        {showUpload && (
          <div className="bg-white rounded-2xl border p-6 mb-6 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <h2 className="font-semibold mb-4" style={{ color: DN }}>Add New Project</h2>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Project Title*</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. House Wiring Installation" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Describe the project, tools used, and results achieved..." className="w-full px-3 py-2 rounded-xl border text-sm resize-none" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Technologies / Skills Used</label>
                <input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                  placeholder="e.g. Electrical, Solar, Welding" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>GitHub URL</label>
                <input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  placeholder="https://github.com/..." className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Live Demo URL</label>
                <input value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                  placeholder="https://..." className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Photo or Video (up to 1080p / 5 min)</label>
                <MediaUploader value={media} onChange={setMedia} label="Add project photo / video" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Save Project</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === c ? 'text-white shadow-sm' : 'border hover:bg-gray-50'}`}
              style={{ background: activeCategory === c ? PB : 'white', borderColor: '#E2E8F0', color: activeCategory === c ? 'white' : '#475569' }}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: '#64748B' }}>Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: '#94A3B8' }}>No projects found</p>
            {!isCompany && (
              <button onClick={() => setShowUpload(true)} className="mt-3 px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>
                + Add Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: '#E2E8F0' }}>
                <div className="h-40 flex items-center justify-center text-5xl relative" style={{ background: '#F8FAFC' }}>
                  {project.mediaType === 'video' || project.video ? (
                    <video src={project.video} className="w-full h-full object-cover" preload="metadata" />
                  ) : project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <span>📂</span>
                  )}
                  {project.mediaType === 'video' && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] text-white bg-black/60 rounded-full px-2 py-0.5"><Play className="w-3 h-3" /> Video</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm" style={{ color: DN }}>{project.title}</h3>
                  {project.authorName && (
                    <p className="text-xs mt-0.5" style={{ color: PB }}>by {project.authorName}</p>
                  )}
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: '#64748B' }}>{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.split(',').map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: PB }}>{t.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t text-xs" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                    <span>👍 {project.likes || 0}</span>
                    <span>💬 {project.comments || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
