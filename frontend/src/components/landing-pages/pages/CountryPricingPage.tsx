import { CountryConfig } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import { Check, ArrowRight, Zap, Building2, Crown, Star, Shield } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SiteFooter } from '@/components/landing-pages/SiteFooter';

interface Props { country: CountryConfig }

const PLANS = [
  {
    name: 'Starter', price: 'KES 2,500', period: '/month', annually: 'KES 24,000/yr',
    icon: Zap, highlight: false, maxUsers: 3,
    features: ['CRM Sales & Quotations', 'Invoicing', 'Inventory Management', 'Expense Management', 'Basic Reports', 'Maximum of 3 users'],
    cta: 'Start Free Trial', action: null,
  },
  {
    name: 'Growth', price: 'KES 5,000', period: '/month', annually: 'KES 48,000/yr',
    icon: Building2, highlight: true, maxUsers: 10,
    features: ['Everything in Starter', 'Human Resource Management', 'Employee Records', 'Kenya Payroll (PAYE, SHIF, NSSF, Housing Levy)', 'Leave Management', 'Procurement', 'Asset Management', 'Customer Portal', 'Maximum of 10 users'],
    cta: 'Start Free Trial', action: null,
  },
  {
    name: 'Professional', price: 'KES 10,000', period: '/month', annually: 'KES 96,000/yr',
    icon: Star, highlight: false, maxUsers: 30,
    features: ['Everything in Growth', 'Accounting', 'Fleet Management', 'Fuel Management', 'Workshop & Maintenance', 'Project Management', 'Approval Workflows', 'Business Intelligence Dashboard', 'API Access', 'Maximum of 30 users'],
    cta: 'Start Free Trial', action: null,
  },
  {
    name: 'Enterprise', price: 'From KES 20,000', period: '/month', annually: 'Custom pricing',
    icon: Crown, highlight: false, maxUsers: 999,
    features: ['Everything in Professional', 'Unlimited users', 'Multi-branch support', 'Custom workflows', 'Dedicated account manager', 'Premium support', 'Custom integrations', 'Optional on-premise deployment', 'SLA'],
    cta: 'Contact Sales', action: null,
  },
];

export function CountryPricingPage({ country }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar countryCode={country.code} />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Pricing for {country.name}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            All plans include {country.currency} support and {country.taxFields.join(', ')} compliance. 
            Start with a <strong>15-day free trial</strong> — no credit card required.
          </p>
        </div>

        <div className="hidden md:flex items-center justify-center gap-2 mb-8">
          <span className="text-sm text-muted-foreground">Save 20% with annual billing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative bg-card border rounded-2xl p-6 transition-shadow hover:shadow-lg flex flex-col ${plan.highlight ? 'border-primary shadow-md ring-1 ring-primary' : 'border-border'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">Recommended</div>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${plan.highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                <plan.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-1">Up to {plan.maxUsers} users</p>
              <div className="mt-1 mb-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{plan.annually}</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <button onClick={() => navigate({ to: '/register' })}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${plan.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border hover:bg-muted/50'}`}>
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-6">Optional Add-on Modules</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Add features to any plan without upgrading</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: 'Payroll', price: 'KES 1,000/mo' },
              { name: 'HR Management', price: 'KES 1,000/mo' },
              { name: 'Accounting', price: 'KES 2,000/mo' },
              { name: 'Fleet Management', price: 'KES 2,000/mo' },
              { name: 'Fuel Management', price: 'KES 1,000/mo' },
              { name: 'Workshop Mgmt', price: 'KES 2,000/mo' },
              { name: 'Procurement', price: 'KES 1,500/mo' },
              { name: 'Project Mgmt', price: 'KES 1,500/mo' },
              { name: 'Asset Management', price: 'KES 1,000/mo' },
              { name: 'CRM Premium', price: 'KES 1,000/mo' },
            ].map((mod) => (
              <div key={mod.name} className="bg-card border border-border rounded-lg p-3 text-center">
                <p className="text-sm font-medium">{mod.name}</p>
                <p className="text-xs text-muted-foreground">{mod.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
            <Shield className="w-4 h-4 text-primary" />
            All plans include a 15-day free trial. No credit card required.
          </div>
        </div>
      </div>
      <SiteFooter countryName={country.name} />
    </div>
  );
}
