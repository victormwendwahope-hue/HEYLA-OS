import { CountryConfig } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Globe2, Heart, Users, Target, ArrowRight } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SiteFooter } from '@/components/landing-pages/SiteFooter';

interface Props { country: CountryConfig }

export function CountryAboutPage({ country }: Props) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar countryCode={country.code} />

      {/* Hero */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">About HEYLA OS</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We are building the operating system for businesses in {country.name} and across the globe. 
            One platform to manage people, customers, finances, and operations.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-8 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Our Mission', desc: `Empower every business in ${country.name} with enterprise-grade tools that are affordable, localised, and easy to use.` },
              { icon: Globe2, title: 'Global Reach', desc: `Serving businesses across 20+ countries with local currency support, tax compliance, and region-specific features.` },
              { icon: Heart, title: 'Built for You', desc: `Every feature is designed with ${country.name}'s unique business environment in mind — from tax fields to payment methods.` },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><v.icon className="w-6 h-6 text-primary" /></div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
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

      {/* CTA */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to transform your business?</h2>
        <button onClick={() => navigate({ to: '/register' })} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
          Get Started Free <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      <SiteFooter countryName={country.name} />
    </div>
  );
}
