import { CountryConfig } from '@/types';

export const countries: CountryConfig[] = [
  { code: 'KE', name: 'Kenya', currency: 'KES', currencySymbol: 'KSh', phonePrefix: '+254', taxFields: ['KRA PIN', 'NSSF No', 'NHIF No', 'National ID'], flag: '🇰🇪' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', currencySymbol: '₦', phonePrefix: '+234', taxFields: ['TIN', 'NIN', 'BVN'], flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', currencySymbol: 'R', phonePrefix: '+27', taxFields: ['Tax Number', 'ID Number'], flag: '🇿🇦' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', currencySymbol: 'GH₵', phonePrefix: '+233', taxFields: ['TIN', 'Ghana Card No'], flag: '🇬🇭' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', currencySymbol: 'TSh', phonePrefix: '+255', taxFields: ['TIN', 'NIDA'], flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', currency: 'UGX', currencySymbol: 'USh', phonePrefix: '+256', taxFields: ['TIN', 'NIN'], flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', currencySymbol: 'RF', phonePrefix: '+250', taxFields: ['TIN', 'NID'], flag: '🇷🇼' },
  { code: 'ET', name: 'Ethiopia', currency: 'ETB', currencySymbol: 'Br', phonePrefix: '+251', taxFields: ['TIN'], flag: '🇪🇹' },
  { code: 'EG', name: 'Egypt', currency: 'EGP', currencySymbol: 'E£', phonePrefix: '+20', taxFields: ['Tax ID', 'National ID'], flag: '🇪🇬' },
  { code: 'US', name: 'United States', currency: 'USD', currencySymbol: '$', phonePrefix: '+1', taxFields: ['SSN', 'EIN'], flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£', phonePrefix: '+44', taxFields: ['NI Number', 'UTR'], flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', currency: 'EUR', currencySymbol: '€', phonePrefix: '+49', taxFields: ['Steuer-ID', 'Sozialversicherungsnummer'], flag: '🇩🇪' },
  { code: 'FR', name: 'France', currency: 'EUR', currencySymbol: '€', phonePrefix: '+33', taxFields: ['NIF', 'Numéro de Sécurité Sociale'], flag: '🇫🇷' },
  { code: 'IN', name: 'India', currency: 'INR', currencySymbol: '₹', phonePrefix: '+91', taxFields: ['PAN', 'Aadhaar', 'UAN'], flag: '🇮🇳' },
  { code: 'AE', name: 'UAE', currency: 'AED', currencySymbol: 'د.إ', phonePrefix: '+971', taxFields: ['TRN', 'Emirates ID'], flag: '🇦🇪' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', currencySymbol: 'R$', phonePrefix: '+55', taxFields: ['CPF', 'CNPJ'], flag: '🇧🇷' },
  { code: 'CN', name: 'China', currency: 'CNY', currencySymbol: '¥', phonePrefix: '+86', taxFields: ['Tax ID', 'ID Number'], flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', currency: 'JPY', currencySymbol: '¥', phonePrefix: '+81', taxFields: ['My Number'], flag: '🇯🇵' },
  { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: 'A$', phonePrefix: '+61', taxFields: ['TFN', 'ABN'], flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', currency: 'CAD', currencySymbol: 'C$', phonePrefix: '+1', taxFields: ['SIN', 'BN'], flag: '🇨🇦' },
];

export const getCountry = (code: string) => countries.find((c) => c.code === code) || countries[0];

export const formatCurrency = (amount: number, countryCode: string = 'KE') => {
  const country = getCountry(countryCode);
  return `${country.currencySymbol} ${amount.toLocaleString()}`;
};
