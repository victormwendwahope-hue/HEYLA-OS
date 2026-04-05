import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function EthiopiaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('ET')}
      highlights={[
        'ERCA TIN compliance fields',
        'ETB invoicing and receipt management',
        'Telebirr payment tracking support',
        'Multi-city across Addis Ababa, Dire Dawa, Hawassa & more',
        'Pension and income tax payroll deductions',
        'Supports Ethiopian labor proclamation compliance',
      ]}
      industries={['Agriculture & Coffee', 'Manufacturing', 'Construction', 'Tourism', 'Textiles', 'Telecom', 'Banking', 'Retail']}
      testimonial={{ name: 'Abebe Tekle', role: 'GM, Addis Commerce Group, Addis Ababa', quote: 'HEYLA OS streamlined our operations across three cities. The ETB accounting module is excellent.' }}
    />
  );
}
