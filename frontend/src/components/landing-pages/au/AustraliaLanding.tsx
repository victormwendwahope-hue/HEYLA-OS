import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function AustraliaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('AU')}
      highlights={[
        'TFN and ABN compliance fields',
        'AUD invoicing with BAS and GST calculations',
        'BPAY and bank transfer tracking',
        'Multi-state across NSW, VIC, QLD, WA & more',
        'Superannuation and PAYG payroll compliance',
        'Fair Work Act and NES compliance tracking',
      ]}
      industries={['Mining', 'Agriculture', 'Tourism', 'Technology', 'Finance', 'Real Estate', 'Healthcare', 'Retail']}
      testimonial={{ name: 'Sarah Mitchell', role: 'Director, Sydney Tech Group Pty Ltd', quote: 'The super compliance and STP reporting in HEYLA OS makes running payroll a breeze.' }}
    />
  );
}
