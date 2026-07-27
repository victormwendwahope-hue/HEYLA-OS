import { useEffect, useRef, useState } from 'react';
import { Users, Building2, Briefcase, Globe, TrendingUp, type LucideIcon } from 'lucide-react';

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
}

function Counter({ end, suffix = '', prefix = '', label, icon: Icon, gradient }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !done.current) {
        setVisible(true);
        done.current = true;
        let start = 0;
        const duration = 1800;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group text-center p-4 rounded-2xl transition-all duration-300 hover:bg-primary/5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease-out',
      }}
    >
      <div className="relative mx-auto mb-3 w-fit">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto shadow-sm group-hover:shadow-lg transition-all duration-500 ${hovered ? 'scale-110 -translate-y-1' : ''}`}>
          <Icon className={`w-6 h-6 text-white transition-all duration-300 ${hovered ? 'animate-icon-bounce' : ''}`} />
        </div>
        {hovered && (
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} animate-ping opacity-20`} />
        )}
      </div>
      <div className={`text-3xl sm:text-4xl font-bold transition-all duration-300 ${hovered ? 'text-primary scale-105' : ''}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

const STATS = [
  { end: 5000, suffix: '+', label: 'Active Businesses', icon: Building2, gradient: 'from-blue-500 to-cyan-500' },
  { end: 50000, suffix: '+', label: 'Employees Managed', icon: Users, gradient: 'from-violet-500 to-purple-500' },
  { end: 20, suffix: '', label: 'Countries Served', icon: Globe, gradient: 'from-emerald-500 to-teal-500' },
  { end: 99.9, suffix: '%', label: 'Uptime Guarantee', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
];

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
    <section ref={ref} className="px-4 sm:px-8 lg:px-16 py-16 bg-gradient-to-br from-primary/5 via-background to-primary/[0.03] border-y border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-10" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease-out' }}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Built for Scale</h2>
          <p className="text-muted-foreground">Trusted by thousands of businesses across 20 countries.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{ animationDelay: `${i * 0.1}s` }}>
              <Counter {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
