import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { sanitizeUrl } from '@/lib/secure'
import { Heart, MessageCircle, Share2, Bookmark, Play, X, MapPin, Sparkles, TrendingUp, Clock } from 'lucide-react'

const PB = '#0A66FF'

const FALLBACK_REELS: any[] = [
  {
    id: 'r1', postType: 'media', content: 'Watch: 3kW solar installation in 90 seconds — grid-tied rooftop system for a residential home. ⚡ #solar #greenenergy',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', mediaType: 'video',
    likes: 892, comments: 47, shares: 12,
    author: { name: 'Grace Wanjiku', headline: 'Solar Installation Technician', photo: '' },
  },
  {
    id: 'r2', postType: 'project', content: 'Custom 8ft steel gate for Green Valley Estate — laser-cut 3D pattern, 40+ booth hours. 🔥',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', mediaType: 'video',
    likes: 604, comments: 38, shares: 9,
    author: { name: 'Brian Kiprop', headline: 'Welder & Fabricator', photo: '' },
  },
  {
    id: 'r3', postType: 'opportunity', content: 'HIRING: 3 Electrical Technicians for our Nairobi project. Apply with your skills profile. 🔌',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', mediaType: 'video',
    likes: 431, comments: 87, shares: 21,
    author: { name: 'PowerBuild Contractors', headline: 'Verified Employer', photo: '' },
  },
  {
    id: 'r4', postType: 'achievement', content: 'Bathroom PPR re-piping done and passed inspection! Plumbers, represent. 💧',
    mediaUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=640&q=80', mediaType: 'image',
    likes: 538, comments: 21, shares: 4,
    author: { name: 'Faith Nyambura', headline: 'Plumber @ AquaTech', photo: '' },
  },
  {
    id: 'r5', postType: 'status', content: 'Tuesday tip: a portfolio with reels beats a wall of certificates. Employers watch videos. 👀',
    mediaUrl: null, mediaType: null,
    likes: 210, comments: 19, shares: 6,
    author: { name: 'NITA Kenya', headline: 'Government Agency', photo: '' },
  },
]

const FALLBACK_PHOTO_POSTS: any[] = [
  {
    id: 'p1', postType: 'project', content: 'Complete bathroom renovation — tiling, plumbing, finishes. Client review: 5★.',
    mediaUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=640&q=80', mediaType: 'image',
    likes: 342, comments: 25, shares: 3,
    author: { name: 'Maya Finishes', headline: 'Painting & Finishing', photo: '' },
  },
  {
    id: 'p2', postType: 'project', content: 'Office structured cabling — 40 desks, 2 server rooms, zero downtime migration.',
    mediaUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=640&q=80', mediaType: 'image',
    likes: 189, comments: 14, shares: 2,
    author: { name: 'TechBuilt', headline: 'ICT & Networking', photo: '' },
  },
  {
    id: 'p3', postType: 'achievement', content: 'Engine rebuild complete — 350km test drive, no leaks. #auto #mechanics',
    mediaUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=640&q=80', mediaType: 'image',
    likes: 276, comments: 31, shares: 5,
    author: { name: 'AutoWorks Ltd', headline: 'Automotive Repair', photo: '' },
  },
  {
    id: 'p4', postType: 'opportunity', content: 'Internship: 5 solar trainees wanted — we train, you install. No experience needed.',
    mediaUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=640&q=80', mediaType: 'image',
    likes: 156, comments: 44, shares: 8,
    author: { name: 'SunCulture Kenya', headline: 'Verified Employer', photo: '' },
  },
]

const FALLBACK_PHOTO_POSTS_2: any[] = [
  {
    id: 'p5', postType: 'project', content: 'Onyx countertop install for Karen residence — 4 days, zero defects.',
    mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=640&q=80', mediaType: 'image',
    likes: 198, comments: 12, shares: 2,
    author: { name: 'StoneCraft KE', headline: 'Masonry & Stone', photo: '' },
  },
  {
    id: 'p6', postType: 'status', content: 'Carpentry: mid-century dining set, 12 pieces, mahogany finish.',
    mediaUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=640&q=80', mediaType: 'image',
    likes: 264, comments: 22, shares: 4,
    author: { name: 'MazuriWood', headline: 'Carpentry & Joinery', photo: '' },
  },
]

const FALLBACK_PROJECTS = [
  { id: 'fp1', title: 'Smart 3kW Solar System', mediaUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=640&q=80', mediaType: 'image', authorName: 'Grace Wanjiku', description: 'Complete grid-tied solar install with battery backup.', technologies: 'Solar, Inverters, Wiring' },
  { id: 'fp2', title: 'Custom Steel Gate', mediaUrl: 'https://images.unsplash.com/photo-1504307651254-356dfd9?w=640&q=80', mediaType: 'image', authorName: 'Brian Kiprop', description: '8ft gate with laser-cut pattern.', technologies: 'Welding, Fabrication' },
  { id: 'fp3', title: 'Office Network Rebuild', mediaUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=640&q=80', mediaType: 'image', authorName: 'TechBuilt', description: 'Structured cabling, 40 desks, server room cooling.', technologies: 'ICT, Networking' },
  { id: 'fp4', title: 'Engine Rebuild', mediaUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=640&q=80', mediaType: 'image', authorName: 'AutoWorks Ltd', description: 'Full engine rebuild, 350km passed.', technologies: 'Automotive' },
  { id: 'fp5', title: 'Bathroom Renovation', mediaUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=640&q=80', mediaType: 'image', authorName: 'Maya Finishes', description: 'Tiling, plumbing, finishing — passed inspection.', technologies: 'Plumbing, Painting' },
  { id: 'fp6', title: 'Smart Lab Build', mediaUrl: 'https://images.unsplash.com/photo-1545870811-2cc83ffd565d?w=640&q=80', mediaType: 'image', authorName: 'TechBuilt', description: '60-seat lab, server room + cooling.', technologies: 'ICT, HVAC' },
]

const FALLBACK_JOBS = [
  { id: 'j1', title: 'Electrical Technician', company: { name: 'PowerBuild Contractors' }, location: 'Nairobi, Kenya', employmentType: 'full_time', salaryRange: 'KSh 40K – 60K' },
  { id: 'j2', title: 'Carpenter — Kitchen Fitting', company: { name: 'UrbanKitchen' }, location: 'Nairobi, Kenya', employmentType: 'full_time', salaryRange: 'KSh 35K – 50K' },
  { id: 'j3', title: 'Solar Installation Intern', company: { name: 'SunCulture Kenya' }, location: 'Kiambu, Kenya', employmentType: 'Internship', salaryRange: 'KSh 15K' },
  { id: 'j4', title: 'Refrigeration Technician', company: { name: 'CoolTech Services' }, location: 'Mombasa, Kenya', employmentType: 'full_time', salaryRange: 'KSh 50K – 70K' },
  { id: 'j5', title: 'Mason — Site Supervisor', company: { name: 'BuildRight Ltd' }, location: 'Eldoret, Kenya', employmentType: 'full_time', salaryRange: 'KSh 40K – 55K' },
]

const FALLBACK_SKILLS = [
  { name: 'Welding', count: 48 }, { name: 'Electrical Wiring', count: 42 }, { name: 'Solar Installation', count: 36 },
  { name: 'Plumbing', count: 34 }, { name: 'Carpentry', count: 31 }, { name: 'Masonry', count: 28 },
  { name: 'Auto Repair', count: 25 }, { name: 'Network Cabling', count: 22 }, { name: 'HVAC', count: 19 },
]

type TabId = 'reels' | 'posts' | 'projects' | 'jobs'

export default function NetworkTapLanding() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  const [scrolled, setScrolled] = useState(false)
  const [tab, setTab] = useState<TabId>('reels')
  const [showModal, setShowModal] = useState(false)
  const [feed, setFeed] = useState<any[]>(FALLBACK_REELS)
  const [posts, setPosts] = useState<any[]>([...FALLBACK_PHOTO_POSTS, ...FALLBACK_PHOTO_POSTS_2])
  const [projects, setProjects] = useState<any[]>(FALLBACK_PROJECTS)
  const [jobs, setJobs] = useState<any[]>(FALLBACK_JOBS)
  const [skills, setSkills] = useState<any[]>(FALLBACK_SKILLS)
  const [loading, setLoading] = useState(true)

  const feedContainerRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<Map<number, HTMLVideoElement>>(new Map())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    Promise.allSettled([
      api.public.ntv.feed('trending', 20),
      api.public.ntv.feed('recent', 20),
      api.public.ntv.projects(8),
      api.public.ntv.jobs(10),
      api.public.ntv.skills(24),
    ]).then(([trendingR, recentR, projectsR, jobsR, skillsR]) => {
      const pick = (r: PromiseSettledResult<any[]>, fb: any[]) => (r.status === 'fulfilled' && r.value.length > 0 ? r.value : fb)
      const recentPosts = pick(recentR, [])
      setFeed(pick(trendingR, FALLBACK_REELS))
      setPosts(recentPosts.length > 0 ? recentPosts : pick(trendingR, [...FALLBACK_PHOTO_POSTS, ...FALLBACK_PHOTO_POSTS_2]))
      setProjects(pick(projectsR, FALLBACK_PROJECTS))
      setJobs(pick(jobsR, FALLBACK_JOBS))
      setSkills(pick(skillsR, FALLBACK_SKILLS))
      setLoading(false)
    })
  }, [])

  useEffect(() => { load() }, [load])

  const reelFeed = useMemo(() => {
    if (tab !== 'reels') return []
    return feed
  }, [feed, tab])

  useEffect(() => {
    if (tab !== 'reels' || !feedContainerRef.current) return
    const container = feedContainerRef.current
    let lastIndex = -1
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
      if (visible.length === 0) return
      const idx = Number((visible[0].target as HTMLElement).dataset.index)
      if (idx !== lastIndex) {
        lastIndex = idx
        mediaRef.current.forEach((v, key) => {
          if (key === idx) v.play().catch(() => {})
          else v.pause()
        })
      }
    }, { root: container, threshold: 0.55 })
    const cards = container.querySelectorAll<HTMLElement>('[data-index]')
    cards.forEach((c) => observer.observe(c))
    return () => observer.disconnect()
  }, [tab, reelFeed])

  const openAuth = (action: string) => {
    if (isAuthenticated) { navigate({ to: '/network-tap/dashboard' }); return }
    setShowModal(true)
    void action
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: '#050B1F' }}>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? 'bg-black/85 backdrop-blur' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0" style={{ background: 'linear-gradient(135deg, #0A66FF, #38BDF8)' }}>NT</div>
            <span className="font-bold text-sm sm:text-lg truncate text-white">NETWORK TAP</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <button onClick={() => navigate({ to: '/network-tap/dashboard' })}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0A66FF, #38BDF8)', color: 'white' }}>
                Open your feed{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </button>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors" style={{ borderColor: '#ffffff55', color: 'white' }}>Sign In</Link>
                <Link to="/register/individual" className="px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0A66FF, #38BDF8)', color: 'white' }}>Join Free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed top-14 inset-x-0 z-40 py-2 px-2">
        <div className="max-w-xl mx-auto flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'reels' as TabId, label: '🎬 Reels' },
            { id: 'posts' as TabId, label: '📸 Posts' },
            { id: 'projects' as TabId, label: '📂 Projects' },
            { id: 'jobs' as TabId, label: '💼 Jobs & Skill' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${tab === t.id ? 'text-white' : 'text-white/60 hover:text-white'}`}
              style={{ background: tab === t.id ? 'linear-gradient(135deg, #0A66FF, #38BDF8)' : 'rgba(255,255,255,0.08)' }}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 min-h-0 pt-28 sm:pt-[7.5rem]">
        <div className="h-full max-w-xl mx-auto relative">
          {tab === 'reels' && (
            <div ref={feedContainerRef} className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar">
              {(loading ? FALLBACK_REELS : reelFeed).map((post: any, i: number) => (
                <ReelCard key={post.id} post={post} index={i} onAction={openAuth}
                  videoRef={(el) => { if (el) mediaRef.current.set(i, el); else mediaRef.current.delete(i) }} />
              ))}
            </div>
          )}
          {tab === 'posts' && <PostsGrid posts={loading ? [...FALLBACK_PHOTO_POSTS, ...FALLBACK_PHOTO_POSTS_2] : posts} onAction={openAuth} />}
          {tab === 'projects' && <ProjectsGrid projects={projects} />}
          {tab === 'jobs' && <JobsPanel jobs={jobs} skills={skills} onAction={openAuth} />}
        </div>
      </main>

      <footer className="shrink-0 py-3 text-center text-[11px] text-white/35 px-4">
        Browse everything free — no account needed. Join to like, comment &amp; apply. <Link to="/register/individual" className="font-semibold" style={{ color: '#7FB5FF' }}>Join free</Link>
      </footer>

      <AuthModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function ReelCard({ post, index, onAction, videoRef }: { post: any; index: number; onAction: (a: string) => void; videoRef: (el: HTMLVideoElement | null) => void }) {
  const [playing, setPlaying] = useState(false)
  const isVideo = post.mediaType === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(post.mediaUrl || '')
  const initials = ((post.author?.name || 'U').split(' ').filter(Boolean).slice(0, 2).map((p: string) => p[0]).join('') || 'U').toUpperCase()

  return (
    <section data-index={index} className="relative w-full h-full min-h-[65vh] snap-start overflow-hidden" style={{ background: 'linear-gradient(160deg, #071236 0%, #0A2E6F 55%, #0A66FF 100%)' }}>
      <div className="absolute inset-0">
        {post.mediaUrl ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={sanitizeUrl(post.mediaUrl)}
              loop muted playsInline preload="metadata"
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
              onClick={(e) => { e.stopPropagation(); const v = e.currentTarget; if (v.paused) v.play().catch(() => {}); else v.pause() }}
              className="w-full h-full object-contain sm:object-cover" />
          ) : (
            <img src={sanitizeUrl(post.mediaUrl)} alt="" loading={index > 2 ? 'lazy' : 'eager'} className="w-full h-full object-contain sm:object-cover" />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <p className="text-lg sm:text-xl font-semibold text-white/90 leading-relaxed max-w-sm">{post.content}</p>
          </div>
        )}
        {!post.mediaUrl && <Sparkles className="absolute top-6 left-6 w-5 h-5 text-white/40" />}
        {isVideo && !playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        )}
        {isVideo && (
          <span className="absolute top-4 left-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/50 text-white">▶ Reel</span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 pb-7 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none">
        <p className="font-bold text-white text-sm flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'linear-gradient(135deg, #0A66FF, #38BDF8)' }}>▶</span>
          {post.author?.name || 'Member'}
          <span className="font-normal text-white/70 text-xs">· {post.author?.headline || 'Skilled Worker'}</span>
        </p>
        <p className="text-white/90 text-sm line-clamp-2 mt-1 max-w-sm">{post.content}</p>
      </div>

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4">
        <ActionButton icon={<Heart className="w-5 h-5 text-white" />} count={post.likes || 0} onClick={() => onAction('like')} />
        <ActionButton icon={<MessageCircle className="w-5 h-5 text-white" />} count={post.comments || 0} onClick={() => onAction('comment')} />
        <ActionButton icon={<Share2 className="w-5 h-5 text-white" />} count={post.shares || 0} onClick={() => onAction('share')} />
        <ActionButton icon={<Bookmark className="w-5 h-5 text-white" />} onClick={() => onAction('like')} />
      </div>
      <div className="absolute left-4 top-[4.5rem] w-10 h-10 rounded-full bg-gradient-to-br from-[#0A66FF] to-[#38BDF8] flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white/30">{initials}</div>
      <p className="absolute left-4 top-[7.5rem] text-white/50 text-[10px] font-semibold tracking-wide">Follow</p>
    </section>
  )
}

function ActionButton({ icon, count, onClick }: { icon: React.ReactNode; count?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <span className="w-11 h-11 rounded-full bg-black/35 backdrop-blur border border-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</span>
      {count !== undefined && <span className="text-white text-xs font-semibold">{count}</span>}
    </button>
  )
}

function PostsGrid({ posts, onAction }: { posts: any[]; onAction: (a: string) => void }) {
  if (!posts?.length) return <EmptyState label="No posts yet — the first one could be yours!" />
  return (
    <div className="h-full overflow-y-auto px-3 py-4 grid grid-cols-2 gap-3 content-start">
      {posts.map((p: any) => (
        <button key={p.id} onClick={() => onAction('like')} className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-lg border border-white/10">
          {p.mediaUrl ? (
            <>
              <img src={sanitizeUrl(p.mediaUrl)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-2 left-2 right-2 text-left text-[11px] text-white font-medium line-clamp-2">{p.content}</p>
              <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-white bg-black/50 rounded-full px-2 py-0.5"><Heart className="w-3 h-3" /> {p.likes || 0}</span>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col justify-between p-3 text-left" style={{ background: 'linear-gradient(140deg, #0A66FF, #071B4D)' }}>
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-white text-xs font-semibold line-clamp-4">{p.content}</p>
                <p className="text-white/70 text-[10px] mt-1">{p.author?.name || 'Member'}</p>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

function ProjectsGrid({ projects }: { projects: any[] }) {
  if (!projects?.length) return <EmptyState label="No projects uploaded yet — be the first to showcase your work!" />
  return (
    <div className="h-full overflow-y-auto px-3 py-4">
      <div className="grid sm:grid-cols-2 gap-4 content-start">
        {projects.map((p: any) => (
          <div key={p.id} className="rounded-2xl overflow-hidden bg-[#0B1530] border border-white/10">
            <div className="relative aspect-video">
              {p.video || p.mediaType === 'video' ? (
                <video src={sanitizeUrl(p.video || p.mediaUrl)} controls playsInline preload="metadata" className="w-full h-full object-cover" />
              ) : p.thumbnail || p.mediaUrl ? (
                <img src={sanitizeUrl(p.thumbnail || p.mediaUrl)} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, #0A66FF55, #071B4D)' }}>📂</div>
              )}
            </div>
            <div className="p-3.5">
              <p className="font-semibold text-white text-sm truncate">{p.title}</p>
              <p className="text-[11px] text-white/60 mb-2">by {p.authorName || 'Member'}</p>
              <p className="text-xs text-white/80 line-clamp-2 mb-3">{p.description || '—'}</p>
              <div className="flex flex-wrap gap-1.5">
                {(p.technologies || '').split(',').filter(Boolean).slice(0, 4).map((t: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#0A66FF33', color: '#7FB5FF' }}>{t.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function JobsPanel({ jobs, skills, onAction }: { jobs: any[]; skills: any[]; onAction: (a: string) => void }) {
  return (
    <div className="h-full overflow-y-auto px-4 py-4 pb-10">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
        <h2 className="text-white font-bold text-sm">Latest Jobs &amp; Vacancies</h2>
      </div>
      <div className="space-y-2.5">
        {jobs.map((j: any) => (
          <button key={j.id} onClick={() => onAction('job')} className="w-full text-left rounded-2xl bg-[#0B1530] border border-white/10 p-3.5 hover:border-[#38BDF8]/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{j.title}</p>
                <p className="text-xs text-white/70 mt-0.5 flex items-center gap-1 flex-wrap"><Sparkles className="w-3 h-3" /> {j.company?.name || j.company} · <MapPin className="w-3 h-3" /> {j.location || 'Kenya'}</p>
              </div>
              <span className="shrink-0 text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide" style={{ background: '#0A66FF33', color: '#8FBDFF' }}>
                {j.employmentType || 'Full time'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
              <span className="text-xs font-semibold text-[#38BDF8]">{j.salaryRange || j.salary || ''}</span>
              <span className="text-[11px] text-white/60">Apply free →</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#38BDF8]" />
          <h2 className="text-white font-bold text-sm">Skills Employers Want</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((s: any, i: number) => (
            <span key={`${s.name}-${i}`} className="text-xs font-medium px-3.5 py-1.5 rounded-full" style={{ background: '#0B1530', border: '1px solid #ffffff22' }}>
              <span className="text-white">{s.name}</span>
              <span className="ml-1.5 text-white/50">· {s.count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🎒</div>
        <p className="text-white/70 text-sm">{label}</p>
      </div>
    </div>
  )
}

function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
        <button onClick={onClose} className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-gray-100" aria-label="Close">
          <X className="w-5 h-5" style={{ color: '#64748B' }} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: 'linear-gradient(135deg, #0A66FF, #38BDF8)' }}>🎬</div>
        <h3 className="text-xl font-bold mb-1" style={{ color: '#071B4D' }}>Join to interact</h3>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>
          Like, comment &amp; share reels, post your work, and apply for jobs. Free forever — 29 seconds to join.
        </p>
        <button onClick={() => navigate({ to: '/register/individual' })} className="w-full py-3 rounded-xl font-semibold text-white shadow-lg hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #0A66FF, #38BDF8)' }}>
          Create Free Account
        </button>
        <button onClick={() => navigate({ to: '/login' })} className="w-full py-3 rounded-xl font-semibold mt-3 border-2 hover:bg-blue-50 transition-colors" style={{ borderColor: '#0A66FF', color: '#0A66FF' }}>
          Sign In
        </button>
        <p className="text-[11px] text-center mt-4" style={{ color: '#94A3B8' }}>Job seekers, students, artisans &amp; employers</p>
      </div>
    </div>
  )
}