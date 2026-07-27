import { useNavigate } from '@tanstack/react-router';

interface SiteFooterProps {
  countryName?: string;
}

const CONTACTS = [
  { category: 'General Inquiries', email: 'info@heylaos.com' },
  { category: 'Executive', email: 'ceo@heylaos.com' },
  { category: 'Recruitment', email: 'recruiter@heylaos.com' },
  { category: 'Support', email: 'support@heylaos.com' },
];

export function SiteFooter({ countryName }: SiteFooterProps) {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-border px-4 sm:px-8 lg:px-16 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {CONTACTS.map((c) => (
            <div key={c.email} className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1">{c.category}</p>
              <a href={`mailto:${c.email}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{c.email}</a>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <img src="/logo.png?v=3" alt="HEYLA" className="w-6 h-6" />
            <span className="text-sm font-semibold">HEYLA</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate({ to: '/privacy' })} className="hover:text-foreground transition-colors">Privacy Policy</button>
            <button onClick={() => navigate({ to: '/terms' })} className="hover:text-foreground transition-colors">Terms of Use</button>
            <span>&copy; 2026 HEYLA. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
