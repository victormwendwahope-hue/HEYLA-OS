import { useState } from 'react';
import { CreditCard, Shield, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [processing, setProcessing] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 'KSh 2,500',
      period: '/month',
      features: ['Full HR & Payroll', 'Accounting & Invoicing', 'Inventory Management', 'Transport & Fleet', 'CRM & Sales', 'Engineering Projects', 'EHS Compliance', 'Email Support'],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: 'KSh 25,000',
      period: '/year',
      features: ['Everything in Monthly', '2 months free', 'Priority Support', 'Dedicated Account Manager', 'Custom Integrations', 'API Access', 'White-label Option'],
      popular: true,
    },
  ];

  const handleSubscribe = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast.success('Subscription activated! Redirecting to dashboard...');
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your trial has ended</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upgrade to continue using HEYLA OS. Choose a plan that works for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((p) => (
            <div key={p.id} onClick={() => setPlan(p.id as 'monthly' | 'yearly')}
              className={`glass rounded-2xl p-6 cursor-pointer transition-all border-2 ${plan === p.id ? 'border-primary' : 'border-transparent hover:border-primary/50'} ${p.popular ? 'relative' : ''}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span>
              )}
              <h3 className="text-lg font-semibold mb-1">{p.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={(e) => { e.stopPropagation(); handleSubscribe(); }} disabled={processing}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 ${plan === p.id ? 'gradient-primary text-primary-foreground hover:opacity-90' : 'border border-border hover:bg-muted'}`}>
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                {processing ? 'Processing...' : `Choose ${p.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          Secure payment powered by HEYLA OS Payments
        </div>
      </div>
    </div>
  );
}