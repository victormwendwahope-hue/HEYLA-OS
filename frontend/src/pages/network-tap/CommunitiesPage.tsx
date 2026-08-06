import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Users, ThumbsUp, MessageSquare, Plus, UserPlus, UserCheck } from 'lucide-react'

const PB = '#0A66FF'
const DN = '#071B4D'

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([])
  const [active, setActive] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({})
  const [postText, setPostText] = useState('')

  useEffect(() => { fetchCommunities() }, [])

  const fetchCommunities = async () => {
    setLoading(true)
    try {
      const res: any = await api.network.communities.list()
      setCommunities(Array.isArray(res) ? res : res?.communities || [])
    } catch { }
    finally { setLoading(false) }
  }

  const open = async (c: any) => {
    try {
      const res: any = await api.network.communities.get(c.id)
      setActive(res?.community || res)
    } catch { setActive(c) }
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.network.communities.create(form)
      toast.success('Community created')
      setShowForm(false)
      setForm({})
      fetchCommunities()
    } catch { toast.error('Failed to create community') }
  }

  const join = async (id: string) => {
    try {
      await api.network.communities.join(id)
      toast.success('Joined community')
      fetchCommunities()
    } catch { toast.error('Failed to join') }
  }

  const leave = async (id: string) => {
    try {
      await api.network.communities.leave(id)
      toast.success('Left community')
      fetchCommunities()
    } catch { toast.error('Failed to leave') }
  }

  const post = async () => {
    if (!postText.trim()) return
    try {
      await api.network.communities.post(active.id, { content: postText })
      toast.success('Posted')
      setPostText('')
      open(active)
    } catch { toast.error('Failed to post') }
  }

  const like = async (postId: string) => {
    try {
      await api.network.communities.likePost(active.id, postId)
      open(active)
    } catch { }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><Users className="w-6 h-6" style={{ color: PB }} /> Communities</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Trade groups and professional communities</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2" style={{ background: PB }}><Plus className="w-4 h-4" /> Create Community</button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-2xl border p-6 shadow-sm flex flex-wrap items-end gap-4" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex-1 min-w-[200px]"><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Community Name</label>
            <input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="flex-1 min-w-[200px]"><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Description</label>
            <input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="flex gap-2 items-end">
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`space-y-3 ${active ? 'md:col-span-1' : 'md:col-span-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0'}`}>
            {communities.length === 0 && <div className="text-center py-16 text-sm col-span-full" style={{ color: '#64748B' }}>No communities yet. Create the first one for your trade.</div>}
            {communities.map((c: any) => (
              <div key={c.id} onClick={() => open(c)} className={`bg-white rounded-2xl border p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${active?.id === c.id ? 'ring-2' : ''}`} style={{ borderColor: '#E2E8F0', ...(active?.id === c.id ? { ['--tw-ring-color' as any]: PB } : {}) }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: DN }}>{c.name}</span>
                  <span className="text-[11px] flex items-center gap-1" style={{ color: '#64748B' }}><Users className="w-3.5 h-3.5" />{c.memberCount || c.members?.length || 0}</span>
                </div>
                {c.description && <p className="text-xs mt-2 line-clamp-2" style={{ color: '#94A3B8' }}>{c.description}</p>}
                <div className="mt-3">
                  {c.isMember ? (
                    <button onClick={(ev) => { ev.stopPropagation(); leave(c.id) }} className="text-xs font-medium flex items-center gap-1 rounded-lg px-2 py-1 bg-slate-100" style={{ color: DN }}><UserCheck className="w-3.5 h-3.5" />Member</button>
                  ) : (
                    <button onClick={(ev) => { ev.stopPropagation(); join(c.id) }} className="text-xs font-medium text-white flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: PB }}><UserPlus className="w-3.5 h-3.5" />Join</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {active && (
            <div className="md:col-span-2 bg-white rounded-2xl border p-6 shadow-sm space-y-4" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold" style={{ color: DN }}>{active.name}</h2>
                <button onClick={() => setActive(null)} className="text-sm font-medium" style={{ color: PB }}>Close</button>
              </div>
              <div className="flex gap-2">
                <input value={postText} onChange={e => setPostText(e.target.value)} placeholder="Share with your community..." className="flex-1 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} />
                <button onClick={post} style={{ background: PB }} className="px-4 py-2 rounded-xl text-sm font-medium text-white">Post</button>
              </div>
              {(active.posts || []).map((p: any) => (
                <div key={p.id} className="border-t pt-4" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex items-center gap-2 text-xs mb-1" style={{ color: '#64748B' }}>
                    <span className="font-semibold" style={{ color: DN }}>{p.authorName || p.author}</span>
                    <span>· {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm" style={{ color: '#334155' }}>{p.content}</p>
                  <div className="flex gap-4 mt-2 text-xs" style={{ color: '#94A3B8' }}>
                    <button onClick={() => like(p.id)} className="flex items-center gap-1 hover:text-blue-600"><ThumbsUp className="w-3.5 h-3.5" />{p.likes?.length || 0}</button>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{p.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}