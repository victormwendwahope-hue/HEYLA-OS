import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { Bell, Search, ChevronDown, Settings, LogOut, User, Shield, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { countries } from '@/utils/countries';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('KE');
  const [showCountry, setShowCountry] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const country = countries.find((c) => c.code === selectedCountry) || countries[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setShowCountry(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-2 md:px-4 gap-1 md:gap-2 sticky top-0 z-30">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground shrink-0" />

      {/* Search — expands on mobile, always visible on desktop */}
      <div className={`flex-1 min-w-0 flex items-center ${searchOpen ? 'absolute inset-x-0 top-0 h-14 bg-card z-40 px-4 md:px-0 md:relative md:inset-auto md:h-auto md:bg-transparent' : ''}`}>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
            placeholder="Search employees, payroll, documents..."
            className={`w-full bg-muted/50 border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${searchOpen ? 'block' : 'hidden md:block'}`}
          />
          {searchOpen && (
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden p-1 rounded hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {!searchOpen && (
          <button onClick={() => setSearchOpen(true)} className="md:hidden ml-2 p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground">
            <Search className="w-4 h-4" />
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
        <button className="relative p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
        </button>

        {/* User Avatar + Dropdown */}
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
                <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" /> Profile
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