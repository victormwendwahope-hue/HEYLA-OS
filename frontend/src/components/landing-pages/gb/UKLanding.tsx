import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function UKLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('GB')}
      highlights={[
        'NI Number and UTR compliance fields',
        'GBP invoicing with MTD VAT readiness',
        'BACS and Faster Payments tracking',
        'Multi-region across England, Scotland, Wales & N. Ireland',
        'PAYE, NIC, and pension auto-enrolment support',
        'HMRC-aligned reporting capabilities',
      ]}
      industries={['Finance & Banking', 'Technology', 'Healthcare (NHS)', 'Real Estate', 'Retail', 'Manufacturing', 'Professional Services', 'Creative Industries']}
      testimonial={{ name: 'James Clarke', role: 'Director, London Scale Ltd, London', quote: 'The MTD VAT readiness alone makes HEYLA OS worth it for any UK SME.' }}
    />
  );
}
