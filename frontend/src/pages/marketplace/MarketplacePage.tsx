import { PageHeader, StatusBadge } from '@/components/shared/CommonUI';
import { formatCurrency } from '@/utils/countries';
import { Briefcase, MapPin, Clock, Star, Send } from 'lucide-react';

const jobs = [
  { id: '1', title: 'Full Stack Developer', company: 'Heyla Corp', location: 'Nairobi, Kenya', type: 'Full-time', salary: '180K - 250K KES', posted: '2 days ago', skills: ['React', 'Node.js', 'TypeScript'] },
  { id: '2', title: 'Sales Executive', company: 'TechVentures', location: 'Mombasa, Kenya', type: 'Full-time', salary: '100K - 150K KES', posted: '1 week ago', skills: ['B2B Sales', 'CRM', 'Negotiation'] },
  { id: '3', title: 'UI/UX Designer', company: 'DesignHub', location: 'Remote', type: 'Contract', salary: '120K - 180K KES', posted: '3 days ago', skills: ['Figma', 'User Research', 'Prototyping'] },
];

const freelancers = [
  { id: '1', name: 'Grace Wambui', title: 'Mobile Developer', rating: 4.9, rate: 5000, skills: ['Flutter', 'React Native'], jobs: 34 },
  { id: '2', name: 'Kevin Odhiambo', title: 'Data Analyst', rating: 4.7, rate: 4000, skills: ['Python', 'SQL', 'Tableau'], jobs: 28 },
  { id: '3', name: 'Fatuma Ali', title: 'Content Writer', rating: 4.8, rate: 2500, skills: ['SEO', 'Copywriting', 'Blogging'], jobs: 56 },
  { id: '4', name: 'Brian Kimani', title: 'DevOps Engineer', rating: 4.6, rate: 6000, skills: ['AWS', 'Docker', 'CI/CD'], jobs: 19 },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Marketplace" description="Find talent, post jobs, and connect with freelancers" />

      {/* Jobs */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Job Listings</h2>
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="glass rounded-xl p-5 hover:shadow-elevated transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.posted}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {job.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{job.salary}</p>
                  <StatusBadge status={job.type} variant="info" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Freelancers */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Top Freelancers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {freelancers.map((f) => (
            <div key={f.id} className="glass rounded-xl p-5 text-center hover:shadow-elevated transition-shadow">
              <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-lg font-bold mx-auto mb-3">
                {f.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-semibold">{f.name}</h3>
              <p className="text-xs text-muted-foreground">{f.title}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span className="text-sm font-medium">{f.rating}</span>
                <span className="text-xs text-muted-foreground">· {f.jobs} jobs</span>
              </div>
              <p className="text-sm font-semibold text-primary mt-2">{formatCurrency(f.rate)}/hr</p>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {f.skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs">{s}</span>
                ))}
              </div>
              <button className="w-full mt-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-accent transition-colors flex items-center justify-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Send Proposal
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
