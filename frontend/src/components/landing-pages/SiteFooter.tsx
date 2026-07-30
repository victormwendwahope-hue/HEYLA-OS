import { useNavigate } from '@tanstack/react-router';

interface SiteFooterProps {
  countryName?: string;
}

const CONTACTS = [
  { category: 'General Inquiries', email: 'info@heylaos.com' },
  { category: 'Executive', email: 'ceo@heylaos.com' },
  { category: 'Recruitment', email: 'recruiter@heylaos.com' },
  { category: 'Support', email: 'support@heylaos.com' },
  { category: 'Safaricom Line', email: '0708 066 022' },
];

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/country/ke/features' },
  { label: 'Professional Network', to: '/register' },
  { label: 'Careers', to: '/careers' },
  { label: 'Skilled Workers', to: '/register' },
  { label: 'Employers', to: '/register/company' },
  { label: 'Help Center', to: '/register' },
  { label: 'Labour Resources', to: '/privacy' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
  { label: 'Contact Us', to: '/' },
  { label: 'Advertise With Us', to: '/register/company' },
];

export function SiteFooter({ countryName }: SiteFooterProps) {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-border/10 bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png?v=3" alt="HEYLA" className="w-8 h-8 rounded-lg" />
              <span className="font-bold text-lg">HEYLA<span className="text-primary"> OS</span></span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Your businesses unified. Empowering the global skilled workforce through networking, opportunity, and digital transformation.
            </p>
            <a href="tel:+254708066022" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mt-3">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              0708 066 022
            </a>
            <div className="flex items-center gap-3 mt-2">
              <a href="mailto:info@heylaos.com" className="w-9 h-9 rounded-lg bg-card border border-border/20 flex items-center justify-center hover:border-primary/30 hover:text-primary transition-all duration-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
              <a href="https://twitter.com/heylaos" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-card border border-border/20 flex items-center justify-center hover:border-primary/30 hover:text-primary transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://linkedin.com/company/heylaos" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-card border border-border/20 flex items-center justify-center hover:border-primary/30 hover:text-primary transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
          {[
            { title: 'Platform', links: ['Features', 'Professional Network', 'Careers', 'Skilled Workers', 'Employers'] },
            { title: 'Resources', links: ['Help Center', 'Labour Resources', 'Privacy Policy', 'Terms of Use', 'Advertise With Us'] },
            { title: 'Company', links: ['Home', 'Contact Us', 'About', 'Blog', 'Pricing'] },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => {
                  const footerLink = FOOTER_LINKS.find((fl) => fl.label === link);
                  return (
                    <li key={link}>
                      {footerLink ? (
                        <button onClick={() => navigate({ to: footerLink.to })}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">
                          {link}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{link}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/10">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <button onClick={() => navigate({ to: '/privacy' })} className="hover:text-foreground transition-colors">Privacy Policy</button>
            <button onClick={() => navigate({ to: '/terms' })} className="hover:text-foreground transition-colors">Terms of Use</button>
            <span>&copy; 2026 HEYLA. All rights reserved.</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Built with ❤️ in Nairobi, Kenya · Serving {countryName || 'the world'}
          </p>
        </div>
      </div>
    </footer>
  );
}
