import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/store/authStore'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from '@/components/ui/sidebar'

const PB = '#0A66FF'
const DN = '#071B4D'

const navItems = [
  { icon: '🏠', label: 'Home', path: '/network-tap/dashboard' },
  { icon: '🌐', label: 'My Network', path: '/network-tap/connections' },
  { icon: '📱', label: 'Posts / Reals', path: '/network-tap/dashboard' },
  { icon: '💼', label: 'Jobs', path: '/network-tap/jobs' },
  { icon: '📂', label: 'Projects', path: '/network-tap/projects' },
  { icon: '🛂', label: 'Passport', path: '/network-tap/passport' },
  { icon: '✅', label: 'Verifications', path: '/network-tap/verifications' },
  { icon: '📋', label: 'Worklog', path: '/network-tap/worklog' },
  { icon: '🤝', label: 'References', path: '/network-tap/references' },
  { icon: '👥', label: 'Communities', path: '/network-tap/communities' },
  { icon: '📅', label: 'Events', path: '/network-tap/events' },
  { icon: '🎓', label: 'Mentorship', path: '/network-tap/mentorship' },
  { icon: '✨', label: 'AI Career Hub', path: '/network-tap/ai' },
  { icon: '💬', label: 'Messaging', path: '/network-tap/messages' },
  { icon: '🔔', label: 'Notification', path: '/network-tap/notifications' },
]

export function NtvSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  const isCompany = user?.accountType === 'company' || user?.company
  const hasPremium = user?.subscription?.status === 'active' || user?.subscription?.status === 'premium'
  const initial = user?.name?.[0] || (isCompany ? (user?.company?.[0] || 'C') : 'U')
  const displayName = user?.name || user?.company || (isCompany ? 'Company' : 'User')

  const items = [...navItems]
  if (isCompany) {
    items.splice(4, 0, { icon: '📋', label: hasPremium ? 'Candidates' : 'Applicants', path: '/network-tap/jobs' })
  }

  const currentPath = location.pathname
  const activeLabel = items.find(i => currentPath.startsWith(i.path))?.label || 'Home'

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-3 py-4 border-b" style={{ borderColor: '#E2E8F0' }}>
          <div className="text-center">
            {isCompany ? (
              <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold shadow-sm" style={{ background: PB }}>{initial}</div>
            ) : (
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold shadow-sm" style={{ background: PB }}>{initial}</div>
            )}
            <p className="font-semibold text-sm mt-2 truncate" style={{ color: DN }}>{displayName}</p>
            <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{isCompany ? (user?.company || 'Company') : 'Student / Job Seeker'}</p>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = activeLabel === item.label
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={active}>
                      <button onClick={() => navigate({ to: item.path as any })} className="flex items-center gap-3">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-3" style={{ borderColor: '#E2E8F0' }}>
        <SidebarMenuButton asChild>
          <button onClick={() => navigate({ to: isCompany ? '/dashboard' : '/' })} className="flex items-center gap-3 text-sm" style={{ color: '#64748B' }}>
            <span>←</span>
            <span>{isCompany ? 'Back to Main' : 'Back to Website'}</span>
          </button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
