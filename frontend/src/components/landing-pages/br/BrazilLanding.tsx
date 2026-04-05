import { CountryLandingTemplate } from '../CountryLandingTemplate';
import { getCountry } from '@/utils/countries';

export default function BrazilLanding() {
  return (
    <CountryLandingTemplate
      country={getCountry('BR')}
      highlights={[
        'CPF and CNPJ compliance fields',
        'BRL invoicing with NFe/NFSe e-invoice support',
        'PIX, boleto, and TED payment tracking',
        'Multi-state operations with ICMS and ISS support',
        'CLT and eSocial payroll compliance',
        'LGPD (data protection) compliance built in',
      ]}
      industries={['Agriculture & Agribusiness', 'Fintech', 'E-commerce', 'Mining', 'Manufacturing', 'Tourism', 'Retail', 'Technology']}
      testimonial={{ name: 'Carlos Silva', role: 'CEO, São Paulo Digital Ltda', quote: 'O HEYLA OS simplifica o eSocial e a folha de pagamento como nenhuma outra plataforma.' }}
    />
  );
}
