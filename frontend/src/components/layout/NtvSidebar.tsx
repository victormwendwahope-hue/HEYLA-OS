import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from '@tanstack/react-router'

const PB = '#0A66FF'
const DN = '#071B4D'

const navItems = [
  { icon: '🏠', label: 'Home', path: '/network-tap/dashboard' },
  { icon: '🌐', label: 'My Network', path: '/network-tap/connections' },
  { icon: '📱', label: 'Posts / Reals', path: '/network-tap/dashboard' },
  { icon: '💼', label: 'Jobs', path: '/network-tap/jobs' },
  { icon: '💬', label: 'Messaging', path: '/network-tap/messages' },
  { icon: '🔔', label: 'Notification', path: '/network-tap/notifications' },
]

export function NtvSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = localStorage.getItem('heyla_user')
    if (u) setUser(JSON.parse(u))
  }, [])

  const isCompany = user?.accountType === 'company' || user?.company
  const hasPremium = user?.subscription?.status === 'active' || user?.subscription?.status === 'premium'
  const initial = user?.name?.[0] || (isCompany ? (user?.company?.[0] || 'C') : 'U')
  const displayName = user?.name || user?.company || (isCompany ? 'Company' : 'User')

  const items = [...navItems]
  if (isCompany) {
    items.splice(3, 0, { icon: '📋', label: hasPremium ? 'Candidates' : 'Applicants', path: '/network-tap/jobs' })
  }

  const currentPath = location.pathname
  const activeLabel = items.find(i => currentPath.startsWith(i.path))?.label || 'Home'

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="bg-white rounded-2xl border overflow-hidden sticky top-20 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
        <div className="h-16" style={{ background: 'linear-gradient(135deg, #071B4D, #0A66FF)' }} />
        <div className="text-center -mt-10 px-4 pb-4 border-b" style={{ borderColor: '#E2E8F0' }}>
          {isCompany ? (
            <div className="w-20 h-20 rounded-xl border-3 border-white mx-auto flex items-center justify-center font-bold text-xl mb-2 shadow-md" style={{ background: 'white', color: DN }}>
              <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl" style={{ background: PB }}>{initial}</div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full border-3 border-white mx-auto flex items-center justify-center font-bold text-xl mb-2 shadow-md" style={{ background: PB, color: 'white' }}>
              {initial}
            </div>
          )}
          <Link to={isCompany ? '/network-tap/jobs' : '/network-tap/profile'} className="font-semibold hover:underline" style={{ color: DN }}>{displayName}</Link>
          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{isCompany ? (user?.company || 'Company Account') : 'Student / Job Seeker'}</p>
          {isCompany && (
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: hasPremium ? '#DCFCE7' : '#FEF3C7', color: hasPremium ? '#16A34A' : '#B45309' }}>
                {hasPremium ? 'Premium' : 'Free'}
              </span>
            </div>
          )}
        </div>
        <div className="py-2">
          {items.map((item) => (
            <button key={item.label} onClick={() => { navigate({ to: item.path as any }) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${activeLabel === item.label ? 'text-white' : 'hover:bg-gray-50'}`}
              style={{ background: activeLabel === item.label ? PB : 'transparent', color: activeLabel === item.label ? 'white' : '#475569' }}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="border-t" style={{ borderColor: '#E2E8F0' }}>
          <button onClick={() => navigate({ to: isCompany ? '/dashboard' : '/' })}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ color: '#64748B' }}>
            <span>←</span>
            {isCompany ? 'Back to Main' : 'Back to Website'}
          </button>
        </div>
      </div>
    </aside>
  )
}
