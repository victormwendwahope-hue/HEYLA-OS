import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function ChinaLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('CN')}
      highlights={[
        'Tax ID and ID Number compliance fields',
        'CNY invoicing with fapiao integration readiness',
        'WeChat Pay and Alipay payment tracking',
        'Multi-province operations support',
        'Five insurances and housing fund payroll deductions',
        'Chinese labor contract law compliance',
      ]}
      industries={['Manufacturing', 'Technology', 'E-commerce', 'Real Estate', 'Finance', 'Agriculture', 'Logistics', 'Healthcare']}
      testimonial={{ name: 'Li Wei', role: 'GM, Shenzhen Innovation Co., Ltd', quote: 'HEYLA OS handles our complex payroll with five insurances and housing fund perfectly.' }}
    />
  );
}
