import { CountryConfig } from '@/types';
import { useNavigate } from '@tanstack/react-router';
import { Calendar, ArrowRight, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SiteFooter } from '@/components/landing-pages/SiteFooter';

interface Props { country: CountryConfig }

const ARTICLES: { title: string; excerpt: string; date: string; readTime: string; slug: string }[] = [
  { title: 'How to Manage Payroll in {country} — A Complete Guide', excerpt: 'Learn everything about payroll management including tax calculations, deductions, and compliance requirements specific to your region.', date: 'Jul 15, 2026', readTime: '8 min read', slug: 'payroll-guide' },
  { title: 'Top HR Challenges in {country} and How to Solve Them', excerpt: 'From employee retention to compliance, discover the most common HR challenges businesses face and practical solutions.', date: 'Jul 10, 2026', readTime: '6 min read', slug: 'hr-challenges' },
  { title: 'Why {country} SMEs Need an All-in-One Business Platform', excerpt: 'Juggling multiple tools? See how an integrated platform saves time, reduces errors, and helps you scale.', date: 'Jul 5, 2026', readTime: '5 min read', slug: 'all-in-one-platform' },
  { title: 'Understanding {country} Tax Compliance for Small Businesses', excerpt: 'A breakdown of {taxFields} and how to stay compliant without the headache.', date: 'Jun 28, 2026', readTime: '10 min read', slug: 'tax-compliance' },
  { title: 'How to Attract Top Talent in {country}', excerpt: 'Build a strong employer brand and leverage HEYLA\'s recruitment tools to find the best candidates.', date: 'Jun 20, 2026', readTime: '7 min read', slug: 'attract-talent' },
];

export function CountryBlogPage({ country }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const articles = ARTICLES.map(a => ({
    ...a,
    title: a.title.replace(/\{country\}/g, country.name),
    excerpt: a.excerpt.replace(/\{country\}/g, country.name).replace('{taxFields}', country.taxFields.join(', ')),
  })).filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar countryCode={country.code} />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">HEYLA Blog</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Insights, guides, and updates for businesses in {country.name}.</p>
        </div>

        <div className="max-w-md mx-auto mb-10">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div className="space-y-6">
          {articles.map((a) => (
            <article key={a.slug} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-semibold text-lg mb-1">{a.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{a.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {a.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.readTime}</span>
                  </div>
                </div>
                <button onClick={() => navigate({ to: `/country/${country.code}/blog/${a.slug}` })} className="shrink-0 text-sm text-primary hover:underline flex items-center gap-1">
                  Read <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </article>
          ))}
          {articles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No articles found.</div>
          )}
        </div>
      </div>
      <SiteFooter countryName={country.name} />
    </div>
  );
}
