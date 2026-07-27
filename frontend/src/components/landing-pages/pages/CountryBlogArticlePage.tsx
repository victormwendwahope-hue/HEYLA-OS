import { CountryConfig } from '@/types';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SiteFooter } from '@/components/landing-pages/SiteFooter';

interface Props { country: CountryConfig }

export function CountryBlogArticlePage({ country }: Props) {
  const navigate = useNavigate();
  const { slug } = useParams({ from: `/country/${country.code.toLowerCase()}/blog/$slug` });
  const article = getArticle(country, slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar countryCode={country.code} />
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <button onClick={() => navigate({ to: `/country/${country.code}/blog` })} className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </button>
        </div>
        <SiteFooter countryName={country.name} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar countryCode={country.code} />
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        <button onClick={() => navigate({ to: `/country/${country.code}/blog` })} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>
        <article>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {article.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {article.readTime}</span>
          </div>
          <div className="text-muted-foreground">
            <p className="text-base leading-relaxed mb-4">{article.excerpt}</p>
            <p className="text-base leading-relaxed mb-4">
              This is a comprehensive guide for businesses operating in {country.name}. HEYLAOS provides all the tools you need
              to manage your operations efficiently, from HR and payroll to CRM and inventory management.
            </p>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">Why This Matters for Your Business</h2>
            <p className="text-base leading-relaxed mb-4">
              Running a business in {country.name} comes with unique challenges — local tax regulations, labor laws,
              currency management, and industry-specific requirements. HEYLAOS is built specifically to address these
              challenges with pre-configured compliance, local currency support, and region-specific features.
            </p>
            <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">Getting Started with HEYLAOS</h2>
            <p className="text-base leading-relaxed mb-4">
              Ready to transform your business operations? HEYLAOS offers a free tier that supports up to 5 employees
              with access to all core modules. Sign up today and see why thousands of businesses across 20 countries
              trust HEYLAOS for their daily operations.
            </p>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <p className="text-sm text-muted-foreground">Was this article helpful?</p>
            <button onClick={() => navigate({ to: '/register' })} className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Start Free Trial
            </button>
          </div>
        </article>
      </div>
      <SiteFooter countryName={country.name} />
    </div>
  );
}

function getArticle(country: CountryConfig, slug: string) {
  const articles = [
    { title: 'How to Manage Payroll in {country} — A Complete Guide', excerpt: 'Learn everything about payroll management including tax calculations, deductions, and compliance requirements specific to your region.', date: 'Jul 15, 2026', readTime: '8 min read', slug: 'payroll-guide' },
    { title: 'Top HR Challenges in {country} and How to Solve Them', excerpt: 'From employee retention to compliance, discover the most common HR challenges businesses face and practical solutions.', date: 'Jul 10, 2026', readTime: '6 min read', slug: 'hr-challenges' },
    { title: 'Why {country} SMEs Need an All-in-One Business Platform', excerpt: 'Juggling multiple tools? See how an integrated platform saves time, reduces errors, and helps you scale.', date: 'Jul 5, 2026', readTime: '5 min read', slug: 'all-in-one-platform' },
    { title: 'Understanding {country} Tax Compliance for Small Businesses', excerpt: 'A breakdown of {taxFields} and how to stay compliant without the headache.', date: 'Jun 28, 2026', readTime: '10 min read', slug: 'tax-compliance' },
    { title: 'How to Attract Top Talent in {country}', excerpt: 'Build a strong employer brand and leverage HEYLA\'s recruitment tools to find the best candidates.', date: 'Jun 20, 2026', readTime: '7 min read', slug: 'attract-talent' },
  ];

  const found = articles.find(a => a.slug === slug);
  if (!found) return null;
  return {
    ...found,
    title: found.title.replace(/\{country\}/g, country.name),
    excerpt: found.excerpt.replace(/\{country\}/g, country.name).replace('{taxFields}', country.taxFields.join(', ')),
  };
}
