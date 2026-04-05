import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function USALanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('US')}
      highlights={[
        'SSN and EIN compliance fields for tax reporting',
        'USD invoicing with multi-state tax calculations',
        'ACH, wire transfer, and card payment tracking',
        'Multi-state operations across all 50 states',
        'W-2 and 1099 payroll support',
        'FLSA and ADA compliance tracking',
      ]}
      industries={['Technology', 'Healthcare', 'Finance', 'Real Estate', 'E-commerce', 'Manufacturing', 'Professional Services', 'Retail']}
      testimonial={{ name: 'Sarah Johnson', role: 'COO, TechStart Inc, San Francisco', quote: 'HEYLA OS handles our multi-state payroll complexities like no other platform.' }}
    />
  );
}
