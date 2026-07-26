import { CountryConfig } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, Users, TrendingUp, Package, DollarSign, Globe, Shield, Zap, CheckCircle, Briefcase, MapPin, Clock, Loader2 } from 'lucide-react';
import { AdBanner } from '@/components/ui/AdBanner';
import { api } from '@/lib/api';

interface PublicJob {
  id: string; title: string; company: string; location: string;
  type: string; salary: string; description: string; postedDate: string;
}

interface CountryLandingProps {
  country: CountryConfig;
  highlights: string[];
  industries: string[];
  testimonial?: { name: string; role: string; quote: string };
}

export function CountryLandingTemplate({ country, highlights, industries, testimonial }: CountryLandingProps) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setJobsLoading(true);
    api.public.jobs(country.code).then((data) => {
      if (!cancelled) { setJobs(data); setJobsLoading(false); }
    }).catch(() => {
      if (!cancelled) setJobsLoading(false);
    });
    return () => { cancelled = true; };
  }, [country.code]);

  const features = [
    { icon: Users, title: 'HR and People', desc: `Manage your ${country.name} workforce with local compliance built in.` },
    { icon: TrendingUp, title: 'CRM and Sales', desc: `Track leads and close deals in ${country.currency}.` },
    { icon: DollarSign, title: 'Accounting', desc: `Invoicing, payroll, and tax reports with ${country.currencySymbol} formatting.` },
    { icon: Package, title: 'Inventory', desc: 'Real-time stock management across locations.' },
    { icon: Globe, title: 'Networking', desc: `Connect with businesses across ${country.name}.` },
    { icon: Shield, title: 'Compliance', desc: `Built-in support for ${country.taxFields.join(', ')}.` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdBanner position="top" />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 lg:px-16 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png?v=3" alt="HEYLA" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold">HEYLA<span className="text-primary"> OS</span></span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => navigate('/login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</button>
            <button onClick={() => navigate('/register')} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Get Started</button>
          </div>
        </nav>

        <div className="relative z-10 px-4 sm:px-8 lg:px-16 py-12 sm:py-20 lg:py-28 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                Built for {country.name}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                Run Your Business in{' '}
                <span className="text-primary">{country.name}</span>{' '}
                With One Platform
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                HEYLA is the all-in-one business management platform designed for {country.name}. 
                HR, CRM, Accounting, Inventory -- all with {country.currency} support and local compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button onClick={() => navigate('/register')} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/login')} className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors">
                  View Demo
                </button>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Quick Stats</p>
                    <p className="text-xs text-muted-foreground">{country.name} Dashboard</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Revenue', value: `${country.currencySymbol} 2.4M` },
                    { label: 'Employees', value: '156' },
                    { label: 'Active Leads', value: '89' },
                    { label: 'Products', value: '1,240' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Highlights */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">Why Businesses in {country.name} Choose HEYLA</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">{h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad placement between sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-4">
        <AdBanner position="sidebar" />
      </div>

      {/* Features */}
      <section className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">Everything You Need</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">Manage every aspect of your business from a single dashboard, localized for {country.name}.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Compliance */}
      <section className="px-4 sm:px-8 lg:px-16 py-12 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">{country.name} Compliance Built In</h2>
          <p className="text-muted-foreground mb-6">Pre-configured tax fields and formats for {country.name}:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {country.taxFields.map((field) => (
              <span key={field} className="bg-card border border-border rounded-full px-4 py-2 text-sm font-medium">{field}</span>
            ))}
            <span className="bg-card border border-border rounded-full px-4 py-2 text-sm text-muted-foreground">Phone: {country.phonePrefix}</span>
            <span className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">{country.currency} ({country.currencySymbol})</span>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">Industries We Serve in {country.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {industries.map((ind) => (
              <div key={ind} className="bg-card border border-border rounded-xl p-4 text-center text-sm font-medium hover:border-primary/50 transition-colors">
                {ind}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vacancies */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold text-center">Open Vacancies in {country.name}</h2>
          </div>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Companies in {country.name} are hiring. Browse opportunities and apply as an individual.
          </p>

          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No open vacancies at the moment. Check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <p className="font-semibold text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {job.type} {job.salary ? `- ${job.salary}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/register?type=individual')}
                    className="w-full text-xs bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    I am Interested
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonial */}
      {testimonial && (
        <section className="px-4 sm:px-8 lg:px-16 py-12 bg-muted/20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg italic text-muted-foreground mb-4">"{testimonial.quote}"</p>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Grow Your Business in {country.name}?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of businesses using HEYLA. Start free today.</p>
          <button onClick={() => navigate('/register')} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer with Privacy & Terms links */}
      <footer className="border-t border-border px-4 sm:px-8 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png?v=3" alt="HEYLA" className="w-6 h-6" />
            <span className="text-sm font-semibold">HEYLA</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Use</a>
            <span>&copy; 2026 HEYLA. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
