import { useState, useEffect, useRef } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star, Sparkles, MessageCircle } from 'lucide-react';

interface TestimonialsProps { name: string; role: string; quote: string; countryName: string }

const FALLBACKS = [
  { name: 'James Kariuki', role: 'CEO, TechNest Solutions', quote: 'HEYLA OS transformed how we manage our team. Payroll that used to take 3 days now takes 30 minutes. The compliance features are a game changer for our business in {country}.' },
  { name: 'Amina Hassan', role: 'Operations Director, BuildRight Ltd', quote: 'We tried 5 different platforms before HEYLA. Nothing comes close to the integration — HR, CRM, accounting all in one place. Our team adopted it in days.' },
  { name: 'David Ochieng', role: 'Founder, GreenField Agribusiness', quote: 'The inventory and CRM modules alone saved us thousands. We can track everything from farm to customer in one system. Highly recommended for growing businesses.' },
];

export function Testimonials({ name, role, quote, countryName }: TestimonialsProps) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const all = [
    { name, role, quote: quote.replace('{country}', countryName) },
    ...FALLBACKS.map(f => ({ ...f, quote: f.quote.replace('{country}', countryName) })),
  ];

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

  const goTo = (i: number) => {
    setFade(false);
    setTimeout(() => { setIdx(i); setFade(true); }, 200);
  };

  return (
    <section ref={ref} className="px-4 sm:px-8 lg:px-16 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.5s ease-out',
          }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <MessageCircle className="w-4 h-4" /> Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground mb-10">Join thousands of businesses that trust HEYLA OS.</p>
        </div>
        <div
          className="bg-card border border-border rounded-2xl p-8 sm:p-10 relative overflow-hidden"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.95)',
            transition: 'all 0.5s ease-out 0.15s',
          }}
        >
          <Quote className="w-10 h-10 text-primary/10 absolute top-4 left-4" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className={`w-4 h-4 fill-amber-400 text-amber-400 transition-all duration-300 ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                style={{ transitionDelay: `${i * 0.08}s` }} />
            ))}
          </div>
          <div className="min-h-[120px] flex items-center justify-center">
            <p className={`text-base italic text-muted-foreground mb-6 leading-relaxed transition-all duration-300 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              "{all[idx].quote}"
            </p>
          </div>
          <div className={`transition-all duration-300 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <p className="font-semibold">{all[idx].name}</p>
            <p className="text-sm text-muted-foreground">{all[idx].role}</p>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => goTo((idx - 1 + all.length) % all.length)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors border border-border hover:border-primary/30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {all.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`h-2 rounded-full transition-all duration-300 ${i === idx ? 'bg-primary w-6' : 'bg-muted-foreground/25 w-2 hover:bg-muted-foreground/50'}`} />
              ))}
            </div>
            <button onClick={() => goTo((idx + 1) % all.length)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors border border-border hover:border-primary/30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
