import { useState, useEffect, useRef } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

interface FAQProps { countryName: string; currency: string }

const FAQ_DATA: { q: string; a: string }[] = [
  { q: 'Is HEYLA OS really free to start?', a: 'Yes. Our Starter plan is completely free with support for up to 5 employees. You only pay when you need more capacity or advanced features like payroll automation.' },
  { q: 'Do you support {country} tax calculations?', a: 'Absolutely. HEYLA OS comes pre-configured with {country} tax fields including {taxFields}. Payroll automatically calculates deductions and generates compliant payslips.' },
  { q: 'Can I use {currency} for all transactions?', a: 'Yes. All financial modules support {currency} natively — invoicing, expenses, payroll, and reporting.' },
  { q: 'How long does it take to set up?', a: 'Most businesses are fully set up in under 30 minutes. Import your employees and start managing HR, payroll, and operations on day one.' },
  { q: 'Is my data secure?', a: 'We use enterprise-grade encryption for all data. Your information is stored securely and regularly backed up. We comply with international data protection standards.' },
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade, downgrade, or cancel anytime. No long-term contracts. Your data is always accessible.' },
];

export function FAQ({ countryName, currency }: FAQProps) {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const items = FAQ_DATA.map(item => ({
    q: item.q.replace('{country}', countryName).replace('{currency}', currency),
    a: item.a.replace('{country}', countryName).replace('{currency}', currency),
  }));

  return (
    <section ref={ref} className="px-4 sm:px-8 lg:px-16 py-16 bg-muted/20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease-out' }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" /> FAQ
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about HEYLA OS in {countryName}.</p>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <FAQItem key={i} item={item} index={i} isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ item, index, isOpen, onToggle, visible }: {
  item: { q: string; a: string }; index: number; isOpen: boolean; onToggle: () => void; visible: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-sm"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `all 0.4s ease-out ${index * 0.06}s`,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-muted/20 transition-colors gap-4"
      >
        <div className="flex items-start gap-3">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <span>{item.q}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? (contentRef.current?.scrollHeight ?? 200) : 0 }}
      >
        <div className="px-5 pb-4 pl-14 text-sm text-muted-foreground">{item.a}</div>
      </div>
    </div>
  );
}
