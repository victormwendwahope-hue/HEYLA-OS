import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function TanzaniaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('TZ')}
      highlights={[
        'TRA TIN and NIDA compliance fields',
        'TZS invoicing and EFD receipt support',
        'M-Pesa Tanzania payment tracking',
        'Multi-city management across Dar es Salaam, Dodoma, Arusha & more',
        'NSSF and WCF payroll deductions',
        'Swahili-friendly interface options',
      ]}
      industries={['Tourism & Safari', 'Mining', 'Agriculture', 'Telecommunications', 'Real Estate', 'Retail', 'Energy', 'Transport']}
      testimonial={{ name: 'Juma Bakari', role: 'Director, Kilimanjaro Ventures, Dar es Salaam', quote: 'With HEYLA OS, managing our tourism business across multiple regions is finally simple.' }}
    />
  );
}
