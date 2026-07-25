import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, ArrowRight, Building2, User, Globe, Search, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { countries } from '@/utils/countries';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (moment: () => void) => void;
          renderButton: (element: HTMLElement, options: { theme?: string; size?: string; text?: string; width?: string }) => void;
        };
      };
    };
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<'company' | 'individual'>('company');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('KE');
  const [showCountry, setShowCountry] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [facilityName, setFacilityName] = useState('');
  const [facilityLogo, setFacilityLogo] = useState<string>('');
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const { register, googleRegister, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const country = countries.find((c) => c.code === selectedCountry) || countries[0];
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // Check if navigated here from Google login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('google') === '1') {
      const state = (location.state as any)?.googleCredential;
      if (state) setGoogleCredential(state);
    }
  }, []);

  const handleGoogleCredential = useCallback(async (credential: string) => {
    if (!password) {
      setGoogleCredential(credential);
      toast.info('Complete your account setup below');
      return;
    }
    try {
      clearError();
      await googleRegister({
        credential,
        password,
        facilityName: facilityName || company || name,
        facilityLogo: facilityLogo || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Google sign-up failed');
    }
  }, [googleRegister, password, facilityName, facilityLogo, company, name, navigate, clearError]);

  useEffect(() => {
    if (!googleClientId) return;
    loadGoogleScript().then(() => setGoogleLoaded(true));
  }, [googleClientId]);

  useEffect(() => {
    if (!googleLoaded || !googleBtnRef.current || !googleClientId) return;
    googleBtnRef.current.innerHTML = '';
    window.google?.accounts.id.initialize({
      client_id: googleClientId,
      callback: (res) => handleGoogleCredential(res.credential),
      cancel_on_tap_outside: false,
    });
    window.google?.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signup_with',
      width: '100%',
    });
  }, [googleLoaded, googleClientId, handleGoogleCredential]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setFacilityLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    clearError();

    if (googleCredential) {
      await googleRegister({
        credential: googleCredential,
        password,
        facilityName: facilityName || company || name,
        facilityLogo: facilityLogo || undefined,
      });
    } else {
      await register({
        email, password, name,
        company: company || facilityName || name,
        facilityName: facilityName || company || name,
        facilityLogo: facilityLogo || undefined,
      });
    }
    navigate('/dashboard');
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /\d/.test(password) ? 4 : 3;
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const pwColors = ['', 'bg-destructive', 'bg-warning', 'bg-info', 'bg-success'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <img src="/logo.png?v=2" alt="HEYLA" className="w-10 h-10 rounded-xl shrink-0" />
          <span className="text-xl font-bold">HEYLA</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-1">Create your account</h2>
          <p className="text-muted-foreground mb-6">Start managing your business today</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1 max-w-xs relative">
              {showSearch ? (
                <input
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                  placeholder="Search…"
                  className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              ) : (
                <button onClick={() => setShowSearch(true)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowCountry(!showCountry)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors"
              >
                <span className="text-base">{country.flag}</span>
                <span className="text-muted-foreground">{country.currency}</span>
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              {showCountry && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-elevated z-50 max-h-60 overflow-y-auto">
                  {countries.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setSelectedCountry(c.code); setShowCountry(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent first:rounded-t-lg last:rounded-b-lg ${c.code === selectedCountry ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      <span className="text-lg">{c.flag}</span>
                      <span className="flex-1 text-left">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.currency}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account type toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            {[
              { type: 'company' as const, icon: Building2, label: 'Company' },
              { type: 'individual' as const, icon: User, label: 'Individual' },
            ].map(({ type, icon: Icon, label }) => (
              <button key={type} onClick={() => setAccountType(type)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  accountType === type ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            {accountType === 'company' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company / Facility Name</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwColors[pwStrength] : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pwLabels[pwStrength]}</p>
                </div>
              )}
            </div>

            {/* Facility Name & Logo */}
            <div className="border-t border-border pt-4 mt-2">
              <h3 className="text-sm font-semibold mb-3">Facility Setup</h3>

              <div className="mb-3">
                <label className="text-sm font-medium mb-1.5 block">Facility Name</label>
                <input type="text" value={facilityName} onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g. Hydan Medical Centre"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Facility Logo</label>
                <div className="flex items-center gap-3">
                  {facilityLogo ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                      <img src={facilityLogo} alt="Facility logo" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFacilityLogo('')}
                        className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0">
                      <Upload className="w-5 h-5" />
                    </button>
                  )}
                  <div className="text-xs text-muted-foreground">
                    <p>Upload your facility logo</p>
                    <p>PNG, JPG or SVG. Max 2MB.</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full gradient-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? 'Creating account...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {googleClientId && !googleCredential && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or sign up with</span></div>
              </div>
              <div ref={googleBtnRef} className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:!w-full" />
            </>
          )}

          {googleCredential && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Signed in with Google. Set your password and facility details above.
            </p>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
