import { Link, useLocation } from '@tanstack/react-router';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface PublicNavbarProps {
  countryCode?: string;
  transparent?: boolean;
}

export function PublicNavbar({ countryCode, transparent }: PublicNavbarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCode = countryCode || 'ke';
  const homeTo = countryCode ? `/country/${countryCode}` : '/';
  const prefix = `/country/${activeCode}`;

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { label: 'Home', to: homeTo },
    { label: 'Features', to: `${prefix}/features` },
    { label: 'Network', to: '/register' },
    { label: 'Careers', to: '/careers' },
    { label: 'Pricing', to: `${prefix}/pricing` },
    { label: 'About', to: `${prefix}/about` },
    { label: 'Blog', to: `${prefix}/blog` },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-16 py-3 max-w-7xl mx-auto">
        <Link to={homeTo} className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative">
            <img src="/logo.png?v=3" alt="HEYLA" className="w-8 h-8 rounded-lg transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-bold text-lg tracking-tight">HEYLA<span className="text-primary"> OS</span></span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                isActive(l.to)
                  ? 'text-foreground font-semibold bg-muted/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1">
          <ThemeToggle className="mr-4" />
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
            Log in
          </Link>
          <Link
            to="/register"
            className="relative group inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all duration-200 glow-orange"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border/10 bg-card/95 backdrop-blur-2xl">
          <div className="p-4 space-y-1 max-w-7xl mx-auto">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 text-sm rounded-lg ${
                  isActive(l.to) ? 'bg-muted/50 font-medium text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}>
                {l.label}
              </Link>
            ))}
            <hr className="my-3 border-border/10" />
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30">
              Log in
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground font-semibold text-center mt-2 hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
