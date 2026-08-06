import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import {
  Loader2, Users, ThumbsUp, MessageSquare, Plus, UserPlus, UserCheck,
  LifeBuoy, CheckCircle2, MapPin, Handshake, Video, Clock,
} from 'lucide-react'
import { MediaUploader } from './MediaUploader'

const PB = '#0A66FF'
const DN = '#071B4D'

const HELP_CATEGORIES = [
  ['tools', 'Tools & Equipment'],
  ['safety', 'Safety & PPE'],
  ['training', 'Training & Skills'],
  ['jobs', 'Jobs & Opportunities'],
  ['materials', 'Materials & Supplies'],
  ['advice', 'Advice & Guidance'],
  ['general', 'General'],
]

export default function CommunitiesPage() {
  const user = useAuthStore((s) => s.user)
  const [communities, setCommunities] = useState<any[]>([])
  const [active, setActive] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>({})
  const [tab, setTab] = useState<'posts' | 'help'>('posts')

  // composer states
  const [postText, setPostText] = useState('')
  const [postMedia, setPostMedia] = useState<any>(null)

  const [helpForm, setHelpForm] = useState<any>({})
  const [helpMedia, setHelpMedia] = useState<any>(null)

  const [offerMap, setOfferMap] = useState<Record<string, { text: string; media: any }>>({})
  const [offerMedia, setOfferMedia] = useState<Record<string, any>>({})

  const [selectedThread, setSelectedThread] = useState<any>(null)
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null)

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
      const detail = res?.community || res
      setActive(detail)
      setTab('posts')
      setExpandedHelp(null)
      setSelectedThread(null)
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
      open({ id })
    } catch { toast.error('Failed to join') }
  }

  const leave = async (id: string) => {
    try {
      await api.network.communities.leave(id)
      toast.success('Left community')
      if (active?.id === id) setActive(null)
      fetchCommunities()
    } catch { toast.error('Failed to leave') }
  }

  const post = async () => {
    if (!postText.trim() && !postMedia) return
    try {
      await api.network.communities.post(active.id, {
        content: postText,
        ...(postMedia ? { image: postMedia.mediaType === 'image' ? postMedia.url : '', video: postMedia.mediaType === 'video' ? postMedia.url : '', mediaType: postMedia.mediaType } : {}),
      })
      toast.success('Posted')
      setPostText('')
      setPostMedia(null)
      const res: any = await api.network.communities.get(active.id)
      setActive(res?.community || res)
    } catch { toast.error('Failed to post') }
  }

  const like = async (postId: string) => {
    try {
      await api.network.communities.likePost(active.id, postId)
      const res: any = await api.network.communities.get(active.id)
      setActive(res?.community || res)
    } catch { }
  }

  const askHelp = async () => {
    if (!helpForm.title?.trim()) {
      toast.error('Give your request a short title')
      return
    }
    try {
      await api.network.communities.helpCreate(active.id, {
        ...helpForm,
        ...(helpMedia ? { image: helpMedia.mediaType === 'image' ? helpMedia.url : '', video: helpMedia.mediaType === 'video' ? helpMedia.url : '', mediaType: helpMedia.mediaType } : {}),
      })
      toast.success('Help request posted — your community can now respond')
      setHelpForm({})
      setHelpMedia(null)
      const res: any = await api.network.communities.get(active.id)
      setActive(res?.community || res)
      setTab('help')
    } catch { toast.error('Failed to post help request') }
  }

  const offer = async (help: any) => {
    const text = offerMap[help.id]?.text?.trim()
    if (!text) {
      toast.error('Write a short message about how you can help')
      return
    }
    try {
      const media = offerMedia[help.id]
      await api.network.communities.helpOffer(active.id, help.id, {
        content: text,
        ...(media ? { image: media.mediaType === 'image' ? media.url : '', video: media.mediaType === 'video' ? media.url : '', mediaType: media.mediaType } : {}),
      })
      toast.success('You offered to help!')
      setOfferMap({ ...offerMap, [help.id]: { text: '', media: null } })
      setOfferMedia({ ...offerMedia, [help.id]: null })
      const res: any = await api.network.communities.get(active.id)
      setActive(res?.community || res)
    } catch { toast.error('Failed to send offer') }
  }

  const resolve = async (help: any) => {
    try {
      await api.network.communities.helpResolve(active.id, help.id)
      toast.success('Marked as resolved')
      const res: any = await api.network.communities.get(active.id)
      setActive(res?.community || res)
    } catch { toast.error('Failed to resolve') }
  }

  const canManage = (entity: any) =>
    entity?.authorId === String(user?.id) || active?.isAdmin || user?.role === 'admin' || active?.createdBy === String(user?.id)

  const PostMedia = ({ p }: { p: any }) => {
    if (p.mediaType === 'video' || p.video) {
      return (
        <div className="rounded-xl overflow-hidden bg-black mt-2">
          <video src={p.video} controls className="w-full max-h-[420px]" preload="metadata" />
        </div>
      )
    }
    if (p.image) return <img src={p.image} alt="" className="rounded-xl mt-2 max-h-[420px] w-full object-cover" />
    return null
  }

  const Avatar = ({ name, avatar, size = 32 }: { name?: string; avatar?: string; size?: number }) => {
    if (avatar) return <img src={avatar} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />
    return (
      <div className="rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ width: size, height: size, background: PB }}>
        {(name || '?').charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: DN }}><Users className="w-6 h-6" style={{ color: PB }} /> Communities</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Join groups, share your work, and get help from people who do what you do</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2" style={{ background: PB }}><Plus className="w-4 h-4" /> Create Community</button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-2xl border p-6 shadow-sm flex flex-wrap items-end gap-4" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex-1 min-w-[200px]"><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Community Name</label>
            <input required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="flex-1 min-w-[200px]"><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Description</label>
            <input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }} /></div>
          <div className="flex-1 min-w-[160px]"><label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Type</label>
            <select value={form.type || 'trade'} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#E2E8F0' }}>
              {[['trade', 'Trade'], ['industry', 'Industry'], ['county', 'County'], ['country', 'Country'], ['special', 'Special Interest']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select></div>
          <div className="flex gap-2 items-end">
            <button type="submit" className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium border" style={{ borderColor: '#E2E8F0' }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left: community list */}
          <div className={`space-y-3 ${active ? 'lg:col-span-1' : 'lg:col-span-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-4 space-y-0'}`}>
            {communities.length === 0 && <div className="text-center py-16 text-sm col-span-full" style={{ color: '#64748B' }}>No communities yet. Create the first one for your trade.</div>}
            {communities.map((c: any) => (
              <div key={c.id} onClick={() => open(c)} className={`bg-white rounded-2xl border p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${active?.id === c.id ? 'ring-2' : ''}`} style={{ borderColor: '#E2E8F0', ...(active?.id === c.id ? { ['--tw-ring-color' as any]: PB } : {}) }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: DN }}>{c.name}</span>
                  <span className="text-[11px] flex items-center gap-1" style={{ color: '#64748B' }}><Users className="w-3.5 h-3.5" />{c.memberCount || c.members?.length || 0}</span>
                </div>
                {c.description && <p className="text-xs mt-2 line-clamp-2" style={{ color: '#94A3B8' }}>{c.description}</p>}
                <div className="mt-3 flex items-center justify-between">
                  {c.isMember ? (
                    <button onClick={(ev) => { ev.stopPropagation(); leave(c.id) }} className="text-xs font-medium flex items-center gap-1 rounded-lg px-2 py-1 bg-slate-100" style={{ color: DN }}><UserCheck className="w-3.5 h-3.5" />Member</button>
                  ) : (
                    <button onClick={(ev) => { ev.stopPropagation(); join(c.id) }} className="text-xs font-medium text-white flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: PB }}><UserPlus className="w-3.5 h-3.5" />Join</button>
                  )}
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: '#94A3B8' }}>{c.category || 'General'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: active community */}
          {active && (
            <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
              {/* header */}
              <div className="p-6" style={{ background: `linear-gradient(135deg, ${DN} 0%, ${PB} 100%)` }}>
                <div className="flex items-start justify-between">
                  <div className="text-white">
                    <h2 className="text-xl font-bold">{active.name}</h2>
                    <p className="text-sm text-white/80 mt-1">{active.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-white/80">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{active.memberCount} members</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{active.postCount} posts</span>
                      {active.createdBy && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{active.category || 'Community'}</span>}
                    </div>
                  </div>
                  <button onClick={() => setActive(null)} className="text-white/80 hover:text-white text-sm font-medium bg-white/10 rounded-lg px-3 py-1.5">Close</button>
                </div>
                <div className="flex gap-1.5 mt-4">
                  {active.members?.slice(0, 8).map((m: any) => <Avatar key={m.id} name={m.name} avatar={m.avatar} size={28} />)}
                  {active.memberCount > 8 && <span className="w-7 h-7 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">+{active.memberCount - 8}</span>}
                </div>
              </div>

              {/* tabs */}
              <div className="flex border-b px-6" style={{ borderColor: '#E2E8F0' }}>
                {([['posts', 'Posts', MessageSquare], ['help', 'Help & Support', LifeBuoy]] as const).map(([key, label, Icon]) => (
                  <button key={key} onClick={() => { setTab(key); setSelectedThread(null) }} className={`flex items-center gap-1.5 text-sm font-medium px-4 py-3 border-b-2 -mb-px transition-colors ${tab === key ? '' : 'text-slate-400 border-transparent'}`} style={tab === key ? { color: PB, borderColor: PB } : {}}>
                    <Icon className="w-4 h-4" />{label}
                    {key === 'help' && active.help?.length > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 rounded-full px-1.5 py-0.5 font-semibold">{active.help.length}</span>}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-5">
                {tab === 'posts' && (
                  <>
                    {/* composer */}
                    <div className="border rounded-2xl p-4 space-y-3" style={{ borderColor: '#E2E8F0' }}>
                      <div className="flex gap-3">
                        <Avatar name={user?.name} avatar={user?.avatar} size={40} />
                        <textarea value={postText} onChange={e => setPostText(e.target.value)} placeholder={`Share work, updates or questions with ${active.name}...`} className="flex-1 px-3 py-2 rounded-xl border text-sm min-h-[64px] resize-none" style={{ borderColor: '#E2E8F0' }} />
                      </div>
                      <MediaUploader value={postMedia} onChange={setPostMedia} />
                      <div className="flex items-center justify-between pl-[52px]">
                        <span className="text-[10px] text-slate-400">Photos or 1080p videos · max 5 min</span>
                        <button onClick={post} disabled={!postText.trim() && !postMedia} className="px-4 py-1.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40" style={{ background: PB }}>
                          Post
                        </button>
                      </div>
                    </div>

                    {/* feed */}
                    {(active.posts || []).length === 0 ? (
                      <div className="text-center py-10 text-sm" style={{ color: '#64748B' }}>No posts yet. Be the first to share something.</div>
                    ) : (
                      (active.posts || []).map((p: any) => (
                        <div key={p.id} className="border rounded-2xl p-4" style={{ borderColor: '#E2E8F0' }}>
                          <div className="flex items-center gap-2.5">
                            <Avatar name={p.authorName} avatar={p.authorAvatar} size={36} />
                            <div>
                              <p className="text-sm font-semibold" style={{ color: DN }}>{p.authorName || 'Member'}</p>
                              <p className="text-[10px]" style={{ color: '#94A3B8' }}>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</p>
                            </div>
                          </div>
                          {p.content && <p className="text-sm mt-2.5" style={{ color: '#334155' }}>{p.content}</p>}
                          <PostMedia p={p} />
                          <div className="flex gap-4 mt-3 text-xs" style={{ color: '#94A3B8' }}>
                            <button onClick={() => like(p.id)} className={`flex items-center gap-1 font-medium transition-colors ${p.liked ? '' : 'hover:text-blue-600'}`} style={p.liked ? { color: PB } : {}}><ThumbsUp className="w-3.5 h-3.5" />{p.likes || 0}</button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {tab === 'help' && (
                  <>
                    {/* ask for help */}
                    <div className="border rounded-2xl p-4 space-y-3" style={{ borderColor: '#E2E8F0', background: '#F8FBFF' }}>
                      <div className="flex items-center gap-2">
                        <LifeBuoy className="w-5 h-5" style={{ color: PB }} />
                        <h3 className="font-semibold" style={{ color: DN }}>Ask for help</h3>
                        <p className="text-xs" style={{ color: '#64748B' }}>Post a request — members who can help will reply</p>
                      </div>
                      <div className="flex gap-3">
                        <Avatar name={user?.name} avatar={user?.avatar} size={40} />
                        <div className="flex-1 space-y-2">
                          <input value={helpForm.title || ''} onChange={e => setHelpForm({ ...helpForm, title: e.target.value })} placeholder="e.g. Need a mobile welding machine for tomorrow in Kitengela" className="w-full px-3 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: '#E2E8F0' }} />
                          <textarea value={helpForm.description || ''} onChange={e => setHelpForm({ ...helpForm, description: e.target.value })} placeholder="Details — what you need, when, location, budget..." className="w-full px-3 py-2 rounded-xl border text-sm min-h-[64px] resize-none" style={{ borderColor: '#E2E8F0' }} />
                          <div className="flex flex-wrap gap-2">
                            {HELP_CATEGORIES.map(([v, l]) => (
                              <button key={v} type="button" onClick={() => setHelpForm({ ...helpForm, category: v })} className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${helpForm.category === v ? 'text-white' : 'bg-slate-100'}`} style={helpForm.category === v ? { background: PB } : { color: DN }}>
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <MediaUploader value={helpMedia} onChange={setHelpMedia} />
                      <div className="flex items-center justify-between pl-[52px]">
                        <span className="text-[10px] text-slate-400">Add a photo or video to show what you need</span>
                        <button onClick={askHelp} className="px-4 py-1.5 rounded-xl text-sm font-medium text-white" style={{ background: PB }}>Post Help Request</button>
                      </div>
                    </div>

                    {/* help threads */}
                    {(active.help || []).length === 0 ? (
                      <div className="text-center py-10 text-sm" style={{ color: '#64748B' }}>
                        <Handshake className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        No help requests yet. When someone asks, your community's the first place they'll turn.
                      </div>
                    ) : (
                      (active.help || []).map((h: any) => (
                        <div key={h.id} className="border rounded-2xl p-4" style={{ borderColor: h.status === 'resolved' ? '#BBF7D0' : '#E2E8F0' }}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={h.authorName} avatar={h.authorAvatar} size={36} />
                              <div>
                                <p className="text-sm font-semibold" style={{ color: DN }}>{h.authorName || 'Member'}</p>
                                <p className="text-[10px]" style={{ color: '#94A3B8' }}>{h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {h.status === 'resolved'
                                ? <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5"><CheckCircle2 className="w-3.5 h-3.5" />Resolved</span>
                                : <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 rounded-full px-2 py-0.5"><Clock className="w-3.5 h-3.5" />Open</span>}
                              <span className="text-[10px] text-slate-400 rounded-full bg-slate-100 px-2 py-0.5 font-medium">{HELP_CATEGORIES.find(c => c[0] === h.category)?.[1] || 'General'}</span>
                            </div>
                          </div>

                          <h4 className="font-semibold mt-3" style={{ color: DN }}>{h.title}</h4>
                          {h.description && <p className="text-sm mt-1" style={{ color: '#475569' }}>{h.description}</p>}
                          {h.mediaType === 'video' || h.video ? (
                            <div className="rounded-xl overflow-hidden bg-black mt-2"><video src={h.video} controls className="w-full max-h-[360px]" preload="metadata" /></div>
                          ) : h.image ? <img src={h.image} alt="" className="rounded-xl mt-2 max-h-[360px] w-full object-cover" /> : null}

                          {/* replies */}
                          {h.replies && h.replies.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {(expandedHelp === h.id ? h.replies : h.replies.slice(-2)).map((r: any) => (
                                <div key={r.id} className="bg-slate-50 rounded-xl p-3 ml-9">
                                  <div className="flex items-center gap-2">
                                    <Avatar name={r.authorName} avatar={r.authorAvatar} size={24} />
                                    <p className="text-xs font-semibold" style={{ color: DN }}>{r.authorName}</p>
                                    <p className="text-[10px]" style={{ color: '#94A3B8' }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</p>
                                  </div>
                                  <p className="text-xs mt-1" style={{ color: '#475569' }}>{r.content}</p>
                                  {r.video ? (
                                    <div className="rounded-lg overflow-hidden bg-black mt-1.5"><video src={r.video} controls className="w-full max-h-[240px]" preload="metadata" /></div>
                                  ) : r.image ? <img src={r.image} alt="" className="rounded-lg mt-1.5 max-h-[240px] w-full object-cover" /> : null}
                                </div>
                              ))}
                              {h.replies.length > 2 && (
                                <button onClick={() => setExpandedHelp(expandedHelp === h.id ? null : h.id)} className="text-xs font-medium ml-9" style={{ color: PB }}>
                                  {expandedHelp === h.id ? 'Show fewer' : `View all ${h.replies.length} replies`}
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-3">
                            <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: '#64748B' }}><Handshake className="w-3.5 h-3.5" />{h.offerCount || h.replies?.length || 0} offered to help</p>
                            <div className="flex-1" />
                            {canManage(h) && h.status === 'open' && (
                              <button onClick={() => resolve(h)} className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1 hover:bg-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" />Mark Resolved</button>
                            )}
                          </div>

                          {h.status === 'open' && (
                            <div className="mt-2 pl-0">
                              <textarea value={offerMap[h.id]?.text || ''} onChange={e => setOfferMap({ ...offerMap, [h.id]: { text: e.target.value, media: offerMedia[h.id] || null } })} placeholder={`Offer to help ${h.authorName || 'them'}...`} className="w-full px-3 py-2 rounded-xl border text-sm min-h-[52px] resize-none" style={{ borderColor: '#E2E8F0' }} />
                              <MediaUploader value={offerMedia[h.id] || null} onChange={(m) => setOfferMedia({ ...offerMedia, [h.id]: m })} label="Add photo / video" />
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-slate-400">Show what you're offering</span>
                                <button onClick={() => offer(h)} className="px-4 py-1.5 rounded-xl text-xs font-medium text-white" style={{ background: PB }}>Offer Help</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}