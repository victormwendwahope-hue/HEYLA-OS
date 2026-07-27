import { Link, useLocation } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

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
    { label: 'Pricing', to: `${prefix}/pricing` },
    { label: 'About', to: `${prefix}/about` },
    { label: 'Careers', to: '/careers' },
    { label: 'Blog', to: `${prefix}/blog` },
  ];

  return (
    <nav className={`relative z-20 flex items-center justify-between px-4 sm:px-8 lg:px-16 py-3 ${transparent ? 'bg-transparent' : 'bg-background border-b border-border'}`}>
      <Link to={homeTo} className="flex items-center gap-2 shrink-0">
        <img src="/logo.png?v=3" alt="HEYLA" className="w-7 h-7 rounded-lg" />
        <span className="font-bold text-base">HEYLA<span className="text-primary"> OS</span></span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`text-sm transition-colors ${
              isActive(l.to) ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Desktop right */}
      <div className="hidden md:flex items-center gap-4">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
        <Link to="/register" className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-medium hover:bg-primary/90 transition-colors">Get Started</Link>
      </div>

      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 text-muted-foreground hover:text-foreground">
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg z-50 md:hidden">
          <div className="p-4 space-y-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm rounded-md ${isActive(l.to) ? 'bg-muted/30 font-medium' : 'hover:bg-muted/50'}`}>
                {l.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50">Log in</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium mt-1 text-center">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
