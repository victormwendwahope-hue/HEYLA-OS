import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { Bell, Search, Globe } from 'lucide-react';
import { useState } from 'react';
import { countries } from '@/utils/countries';

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('KE');
  const [showCountry, setShowCountry] = useState(false);

  const country = countries.find((c) => c.code === selectedCountry) || countries[0];

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center px-4 gap-3 sticky top-0 z-30">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        {showSearch ? (
          <input
            autoFocus
            onBlur={() => setShowSearch(false)}
            placeholder="Search anything..."
            className="w-full bg-muted/50 border border-border rounded-lg px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        ) : (
          <button onClick={() => setShowSearch(true)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search… <kbd className="ml-2 px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd></span>
          </button>
        )}
      </div>

      {/* Country Selector */}
      <div className="relative">
        <button
          onClick={() => setShowCountry(!showCountry)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted/50 text-sm transition-colors"
        >
          <span className="text-lg">{country.flag}</span>
          <span className="hidden sm:inline text-muted-foreground">{country.currency}</span>
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        {showCountry && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-elevated z-50 max-h-72 overflow-y-auto animate-scale-in">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => { setSelectedCountry(c.code); setShowCountry(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${c.code === selectedCountry ? 'bg-accent text-accent-foreground' : ''}`}
              >
                <span className="text-lg">{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-muted-foreground text-xs">{c.currency}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse-soft" />
      </button>

      {/* User Avatar */}
      <div className="flex items-center gap-2.5 pl-2 border-l border-border">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
          {user?.name?.charAt(0) || 'H'}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{user?.role || 'Admin'}</p>
        </div>
      </div>
    </header>
  );
}
