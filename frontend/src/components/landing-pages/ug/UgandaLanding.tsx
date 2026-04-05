import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function UgandaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('UG')}
      highlights={[
        'URA TIN and NIN compliance fields',
        'UGX invoicing with EFRIS integration readiness',
        'Mobile money (MTN MoMo, Airtel Money) tracking',
        'Multi-district management across Kampala, Jinja, Gulu & more',
        'NSSF Uganda payroll deductions',
        'Supports Uganda Employment Act compliance',
      ]}
      industries={['Agriculture & Coffee', 'Tourism', 'Fintech', 'Real Estate', 'Healthcare', 'Education', 'Manufacturing', 'Retail']}
      testimonial={{ name: 'Grace Nambi', role: 'CEO, Pearl Hub, Kampala', quote: 'HEYLA OS helped us scale from 10 to 80 employees while staying fully URA-compliant.' }}
    />
  );
}
