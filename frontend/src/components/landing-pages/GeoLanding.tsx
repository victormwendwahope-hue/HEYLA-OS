import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { countries, getCountry } from '@/utils/countries';
import { Globe, ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';

const SUPPORTED = new Set(countries.map((c) => c.code.toUpperCase()));

export default function GeoLanding() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'detecting' | 'vpn' | 'failed'>('detecting');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  const goTo = (code: string) => {
    const upper = code.toUpperCase();
    const finalCode = SUPPORTED.has(upper) ? upper : 'KE';
    navigate(`/country/${finalCode.toLowerCase()}`, { replace: true });
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="HEYLA" className="w-10 h-10" />
        <span className="text-xl font-bold">HEYLA<span className="text-primary"> OS</span></span>
      </div>

      {status === 'detecting' && (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Detecting your region</h1>
            <p className="text-sm text-muted-foreground mt-1">One moment please...</p>
          </div>
        </>
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
          <button
            onClick={retry}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      )}
    </div>
  );
}
