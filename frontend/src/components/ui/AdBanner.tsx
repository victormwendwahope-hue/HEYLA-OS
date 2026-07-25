import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CONSENT_KEY = 'heylaos_cookie_consent';

interface Consent {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

function getConsent(): Consent | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

const BANNERS = [
  {
    text: 'Scale your operations with HEYLAOS Enterprise. HR, CRM, Accounting, and more in one platform.',
    link: '/register',
    cta: 'Start Free Trial',
  },
  {
    text: 'Trusted by businesses across 20+ countries. Local compliance, global reach.',
    link: '/register',
    cta: 'Learn More',
  },
  {
    text: 'From SMEs to enterprises. HEYLAOS adapts to your business size and needs.',
    link: '/register',
    cta: 'Get Started',
  },
  {
    text: 'One platform for HR, Payroll, CRM, Accounting, Inventory, and EHS. No more switching tools.',
    link: '/register',
    cta: 'See Features',
  },
];

export function AdBanner({ position }: { position: 'top' | 'bottom' | 'sidebar' }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [current] = useState(() => BANNERS[Math.floor(Math.random() * BANNERS.length)]);

  useEffect(() => {
    const consent = getConsent();
    if (consent?.advertising) {
      setVisible(true);
    }
  }, []);

  if (!visible || dismissed) return null;

  if (position === 'sidebar') {
    return (
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 relative">
        <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 pr-4">{current.text}</p>
        <a href={current.link} className="text-xs font-medium text-primary hover:underline">{current.cta} &rarr;</a>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{current.text}</p>
        <div className="flex items-center gap-3 shrink-0">
          <a href={current.link} className="text-sm font-medium text-primary hover:underline whitespace-nowrap">
            {current.cta} &rarr;
          </a>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
