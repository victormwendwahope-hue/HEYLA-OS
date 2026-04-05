import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function KenyaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('KE')}
      highlights={[
        'M-Pesa integration ready for seamless mobile payments',
        'KRA PIN, NSSF, and NHIF compliance built in',
        'Multi-branch management for Nairobi, Mombasa, Kisumu & more',
        'Payroll with PAYE, HELB, and housing levy deductions',
        'Supports Kenyan labor laws and leave policies',
        'SMS notifications via local providers',
      ]}
      industries={['Agriculture', 'Tourism & Hospitality', 'Retail & FMCG', 'Real Estate', 'Transport & Logistics', 'Healthcare', 'Education', 'Manufacturing']}
      testimonial={{ name: 'Wanjiku Mwangi', role: 'CEO, Safari Tech Solutions, Nairobi', quote: 'HEYLA OS transformed how we manage our 50-person team. The KRA integration alone saves us hours every month.' }}
    />
  );
}
