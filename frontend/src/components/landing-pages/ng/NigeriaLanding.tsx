import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function NigeriaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('NG')}
      highlights={[
        'Naira-first pricing and invoicing',
        'TIN, NIN, and BVN verification fields',
        'Multi-state operations across Lagos, Abuja, Kano & more',
        'Payroll with Nigerian tax tables and pension deductions',
        'Supports Nigerian labor act compliance',
        'Bank transfer and Paystack-ready payment tracking',
      ]}
      industries={['Oil & Gas', 'Fintech', 'Agriculture', 'E-commerce', 'Real Estate', 'Entertainment', 'Healthcare', 'Manufacturing']}
      testimonial={{ name: 'Chinedu Okafor', role: 'Founder, PayStack Commerce, Lagos', quote: 'Managing our distributed team across Lagos and Abuja is now seamless with HEYLA OS.' }}
    />
  );
}
