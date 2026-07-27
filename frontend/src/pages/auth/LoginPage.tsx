import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
          renderButton: (element: HTMLElement, options: { theme?: string; size?: string; text?: string; width?: string }) => void;
        };
      };
    };
  }
}

let gsiScriptLoaded = false;
let gsiInitialized = false;

function loadGoogleScript(): Promise<void> {
  if (gsiScriptLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) { gsiScriptLoaded = true; resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => { gsiScriptLoaded = true; resolve(); };
    document.head.appendChild(s);
  });
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const gcb = useRef<((credential: string) => void) | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleGoogleCredential = useCallback(async (credential: string) => {
    try {
      await googleLogin(credential);
      navigate({ to: '/dashboard' });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e?.status === 404 || e?.message?.toLowerCase().includes('not found')) {
        navigate({ to: '/register', search: { google: '1' }, state: { googleCredential: credential } });
      } else {
        toast.error(e?.message || 'Google sign-in failed');
      }
    }
  }, [googleLogin, navigate]);

  gcb.current = handleGoogleCredential;

  useEffect(() => {
    if (!googleClientId) return;
    loadGoogleScript().then(() => setGoogleLoaded(true));
  }, [googleClientId]);

  useEffect(() => {
    if (!googleLoaded || !googleBtnRef.current || !googleClientId || gsiInitialized) return;
    gsiInitialized = true;
    googleBtnRef.current.innerHTML = '';
    window.google?.accounts.id.initialize({
      client_id: googleClientId,
      callback: (res) => gcb.current?.(res.credential),
      cancel_on_tap_outside: false,
    });
    window.google?.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline', size: 'large', text: 'signin_with', width: 400,
    });
    return () => { window.google?.accounts.id.cancel(); };
  }, [googleLoaded, googleClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    clearError();
    await login(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-50 to-white items-center justify-center p-12">
        <div className="text-center max-w-md">
          <img src="/logo.png?v=3" alt="HEYLA" className="w-32 h-32 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Your Businesses Unified</h1>
          <p className="text-slate-500 leading-relaxed">
            All-in-one business management platform for SMEs and enterprises. HR, Payroll, CRM, Accounting, Inventory, and more.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png?v=3" alt="HEYLA" className="w-16 h-16 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-slate-800">HEYLAOS</h1>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h2>
          <p className="text-slate-500 mb-8">Enter your credentials to access your account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or continue with</span></div>
          </div>

          {googleClientId ? (
            <div ref={googleBtnRef} className="flex justify-center [&>div]:w-[400px] [&>div>div]:w-[400px] [&_iframe]:!w-[400px]" />
          ) : (
            <button
              onClick={() => toast.info('Google sign-in is being configured. Please use email and password.')}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
