import { NavLink } from '@/components/NavLink';
import { useAuthStore } from '@/store/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, DollarSign, Package, Globe, ShoppingBag,
  ChevronLeft, LogOut, Settings, ChevronDown, FileText, Calendar, Award, ShieldBan, FolderOpen, Receipt,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { useState } from 'react';

const mainNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'HR & People', url: '/hr', icon: Users, items: [
    { title: 'Employee List', url: '/hr', icon: Users },
    { title: 'Attendance', url: '/hr/attendance', icon: Calendar },
    { title: 'Leave Management', url: '/hr/leave', icon: FileText },
    { title: 'Performance', url: '/hr/performance', icon: Award },
    { title: 'Blacklist', url: '/hr/blacklist', icon: ShieldBan },
    { title: 'Documents', url: '/hr/documents', icon: FolderOpen },
  ] },
  { title: 'CRM', url: '/crm', icon: TrendingUp },
  { title: 'Accounting', url: '/accounting', icon: DollarSign, items: [
    { title: 'Ledger', url: '/accounting', icon: DollarSign },
    { title: 'Payroll', url: '/accounting/payroll', icon: Receipt },
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
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const isActive = (url: string) => location.pathname === url;
  const isGroupActive = (item: typeof mainNav[0]) => {
    if (item.items) return item.items.some((sub) => location.pathname === sub.url) || location.pathname.startsWith(item.url + '/');
    return location.pathname === item.url;
  };

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
                const active = isGroupActive(item);
                const hasItems = item.items && item.items.length > 0;
                const isExpanded = expanded === item.title || (active && hasItems);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => {
                          if (hasItems && !collapsed) {
                            setExpanded(isExpanded ? null : item.title);
                          } else {
                            navigate(item.url);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'gradient-primary text-primary-foreground shadow-md'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1 text-left">{item.title}</span>}
                        {!collapsed && hasItems && (
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </SidebarMenuButton>

                    {!collapsed && hasItems && isExpanded && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-sidebar-border pl-3">
                        {item.items!.map((sub) => (
                          <NavLink
                            key={sub.url}
                            to={sub.url}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isActive(sub.url)
                                ? 'text-sidebar-primary bg-sidebar-accent'
                                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                            }`}
                            activeClassName=""
                          >
                            <sub.icon className="w-3.5 h-3.5" />
                            {sub.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
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
            <SidebarMenuButton onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer w-full">
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
