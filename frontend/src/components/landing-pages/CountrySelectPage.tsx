import { countries } from '@/utils/countries';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';

export default function CountrySelectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-4 sm:px-8 lg:px-16 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">H</div>
          <span className="text-lg font-bold">HEYLA<span className="text-primary"> OS</span></span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => navigate('/login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</button>
          <button onClick={() => navigate('/register')} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Get Started</button>
        </div>
      </nav>

      <div className="px-4 sm:px-8 lg:px-16 py-12 sm:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Globe className="w-4 h-4" /> {countries.length} Countries
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            One Platform. <span className="text-primary">Every Country.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            HEYLA OS is built for global business. Choose your country to see how we support local compliance, currency, and regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => navigate(`/country/${c.code.toLowerCase()}`)}
              className="group bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{c.flag}</span>
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.currency} ({c.currencySymbol})</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {c.taxFields.slice(0, 3).map((f) => (
                  <span key={f} className="text-xs bg-muted/50 rounded px-2 py-0.5">{f}</span>
                ))}
                {c.taxFields.length > 3 && <span className="text-xs text-muted-foreground">+{c.taxFields.length - 3}</span>}
              </div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <footer className="border-t border-border px-4 sm:px-8 lg:px-16 py-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">H</div>
            <span className="text-sm font-semibold">HEYLA OS</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 HEYLA OS. Global Business Management Platform.</p>
        </div>
      </footer>
    </div>
  );
}
