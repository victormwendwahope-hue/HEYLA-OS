import { useState, useEffect, useRef } from 'react';
import { Shield, Check, ArrowLeft, Loader2, Zap, Building2, Crown, Star, Smartphone, CreditCard, Landmark, AlertCircle } from 'lucide-react';
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

const PAYMENT_METHODS = [
  { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, description: 'Pay via M-Pesa STK Push' },
  { id: 'card', name: 'Card Payment', icon: CreditCard, description: 'Debit/Credit card via Stripe' },
  { id: 'paystack', name: 'Paystack', icon: Landmark, description: 'Card & Mobile Money via Paystack' },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [phone, setPhone] = useState('0708066022');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'pay' | 'confirming'>('select');
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval>>();

  const plan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];
  const price = billing === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice || plan.monthlyPrice * 12);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleProceedToPay = () => {
    setStep('pay');
  };

  const handlePay = async () => {
    setProcessing(true);
    try {
      if (paymentMethod === 'mpesa') {
        if (!phone || phone.length < 10) {
          toast.error('Please enter a valid phone number');
          setProcessing(false);
          return;
        }
        const result = await api.payment.initiateMpesa(selectedPlan, billing, phone);
        setPaymentRef(result.reference);
        setStep('confirming');
        toast.success(result.customerMessage || 'M-Pesa STK Push sent! Check your phone.');

        pollingRef.current = setInterval(async () => {
          try {
            const status = await api.payment.mpesaStatus(result.checkoutRequestId);
            if (status.status === 'completed') {
              clearInterval(pollingRef.current);
              toast.success('Payment confirmed! Subscription activated.');
              await api.subscription.subscribe(selectedPlan, billing);
              navigate({ to: '/dashboard' });
            } else if (status.status === 'failed') {
              clearInterval(pollingRef.current);
              toast.error(status.reason || 'Payment failed');
              setStep('pay');
              setProcessing(false);
            }
          } catch {
            clearInterval(pollingRef.current);
            setStep('pay');
            setProcessing(false);
          }
        }, 3000);

      } else if (paymentMethod === 'card') {
        const result = await api.payment.initiateStripe(selectedPlan, billing);
        setPaymentRef(result.reference);
        setStep('confirming');
        toast.success('Redirecting to Stripe...');
        await api.subscription.subscribe(selectedPlan, billing);
        navigate({ to: '/dashboard' });

      } else if (paymentMethod === 'paystack') {
        const result = await api.payment.initiatePaystack(selectedPlan, billing);
        setPaymentRef(result.reference);
        setStep('confirming');
        window.location.href = result.authorizationUrl;

      } else {
        toast.error('Please select a payment method');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      toast.error(msg);
      setStep('pay');
    } finally {
      if (paymentMethod !== 'mpesa') setProcessing(false);
    }
  };

  const handleBack = () => {
    if (step === 'pay') setStep('select');
    else if (step === 'confirming') { setStep('pay'); setPaymentRef(null); }
    else navigate({ to: '/dashboard' });
  };

  if (step === 'confirming') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold mb-2">Confirming your payment</h2>
          <p className="text-muted-foreground mb-4">
            {paymentMethod === 'mpesa' ? 'Check your phone and enter your M-Pesa PIN to complete payment.' : 'Processing your payment...'}
          </p>
          <div className="bg-card border rounded-xl p-4 text-left space-y-2 mb-4">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Plan</span><span className="font-medium">{plan.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-medium">KES {price?.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Reference</span><span className="font-medium text-xs">{paymentRef}</span></div>
          </div>
          <p className="text-xs text-muted-foreground">Please wait — this page will update automatically once confirmed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {step === 'select' ? 'Back to Dashboard' : 'Back to Plans'}
        </button>

        {step === 'select' && (
          <>
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
              <button onClick={handleProceedToPay}
                className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                Continue to Payment — KES {price?.toLocaleString()}{billing === 'monthly' ? '/month' : '/year'}
              </button>
              <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Secure payment via M-Pesa, Card, or Mobile Money
              </p>
            </div>
          </>
        )}

        {step === 'pay' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Complete Payment</h1>
              <p className="text-muted-foreground">
                {plan.name} — KES {price?.toLocaleString()}{billing === 'monthly' ? '/month' : '/year'}
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${paymentMethod === pm.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <Icon className={`w-6 h-6 ${paymentMethod === pm.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-medium">{pm.name}</span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === 'mpesa' && (
                <div>
                  <label className="text-sm font-medium mb-1 block">M-Pesa Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full px-4 py-3 rounded-xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <p className="text-xs text-muted-foreground mt-1">You will receive an STK Push prompt on this phone.</p>
                </div>
              )}

              <button onClick={handlePay} disabled={processing || (paymentMethod === 'mpesa' && !phone)}
                className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 disabled:opacity-50">
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                {processing ? 'Processing...' : `Pay KES ${price?.toLocaleString()}`}
              </button>

              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Your payment info is secure. No card details stored on our servers.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
