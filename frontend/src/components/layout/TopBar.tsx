import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { Bell, Search, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { countries } from '@/utils/countries';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('KE');
  const [showCountry, setShowCountry] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const country = countries.find((c) => c.code === selectedCountry) || countries[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setShowCountry(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setShowCountry(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-2 sm:px-4 gap-2 sm:gap-3 sticky top-0 z-30">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="flex-1 max-w-md relative">
        {showSearch ? (
          <input autoFocus onBlur={() => setShowSearch(false)} placeholder="Search anything..."
            className="w-full bg-muted/50 border border-border rounded-lg px-3 sm:px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        ) : (
          <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search… <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd></span>
          </button>
        )}
      </div>

      {/* Country Selector */}
      <div className="relative" ref={countryRef}>
        <button onClick={() => setShowCountry(!showCountry)}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-muted/50 text-sm transition-colors">
          <span className="text-base sm:text-lg">{country.flag}</span>
          <span className="hidden md:inline text-muted-foreground">{country.currency}</span>
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showCountry ? 'rotate-180' : ''}`} />
        </button>
        {showCountry && (
          <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-card border border-border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
            <div className="p-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Select Country ({countries.length})</p>
            </div>
            <div className="p-1">
              {countries.map((c) => (
                <button key={c.code} onClick={() => handleCountrySelect(c.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted/50 transition-colors ${c.code === selectedCountry ? 'bg-primary/10 text-primary font-medium' : ''}`}>
                  <span className="text-lg">{c.flag}</span>
                  <span className="flex-1 text-left truncate">{c.name}</span>
                  <span className="text-muted-foreground text-xs">{c.currency}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <button className="relative p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full animate-pulse" />
      </button>

      {/* User Avatar + Dropdown */}
      <div className="relative" ref={userRef}>
        <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-border hover:bg-muted/30 rounded-lg py-1 pr-2 transition-colors">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs sm:text-sm font-semibold">
            {user?.name?.charAt(0) || 'H'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Admin'}</p>
          </div>
          <ChevronDown className={`w-3 h-3 text-muted-foreground hidden sm:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-border">
              <p className="font-medium text-sm">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'user@heyla.co'}</p>
            </div>
            <div className="p-1">
              <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left">
                <Settings className="w-4 h-4 text-muted-foreground" /> Settings
              </button>
              <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted/50 transition-colors text-left">
                <User className="w-4 h-4 text-muted-foreground" /> Profile
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
