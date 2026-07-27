import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useSearch } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, ArrowRight, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeError } from '@/lib/secure';

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

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

export default function RegisterIndividualPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { register, googleRegister, linkedinRegister, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleGoogleCredential = useCallback(async (credential: string) => {
    try {
      clearError();
      await googleRegister({ credential, password: '' });
      navigate({ to: '/careers' });
    } catch (err: unknown) {
      toast.error(sanitizeError(err, 'Google sign-up failed'));
    }
  }, [googleRegister, navigate, clearError]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    if (code && state && state === localStorage.getItem('linkedin_oauth_state')) {
      localStorage.removeItem('linkedin_oauth_state');
      const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '';
      const LINKEDIN_CLIENT_SECRET = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || '';
      if (LINKEDIN_CLIENT_ID && LINKEDIN_CLIENT_SECRET) {
        const redirectUri = `${window.location.origin}/register/individual`;
        fetch(`https://www.linkedin.com/oauth/v2/accessToken`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: LINKEDIN_CLIENT_ID, client_secret: LINKEDIN_CLIENT_SECRET }),
        }).then(r => r.json()).then(async (tokenData) => {
          const accessToken = tokenData.access_token;
          if (!accessToken) { toast.error('LinkedIn auth failed'); return; }
          try {
            await linkedinRegister(accessToken);
            navigate({ to: '/careers' });
          } catch (err: any) {
            toast.error(err?.message || 'LinkedIn sign-up failed');
          }
        }).catch(() => toast.error('LinkedIn auth failed'));
        window.history.replaceState({}, '', '/register/individual');
      }
    }
  }, []);

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
      theme: 'outline', size: 'large', text: 'signup_with', width: '100%',
    });
  }, [googleLoaded, googleClientId, handleGoogleCredential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    clearError();
    await register({ email, password, name, accountType: 'individual' });
    navigate({ to: '/careers' });
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /\d/.test(password) ? 4 : 3;
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const pwColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png?v=3" alt="HEYLA" className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-800">Create Individual Account</h1>
          <p className="text-slate-500 mt-1">Apply for jobs and opportunities on HEYLAOS</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-sm text-blue-700">
              Looking for a job or opportunity? Create an individual account to apply for vacancies posted by companies.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
            </div>

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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwColors[pwStrength] : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pwLabels[pwStrength]}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? 'Creating account...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or sign up with</span></div>
          </div>

          {googleClientId ? (
            <div ref={googleBtnRef} className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&_iframe]:!w-full" />
          ) : (
            <button onClick={() => toast.info('Google sign-up is being configured.')}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or</span></div>
          </div>

          <button
            onClick={() => {
              const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID || '';
              if (!LINKEDIN_CLIENT_ID) { toast.error('LinkedIn sign-up not configured'); return; }
              const redirectUri = `${window.location.origin}/register/individual`;
              const state = Math.random().toString(36).substring(2);
              localStorage.setItem('linkedin_oauth_state', state);
              const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=openid%20profile%20email`;
              window.location.href = authUrl;
            }}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            Sign up with LinkedIn
          </button>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
          <p className="text-sm text-slate-500">
            Registering a business? <Link to="/register/company" className="text-blue-600 font-medium hover:underline">Create company account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
