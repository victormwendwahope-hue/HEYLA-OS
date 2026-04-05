import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function CanadaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('CA')}
      highlights={[
        'SIN and BN compliance fields',
        'CAD invoicing with GST/HST/PST calculations',
        'Interac e-Transfer and EFT payment tracking',
        'Multi-province across Ontario, BC, Alberta, Quebec & more',
        'CPP, EI, and provincial tax payroll deductions',
        'Canada Labour Code and ESA compliance',
      ]}
      industries={['Mining & Resources', 'Technology', 'Finance', 'Oil & Gas', 'Agriculture', 'Real Estate', 'Healthcare', 'Retail']}
      testimonial={{ name: 'Michael Chen', role: 'CEO, Toronto Innovations Inc.', quote: 'Managing our team across Ontario and BC with different tax rules is now effortless with HEYLA OS.' }}
    />
  );
}
