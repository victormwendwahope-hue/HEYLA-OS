import { useEffect, useRef, useState } from 'react';
import { UserPlus, Settings, Zap, BarChart3, ArrowDown, Sparkles } from 'lucide-react';

const STEPS = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up free — no credit card required. Set up your company profile in under 2 minutes.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Settings, title: 'Configure Your Stack', desc: 'Enable HR, CRM, Accounting, Inventory — only what you need. Everything is pre-configured for your country.', gradient: 'from-violet-500 to-purple-500' },
  { icon: Zap, title: 'Import & Go', desc: 'Import your employees, leads, and products. Or start fresh — the interface guides you step by step.', gradient: 'from-amber-500 to-orange-500' },
  { icon: BarChart3, title: 'Grow & Scale', desc: 'Track performance, automate payroll, manage compliance, and make data-driven decisions.', gradient: 'from-emerald-500 to-teal-500' },
];

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `all 0.5s ease-out ${index * 0.15}s`,
      }}
    >
      <div className="relative mx-auto mb-4">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto shadow-lg transition-all duration-500 ${hovered ? 'scale-110 shadow-xl' : ''}`}>
          <step.icon className={`w-7 h-7 text-white transition-all duration-300 ${hovered ? 'animate-icon-bounce' : ''}`} />
          {hovered && (
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${step.gradient} animate-ping opacity-25`} />
          )}
        </div>
        <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center transition-all duration-300 ${hovered ? 'scale-110 border-primary/80' : ''}`}>
          <span className="text-xs font-bold text-primary">{index + 1}</span>
        </div>
      </div>
      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{step.title}</h3>
      <p className="text-sm text-muted-foreground px-2">{step.desc}</p>
    </div>
  );
}

export function HowItWorks() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); observer.unobserve(el); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="px-4 sm:px-8 lg:px-16 py-16 bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-5xl mx-auto">
        <div ref={headerRef} className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.4s ease-out',
            }}
          >
            <Sparkles className="w-4 h-4" /> Simple Setup
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.4s ease-out 0.1s',
            }}
          >
            How It Works
          </h2>
          <p
            className="text-muted-foreground max-w-xl mx-auto"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.4s ease-out 0.2s',
            }}
          >
            Get your business running on HEYLA OS in four simple steps.
          </p>
        </div>
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
          <div className="hidden lg:block absolute top-1/2 left-[12.5%] right-[12.5%] -translate-y-1/2 pointer-events-none">
            <div className="flex justify-between px-2">
              {[0, 1, 2].map(i => (
                <ArrowDown key={i} className="w-5 h-5 text-primary/30 -rotate-90" style={{ animation: `float 2s ease-in-out ${i * 0.5}s infinite` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
