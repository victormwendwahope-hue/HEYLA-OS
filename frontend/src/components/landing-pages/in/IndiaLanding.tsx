import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function IndiaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('IN')}
      highlights={[
        'PAN, Aadhaar, and UAN compliance fields',
        'INR invoicing with GST calculations built in',
        'UPI, NEFT, and RTGS payment tracking',
        'Multi-state operations with state GST support',
        'PF, ESI, and professional tax payroll deductions',
        'Shops & Establishment Act compliance',
      ]}
      industries={['IT & Software', 'E-commerce', 'Manufacturing', 'Pharma', 'Agriculture', 'Textiles', 'Finance', 'Real Estate']}
      testimonial={{ name: 'Priya Sharma', role: 'CEO, Mumbai Tech Solutions', quote: 'The GST compliance and multi-state payroll in HEYLA OS saved us from hiring an extra accountant.' }}
    />
  );
}
