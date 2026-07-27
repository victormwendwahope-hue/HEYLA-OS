import { CountryConfig } from '@/types';
import { Users, TrendingUp, DollarSign, Package, Globe, Shield } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SiteFooter } from '@/components/landing-pages/SiteFooter';

interface Props { country: CountryConfig; industries: string[] }

export function CountryFeaturesPage({ country, industries }: Props) {
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
      <PublicNavbar countryCode={country.code} />
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Everything You Need</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Manage every aspect of your business from a single dashboard, localized for {country.name}.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4"><f.icon className="w-5 h-5 text-primary" /></div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Industries */}
      <section className="px-4 sm:px-8 lg:px-16 py-16 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">Industries We Serve in {country.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {industries.map((ind) => (
              <div key={ind} className="bg-card border border-border rounded-xl p-4 text-center text-sm font-medium hover:border-primary/50 transition-colors">{ind}</div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter countryName={country.name} />
    </div>
  );
}
