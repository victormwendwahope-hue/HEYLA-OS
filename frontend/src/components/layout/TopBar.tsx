import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { Bell, Search, ChevronDown, Settings, LogOut, User, Shield, X, Loader2, FileText, Users, CheckCheck, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { countries } from '@/utils/countries';
import { useNavigate } from 'react-router-dom';
import { getToken, apiBaseUrl } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const employees = useEmployeeStore((s) => s.employees);
  const navigate = useNavigate();
  const token = getToken();
  const baseUrl = apiBaseUrl();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; label: string; sub: string; to: string }[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('KE');
  const [showCountry, setShowCountry] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const country = countries.find((c) => c.code === selectedCountry) || countries[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setShowCountry(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) setShowSearchResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowSearchResults(false); return; }
    const q = searchQuery.toLowerCase();
    const results: typeof searchResults = [];

    employees.forEach((e) => {
      const name = `${e.firstName} ${e.lastName}`.toLowerCase();
      if (name.includes(q) || (e.payrollNumber || '').toLowerCase().includes(q) || e.department.toLowerCase().includes(q)) {
        results.push({ type: 'employee', label: `${e.firstName} ${e.lastName}`, sub: `${e.payrollNumber || '-'} · ${e.department}`, to: `/hr/employee/${e.id}` });
      }
    });

    if (q.includes('payroll') || q.includes('salary')) results.push({ type: 'page', label: 'Payroll Setup', sub: 'HR Payroll Management', to: '/hr/payroll' });
    if (q.includes('account') || q.includes('invoice')) results.push({ type: 'page', label: 'Accounting', sub: 'Invoices, expenses, reports', to: '/accounting' });
    if (q.includes('attend') || q.includes('absent')) results.push({ type: 'page', label: 'Attendance', sub: 'Daily attendance records', to: '/hr/attendance' });
    if (q.includes('leave')) results.push({ type: 'page', label: 'Leave Management', sub: 'Request and approve leave', to: '/hr/leave' });
    if (q.includes('transport') || q.includes('fleet')) results.push({ type: 'page', label: 'Transport', sub: 'Fleet, drivers, shipments', to: '/transport' });
    if (q.includes('inventory') || q.includes('stock')) results.push({ type: 'page', label: 'Inventory', sub: 'Products, stock management', to: '/inventory' });
    if (q.includes('crm') || q.includes('lead')) results.push({ type: 'page', label: 'CRM', sub: 'Sales pipeline, tickets', to: '/crm' });
    if (q.includes('settings') || q.includes('profile')) results.push({ type: 'page', label: 'Settings', sub: 'Profile, security, appearance', to: '/settings' });
    if (q.includes('doc') || q.includes('document')) results.push({ type: 'page', label: 'Documents', sub: 'Employee documents', to: '/hr' });

    setSearchResults(results.slice(0, 8));
    setShowSearchResults(results.length > 0);
  }, [searchQuery, employees]);

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await fetch(`${baseUrl}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setNotifications(await res.json());
    } catch {} finally { setNotifLoading(false); }
  };

  const markAllRead = async () => {
    for (const n of notifications.filter((x) => !x.read)) {
      await fetch(`${baseUrl}/notifications/${n.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ read: true }),
      });
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-2 md:px-4 gap-1 md:gap-2 sticky top-0 z-30">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />

      {/* Search */}
      <div ref={searchContainerRef} className="flex-1 min-w-0 flex items-center relative">
        <div className={`relative w-full max-w-sm ${searchOpen ? 'block' : 'hidden md:block'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
            placeholder="Search employees, payroll, documents..."
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {showSearchResults && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
              {searchResults.map((r, i) => (
                <button key={i} onMouseDown={() => { navigate(r.to); setShowSearchResults(false); setSearchQuery(''); setSearchOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left">
                  <div className={`p-1.5 rounded-lg ${r.type === 'employee' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {r.type === 'employee' ? <Users className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{r.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {!searchOpen && (
          <button onClick={() => setSearchOpen(true)} className="md:hidden ml-2 p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground">
            <Search className="w-4 h-4" />
          </button>
        )}
        {searchOpen && (
          <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setShowSearchResults(false); }} className="md:hidden ml-2 p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Country Selector */}
        <div className="relative" ref={countryRef}>
          <button onClick={() => setShowCountry(!showCountry)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-muted/50 text-sm transition-colors">
            <span className="text-base">{country.flag}</span>
            <span className="hidden lg:inline text-muted-foreground text-xs">{country.code}</span>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showCountry ? 'rotate-180' : ''}`} />
          </button>
          {showCountry && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2">
              <div className="p-1">
                {countries.map((c) => (
                  <button key={c.code} onClick={() => { setSelectedCountry(c.code); setShowCountry(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors ${c.code === selectedCountry ? 'bg-primary/10 text-primary font-medium' : ''}`}>
                    <span className="text-lg shrink-0">{c.flag}</span>
                    <span className="flex-1 text-left truncate">{c.name}</span>
                    <span className="text-muted-foreground text-xs shrink-0">{c.currency}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { if (!showNotifications) fetchNotifications(); setShowNotifications(!showNotifications); }}
            className="relative p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1 leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Mark all read">
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={clearNotifications} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Clear all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 px-3 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => { fetchNotifications(); }}
                className="w-full p-2.5 text-xs text-muted-foreground hover:text-foreground border-t border-border rounded-b-xl hover:bg-muted/30 transition-colors">
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="relative" ref={userRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 pl-2 border-l border-border hover:bg-muted/30 rounded-lg py-1 pr-2 transition-colors">
            <div className="w-7 h-7 rounded-full overflow-hidden gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'H'
              )}
            </div>
            <div className="hidden md:block text-left max-w-[100px]">
              <p className="text-sm font-medium leading-none truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{user?.role || 'Admin'}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-muted-foreground hidden md:block transition-transform shrink-0 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-border">
                <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@heyla.co'}</p>
              </div>
              <div className="p-1">
                <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left">
                  <Settings className="w-4 h-4 text-muted-foreground shrink-0" /> Settings
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => { setShowUserMenu(false); navigate('/admin'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left">
                    <Shield className="w-4 h-4 text-muted-foreground shrink-0" /> Admin Panel
                  </button>
                )}
                <button onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left">
                  <LogOut className="w-4 h-4 shrink-0" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}