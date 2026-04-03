import { NavLink } from '@/components/NavLink';
import { useAuthStore } from '@/store/authStore';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, DollarSign, Package, Globe, ShoppingBag,
  ChevronLeft, LogOut, Settings, Zap,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const mainNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'HR & People', icon: Users, items: [
    { title: 'Employee List', url: '/hr' },
    { title: 'Add Employee', url: '/hr/add' },
    { title: 'Attendance', url: '/hr/attendance' },
    { title: 'Leave Management', url: '/hr/leave' },
    { title: 'Performance', url: '/hr/performance' },
    { title: 'Blacklist', url: '/hr/blacklist' },
  ] },
  { title: 'CRM', url: '/crm', icon: TrendingUp },
  { title: 'Accounting', url: '/accounting', icon: DollarSign, items: [
    { title: 'Ledger', url: '/accounting' },
    { title: 'Payroll', url: '/accounting/payroll' },
  ] },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Networking', url: '/networking', icon: Globe },
  { title: 'Marketplace', url: '/marketplace', icon: ShoppingBag },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  return (
    <Sidebar collapsible="icon">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
          <img src="/logo.png" alt="HEYLA" className="w-8 h-8 rounded-lg shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-primary-foreground tracking-tight">
              HEYLA<span className="text-sidebar-primary"> OS</span>
            </span>
          )}
          {!collapsed && (
            <button onClick={toggleSidebar} className="ml-auto text-sidebar-foreground hover:text-sidebar-primary-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-2">
            {!collapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
SidebarCollapsible>
                <SidebarCollapsibleTrigger asChild>
                  <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'gradient-primary text-primary-foreground shadow-md'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4 border-t border-sidebar-border pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors" activeClassName="bg-sidebar-accent">
                <Settings className="w-5 h-5 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer w-full">
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
