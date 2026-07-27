import { useRef, useState, useEffect } from 'react';
import {
  Smartphone, CreditCard, MessageSquare, Mail, Globe,
  Database, Cloud, Lock, BarChart3, Shield,
  type LucideIcon
} from 'lucide-react';

interface Integration {
  icon: LucideIcon;
  name: string;
  desc: string;
}

const INTEGRATIONS: Integration[] = [
  { icon: Smartphone, name: 'Mobile Money', desc: 'M-Pesa, Airtel Money, MTN Mobile' },
  { icon: CreditCard, name: 'Payment Gateways', desc: 'Card, PayPal, Stripe, Paystack' },
  { icon: MessageSquare, name: 'SMS & WhatsApp', desc: 'Twilio, Africa\'s Talking, WATI' },
  { icon: Mail, name: 'Email Services', desc: 'SMTP, Mailgun, SendGrid' },
  { icon: Globe, name: 'Cloud Hosting', desc: 'AWS, GCP, Azure, DigitalOcean' },
  { icon: Database, name: 'Data Sync', desc: 'Odoo, SAP, QuickBooks, Xero' },
  { icon: Cloud, name: 'Storage & Backup', desc: 'Google Drive, Dropbox, S3' },
  { icon: Lock, name: 'Authentication', desc: 'SSO, OAuth2, Magic Links, 2FA' },
  { icon: BarChart3, name: 'Analytics', desc: 'Google Analytics, Metabase, Power BI' },
  { icon: Shield, name: 'Compliance Tools', desc: 'GDPR, SOC2, ISO 27001 ready' },
];

function IntegrationIcon({ icon: Icon, index }: { icon: LucideIcon; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.8)',
        transition: `all 0.4s ease-out ${index * 0.04}s`,
      }}
    >
      <div className="group relative flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-default">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{Icon.name}</p>
          <p className="text-xs text-muted-foreground truncate">{INTEGRATIONS.find(i => i.icon === Icon)?.desc}</p>
        </div>
        <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}

const iconList: LucideIcon[] = [Smartphone, CreditCard, MessageSquare, Mail, Globe, Database, Cloud, Lock, BarChart3, Shield];

export function IntegrationsShowcase() {
  return (
    <section className="px-4 sm:px-8 lg:px-16 py-16 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Integrates With Everything</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Connect your favorite tools and services. HEYLA OS plays well with others.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {iconList.map((Icon, i) => (
            <IntegrationIcon key={i} icon={Icon} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
