import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function SouthAfricaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('ZA')}
      highlights={[
        'SARS-compliant tax number and ID number fields',
        'ZAR invoicing with VAT calculations',
        'BEE compliance tracking support',
        'Multi-province management across Gauteng, Western Cape & more',
        'UIF and SDL payroll deductions built in',
        'Load shedding-ready offline data caching',
      ]}
      industries={['Mining', 'Finance & Banking', 'Agriculture', 'Tourism', 'Retail', 'Technology', 'Healthcare', 'Manufacturing']}
      testimonial={{ name: 'Thabo Nkosi', role: 'MD, Cape Innovations, Johannesburg', quote: 'The BEE tracking and SARS compliance features make HEYLA OS indispensable for our business.' }}
    />
  );
}
