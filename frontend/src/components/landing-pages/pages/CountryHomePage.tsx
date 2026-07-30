import { useEffect, useRef, useState } from 'react';
import { CountryConfig } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Zap, Search, UserCheck, Building2, Star, CheckCircle, Globe2, Sparkles, Users, ExternalLink, MapPin, Phone, Mail, CreditCard, Smartphone, Landmark, Receipt, FileText, Megaphone, Handshake, Award, Shield, ChevronRight, Monitor, Wifi, Briefcase, GraduationCap, Network, Layers, BookOpen, BarChart3, Trophy, Target, Play, CheckCheck, ChevronLeft, Quote, Clock, Eye, ThumbsUp, Linkedin, Activity } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SiteFooter } from '@/components/landing-pages/SiteFooter';
import { WorldMap } from '@/components/ui/WorldMap';
import { Reveal } from '@/components/ui/Reveal';
import { countries } from '@/utils/countries';

interface Props { country: CountryConfig; highlights: string[]; testimonial?: { name: string; role: string; quote: string } }

function SectionHeader({ label, title, description, visible, light }: { label?: string; title: string; description?: string; visible: boolean; light?: boolean }) {
  return (
    <div className="text-center mb-14" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out' }}>
      {label && (
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-full px-5 py-1.5 text-sm font-semibold mb-5 border border-primary/10">
          <Sparkles className="w-3.5 h-3.5" /> {label}
        </div>
      )}
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight ${light ? 'text-white' : ''}`}>{title}</h2>
      {description && <p className={`text-base sm:text-lg max-w-3xl mx-auto leading-relaxed ${light ? 'text-white/70' : 'text-muted-foreground'}`}>{description}</p>}
    </div>
  );
}

function useVisibility(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function HeroDashboard() {
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:mx-0">
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-3xl opacity-30 animate-pulse-soft" />
      <div className="relative bg-card border border-border/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-muted-foreground font-mono">HEYLAOS Dashboard</span>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm">JM</div>
              <div>
                <p className="text-sm font-semibold">James Mwangi</p>
                <p className="text-xs text-muted-foreground">Software Engineer · Nairobi</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 text-xs px-2.5 py-1 rounded-full font-medium">
              <CheckCheck className="w-3 h-3" /> Verified
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Profile Views', value: '2,847', icon: Eye, change: '+12%' },
              { label: 'Connections', value: '1,234', icon: Users, change: '+28' },
              { label: 'Endorsements', value: '89', icon: ThumbsUp, change: '+5' },
            ].map((s) => (
              <div key={s.label} className="bg-muted/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-emerald-500 font-medium">{s.change}</span>
                </div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills & Endorsements</span>
              <span className="text-[10px] text-primary">Top 5%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX', 'DevOps'].map((s) => (
                <div key={s} className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full border border-primary/10">
                  <span>{s}</span>
                  <span className="text-[10px] text-muted-foreground">· 12</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Active now · 5 new opportunities matched</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl -z-10 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-float-lg">
        <Briefcase className="w-8 h-8 text-white" />
      </div>
    </div>
  );
}

function ProfileCard({ name, role, skills, verified, className }: { name: string; role: string; skills: string[]; verified?: boolean; className?: string }) {
  return (
    <div className={`bg-card border border-border/20 rounded-xl p-4 hover:border-primary/20 hover:shadow-lg transition-all duration-300 group ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate">{name}</p>
            {verified && <CheckCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{role}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span key={s} className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full border border-border/10">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, gradient }: { icon: any; value: string; label: string; gradient: string }) {
  return (
    <div className="group relative">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
      <div className="relative bg-card border border-border/20 rounded-2xl p-6 text-center hover:border-border/40 transition-all duration-300">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} p-0.5 mx-auto mb-4`}>
          <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ModuleCard({ icon: Icon, title, desc, gradient }: { icon: any; title: string; desc: string; gradient: string }) {
  return (
    <div className="group bg-card border border-border/20 rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, role, quote, avatar }: { name: string; role: string; quote: string; avatar?: string }) {
  return (
    <div className="bg-card border border-border/20 rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      <Quote className="w-8 h-8 text-primary/20 mb-3" />
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary/60 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function CountryHomePage({ country, highlights, testimonial }: Props) {
  const t = testimonial || { name: 'Business Owner', role: `CEO, ${country.name}`, quote: 'HEYLA OS transformed how we manage our team in {country}.' };
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeroVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { ref: trustRef, visible: trustVisible } = useVisibility();
  const { ref: modulesRef, visible: modulesVisible } = useVisibility();
  const { ref: networkRef, visible: networkVisible } = useVisibility();
  const { ref: metricsRef, visible: metricsVisible } = useVisibility();
  const { ref: stepsRef, visible: stepsVisible } = useVisibility();
  const { ref: testimonialsRef, visible: testimonialsVisible } = useVisibility();
  const { ref: ctaRef, visible: ctaVisible } = useVisibility();
  const { ref: mapRef, visible: mapVisible } = useVisibility();
  const { ref: contactRef, visible: contactVisible } = useVisibility();

  const isKE = country.code === 'ke';

  const networkSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'UI/UX', 'DevOps', 'Go', 'GraphQL', 'Kubernetes', 'PostgreSQL'];
  const networkUsers = [
    { name: 'James Mwangi', role: 'Software Engineer', skills: ['React', 'TypeScript', 'Node.js'], verified: true },
    { name: 'Sarah Wanjiku', role: 'UI/UX Designer', skills: ['Figma', 'UI Design', 'Prototyping'], verified: true },
    { name: 'Peter Kamau', role: 'Data Analyst', skills: ['Python', 'SQL', 'Power BI'], verified: false },
    { name: 'Grace Akinyi', role: 'Project Manager', skills: ['Agile', 'Scrum', 'JIRA'], verified: true },
  ];
  const platformModules = [
    { icon: Briefcase, title: 'Jobs & Recruitment', desc: isKE ? 'Post jobs, browse candidates, and hire skilled professionals across Kenya.' : `Post jobs, browse candidates, and hire skilled professionals across ${country.name}.`, gradient: 'from-primary to-orange-500' },
    { icon: Users, title: 'Professional Networking', desc: 'Connect with verified professionals, grow your network, and discover opportunities.', gradient: 'from-secondary to-blue-500' },
    { icon: Star, title: 'Skills Marketplace', desc: 'List your services, find freelance work, and collaborate on projects.', gradient: 'from-amber-500 to-yellow-500' },
    { icon: Layers, title: 'ERP & Business Tools', desc: 'HR, payroll, CRM, accounting, inventory — manage your entire business.', gradient: 'from-violet-500 to-purple-500' },
    { icon: BookOpen, title: 'Training & Certification', desc: isKE ? 'NITA-certified courses, TVET programs, and Ajira Digital training.' : 'Industry-certified courses, professional development, and skills training.', gradient: 'from-emerald-500 to-teal-500' },
    { icon: BarChart3, title: 'Workforce Management', desc: 'Track attendance, performance, leave, and team productivity.', gradient: 'from-cyan-500 to-blue-500' },
    { icon: Shield, title: 'Compliance & Labour Resources', desc: isKE ? 'KRA, NSSF, NHIF, WIBA compliance and labour law resources.' : 'Local compliance, tax, and labour law resources for your region.', gradient: 'from-rose-500 to-pink-500' },
    { icon: Target, title: 'Talent Discovery', desc: 'AI-powered matching between employers and verified skilled professionals.', gradient: 'from-indigo-500 to-violet-500' },
  ];
  const metrics = [
    { icon: Users, value: '50,000+', label: isKE ? 'Kenyan Professionals' : `${country.name} Professionals`, gradient: 'from-primary to-orange-500' },
    { icon: Building2, value: '2,500+', label: 'Employers & SMEs', gradient: 'from-secondary to-blue-500' },
    { icon: GraduationCap, value: '120+', label: isKE ? 'TVET Institutions' : 'Training Institutions', gradient: 'from-emerald-500 to-teal-500' },
    { icon: BookOpen, value: '800+', label: isKE ? 'Ajira & NITA Programs' : 'Training Programs', gradient: 'from-amber-500 to-yellow-500' },
    { icon: Briefcase, value: '15,000+', label: 'Jobs Posted', gradient: 'from-violet-500 to-purple-500' },
  ];
  const steps = [
    { icon: UserCheck, title: 'Create Profile', desc: 'Build a professional profile showcasing your skills, experience, certifications, and portfolio.', gradient: 'from-primary to-orange-500' },
    { icon: Award, title: 'Show Skills', desc: 'List your competencies, get endorsed by peers, and earn verified skill badges.', gradient: 'from-secondary to-blue-500' },
    { icon: Handshake, title: 'Connect', desc: 'Network with employers, institutions, and fellow professionals in your industry.', gradient: 'from-emerald-500 to-teal-500' },
    { icon: Trophy, title: 'Get Opportunities', desc: 'Discover jobs, projects, training programs, and career advancement opportunities.', gradient: 'from-amber-500 to-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar countryCode={country.code} />

      {/* ===== 1. HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-secondary/5 via-primary/5 to-secondary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left max-w-xl">
              <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out' }}>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-6 border border-primary/10">
                  <Sparkles className="w-4 h-4" /> {isKE ? `Built for ${country.name}` : `Trusted in ${country.name}`}
                </div>
              </div>
              <h1 style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.1s' }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
                One Platform.<br />
                <span className="text-gradient-orange">Unlimited Opportunities.</span>
              </h1>
              <p style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.2s' }}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                {isKE
                  ? 'Connect skilled professionals, businesses, employers, institutions, and opportunities across Kenya.'
                  : `Connect skilled professionals, businesses, employers, institutions, and opportunities across ${country.name}.`}
              </p>
              <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.3s' }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => navigate({ to: '/register' })}
                  className="group relative inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-primary/90 transition-all duration-200 glow-orange overflow-hidden">
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
                <button onClick={() => navigate({ to: isKE ? '/register/company' : '/register' })}
                  className="inline-flex items-center gap-2 border border-border/30 text-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-white/5 hover:border-border/50 transition-all duration-200">
                  <Network className="w-4 h-4" /> Explore Network
                </button>
              </div>
            </div>
            <div className="flex-1 w-full" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateX(0)' : 'translateX(40px)', transition: 'all 0.8s ease-out 0.3s' }}>
              <HeroDashboard />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ===== 2. TRUST SECTION ===== */}
      <section ref={trustRef} className="px-4 sm:px-8 lg:px-16 py-16 border-t border-border/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-8 font-semibold" style={{ opacity: trustVisible ? 1 : 0, transition: 'all 0.5s ease-out' }}>
            Trusted by leading institutions across {country.name}
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6" style={{ opacity: trustVisible ? 1 : 0, transform: trustVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.5s ease-out 0.1s' }}>
            {[
              { icon: GraduationCap, label: 'Universities' },
              { icon: Building2, label: isKE ? 'TVET Institutions' : 'Institutes' },
              { icon: Shield, label: isKE ? 'NITA' : 'Certifiers' },
              { icon: Globe2, label: isKE ? 'Ajira Digital' : 'Digital Skills' },
              { icon: Briefcase, label: 'Employers' },
              { icon: Star, label: 'SMEs' },
              { icon: Handshake, label: isKE ? 'Government' : 'Partners' },
            ].map((partner) => (
              <div key={partner.label} className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl bg-card border border-border/20 flex items-center justify-center">
                  <partner.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{partner.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. PLATFORM MODULES ===== */}
      <section ref={modulesRef} className="px-4 sm:px-8 lg:px-16 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader label="Platform Modules" title="Everything You Need in One Platform" description={`From job posting to professional networking, business management to skills certification — HEYLAOS unifies everything for ${country.name}'s workforce ecosystem.`} visible={modulesVisible} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ opacity: modulesVisible ? 1 : 0, transform: modulesVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.1s' }}>
            {platformModules.map((mod) => (
              <ModuleCard key={mod.title} {...mod} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. PROFESSIONAL NETWORK PREVIEW ===== */}
      <section ref={networkRef} className="px-4 sm:px-8 lg:px-16 py-20 bg-muted/5 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader label="Professional Network" title={isKE ? "Kenya's Premier Professional Network" : `${country.name}'s Premier Professional Network`} description="LinkedIn-style profiles with skill endorsements, portfolio showcases, certifications, and a real-time activity feed." visible={networkVisible} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10" style={{ opacity: networkVisible ? 1 : 0, transform: networkVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.1s' }}>
            <div className="space-y-4">
              {networkUsers.map((u) => (
                <ProfileCard key={u.name} {...u} />
              ))}
            </div>
            <div className="bg-card border border-border/20 rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Activity Feed</span>
                </div>
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
              <div className="space-y-4">
                {[
                  { user: 'Sarah Wanjiku', action: 'completed a certification in', target: 'Advanced UI/UX Design', time: '2m ago', type: 'cert' },
                  { user: 'Peter Kamau', action: 'posted a new project:', target: 'Data Analytics Dashboard', time: '15m ago', type: 'project' },
                  { user: 'Grace Akinyi', action: 'endorsed James Mwangi for', target: 'Project Management', time: '1h ago', type: 'endorse' },
                  { user: 'HEYLAOS', action: 'matched you with', target: '3 new job opportunities', time: '2h ago', type: 'match' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-border/10 last:border-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      activity.type === 'cert' ? 'bg-emerald-500/80' :
                      activity.type === 'project' ? 'bg-secondary/80' :
                      activity.type === 'endorse' ? 'bg-amber-500/80' :
                      'bg-primary/80'
                    }`}>
                      {activity.user[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs">
                        <span className="font-semibold">{activity.user}</span>
                        <span className="text-muted-foreground"> {activity.action} </span>
                        <span className="font-medium text-primary">{activity.target}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center">
            <button onClick={() => navigate({ to: '/register' })}
              className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary/90 transition-all duration-200 glow-blue">
              Join the Network <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== 5. WHY HEYLAOS / METRICS ===== */}
      <section ref={metricsRef} className="px-4 sm:px-8 lg:px-16 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-secondary/5 via-primary/5 to-secondary/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader label="Why HEYLAOS" title="Trusted by Thousands" description={`Join the fastest growing professional ecosystem in ${country.name}.`} visible={metricsVisible} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" style={{ opacity: metricsVisible ? 1 : 0, transform: metricsVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.1s' }}>
            {metrics.map((m) => (
              <StatCard key={m.label} {...m} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. HOW IT WORKS ===== */}
      <section ref={stepsRef} className="px-4 sm:px-8 lg:px-16 py-20 bg-muted/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeader label="How It Works" title="Get Started in 4 Simple Steps" description="Join thousands of professionals building their careers on HEYLAOS." visible={stepsVisible} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ opacity: stepsVisible ? 1 : 0, transform: stepsVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.1s' }}>
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="bg-card border border-border/20 rounded-2xl p-6 text-center hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
                  <div className="relative mb-5 inline-block">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} p-0.5 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <div className="w-full h-full rounded-[12px] bg-card flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-primary/30">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-base font-bold mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/3 -right-3 z-10">
                    <ChevronRight className="w-5 h-5 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. TESTIMONIALS ===== */}
      <section ref={testimonialsRef} className="px-4 sm:px-8 lg:px-16 py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Testimonials" title="What Our Users Say" description="Hear from professionals and businesses using HEYLAOS." visible={testimonialsVisible} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ opacity: testimonialsVisible ? 1 : 0, transform: testimonialsVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.1s' }}>
            <TestimonialCard
              name={t.name}
              role={t.role}
              quote={t.quote}
            />
            <TestimonialCard
              name={isKE ? 'Peter Ochieng' : 'Alex Johnson'}
              role={isKE ? 'CTO, Mombasa Tech Hub' : `CTO, ${country.name}`}
              quote={isKE ? 'HEYLAOS completely transformed our hiring process. We found our top three engineers through the platform in just two weeks.' : 'HEYLAOS transformed our hiring process. We found top talent through the platform in record time.'}
            />
            <TestimonialCard
              name={isKE ? 'Dr. Faith Nyambura' : 'Dr. Maria Santos'}
              role={isKE ? 'Dean, Nairobi TVET Institute' : `Director, ${country.name} Institute`}
              quote={isKE ? 'The partnership with HEYLAOS has helped our graduates find meaningful employment. The skills verification is a game-changer for TVET.' : 'The partnership with HEYLAOS has helped our graduates find meaningful employment opportunities.'}
            />
          </div>
        </div>
      </section>

      {/* ===== 8. DUAL CTA ===== */}
      <Reveal animation="slide-up">
        <section className="px-4 sm:px-8 lg:px-16 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="group relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center md:text-left hover:border-primary/40 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{isKE ? 'Looking for Work in Kenya?' : `Looking for Work in ${country.name}?`}</h3>
                  <p className="text-sm text-muted-foreground mb-5">Browse open positions from top companies. Create your profile, match your skills, and land your next role.</p>
                  <button onClick={() => navigate({ to: '/careers' })} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all duration-200">
                    <Search className="w-4 h-4" /> Browse Jobs
                  </button>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 rounded-2xl p-8 text-center md:text-right hover:border-secondary/40 hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 mx-auto md:mx-4 md:ml-auto group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{isKE ? 'Hiring in Kenya?' : `Hiring in ${country.name}?`}</h3>
                  <p className="text-sm text-muted-foreground mb-5">Post jobs, review applicants, and find the perfect candidate. HEYLAOS gives you the tools to recruit and manage your workforce.</p>
                  <button onClick={() => navigate({ to: '/register/company' })} className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-all duration-200">
                    <Star className="w-4 h-4" /> Post a Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ===== WORLD MAP ===== */}
      <section ref={mapRef} className="px-4 sm:px-8 lg:px-16 py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Global Reach" title="Serving Businesses Across the World" description={`HEYLAOS is live in ${countries.length} countries with local features built in.`} visible={mapVisible} />
          <Reveal animation="scale-bounce" delay={0.2}>
            <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300">
              <WorldMap className="max-w-4xl mx-auto" highlightColor="#0F6FFF" />
            </div>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-8" style={{ opacity: mapVisible ? 1 : 0, transition: 'all 0.5s ease-out 0.3s' }}>
            {countries.map((c) => (
              <div key={c.code} className="flex items-center gap-2 text-sm hover:text-primary transition-colors cursor-default">
                <span className="text-base">{c.flag}</span>
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">({c.code.toUpperCase()})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HIGHLIGHTS ===== */}
      {highlights.length > 0 && (
        <section className="px-4 sm:px-8 lg:px-16 py-16 bg-muted/5 border-y border-border/5">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title={`Why ${country.name} Chooses HEYLAOS`} visible={true} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 bg-card border border-border/20 rounded-xl p-4 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{h}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== PAYMENT GATEWAY ===== */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Secure Payments" title="Payment Gateway Integration" description="HEYLAOS supports secure online payments through mobile money, card payments, bank transfers, and global payment gateway integrations." visible={true} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Smartphone, title: 'M-Pesa STK Push', desc: 'Mobile money via M-Pesa, MTN MoMo, Airtel Money', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { icon: CreditCard, title: 'Visa / Mastercard', desc: 'Card payments with built-in fraud protection', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { icon: Landmark, title: 'Bank Transfer', desc: 'Direct transfers with automated reconciliation', color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
              { icon: Receipt, title: 'Invoice Payments', desc: 'Send invoices and accept payments in real-time', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            ].map((gw) => (
              <div key={gw.title} className={`group bg-card border ${gw.border} rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-center`}>
                <div className={`w-12 h-12 rounded-xl ${gw.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <gw.icon className={`w-5 h-5 ${gw.color}`} />
                </div>
                <h4 className="font-semibold text-sm mb-1">{gw.title}</h4>
                <p className="text-xs text-muted-foreground">{gw.desc}</p>
              </div>
            ))}
          </div>
          <Reveal animation="slide-up" delay={0.2}>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 text-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Administrator Notice</p>
                  <p className="text-muted-foreground">Bank account linking should be handled through the selected payment gateway provider's merchant onboarding process. Sensitive credentials must not be exposed publicly.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== ADVERTISE WITH US ===== */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 bg-muted/5 border-y border-border/5 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader label="Advertising" title="Advertise With Us" description="Reach thousands of businesses, skilled workers, and decision-makers across HEYLAOS." visible={true} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Megaphone, title: 'Banner Advertising', desc: 'Premium banner placements across the HEYLAOS platform.' },
              { icon: Building2, title: 'Sponsored Profiles', desc: 'Feature your company as a top employer.' },
              { icon: Award, title: 'TVET Promotions', desc: 'Promote courses and certification programs.' },
              { icon: Users, title: 'Recruitment Campaigns', desc: isKE ? 'Reach skilled workers by industry and county.' : 'Reach skilled workers by industry and location.' },
              { icon: Globe2, title: 'Awareness Campaigns', desc: 'Promote programs and public initiatives.' },
              { icon: Star, title: 'Featured Listings', desc: 'Premium placement badges for top listings.' },
            ].map((ad) => (
              <div key={ad.title} className="group flex items-start gap-3 bg-card border border-border/20 rounded-xl p-4 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-all duration-300">
                  <ad.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{ad.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ad.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate({ to: '/register' })} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all duration-200">
              <Megaphone className="w-4 h-4" /> Run Ads
            </button>
            <button onClick={() => navigate({ to: '/register/company' })} className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200">
              <Handshake className="w-4 h-4" /> Become a Partner
            </button>
            <a href="mailto:advertising@heylaos.com" className="inline-flex items-center gap-2 border border-border/30 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/5 hover:border-border/50 transition-all duration-200">
              <Mail className="w-4 h-4" /> Contact Advertising Team
            </a>
          </div>
        </div>
      </section>

      {/* ===== LABOUR & LEGAL RESOURCES ===== */}
      <section className="px-4 sm:px-8 lg:px-16 py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Legal Compliance" title="Labour & Legal Resources" description={isKE ? 'Access key Kenyan labour laws and regulations to ensure compliance.' : 'Access essential labour laws, regulations, and compliance resources.'} visible={true} />
          <div className="max-w-2xl mx-auto space-y-3">
            {(isKE ? [
              { title: 'Work Injury Benefits Act, 2007 (PDF)', url: 'https://www.labour.go.ke/sites/default/files/law/THE_WORK_INJURY_BENEFITS_ACT_2007.pdf' },
              { title: 'Kenya Law – Work Injury Benefits Act', url: 'https://new.kenyalaw.org/akn/ke/act/2007/15/eng@2022-12-31' },
              { title: 'Kenya Law – Occupational Safety and Health Act', url: 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2024-04-26' },
            ] : [
              { title: 'ILO – International Labour Standards', url: 'https://www.ilo.org/global/standards/lang--en/index.htm' },
              { title: 'UN Guiding Principles on Business & Human Rights', url: 'https://www.ohchr.org/en/publications/reference-publications/guiding-principles-business-and-human-rights' },
              { title: 'ISO 45001 – Occupational Health & Safety', url: 'https://www.iso.org/iso-45001-occupational-health-and-safety.html' },
            ]).map((res) => (
              <a key={res.url} href={res.url} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-card border border-border/20 rounded-xl p-4 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <span className="flex-1 text-sm font-medium group-hover:text-primary transition-colors">{res.title}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT & LOCATION ===== */}
      <section ref={contactRef} className="px-4 sm:px-8 lg:px-16 py-20 bg-muted/5 border-y border-border/5 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SectionHeader label="Visit Us" title="Contact & Location" description={isKE ? 'Visit our headquarters in Nairobi or get in touch with our global team.' : `HEYLAOS is headquartered in Nairobi, Kenya, serving ${country.name} and the world.`} visible={contactVisible} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center" style={{ opacity: contactVisible ? 1 : 0, transform: contactVisible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease-out 0.1s' }}>
            <div className="space-y-5">
              <div className="bg-card border border-border/20 rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">HEYLA Communications</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Kenya Bankers Centre<br />3rd Ngong Avenue<br />Nairobi, Kenya
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Globe2 className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Global operations serving {countries.length} countries worldwide</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <a href="https://maps.google.com/?q=Kenya+Bankers+Centre+3rd+Ngong+Avenue+Nairobi" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                        <MapPin className="w-3 h-3" /> Google Maps
                      </a>
                      <a href="https://www.google.com/maps/search/?api=1&query=Kenya+Bankers+Centre+3rd+Ngong+Avenue+Nairobi" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary text-xs px-3 py-1.5 rounded-full hover:bg-secondary/20 transition-colors">
                        <ExternalLink className="w-3 h-3" /> Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="https://www.google.com/maps/search/?api=1&query=Kenya+Bankers+Centre+3rd+Ngong+Avenue+Nairobi" target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 bg-card border border-border/20 rounded-xl p-4 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Get Directions</p>
                    <p className="text-xs text-muted-foreground">Open in Google Maps</p>
                  </div>
                </a>
                <a href="tel:+254708066022"
                  className="group flex items-center gap-3 bg-card border border-border/20 rounded-xl p-4 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Safaricom Line</p>
                    <p className="text-xs text-muted-foreground">0708 066 022</p>
                  </div>
                </a>
                <a href="mailto:info@heylaos.com"
                  className="group sm:col-span-2 flex items-center gap-3 bg-card border border-border/20 rounded-xl p-4 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Email Us</p>
                    <p className="text-xs text-muted-foreground">info@heylaos.com</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="bg-card border border-border/20 rounded-2xl overflow-hidden h-64 sm:h-80 hover:shadow-lg transition-shadow duration-300">
              <iframe
                title="HEYLA Communications Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=36.8085%2C-1.2975%2C36.8285%2C-1.2835&layer=mapnik&marker=-1.2905%2C36.8185"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                className="rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section ref={ctaRef} className="relative px-4 sm:px-8 lg:px-16 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        <Reveal animation="scale-bounce">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
              {isKE ? "Join Kenya's Fastest Growing" : `Join ${country.name}'s Fastest Growing`}<br />
              <span className="text-gradient-orange">Skilled Workforce Platform</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {isKE
                ? 'Connect with employers, showcase your skills, and find opportunities that match your talent.'
                : `Connect with employers, showcase your skills, and find opportunities across ${country.name}.`}
            </p>
            <button onClick={() => navigate({ to: '/register' })}
              className="group relative inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-xl text-lg font-bold hover:bg-primary/90 transition-all duration-200 glow-orange overflow-hidden">
              <span className="relative z-10">Create Free Account</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </Reveal>
      </section>

      <SiteFooter countryName={country.name} />
    </div>
  );
}
