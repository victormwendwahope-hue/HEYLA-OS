import { useEffect, useRef, useState } from 'react';
import { CountryConfig } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Zap, Search, UserCheck, Building2, Star, CheckCircle, Globe2, Sparkles } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SiteFooter } from '@/components/landing-pages/SiteFooter';
import { WorldMap } from '@/components/ui/WorldMap';
import { TrustBar } from '@/components/landing-pages/sections/TrustBar';
import { HowItWorks } from '@/components/landing-pages/sections/HowItWorks';
import { StatsBar } from '@/components/landing-pages/sections/AnimatedCounter';
import { Testimonials } from '@/components/landing-pages/sections/Testimonials';
import { FAQ } from '@/components/landing-pages/sections/FAQ';
import { FeaturesShowcase } from '@/components/landing-pages/sections/FeaturesShowcase';
import { IntegrationsShowcase } from '@/components/landing-pages/sections/IntegrationsShowcase';
import { Reveal } from '@/components/ui/Reveal';
import { countries } from '@/utils/countries';

interface Props { country: CountryConfig; highlights: string[]; testimonial?: { name: string; role: string; quote: string } }

function SectionHeader({ label, title, description, visible }: { label?: string; title: string; description?: string; visible: boolean }) {
  return (
    <div className="text-center mb-12" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease-out' }}>
      {label && (
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> {label}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h2>
      {description && <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>}
    </div>
  );
}

function useVisibility(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function CountryHomePage({ country, highlights, testimonial }: Props) {
  const t = testimonial || { name: 'Business Owner', role: `CEO, ${country.name}`, quote: 'HEYLA OS transformed how we manage our team in {country}.' };
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeroVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { ref: highlightsRef, visible: highlightsVisible } = useVisibility();
  const { ref: mapRef, visible: mapVisible } = useVisibility();
  const { ref: ctaRef, visible: ctaVisible } = useVisibility();

  return (
    <div className="min-h-screen bg-background">
      <header ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-soft" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <PublicNavbar countryCode={country.code} transparent />
        <div className="relative z-10 px-4 sm:px-8 lg:px-16 py-12 sm:py-20 lg:py-28 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div
                className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6"
                style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease-out' }}
              >
                <Sparkles className="w-4 h-4" /> Built for {country.name}
              </div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4"
                style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease-out 0.1s' }}
              >
                Run Your Business in <span className="text-primary">{country.name}</span> With One Platform
              </h1>
              <p
                className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
                style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease-out 0.2s' }}
              >
                HEYLA is the all-in-one business management platform designed for {country.name}. HR, CRM, Accounting, Inventory -- all with {country.currency} support and local compliance.
              </p>
              <div
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease-out 0.3s' }}
              >
                <button onClick={() => navigate({ to: '/register' })} className="group bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 relative overflow-hidden">
                  <span className="relative z-10">Start Free Trial</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
                <button onClick={() => navigate({ to: '/login' })} className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors hover:border-primary/30">View Demo</button>
              </div>
            </div>
            <div
              className="flex-1 w-full max-w-md"
              style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateX(0)' : 'translateX(20px)', transition: 'all 0.6s ease-out 0.3s' }}
            >
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div><p className="font-semibold text-sm">Quick Stats</p><p className="text-xs text-muted-foreground">{country.name} Dashboard</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Revenue', value: `${country.currencySymbol} 2.4M`, gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'Employees', value: '156', gradient: 'from-violet-500 to-purple-500' },
                    { label: 'Active Leads', value: '89', gradient: 'from-amber-500 to-orange-500' },
                    { label: 'Products', value: '1,240', gradient: 'from-emerald-500 to-teal-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="group bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-default">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold group-hover:text-primary transition-colors">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <TrustBar countryName={country.name} />

      <HowItWorks />

      <StatsBar />

      <FeaturesShowcase />

      {/* Dual CTA */}
      <Reveal animation="slide-up">
        <section className="px-4 sm:px-8 lg:px-16 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center md:text-left hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 mx-auto md:mx-0 group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Looking for Work in {country.name}?</h3>
                <p className="text-sm text-muted-foreground mb-6">Browse open positions from top companies hiring in {country.name}. Create your profile, match your skills, and land your next role — all for free.</p>
                <button onClick={() => navigate({ to: '/careers' })} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2 group/btn">
                  <Search className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Browse Jobs
                </button>
              </div>
              <div className="group bg-gradient-to-br from-amber-500/5 to-amber-500/10 border border-amber-500/20 rounded-2xl p-8 text-center md:text-right hover:border-amber-500/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 mx-auto md:mx-4 md:ml-auto group-hover:scale-110 group-hover:bg-amber-500/30 transition-all duration-300">
                  <Building2 className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Hiring in {country.name}?</h3>
                <p className="text-sm text-muted-foreground mb-6">Post jobs, review applicants, and find the perfect candidate. HEYLA gives you the tools to recruit and manage your entire workforce.</p>
                <button onClick={() => navigate({ to: '/register/company' })} className="bg-amber-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-500/90 transition-colors inline-flex items-center gap-2 group/btn">
                  <Star className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Post a Job
                </button>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Highlights */}
      <section ref={highlightsRef} className="px-4 sm:px-8 lg:px-16 py-12 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title={`Why Businesses in ${country.name} Choose HEYLA`} visible={highlightsVisible} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="group flex items-start gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300"
                style={{ opacity: highlightsVisible ? 1 : 0, transform: highlightsVisible ? 'translateY(0)' : 'translateY(12px)', transition: `all 0.4s ease-out ${i * 0.06}s` }}
              >
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm">{h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <IntegrationsShowcase />

      {/* World Map — Countries We Serve */}
      <section ref={mapRef} className="px-4 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Global Reach" title="Serving Businesses Across the World" description={`HEYLA OS is live in ${countries.length} countries with local currency, tax compliance, and region-specific features built in.`} visible={mapVisible} />

          <Reveal animation="scale-bounce" delay={0.2}>
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <WorldMap className="max-w-4xl mx-auto" highlightColor="#2563eb" />
            </div>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-8" style={{ opacity: mapVisible ? 1 : 0, transition: 'all 0.5s ease-out 0.3s' }}>
            {countries.map((c) => (
              <div key={c.code} className="flex items-center gap-2 text-sm hover:text-primary transition-colors cursor-default">
                <span className="text-base">{c.flag}</span>
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">({c.code.toUpperCase()})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials name={t.name} role={t.role} quote={t.quote} countryName={country.name} />

      <FAQ countryName={country.name} currency={country.currencySymbol} />

      {/* CTA */}
      <section ref={ctaRef} className="px-4 sm:px-8 lg:px-16 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <Reveal animation="scale-bounce">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Grow Your Business in {country.name}?</h2>
            <p className="text-muted-foreground mb-8">Join thousands of businesses using HEYLA. Start free today.</p>
            <button onClick={() => navigate({ to: '/register' })} className="group bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2 relative overflow-hidden">
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </Reveal>
      </section>

      <SiteFooter countryName={country.name} />
    </div>
  );
}
