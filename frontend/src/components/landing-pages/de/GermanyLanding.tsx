import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function GermanyLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('DE')}
      highlights={[
        'Steuer-ID and Sozialversicherungsnummer compliance',
        'EUR invoicing with GoBD-compliant record keeping',
        'SEPA payment tracking and bank reconciliation',
        'Multi-state (Bundesland) operations support',
        'Lohnsteuer and Sozialversicherung payroll support',
        'DSGVO (GDPR) compliance built in',
      ]}
      industries={['Automotive', 'Engineering', 'Manufacturing', 'Technology', 'Pharma', 'Finance', 'Retail', 'Logistics']}
      testimonial={{ name: 'Markus Weber', role: 'Geschäftsführer, Berlin Digital GmbH', quote: 'HEYLA OS versteht die Komplexität des deutschen Arbeitsrechts perfekt.' }}
    />
  );
}
