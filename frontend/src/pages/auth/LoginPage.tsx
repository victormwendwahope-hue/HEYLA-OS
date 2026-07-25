import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, ArrowRight, Globe, Search } from 'lucide-react';
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
          renderButton: (
            element: HTMLElement,
            options: { theme?: string; size?: string; text?: string; width?: string }
          ) => void;
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('KE');
  const [showCountry, setShowCountry] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const country = countries.find((c) => c.code === selectedCountry) || countries[0];
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleGoogleCredential = useCallback(async (credential: string) => {
    try {
      await googleLogin(credential);
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.status === 404 || err?.message?.toLowerCase().includes('not found')) {
        navigate('/register?google=1', { state: { googleCredential: credential } });
      } else {
        toast.error(err?.message || 'Google sign-in failed');
      }
    }
  }, [googleLogin, navigate]);

  useEffect(() => {
    if (!googleClientId) return;
    loadGoogleScript().then(() => {
      setGoogleLoaded(true);
    });
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
      text: 'signin_with',
      width: '100%',
    });
  }, [googleLoaded, googleClientId, handleGoogleCredential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    clearError();
    await login(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-dark items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full gradient-primary" style={{
              width: `${100 + i * 80}px`, height: `${100 + i * 80}px`,
              top: `${10 + i * 15}%`, left: `${5 + i * 12}%`, opacity: 0.15 + i * 0.05,
            }} />
          ))}
        </div>
        <div className="relative z-10 text-center max-w-md flex flex-col items-center">
          <img src="/logo.png?v=2" alt="HEYLA" className="w-28 h-28 rounded-2xl shadow-lg mb-6 mx-auto block shrink-0" />
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">HEYLA</h1>
          <p className="text-primary-foreground/70 text-lg">The global business operating system. Start in Kenya, scale everywhere.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <img src="/logo.png?v=2" alt="HEYLA" className="w-16 h-16 rounded-xl shadow-lg mb-2 mx-auto block shrink-0" />
            <h1 className="text-2xl font-bold text-primary-foreground mb-0">HEYLA</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account</p>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full gradient-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span></div>
          </div>

          {googleClientId ? (
            <div ref={googleBtnRef} className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:!w-full" />
          ) : (
            <button
              onClick={() => toast.info('Google sign-in is being configured. Please use email and password.')}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
