import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

const PB = '#0A66FF'
const DN = '#071B4D'

const MOCK_REALS = [
  { id: 1, user: 'PowerBuild Contractors', type: 'company', avatar: 'P', content: 'We are hiring 3 Electrical Technicians for our Nairobi project. Apply with your Network Tap profile today!', likes: 45, comments: 12, time: '2h', badge: 'Verified Employer' },
  { id: 2, user: 'Grace Wanjiku', type: 'student', avatar: 'GW', content: 'Just completed my solar panel installation project — 3kW system for a residential home. Check out the photos in my portfolio!', likes: 89, comments: 23, time: '4h', badge: null },
  { id: 3, user: 'SunCulture Kenya', type: 'company', avatar: 'S', content: 'Internship Alert! We are looking for 5 Solar Installation Trainees. No experience needed — we train you. Apply now.', likes: 156, comments: 34, time: '6h', badge: 'Verified Employer' },
  { id: 4, user: 'Brian Kiprop', type: 'student', avatar: 'BK', content: 'Proud to share my welding project — custom gate fabrication for Green Valley Estate. Welding skills can take you far!', likes: 67, comments: 15, time: '1d', badge: null },
  { id: 5, user: 'NITA Kenya', type: 'company', avatar: 'N', content: 'Reminder: NITA Trade Test registration closes on September 1st. Get certified and boost your career.', likes: 203, comments: 41, time: '1d', badge: 'Government' },
]

const MOCK_NETWORK = [
  { name: 'Grace Wanjiku', title: 'Electrical Engineering Student', avatar: 'GW', mutual: 8 },
  { name: 'Faith Nyambura', title: 'Plumber @ AquaTech', avatar: 'FN', mutual: 5 },
  { name: 'Kevin Mwangi', title: 'Carpentry Student @ KTTI', avatar: 'KM', mutual: 3 },
]

export default function NetworkTapDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    if (user?.accountType === 'company' || user?.company) {
      api.ntv.project.list().then(setProjects).catch(() => {})
    }
  }, [])

  const isCompany = user?.accountType === 'company' || user?.company
  const hasPremium = user?.subscription?.status === 'active' || user?.subscription?.status === 'premium'
  const initial = user?.name?.[0] || (isCompany ? (user?.company?.[0] || 'C') : 'U')
  const displayName = user?.name || user?.company || (isCompany ? 'Company' : 'User')

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/network-tap/dashboard' },
    { icon: '🌐', label: 'My Network', path: '/network-tap/connections' },
    { icon: '📱', label: 'Posts / Reals', path: '/network-tap/dashboard' },
    { icon: '💼', label: 'Jobs', path: '/network-tap/jobs' },
    { icon: '💬', label: 'Messaging', path: '/network-tap/messages' },
    { icon: '🔔', label: 'Notification', path: '/network-tap/notifications' },
  ]

  if (isCompany) {
    navItems.splice(3, 0, { icon: '📋', label: hasPremium ? 'Candidates' : 'Applicants', path: '/network-tap/jobs' })
  }

  const currentPath = location.pathname
  const activeLabel = navItems.find(i => currentPath.startsWith(i.path))?.label || 'Home'

  const toggleLike = (id: number) => {
    setLiked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={{ background: '#F4F8FF', color: '#0F172A' }}>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: DN }}>{isCompany ? 'Company Dashboard' : 'Dashboard'}</h1>
              <p className="text-sm" style={{ color: '#64748B' }}>Welcome back, {displayName.split(' ')[0]}!</p>
            </div>
            <button onClick={() => setShowMobileNav(!showMobileNav)} className="lg:hidden p-2 rounded-lg border" style={{ borderColor: '#E2E8F0' }}>
              <span>☰</span>
            </button>
          </div>

          {showMobileNav && (
            <div className="lg:hidden bg-white rounded-2xl border p-3 mb-4 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
              <div className="grid grid-cols-2 gap-1">
                {navItems.map((item) => (
                  <button key={item.label} onClick={() => { navigate({ to: item.path as any }); setShowMobileNav(false) }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors`} style={{ background: activeLabel === item.label ? PB : 'transparent', color: activeLabel === item.label ? 'white' : '#475569' }}>
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <button onClick={() => { navigate({ to: isCompany ? '/dashboard' : '/' }); setShowMobileNav(false) }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground">
                  ← {isCompany ? 'Back to Main' : 'Back to Website'}
                </button>
              </div>
            </div>
          )}

          {isCompany && (
            <div className="bg-white rounded-2xl border p-5 mb-6 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold" style={{ background: PB }}>{initial}</div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: DN }}>{displayName}</h2>
                  <p className="text-sm" style={{ color: '#64748B' }}>{user?.email || ''}</p>
                  <Link to="/network-tap/jobs" className="text-xs font-medium" style={{ color: PB }}>Manage Job Postings →</Link>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl text-center" style={{ background: '#F4F8FF' }}>
                  <p className="text-xl font-bold" style={{ color: DN }}>4</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>Active Jobs</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: '#F4F8FF' }}>
                  <p className="text-xl font-bold" style={{ color: DN }}>{hasPremium ? '24' : '24'}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{hasPremium ? 'Candidates' : 'Applicants'}</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: '#F4F8FF' }}>
                  <p className="text-xl font-bold" style={{ color: DN }}>12</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>New This Week</p>
                </div>
              </div>
            </div>
          )}

          {isCompany && !hasPremium && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ borderColor: '#FDE68A' }}>
              <span className="text-lg">🔒</span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#92400E' }}>Applicants-Only View</p>
                <p className="text-xs" style={{ color: '#B45309' }}>Upgrade to Premium to view full candidate profiles, skills, portfolios, and advanced hiring tools.</p>
              </div>
              <button className="px-4 py-1.5 rounded-xl text-xs font-medium shrink-0" style={{ background: PB }}>Upgrade</button>
            </div>
          )}

          <div className="space-y-4">
            {MOCK_REALS.map((real) => (
              <div key={real.id} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: real.type === 'company' ? DN : PB }}>
                    {real.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm" style={{ color: DN }}>{real.user}</p>
                      {real.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: real.badge === 'Government' ? '#EEF2FF' : '#DCFCE7', color: real.badge === 'Government' ? PB : '#16A34A' }}>
                          {real.badge === 'Government' ? '✓ Govt' : '✓ Employer'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: '#64748B' }}>{real.type === 'company' ? 'Company' : 'Student'} · {real.time}</p>
                  </div>
                </div>
                <p className="text-sm mb-3" style={{ color: '#0F172A' }}>{real.content}</p>
                <div className="flex items-center gap-4 pt-3 border-t text-sm" style={{ borderColor: '#E2E8F0' }}>
                  <button onClick={() => toggleLike(real.id)} className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors hover:bg-gray-100" style={{ color: liked.has(real.id) ? PB : '#64748B' }}>
                    {liked.has(real.id) ? '❤️' : '👍'} {real.likes + (liked.has(real.id) ? 1 : 0)}
                  </button>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#64748B' }}>
                    💬 {real.comments}
                  </button>
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors ml-auto" style={{ color: '#64748B' }}>
                    🔗 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="hidden xl:block w-72 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border p-4 sticky top-20 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: DN }}>{isCompany ? 'Recent Projects' : 'My Network'}</h3>
            <div className="space-y-3">
              {isCompany ? (
                projects.slice(0, 4).length > 0 ? projects.slice(0, 4).map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: '#EEF2FF' }}>📂</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs" style={{ color: DN }}>{p.title}</p>
                      <p className="text-[11px]" style={{ color: '#64748B' }}>{p.authorName || 'Individual'}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs" style={{ color: '#94A3B8' }}>No projects posted yet</p>
                )
              ) : (
                MOCK_NETWORK.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ background: PB }}>{p.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs" style={{ color: DN }}>{p.name}</p>
                      <p className="text-[11px]" style={{ color: '#64748B' }}>{p.title}</p>
                    </div>
                    <button className="text-xs font-medium px-2.5 py-1 rounded-lg border" style={{ borderColor: PB, color: PB }}>+</button>
                  </div>
                ))
              )}
            </div>
            <Link to={isCompany ? '/network-tap/projects' : '/network-tap/connections'} className="block text-center text-xs font-medium mt-3 pt-3 border-t" style={{ color: PB, borderColor: '#E2E8F0' }}>
              {isCompany ? 'Browse All Projects →' : 'View All Connections →'}
            </Link>
          </div>

          <div className="bg-white rounded-2xl border p-4 sticky top-[22rem] shadow-sm" style={{ borderColor: '#E2E8F0' }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: DN }}>{isCompany ? 'Company Stats' : 'Quick Stats'}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span style={{ color: '#64748B' }}>{isCompany ? 'Job Views' : 'Profile Views'}</span>
                <span className="font-semibold" style={{ color: DN }}>156</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#64748B' }}>{isCompany ? 'Applications' : 'Applications'}</span>
                <span className="font-semibold" style={{ color: DN }}>24</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#64748B' }}>Messages</span>
                <span className="font-semibold" style={{ color: DN }}>5</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#64748B' }}>{isCompany ? 'Projects Listed' : 'Connections'}</span>
                <span className="font-semibold" style={{ color: DN }}>{isCompany ? projects.length : '12'}</span>
              </div>
            </div>
            <Link to={isCompany ? '/network-tap/projects' : '/network-tap/profile'} className="block text-center text-xs font-medium mt-3 pt-3 border-t" style={{ color: PB, borderColor: '#E2E8F0' }}>
              {isCompany ? 'Browse Projects →' : 'View Profile →'}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
