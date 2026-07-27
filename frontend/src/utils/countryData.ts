type CountryEntry = {
  highlights: string[];
  industries: string[];
  testimonial?: { name: string; role: string; quote: string };
};

const countryData: Record<string, CountryEntry> = {
  ke: {
    highlights: [
      'M-Pesa integration ready for seamless mobile payments',
      'KRA PIN, NSSF, and NHIF compliance built in',
      'Multi-branch management for Nairobi, Mombasa, Kisumu & more',
      'Payroll with PAYE, HELB, and housing levy deductions',
      'Supports Kenyan labor laws and leave policies',
      'SMS notifications via local providers',
    ],
    industries: ['Agriculture', 'Tourism & Hospitality', 'Retail & FMCG', 'Real Estate', 'Transport & Logistics', 'Healthcare', 'Education', 'Manufacturing'],
    testimonial: { name: 'Wanjiku Mwangi', role: 'CEO, Safari Tech Solutions, Nairobi', quote: 'HEYLA OS transformed how we manage our 50-person team. The KRA integration alone saves us hours every month.' },
  },
  ng: {
    highlights: [
      'Naira-first pricing and invoicing',
      'TIN, NIN, and BVN verification fields',
      'Multi-state operations across Lagos, Abuja, Kano & more',
      'Payroll with Nigerian tax tables and pension deductions',
      'Supports Nigerian labor act compliance',
      'Bank transfer and Paystack-ready payment tracking',
    ],
    industries: ['Oil & Gas', 'Fintech', 'Agriculture', 'E-commerce', 'Real Estate', 'Entertainment', 'Healthcare', 'Manufacturing'],
    testimonial: { name: 'Chinedu Okafor', role: 'Founder, PayStack Commerce, Lagos', quote: 'Managing our distributed team across Lagos and Abuja is now seamless with HEYLA OS.' },
  },
  za: {
    highlights: [
      'SARS-compliant tax number and ID number fields',
      'ZAR invoicing with VAT calculations',
      'BEE compliance tracking support',
      'Multi-province management across Gauteng, Western Cape & more',
      'UIF and SDL payroll deductions built in',
      'Load shedding-ready offline data caching',
    ],
    industries: ['Mining', 'Finance & Banking', 'Agriculture', 'Tourism', 'Retail', 'Technology', 'Healthcare', 'Manufacturing'],
    testimonial: { name: 'Thabo Nkosi', role: 'MD, Cape Innovations, Johannesburg', quote: 'The BEE tracking and SARS compliance features make HEYLA OS indispensable for our business.' },
  },
  gh: {
    highlights: [
      'GRA TIN and Ghana Card number compliance',
      'GHS invoicing with E-Levy awareness',
      'Mobile money (MoMo) payment tracking',
      'Multi-region support across Accra, Kumasi, Tamale & more',
      'SSNIT and tier pension payroll deductions',
      'Supports Ghana labor law requirements',
    ],
    industries: ['Cocoa & Agriculture', 'Mining', 'Fintech', 'Oil & Gas', 'Real Estate', 'Education', 'Retail', 'Construction'],
    testimonial: { name: 'Ama Darko', role: 'COO, GoldCoast Digital, Accra', quote: 'HEYLA OS handles our Ghana Card compliance effortlessly while keeping our team productive.' },
  },
  tz: {
    highlights: [
      'TRA TIN and NIDA compliance fields',
      'TZS invoicing and EFD receipt support',
      'M-Pesa Tanzania payment tracking',
      'Multi-city management across Dar es Salaam, Dodoma, Arusha & more',
      'NSSF and WCF payroll deductions',
      'Swahili-friendly interface options',
    ],
    industries: ['Tourism & Safari', 'Mining', 'Agriculture', 'Telecommunications', 'Real Estate', 'Retail', 'Energy', 'Transport'],
    testimonial: { name: 'Juma Bakari', role: 'Director, Kilimanjaro Ventures, Dar es Salaam', quote: 'With HEYLA OS, managing our tourism business across multiple regions is finally simple.' },
  },
  ug: {
    highlights: [
      'URA TIN and NIN compliance fields',
      'UGX invoicing with EFRIS integration readiness',
      'Mobile money (MTN MoMo, Airtel Money) tracking',
      'Multi-district management across Kampala, Jinja, Gulu & more',
      'NSSF Uganda payroll deductions',
      'Supports Uganda Employment Act compliance',
    ],
    industries: ['Agriculture & Coffee', 'Tourism', 'Fintech', 'Real Estate', 'Healthcare', 'Education', 'Manufacturing', 'Retail'],
    testimonial: { name: 'Grace Nambi', role: 'CEO, Pearl Hub, Kampala', quote: 'HEYLA OS helped us scale from 10 to 80 employees while staying fully URA-compliant.' },
  },
  rw: {
    highlights: [
      'RRA TIN and NID compliance fields',
      'RWF invoicing with EBM integration readiness',
      'MTN MoMo Rwanda payment tracking',
      'Kigali-focused with national reach',
      'RSSB payroll deductions built in',
      'Supports Rwanda labor law compliance',
    ],
    industries: ['Tourism & Hospitality', 'Technology & Innovation', 'Agriculture', 'Real Estate', 'Finance', 'Healthcare', 'Education', 'Mining'],
    testimonial: { name: 'Jean-Paul Habimana', role: 'Founder, Kigali Tech, Kigali', quote: 'Rwanda is the hub of African innovation and HEYLA OS fits perfectly into our vision.' },
  },
  et: {
    highlights: [
      'ERCA TIN compliance fields',
      'ETB invoicing and receipt management',
      'Telebirr payment tracking support',
      'Multi-city across Addis Ababa, Dire Dawa, Hawassa & more',
      'Pension and income tax payroll deductions',
      'Supports Ethiopian labor proclamation compliance',
    ],
    industries: ['Agriculture & Coffee', 'Manufacturing', 'Construction', 'Tourism', 'Textiles', 'Telecom', 'Banking', 'Retail'],
    testimonial: { name: 'Abebe Tekle', role: 'GM, Addis Commerce Group, Addis Ababa', quote: 'HEYLA OS streamlined our operations across three cities. The ETB accounting module is excellent.' },
  },
  eg: {
    highlights: [
      'Tax ID and National ID compliance fields',
      'EGP invoicing with e-invoice (ETA) readiness',
      'Fawry and InstaPay payment tracking',
      'Multi-governorate management across Cairo, Alexandria, Giza & more',
      'Social insurance payroll deductions',
      'Supports Egyptian labor law compliance',
    ],
    industries: ['Tourism & Antiquities', 'Real Estate', 'Textiles', 'Petrochemicals', 'Agriculture', 'IT & Outsourcing', 'Food & Beverage', 'Banking'],
    testimonial: { name: 'Ahmed Hassan', role: 'CEO, Nile Digital, Cairo', quote: 'The ETA e-invoicing readiness in HEYLA OS puts us ahead of every competitor in Egypt.' },
  },
  us: {
    highlights: [
      'SSN and EIN compliance fields for tax reporting',
      'USD invoicing with multi-state tax calculations',
      'ACH, wire transfer, and card payment tracking',
      'Multi-state operations across all 50 states',
      'W-2 and 1099 payroll support',
      'FLSA and ADA compliance tracking',
    ],
    industries: ['Technology', 'Healthcare', 'Finance', 'Real Estate', 'E-commerce', 'Manufacturing', 'Professional Services', 'Retail'],
    testimonial: { name: 'Sarah Johnson', role: 'COO, TechStart Inc, San Francisco', quote: 'HEYLA OS handles our multi-state payroll complexities like no other platform.' },
  },
  gb: {
    highlights: [
      'NI Number and UTR compliance fields',
      'GBP invoicing with MTD VAT readiness',
      'BACS and Faster Payments tracking',
      'Multi-region across England, Scotland, Wales & N. Ireland',
      'PAYE, NIC, and pension auto-enrolment support',
      'HMRC-aligned reporting capabilities',
    ],
    industries: ['Finance & Banking', 'Technology', 'Healthcare (NHS)', 'Real Estate', 'Retail', 'Manufacturing', 'Professional Services', 'Creative Industries'],
    testimonial: { name: 'James Clarke', role: 'Director, London Scale Ltd, London', quote: 'The MTD VAT readiness alone makes HEYLA OS worth it for any UK SME.' },
  },
  de: {
    highlights: [
      'Steuer-ID and Sozialversicherungsnummer compliance',
      'EUR invoicing with GoBD-compliant record keeping',
      'SEPA payment tracking and bank reconciliation',
      'Multi-state (Bundesland) operations support',
      'Lohnsteuer and Sozialversicherung payroll support',
      'DSGVO (GDPR) compliance built in',
    ],
    industries: ['Automotive', 'Engineering', 'Manufacturing', 'Technology', 'Pharma', 'Finance', 'Retail', 'Logistics'],
    testimonial: { name: 'Markus Weber', role: 'Geschäftsführer, Berlin Digital GmbH', quote: 'HEYLA OS versteht die Komplexität des deutschen Arbeitsrechts perfekt.' },
  },
  fr: {
    highlights: [
      'NIF and Numéro de Sécurité Sociale compliance',
      'EUR invoicing with Factur-X e-invoicing readiness',
      'SEPA and carte bancaire payment tracking',
      'Multi-region operations across Île-de-France, PACA & more',
      'Cotisations sociales and prélèvement à la source support',
      'RGPD (GDPR) compliance built in',
    ],
    industries: ['Luxury & Fashion', 'Tourism', 'Agriculture & Wine', 'Technology', 'Aerospace', 'Pharma', 'Finance', 'Retail'],
    testimonial: { name: 'Marie Dupont', role: 'DG, Paris Innovation SAS', quote: 'HEYLA OS gère nos obligations sociales françaises avec une précision remarquable.' },
  },
  in: {
    highlights: [
      'PAN, Aadhaar, and UAN compliance fields',
      'INR invoicing with GST calculations built in',
      'UPI, NEFT, and RTGS payment tracking',
      'Multi-state operations with state GST support',
      'PF, ESI, and professional tax payroll deductions',
      'Shops & Establishment Act compliance',
    ],
    industries: ['IT & Software', 'E-commerce', 'Manufacturing', 'Pharma', 'Agriculture', 'Textiles', 'Finance', 'Real Estate'],
    testimonial: { name: 'Priya Sharma', role: 'CEO, Mumbai Tech Solutions', quote: 'The GST compliance and multi-state payroll in HEYLA OS saved us from hiring an extra accountant.' },
  },
  ae: {
    highlights: [
      'TRN and Emirates ID compliance fields',
      'AED invoicing with UAE VAT calculations',
      'WPS payroll compliance built in',
      'Multi-emirate management across Dubai, Abu Dhabi, Sharjah & more',
      'GDRFA and MOL integration readiness',
      'Free zone and mainland entity support',
    ],
    industries: ['Real Estate', 'Tourism & Hospitality', 'Finance', 'Oil & Gas', 'Logistics', 'Technology', 'Retail', 'Construction'],
    testimonial: { name: 'Fatima Al-Rashid', role: 'Managing Partner, Dubai Ventures LLC', quote: 'WPS compliance and multi-emirate support make HEYLA OS the best choice for UAE businesses.' },
  },
  br: {
    highlights: [
      'CPF and CNPJ compliance fields',
      'BRL invoicing with NFe/NFSe e-invoice support',
      'PIX, boleto, and TED payment tracking',
      'Multi-state operations with ICMS and ISS support',
      'CLT and eSocial payroll compliance',
      'LGPD (data protection) compliance built in',
    ],
    industries: ['Agriculture & Agribusiness', 'Fintech', 'E-commerce', 'Mining', 'Manufacturing', 'Tourism', 'Retail', 'Technology'],
    testimonial: { name: 'Carlos Silva', role: 'CEO, São Paulo Digital Ltda', quote: 'O HEYLA OS simplifica o eSocial e a folha de pagamento como nenhuma outra plataforma.' },
  },
  cn: {
    highlights: [
      'Tax ID and ID Number compliance fields',
      'CNY invoicing with fapiao integration readiness',
      'WeChat Pay and Alipay payment tracking',
      'Multi-province operations support',
      'Five insurances and housing fund payroll deductions',
      'Chinese labor contract law compliance',
    ],
    industries: ['Manufacturing', 'Technology', 'E-commerce', 'Real Estate', 'Finance', 'Agriculture', 'Logistics', 'Healthcare'],
    testimonial: { name: 'Li Wei', role: 'GM, Shenzhen Innovation Co., Ltd', quote: 'HEYLA OS handles our complex payroll with five insurances and housing fund perfectly.' },
  },
  jp: {
    highlights: [
      'My Number compliance for tax and social insurance',
      'JPY invoicing with qualified invoice system (インボイス制度) support',
      'Bank transfer and PayPay tracking',
      'Multi-prefecture operations support',
      'Shakai hoken and kosei nenkin payroll deductions',
      'Japanese labor standards act compliance',
    ],
    industries: ['Automotive', 'Electronics', 'Gaming', 'Manufacturing', 'Finance', 'Retail', 'Tourism', 'Healthcare'],
    testimonial: { name: 'Tanaka Yuki', role: 'CEO, Tokyo Solutions K.K.', quote: 'HEYLA OS のインボイス制度対応は、私たちの事業にとって不可欠です。' },
  },
  au: {
    highlights: [
      'TFN and ABN compliance fields',
      'AUD invoicing with BAS and GST calculations',
      'BPAY and bank transfer tracking',
      'Multi-state across NSW, VIC, QLD, WA & more',
      'Superannuation and PAYG payroll compliance',
      'Fair Work Act and NES compliance tracking',
    ],
    industries: ['Mining', 'Agriculture', 'Tourism', 'Technology', 'Finance', 'Real Estate', 'Healthcare', 'Retail'],
    testimonial: { name: 'Sarah Mitchell', role: 'Director, Sydney Tech Group Pty Ltd', quote: 'The super compliance and STP reporting in HEYLA OS makes running payroll a breeze.' },
  },
  ca: {
    highlights: [
      'SIN and BN compliance fields',
      'CAD invoicing with GST/HST/PST calculations',
      'Interac e-Transfer and EFT payment tracking',
      'Multi-province across Ontario, BC, Alberta, Quebec & more',
      'CPP, EI, and provincial tax payroll deductions',
      'Canada Labour Code and ESA compliance',
    ],
    industries: ['Mining & Resources', 'Technology', 'Finance', 'Oil & Gas', 'Agriculture', 'Real Estate', 'Healthcare', 'Retail'],
    testimonial: { name: 'Michael Chen', role: 'CEO, Toronto Innovations Inc.', quote: 'Managing our team across Ontario and BC with different tax rules is now effortless with HEYLA OS.' },
  },
};

export function getCountryData(code: string): { highlights: string[]; industries: string[]; testimonial?: { name: string; role: string; quote: string } } {
  return countryData[code.toLowerCase()] || { highlights: [], industries: [] };
}
