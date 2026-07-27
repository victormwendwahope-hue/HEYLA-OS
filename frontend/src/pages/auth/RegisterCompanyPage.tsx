import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, ArrowRight, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeUrl } from '@/lib/secure';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
          renderButton: (element: HTMLElement, options: { theme?: string; size?: string; text?: string; width?: number }) => void;
          cancel: () => void;
        };
      };
    };
  }
}

let gsiScriptLoaded = false;

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

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

export default function RegisterCompanyPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [facilityName, setFacilityName] = useState('');
  const [facilityLogo, setFacilityLogo] = useState<string>('');
  const [googleStep, setGoogleStep] = useState<'idle' | 'credential'>('idle');
  const { register, googleLogin, googleRegister, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gcb = useRef<((credential: string) => void) | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const gsiDone = useRef(false);
  const handleGoogleCredential = useCallback(async (credential: string) => {
    clearError();
    try {
      await googleLogin(credential);
      navigate({ to: '/dashboard' });
      return;
    } catch (err: unknown) {
      const e = err as { status?: number };
      if (e?.status !== 404) {
        toast.error('Google sign-in failed');
        return;
      }
    }
    const profile = decodeJwt(credential);
    if (profile) {
      if (typeof profile.name === 'string') setName(profile.name);
      if (typeof profile.email === 'string') setEmail(profile.email);
    }
    gcb._credential = credential;
    setGoogleStep('credential');
  }, [googleLogin, navigate, clearError]);

  gcb.current = handleGoogleCredential;

  useEffect(() => {
    if (!googleClientId) return;
    loadGoogleScript().then(() => setGoogleLoaded(true));
  }, [googleClientId]);

  useEffect(() => {
    if (!googleLoaded || !googleBtnRef.current || !googleClientId || gsiDone.current || googleStep === 'credential') return;
    gsiDone.current = true;
    const ref = googleBtnRef.current;
    window.google?.accounts.id.initialize({
      client_id: googleClientId,
      callback: (res) => gcb.current?.(res.credential),
      cancel_on_tap_outside: false,
    });
    window.google?.accounts.id.renderButton(ref, {
      theme: 'outline', size: 'large', text: 'signup_with', width: 400,
    });
    return () => { window.google?.accounts.id.cancel(); };
  }, [googleLoaded, googleClientId, googleStep]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { const r = ev.target?.result; if (typeof r === 'string') setFacilityLogo(r); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (googleStep === 'credential') {
      if (!facilityName) { toast.error('Please enter your facility name'); return; }
      clearError();
      const cred = (gcb as any)._credential;
      if (!cred) { toast.error('Missing Google credential, please try again'); return; }
      await googleRegister({ credential: cred, facilityName, facilityLogo: facilityLogo || undefined });
      navigate({ to: '/dashboard' });
      return;
    }

    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    clearError();
    await register({
      email, password, name, company: facilityName || name,
      accountType: 'company',
      facilityName: facilityName || name,
      facilityLogo: facilityLogo || undefined,
    });
    navigate({ to: '/dashboard' });
  };

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /\d/.test(password) ? 4 : 3;
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const pwColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png?v=3" alt="HEYLA" className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-800">Create Company Account</h1>
          <p className="text-slate-500 mt-1">Register your business on HEYLAOS</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-sm text-blue-700">
              Register your company to post jobs, manage HR, payroll, inventory, and grow your business.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {googleStep === 'credential' ? (
              <>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 mb-2">
                  Signed in with Google. Complete your registration below.
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Name</label>
                  <input type="text" value={name} disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed" />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                  <input type="email" value={email} disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed" />
                </div>

                <div className="border-t border-slate-200 pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Facility Details</h3>
                  <div className="mb-3">
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Facility Name</label>
                    <input type="text" value={facilityName} onChange={(e) => setFacilityName(e.target.value)}
                      placeholder="e.g. Hydan Medical Centre"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Facility Logo</label>
                    <div className="flex items-center gap-3">
                      {facilityLogo ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          <img src={sanitizeUrl(facilityLogo)} alt="Facility logo" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFacilityLogo('')}
                            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors shrink-0">
                          <Upload className="w-5 h-5" />
                        </button>
                      )}
                      <div className="text-xs text-slate-400">
                        <p>Upload your facility logo</p>
                        <p>PNG, JPG or SVG. Max 2MB.</p>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isLoading ? 'Creating account...' : <><span>Complete Registration</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </>
            ) : (
              <>
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

                <div className="border-t border-slate-200 pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Facility Details</h3>
                  <div className="mb-3">
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Facility Name</label>
                    <input type="text" value={facilityName} onChange={(e) => setFacilityName(e.target.value)}
                      placeholder="e.g. Hydan Medical Centre"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Facility Logo</label>
                    <div className="flex items-center gap-3">
                      {facilityLogo ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          <img src={sanitizeUrl(facilityLogo)} alt="Facility logo" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFacilityLogo('')}
                            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors shrink-0">
                          <Upload className="w-5 h-5" />
                        </button>
                      )}
                      <div className="text-xs text-slate-400">
                        <p>Upload your facility logo</p>
                        <p>PNG, JPG or SVG. Max 2MB.</p>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {isLoading ? 'Creating account...' : <><span>Create Company Account</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </>
            )}
          </form>

          {googleStep !== 'credential' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or sign up with</span></div>
              </div>
              {googleClientId ? (
                <div ref={googleBtnRef} className="flex justify-center [&>div]:w-[400px] [&>div>div]:w-[400px] [&_iframe]:!w-[400px]" />
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
            </>
          )}

          {googleStep === 'credential' && (
            <div className="mt-4 text-center">
              <button type="button" onClick={() => { setGoogleStep('idle'); setName(''); setEmail(''); setFacilityName(''); setFacilityLogo(''); }}
                className="text-sm text-slate-500 hover:text-slate-700 underline">
                Use email & password instead
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
          <p className="text-sm text-slate-500">
            Looking for a job? <Link to="/register/individual" className="text-blue-600 font-medium hover:underline">Create individual account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
