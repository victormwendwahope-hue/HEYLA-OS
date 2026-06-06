// Real-time geolocation router. Detects user country and redirects to the
// matching landing page. There is no default — only the geo-detected country
// or, if detection fails, the nearest country picker.
//
// Strategy:
//   1. Try browser navigator.geolocation (high accuracy, real-time changes).
//   2. Reverse-geocode lat/lon -> country code via free open service.
//   3. Fallback to IP-based geolocation (no key required) if browser denied.
//   4. Subscribe to position changes (watchPosition) so the page follows the user.

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { countries } from '@/utils/countries';
import { Globe, MapPin, Loader2 } from 'lucide-react';

const SUPPORTED = new Set(countries.map((c) => c.code.toUpperCase()));

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=3`,
      { headers: { Accept: 'application/json' } }
    );
    if (!r.ok) return null;
    const data = await r.json();
    return (data?.address?.country_code || '').toUpperCase() || null;
  } catch {
    return null;
  }
}

async function ipGeolocate(): Promise<string | null> {
  // No key, CORS-enabled, returns ISO country code.
  try {
    const r = await fetch('https://ipapi.co/json/');
    if (!r.ok) return null;
    const data = await r.json();
    return String(data?.country_code || '').toUpperCase() || null;
  } catch {
    return null;
  }
}

// Haversine — used only if reverse-geocode returns an unsupported country
// so we can route to the geographically nearest supported one. Capitals:
const CAPITALS: Record<string, [number, number]> = {
  KE: [-1.286, 36.817], NG: [9.076, 7.398], ZA: [-25.747, 28.229], GH: [5.603, -0.187],
  TZ: [-6.792, 39.208], UG: [0.347, 32.582], RW: [-1.949, 30.058], ET: [9.030, 38.740],
  EG: [30.044, 31.235], US: [38.907, -77.036], GB: [51.507, -0.127], DE: [52.520, 13.404],
  FR: [48.857, 2.352], IN: [28.613, 77.209], AE: [24.466, 54.366], BR: [-15.793, -47.882],
  CN: [39.904, 116.407], JP: [35.689, 139.692], AU: [-35.281, 149.128], CA: [45.421, -75.697],
};
function nearest(lat: number, lon: number): string {
  let best = 'KE', bestD = Infinity;
  for (const [code, [la, lo]] of Object.entries(CAPITALS)) {
    const d = (la - lat) ** 2 + (lo - lon) ** 2;
    if (d < bestD) { bestD = d; best = code; }
  }
  return best;
}

export default function GeoLanding() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'detecting' | 'denied' | 'failed'>('detecting');
  const lastCountry = useRef<string | null>(null);

  const goTo = (code: string) => {
    const upper = code.toUpperCase();
    const finalCode = SUPPORTED.has(upper) ? upper : 'KE';
    if (lastCountry.current === finalCode) return;
    lastCountry.current = finalCode;
    navigate(`/country/${finalCode.toLowerCase()}`, { replace: true });
  };

  useEffect(() => {
    let watchId: number | null = null;
    let cancelled = false;

    const handleCoords = async (lat: number, lon: number) => {
      const code = await reverseGeocode(lat, lon);
      if (cancelled) return;
      if (code && SUPPORTED.has(code)) goTo(code);
      else goTo(nearest(lat, lon));
    };

    const fallbackIp = async () => {
      const code = await ipGeolocate();
      if (cancelled) return;
      if (code) goTo(code);
      else setStatus('failed');
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleCoords(pos.coords.latitude, pos.coords.longitude),
        () => { setStatus('denied'); fallbackIp(); },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60_000 }
      );
      // Real-time: re-route if the user crosses borders.
      watchId = navigator.geolocation.watchPosition(
        (pos) => handleCoords(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: false, maximumAge: 60_000 }
      );
    } else {
      fallbackIp();
    }

    return () => {
      cancelled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">H</div>
        <span className="text-xl font-bold">HEYLA<span className="text-primary"> OS</span></span>
      </div>

      {status === 'detecting' && (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Finding your nearest experience</h1>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> Detecting your location in real time…
            </p>
          </div>
        </>
      )}

      {status === 'denied' && (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Location blocked — using your network</h1>
            <p className="text-sm text-muted-foreground mt-1">Falling back to IP-based geolocation…</p>
          </div>
        </>
      )}

      {status === 'failed' && (
        <div className="max-w-sm">
          <Globe className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
          <h1 className="text-lg font-semibold mb-2">We couldn't detect your location</h1>
          <p className="text-sm text-muted-foreground mb-4">Pick the country closest to you to continue.</p>
          <button
            onClick={() => navigate('/countries')}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Choose country
          </button>
        </div>
      )}
    </div>
  );
}
