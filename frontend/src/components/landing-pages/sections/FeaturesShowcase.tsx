import { useEffect, useRef, useState } from 'react';
import {
  Users, DollarSign, BarChart3, Package, Headphones, Shield,
  GitBranch, CalendarDays, FileText, MessageSquare, Globe, Zap,
  Building2, CreditCard, PieChart, Truck
} from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'HR Management', desc: 'Onboarding, attendance, leave, and performance — all in one place.', color: 'from-blue-500 to-blue-600' },
  { icon: DollarSign, title: 'Payroll & Tax', desc: 'Local tax tables, auto-calculations, compliance reports.', color: 'from-emerald-500 to-emerald-600' },
  { icon: BarChart3, title: 'CRM & Sales', desc: 'Track leads, manage pipeline, close deals faster.', color: 'from-purple-500 to-purple-600' },
  { icon: Package, title: 'Inventory', desc: 'Real-time stock tracking, low-stock alerts, barcodes.', color: 'from-amber-500 to-amber-600' },
  { icon: Building2, title: 'Multi-Branch', desc: 'Manage multiple locations from a single dashboard.', color: 'from-rose-500 to-rose-600' },
  { icon: CreditCard, title: 'Invoicing', desc: 'Send invoices, track payments, automatic reminders.', color: 'from-cyan-500 to-cyan-600' },
  { icon: PieChart, title: 'Reporting', desc: 'Real-time dashboards, exportable reports, insights.', color: 'from-violet-500 to-violet-600' },
  { icon: Truck, title: 'Logistics', desc: 'Delivery tracking, fleet management, route planning.', color: 'from-orange-500 to-orange-600' },
  { icon: Shield, title: 'Compliance', desc: 'Local labor laws, tax regulations, data protection.', color: 'from-green-500 to-green-600' },
  { icon: Headphones, title: 'Support', desc: '24/7 support, knowledge base, community forum.', color: 'from-sky-500 to-sky-600' },
  { icon: GitBranch, title: 'Workflow', desc: 'Approval chains, task automation, custom triggers.', color: 'from-indigo-500 to-indigo-600' },
  { icon: MessageSquare, title: 'Communication', desc: 'Team chat, announcements, SMS and email alerts.', color: 'from-teal-500 to-teal-600' },
];

export function FeaturesShowcase() {
  return (
    <section className="px-4 sm:px-8 lg:px-16 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything You Need to Run Your Business</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">12 integrated modules that work together seamlessly.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature: f, index }: { feature: typeof FEATURES[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
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
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-card border border-border rounded-xl p-5 cursor-default transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.4s ease-out ${index * 0.06}s`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className={`relative shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center transition-transform duration-300 ${hovered ? 'scale-110' : ''}`}>
          <f.icon className="w-5 h-5 text-white" />
          {hovered && (
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${f.color} animate-ping opacity-20`} />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm mb-0.5">{f.title}</h3>
          <p className="text-xs text-muted-foreground">{f.desc}</p>
        </div>
      </div>
    </div>
  );
}
