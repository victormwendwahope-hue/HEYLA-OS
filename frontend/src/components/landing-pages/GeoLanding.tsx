import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { countries, getCountry } from '@/utils/countries';
import { Globe, ShieldAlert, RefreshCw, Loader2, ArrowRight, UserCheck, Building2, Search, Star } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';

const SUPPORTED = new Set(countries.map((c) => c.code.toUpperCase()));

export default function GeoLanding() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'detecting' | 'vpn' | 'failed'>('detecting');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  const goTo = (code: string) => {
    const upper = code.toUpperCase();
    const finalCode = SUPPORTED.has(upper) ? upper : 'KE';
    navigate({ to: `/country/${finalCode.toLowerCase()}`, replace: true });
  };

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      try {
        const r = await fetch('https://ipapi.co/json/', {
          headers: { Accept: 'application/json' },
        });
        if (!r.ok) throw new Error('API error');
        const data = await r.json();
        if (cancelled) return;

        const isProxy = data.proxy || data.vpn || data.tor || data.hosting;
        if (isProxy) {
          setDetectedCountry(data.country_code || null);
          setStatus('vpn');
          return;
        }

        const code = String(data.country_code || '').toUpperCase();
        if (code) goTo(code);
        else setStatus('failed');
      } catch {
        if (cancelled) return;
        try {
          const r = await fetch('https://ip-api.com/json/', {
            headers: { Accept: 'application/json' },
          });
          if (!r.ok) throw new Error('API error');
          const data = await r.json();
          if (cancelled) return;

          if (data.proxy || data.hosting) {
            setDetectedCountry(data.countryCode || null);
            setStatus('vpn');
            return;
          }

          const code = String(data.countryCode || '').toUpperCase();
          if (code) goTo(code);
          else setStatus('failed');
        } catch {
          if (cancelled) return;
          setStatus('failed');
        }
      }
    };

    detect();
    return () => { cancelled = true; };
  }, []);

  const retry = () => {
    setStatus('detecting');
    setDetectedCountry(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar transparent />

      <div className="flex flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png?v=3" alt="HEYLA" className="w-10 h-10" />
          <span className="text-xl font-bold">HEYLA<span className="text-primary"> OS</span></span>
        </div>

        {status === 'detecting' && (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <div>
              <h1 className="text-lg font-semibold">Welcome to HEYLA OS</h1>
              <p className="text-sm text-muted-foreground mt-1">Detecting your region to show local features...</p>
            </div>
            {/* Quick actions while detection runs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mt-8">
              <button onClick={() => navigate({ to: '/careers' })} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 text-left hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Browse Jobs</p>
                  <p className="text-xs text-muted-foreground">Find your next opportunity</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
              </button>
              <button onClick={() => navigate({ to: '/register/company' })} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 text-left hover:border-amber-500/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Post a Job</p>
                  <p className="text-xs text-muted-foreground">Hire talent today</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto shrink-0" />
              </button>
            </div>
          </div>
        )}

        {status === 'vpn' && (
          <div className="max-w-sm">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-lg font-semibold mb-2">VPN or Proxy Detected</h1>
            <p className="text-sm text-muted-foreground mb-4">
              For security and accurate localisation, please disable your VPN or proxy and try again.
              HEYLAOS uses your region to show the correct currency and features.
            </p>
            {detectedCountry && (
              <p className="text-xs text-muted-foreground mb-4">
                Detected region: {getCountry(detectedCountry)?.name || detectedCountry} &middot; {getCountry(detectedCountry)?.currency || ''}
              </p>
            )}
            <button
              onClick={retry}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry without VPN
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="max-w-sm">
            <Globe className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <h1 className="text-lg font-semibold mb-2">Could not detect your location</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Please disable any VPN or proxy and try again.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={retry}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
              <p className="text-xs text-muted-foreground">Or browse directly:</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => navigate({ to: '/careers' })} className="text-sm text-primary hover:underline">Careers</button>
                <span className="text-muted-foreground">·</span>
                <button onClick={() => navigate({ to: '/register' })} className="text-sm text-primary hover:underline">Get Started</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
