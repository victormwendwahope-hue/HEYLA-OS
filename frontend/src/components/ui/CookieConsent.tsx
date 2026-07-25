import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

const CONSENT_KEY = 'heylaos_cookie_consent';

function loadPreferences(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function savePreferences(prefs: CookiePreferences) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    advertising: false,
    functional: false,
  });

  useEffect(() => {
    const saved = loadPreferences();
    if (!saved) {
      setVisible(true);
    } else {
      setPrefs(saved);
    }
  }, []);

  if (!visible) return null;

  const toggle = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const acceptAll = () => {
    const all: CookiePreferences = { essential: true, analytics: true, advertising: true, functional: true };
    savePreferences(all);
    setPrefs(all);
    setVisible(false);
  };

  const savePreferencesOnly = () => {
    savePreferences({ ...prefs, essential: true });
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Your Privacy</h2>
              <p className="text-xs text-muted-foreground">Cookie Preferences</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            HEYLAOS uses cookies to ensure the platform works properly (essential), 
            and with your consent, to improve your experience through analytics and 
            relevant advertising. You can customise your choices below.
          </p>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-primary hover:underline mb-3"
          >
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showDetails ? 'Hide details' : 'Show details'}
          </button>

          {showDetails && (
            <div className="space-y-2 mb-4">
              <CategoryRow label="Essential" desc="Authentication, security, session management" checked={true} disabled={true} />
              <CategoryRow label="Analytics" desc="Page views, usage patterns, performance" checked={prefs.analytics} onChange={() => toggle('analytics')} />
              <CategoryRow label="Advertising" desc="Relevant ads, ad performance, personalisation" checked={prefs.advertising} onChange={() => toggle('advertising')} />
              <CategoryRow label="Functional" desc="Remembered preferences, enhanced features" checked={prefs.functional} onChange={() => toggle('functional')} />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <Link to="/privacy" className="text-primary hover:underline" onClick={() => setVisible(false)}>Privacy Policy</Link>
            <span className="mx-2">&middot;</span>
            <Link to="/terms" className="text-primary hover:underline" onClick={() => setVisible(false)}>Terms of Use</Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={savePreferencesOnly}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Save Preferences
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ label, desc, checked, disabled, onChange }: {
  label: string; desc: string; checked: boolean; disabled?: boolean; onChange?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${disabled ? 'bg-primary/40 cursor-not-allowed' : checked ? 'bg-primary cursor-pointer' : 'bg-muted-foreground/30 cursor-pointer'}`} onClick={disabled ? undefined : onChange}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </div>
  );
}
