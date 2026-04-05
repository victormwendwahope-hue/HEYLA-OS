import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function GhanaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('GH')}
      highlights={[
        'GRA TIN and Ghana Card number compliance',
        'GHS invoicing with E-Levy awareness',
        'Mobile money (MoMo) payment tracking',
        'Multi-region support across Accra, Kumasi, Tamale & more',
        'SSNIT and tier pension payroll deductions',
        'Supports Ghana labor law requirements',
      ]}
      industries={['Cocoa & Agriculture', 'Mining', 'Fintech', 'Oil & Gas', 'Real Estate', 'Education', 'Retail', 'Construction']}
      testimonial={{ name: 'Ama Darko', role: 'COO, GoldCoast Digital, Accra', quote: 'HEYLA OS handles our Ghana Card compliance effortlessly while keeping our team productive.' }}
    />
  );
}
