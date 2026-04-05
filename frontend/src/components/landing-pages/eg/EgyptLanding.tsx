import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function EgyptLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('EG')}
      highlights={[
        'Tax ID and National ID compliance fields',
        'EGP invoicing with e-invoice (ETA) readiness',
        'Fawry and InstaPay payment tracking',
        'Multi-governorate management across Cairo, Alexandria, Giza & more',
        'Social insurance payroll deductions',
        'Supports Egyptian labor law compliance',
      ]}
      industries={['Tourism & Antiquities', 'Real Estate', 'Textiles', 'Petrochemicals', 'Agriculture', 'IT & Outsourcing', 'Food & Beverage', 'Banking']}
      testimonial={{ name: 'Ahmed Hassan', role: 'CEO, Nile Digital, Cairo', quote: 'The ETA e-invoicing readiness in HEYLA OS puts us ahead of every competitor in Egypt.' }}
    />
  );
}
