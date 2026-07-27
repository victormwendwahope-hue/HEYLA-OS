import { useState, useEffect } from 'react';
import { Shield, Check, ArrowLeft, Loader2, Zap, Building2, Crown, Star } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'starter', name: 'Starter',
    monthlyPrice: 2500, yearlyPrice: 24000,
    maxUsers: 3,
    features: ['CRM Sales & Quotations', 'Invoicing', 'Inventory Management', 'Expense Management', 'Basic Reports', 'Maximum of 3 users'],
    icon: Zap,
  },
  {
    id: 'growth', name: 'Growth',
    monthlyPrice: 5000, yearlyPrice: 48000,
    maxUsers: 10, popular: true,
    features: ['Everything in Starter', 'Human Resource Management', 'Employee Records', 'Kenya Payroll (PAYE, SHIF, NSSF, Housing Levy)', 'Leave Management', 'Procurement', 'Asset Management', 'Customer Portal', 'Maximum of 10 users'],
    icon: Building2,
  },
  {
    id: 'professional', name: 'Professional',
    monthlyPrice: 10000, yearlyPrice: 96000,
    maxUsers: 30,
    features: ['Everything in Growth', 'Accounting', 'Fleet Management', 'Fuel Management', 'Workshop & Maintenance', 'Project Management', 'Approval Workflows', 'Business Intelligence Dashboard', 'API Access', 'Maximum of 30 users'],
    icon: Star,
  },
  {
    id: 'enterprise', name: 'Enterprise',
    monthlyPrice: 20000, yearlyPrice: null,
    maxUsers: 999, custom: true,
    features: ['Everything in Professional', 'Unlimited users', 'Multi-branch support', 'Custom workflows', 'Dedicated account manager', 'Premium support', 'Custom integrations', 'Optional on-premise deployment', 'SLA (Service Level Agreement)'],
    icon: Crown,
  },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [processing, setProcessing] = useState(false);

  const plan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];
  const price = billing === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice || plan.monthlyPrice * 12);

  const handleSubscribe = async () => {
    setProcessing(true);
    try {
      await api.subscription.subscribe(selectedPlan, billing);
      toast.success('Subscription activated!');
      navigate({ to: '/dashboard' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Subscription failed';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <button onClick={() => navigate({ to: '/dashboard' })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose your plan</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {user?.subscription?.status === 'expired' ? 'Your trial has ended. ' : ''}Pick a plan that fits your business.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <button onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            Monthly
          </button>
          <button onClick={() => setBilling('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            Annual <span className="text-xs opacity-80">(20% off)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {PLANS.map((p) => {
            const pPrice = billing === 'monthly' ? p.monthlyPrice : (p.yearlyPrice || p.monthlyPrice * 12);
            const pPeriod = billing === 'monthly' ? '/month' : '/year';
            return (
              <div key={p.id} onClick={() => setSelectedPlan(p.id)}
                className={`relative bg-card border rounded-2xl p-5 cursor-pointer transition-all ${selectedPlan === p.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'} ${p.popular ? 'ring-1 ring-primary' : ''}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
                )}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${selectedPlan === p.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                  <p.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <div className="mt-1 mb-3">
                  <span className="text-2xl font-bold">KES {pPrice?.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm">{pPeriod}</span>
                  {p.custom && <span className="block text-xs text-muted-foreground">Starting from</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-3">Up to {p.maxUsers} users</p>
                <ul className="space-y-1.5 mb-4">
                  {p.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs"><Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />{f}</li>
                  ))}
                  {p.features.length > 5 && (
                    <li className="text-xs text-muted-foreground pl-4">+{p.features.length - 5} more features</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="max-w-md mx-auto mt-8">
          <button onClick={handleSubscribe} disabled={processing}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {processing && <Loader2 className="w-4 h-4 animate-spin" />}
            {processing ? 'Processing...' : `Subscribe to ${plan.name} — KES ${price?.toLocaleString()}${billing === 'monthly' ? '/month' : '/year'}`}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> Secure payment — no credit card required for trial
          </p>
        </div>
      </div>
    </div>
  );
}
