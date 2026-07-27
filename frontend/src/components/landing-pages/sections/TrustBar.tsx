import { useEffect, useRef, useState } from 'react';
import { Shield, TrendingUp, Briefcase } from 'lucide-react';

interface TrustBarProps { countryName: string }

const LOGOS = [
  { name: 'TechCorp', gradient: 'from-blue-500 to-cyan-400', icon: Briefcase },
  { name: 'GlobalInc', gradient: 'from-emerald-500 to-green-400', icon: Shield },
  { name: 'DataSync', gradient: 'from-purple-500 to-pink-400', icon: TrendingUp },
  { name: 'CloudBase', gradient: 'from-cyan-500 to-blue-400', icon: Briefcase },
  { name: 'NexGen', gradient: 'from-rose-500 to-orange-400', icon: Shield },
  { name: 'OmniSoft', gradient: 'from-amber-500 to-yellow-400', icon: TrendingUp },
];

export function TrustBar({ countryName }: TrustBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="px-4 sm:px-8 lg:px-16 py-10 bg-muted/30 border-y border-border overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        <p
          className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s ease-out',
          }}
        >
          Trusted by businesses across {countryName}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {LOGOS.map((logo, i) => (
            <div
              key={logo.name}
              className="group flex items-center gap-3 hover:scale-105 transition-all duration-300"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transition: `all 0.4s ease-out ${0.1 + i * 0.08}s`,
                animation: visible ? `float 3s ease-in-out ${i * 0.4}s infinite` : 'none',
              }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${logo.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110`}>
                <logo.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground/50 group-hover:text-foreground transition-colors">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
