import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function JapanLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('JP')}
      highlights={[
        'My Number compliance for tax and social insurance',
        'JPY invoicing with qualified invoice system (インボイス制度) support',
        'Bank transfer and PayPay tracking',
        'Multi-prefecture operations support',
        'Shakai hoken and kosei nenkin payroll deductions',
        'Japanese labor standards act compliance',
      ]}
      industries={['Automotive', 'Electronics', 'Gaming', 'Manufacturing', 'Finance', 'Retail', 'Tourism', 'Healthcare']}
      testimonial={{ name: 'Tanaka Yuki', role: 'CEO, Tokyo Solutions K.K.', quote: 'HEYLA OS のインボイス制度対応は、私たちの事業にとって不可欠です。' }}
    />
  );
}
