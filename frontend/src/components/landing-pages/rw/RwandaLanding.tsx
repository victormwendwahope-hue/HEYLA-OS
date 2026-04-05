import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function RwandaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('RW')}
      highlights={[
        'RRA TIN and NID compliance fields',
        'RWF invoicing with EBM integration readiness',
        'MTN MoMo Rwanda payment tracking',
        'Kigali-focused with national reach',
        'RSSB payroll deductions built in',
        'Supports Rwanda labor law compliance',
      ]}
      industries={['Tourism & Hospitality', 'Technology & Innovation', 'Agriculture', 'Real Estate', 'Finance', 'Healthcare', 'Education', 'Mining']}
      testimonial={{ name: 'Jean-Paul Habimana', role: 'Founder, Kigali Tech, Kigali', quote: 'Rwanda is the hub of African innovation and HEYLA OS fits perfectly into our vision.' }}
    />
  );
}
