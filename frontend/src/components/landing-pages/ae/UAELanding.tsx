import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function UAELanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('AE')}
      highlights={[
        'TRN and Emirates ID compliance fields',
        'AED invoicing with UAE VAT calculations',
        'WPS payroll compliance built in',
        'Multi-emirate management across Dubai, Abu Dhabi, Sharjah & more',
        'GDRFA and MOL integration readiness',
        'Free zone and mainland entity support',
      ]}
      industries={['Real Estate', 'Tourism & Hospitality', 'Finance', 'Oil & Gas', 'Logistics', 'Technology', 'Retail', 'Construction']}
      testimonial={{ name: 'Fatima Al-Rashid', role: 'Managing Partner, Dubai Ventures LLC', quote: 'WPS compliance and multi-emirate support make HEYLA OS the best choice for UAE businesses.' }}
    />
  );
}
