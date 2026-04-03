import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Zap, Eye, EyeOff, ArrowRight, Building2, User, Globe, Bell, Search } from 'lucide-react';
import { toast } from 'sonner';
import { countries } from '@/utils/countries';

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
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const country = countries.find((c) => c.code === selectedCountry) || countries[0];

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /\d/.test(password) ? 4 : 3;
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const pwColors = ['', 'bg-destructive', 'bg-warning', 'bg-info', 'bg-success'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    await register({ email, password, name, company: company || name });
    toast.success('Account created! Welcome to HEYLA OS');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <img src="/logo.png" alt="HEYLA" className="w-10 h-10 rounded-xl shrink-0" />
          <span className="text-xl font-bold">HEYLA OS</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-1">Create your account</h2>
          <p className="text-muted-foreground mb-6">Start managing your business today</p>

          {/* Header bar like TopBar */}
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
                <label className="text-sm font-medium mb-1.5 block">Company Name</label>
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
            <button type="submit" disabled={isLoading}
              className="w-full gradient-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? 'Creating account...' : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
