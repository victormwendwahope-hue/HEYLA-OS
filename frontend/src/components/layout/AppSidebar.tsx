import { NavLink } from '@/components/NavLink';
import { useAuthStore } from '@/store/authStore';
import { useLocation, useNavigate, Link } from '@tanstack/react-router';
import {
  LayoutDashboard, Users, TrendingUp, DollarSign, Package, Globe,
  ChevronLeft, LogOut, Settings, ChevronDown, FileText, Calendar, Award, ShieldBan, FolderOpen, Receipt,
  Truck, Fuel, Briefcase, Moon, Sun, HeartPulse, Shield, HardHat, ShieldCheck,
  AlertTriangle, ClipboardCheck, Bell, Building2, FileSignature, Scale, Banknote, Gavel, ShieldAlert,
  User, UserPlus, MessageCircle, Activity, Navigation, Wallet, Wrench, CalendarClock, Disc, Satellite,
  Target, LifeBuoy, Users2, Zap,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { sanitizeUrl } from '@/lib/secure';

const mainNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'HR & People', url: '/hr', icon: Users, items: [
    { title: 'Employee List', url: '/hr', icon: Users },
    { title: 'Attendance', url: '/hr/attendance', icon: Calendar },
    { title: 'Leave Management', url: '/hr/leave', icon: FileText },
    { title: 'Performance', url: '/hr/performance', icon: Award },
    { title: 'WIBA Benefits', url: '/hr/wiba', icon: Shield },
    { title: 'Injury Management', url: '/hr/injuries', icon: HeartPulse },
    { title: 'Blacklist', url: '/hr/blacklist', icon: ShieldBan },
    { title: 'Documents', url: '/hr/documents', icon: FolderOpen },
    { title: 'Payroll', url: '/hr/payroll', icon: Receipt },
  ] },
  { title: 'EHS', url: '/ehs', icon: ShieldCheck, items: [
    { title: 'Dashboard', url: '/ehs', icon: ShieldCheck },
    { title: 'Incidents', url: '/ehs', icon: AlertTriangle },
    { title: 'Compliance', url: '/ehs', icon: ClipboardCheck },
    { title: 'Inspections', url: '/ehs', icon: ClipboardCheck },
    { title: 'Alerts', url: '/ehs', icon: Bell },
  ] },
  { title: 'Engineering', url: '/engineering', icon: HardHat, items: [
    { title: 'Dashboard', url: '/engineering', icon: Building2 },
    { title: 'Contracts', url: '/engineering', icon: FileSignature },
    { title: 'Claims', url: '/engineering', icon: Scale },
    { title: 'Payments', url: '/engineering', icon: Banknote },
    { title: 'Disputes', url: '/engineering', icon: Gavel },
    { title: 'Early Warnings', url: '/engineering', icon: ShieldAlert },
  ] },
  { title: 'Jobs & Recruitment', url: '/jobs', icon: Briefcase },
  { title: 'CRM', url: '/crm', icon: TrendingUp, items: [
    { title: 'Overview', url: '/crm', icon: LayoutDashboard },
    { title: 'Customers', url: '/crm/customers', icon: Users },
    { title: 'Leads', url: '/crm/leads', icon: Target },
    { title: 'Opportunities', url: '/crm/opportunities', icon: TrendingUp },
    { title: 'Pipeline Board', url: '/crm/pipeline', icon: Activity },
    { title: 'Quotations', url: '/crm/quotations', icon: FileText },
    { title: 'Communications', url: '/crm/communications', icon: MessageCircle },
    { title: 'Tickets', url: '/crm/tickets', icon: LifeBuoy },
    { title: 'Customer Success', url: '/crm/customer-success', icon: HeartPulse },
    { title: 'Forecasting', url: '/crm/forecasting', icon: Target },
    { title: 'Sales Team', url: '/crm/sales-team', icon: Users2 },
    { title: 'Automations', url: '/crm/automations', icon: Zap },
    { title: 'Reports', url: '/crm/reports', icon: ClipboardCheck },
  ] },
  { title: 'Accounting', url: '/accounting', icon: DollarSign, items: [
    { title: 'Overview', url: '/accounting', icon: DollarSign },
    { title: 'Payroll', url: '/accounting/payroll', icon: Receipt },
  ] },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Transport & Fuel', url: '/transport', icon: Truck, items: [
    { title: 'Fleet Intelligence', url: '/transport/fti', icon: Activity },
    { title: 'Vehicles', url: '/transport/vehicles', icon: Truck },
    { title: 'Drivers', url: '/transport/drivers', icon: Users },
    { title: 'Fuel Tracking', url: '/transport/fuel', icon: Fuel },
    { title: 'Fuel Analytics', url: '/transport/fuel-analytics', icon: ShieldAlert },
    { title: 'Trips', url: '/transport/trips', icon: Navigation },
    { title: 'Flexible Costing', url: '/transport/costing', icon: Wallet },
    { title: 'Workshop', url: '/transport/workshop', icon: Wrench },
    { title: 'Maintenance', url: '/transport/maintenance', icon: CalendarClock },
    { title: 'Tyres', url: '/transport/tyres', icon: Disc },
    { title: 'Breakdowns', url: '/transport/breakdowns', icon: AlertTriangle },
    { title: 'Driver Scores', url: '/transport/driver-scores', icon: Award },
    { title: 'Profitability', url: '/transport/profitability', icon: TrendingUp },
    { title: 'Heavy Equipment', url: '/transport/heavy-equipment', icon: HardHat },
    { title: 'Telematics', url: '/transport/telematics', icon: Satellite },
    { title: 'Compliance', url: '/transport/compliance', icon: ShieldCheck },
    { title: 'Reports', url: '/transport/reports', icon: FileText },
    { title: 'Legacy Overview', url: '/transport', icon: Truck },
    { title: 'Legacy Fuel', url: '/fuel', icon: Fuel },
  ] },
  { title: 'Networking', url: '/network-tap/dashboard', icon: Globe, items: [
    { title: 'Home', url: '/network-tap/dashboard', icon: Globe },
    { title: 'My Network', url: '/network-tap/connections', icon: Users },
    { title: 'Posts / Reals', url: '/network-tap/dashboard', icon: FileText },
    { title: 'Jobs', url: '/network-tap/jobs', icon: Briefcase },
    { title: 'Messaging', url: '/network-tap/messages', icon: MessageCircle },
    { title: 'Notification', url: '/network-tap/notifications', icon: Bell },
  ] },
  { title: 'Manage Users', url: '/manage-users', icon: UserPlus },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('heyla-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('heyla-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const isActive = (url: string) => location.pathname === url;
  const isGroupActive = (item: typeof mainNav[0]) => {
    if (item.items) return item.items.some((sub) => location.pathname === sub.url) || location.pathname.startsWith(item.url + '/');
    return location.pathname === item.url;
  };

  return (
    <Sidebar collapsible="icon">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <img src={sanitizeUrl(user?.facilityLogo || '/logo.png?v=3')} alt={user?.facilityName || 'HEYLA'} className="w-8 h-8 rounded-lg shrink-0 object-cover" />
        {!collapsed && (
          <span className="text-lg font-bold text-sidebar-primary-foreground tracking-tight truncate">
            {user?.facilityName || 'HEYLA'}<span className="text-sidebar-primary">{user?.facilityName ? '' : ' OS'}</span>
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
                const isExp = expanded === item.title || (active && hasItems);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => {
                          if (hasItems && !collapsed) {
                            setExpanded(isExp ? null : item.title);
                          } else {
                            navigate({ to: item.url });
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
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </SidebarMenuButton>

                    {!collapsed && hasItems && isExp && (
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
            <SidebarMenuButton onClick={() => setDark(!dark)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer w-full">
              {dark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
              {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors" activeClassName="bg-sidebar-accent">
                <Settings className="w-5 h-5 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => { logout(); navigate({ to: '/login' }); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors cursor-pointer w-full">
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
