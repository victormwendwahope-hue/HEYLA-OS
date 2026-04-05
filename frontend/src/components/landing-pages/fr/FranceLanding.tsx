import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function FranceLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('FR')}
      highlights={[
        'NIF and Numéro de Sécurité Sociale compliance',
        'EUR invoicing with Factur-X e-invoicing readiness',
        'SEPA and carte bancaire payment tracking',
        'Multi-region operations across Île-de-France, PACA & more',
        'Cotisations sociales and prélèvement à la source support',
        'RGPD (GDPR) compliance built in',
      ]}
      industries={['Luxury & Fashion', 'Tourism', 'Agriculture & Wine', 'Technology', 'Aerospace', 'Pharma', 'Finance', 'Retail']}
      testimonial={{ name: 'Marie Dupont', role: 'DG, Paris Innovation SAS', quote: 'HEYLA OS gère nos obligations sociales françaises avec une précision remarquable.' }}
    />
  );
}
