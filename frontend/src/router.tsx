import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { Suspense } from 'react';
import { CookieConsent } from '@/components/ui/CookieConsent';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import RegisterIndividualPage from '@/pages/auth/RegisterIndividualPage';
import RegisterCompanyPage from '@/pages/auth/RegisterCompanyPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import HRPage from '@/pages/hr/HRPage';
import EmployeeProfilePage from '@/pages/hr/EmployeeProfilePage';
import AttendancePage from '@/pages/hr/AttendancePage';
import LeavePage from '@/pages/hr/LeavePage';
import PerformancePage from '@/pages/hr/PerformancePage';
import BlacklistPage from '@/pages/hr/BlacklistPage';
import DocumentsPage from '@/pages/hr/DocumentsPage';
import WIBAPage from '@/pages/hr/WIBAPage';
import InjuryPage from '@/pages/hr/InjuryPage';
import HRPayrollPage from '@/pages/hr/HRPayrollPage';
import CRMPage from '@/pages/crm/CRMPage';
import AccountingPage from '@/pages/accounting/AccountingPage';
import PayrollPage from '@/pages/accounting/PayrollPage';
import InventoryPage from '@/pages/inventory/InventoryPage';
import NetworkingPage from '@/pages/networking/NetworkingPage';
import MarketplacePage from '@/pages/marketplace/MarketplacePage';
import SettingsPage from '@/pages/settings/SettingsPage';
import AdminPage from '@/pages/admin/AdminPage';
import PaymentPage from '@/pages/payment/PaymentPage';
import TransportPage from '@/pages/transport/TransportPage';
import FuelPage from '@/pages/fuel/FuelPage';
import JobsPage from '@/pages/jobs/JobsPage';
import CareersPage from '@/pages/careers/CareersPage';
import EHSPage from '@/pages/ehs/EHSPage';
import EngineeringPage from '@/pages/engineering/EngineeringPage';
import NotFound from '@/pages/NotFound';
import GeoLanding from '@/components/landing-pages/GeoLanding';
import PrivacyPage from '@/pages/legal/PrivacyPage';
import TermsPage from '@/pages/legal/TermsPage';
import { AppLayoutWithBot } from '@/components/layout/AppLayout';
import { CountryHomePage } from '@/components/landing-pages/pages/CountryHomePage';
import { CountryFeaturesPage } from '@/components/landing-pages/pages/CountryFeaturesPage';
import { CountryPricingPage } from '@/components/landing-pages/pages/CountryPricingPage';
import { CountryAboutPage } from '@/components/landing-pages/pages/CountryAboutPage';
import { CountryBlogPage } from '@/components/landing-pages/pages/CountryBlogPage';
import { CountryBlogArticlePage } from '@/components/landing-pages/pages/CountryBlogArticlePage';
import { getCountry } from '@/utils/countries';
import { getCountryData } from '@/utils/countryData';

const CountryFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

function requireAuth() {
  const token = localStorage.getItem('heyla_token');
  if (!token) throw redirect({ to: '/login' });
  try {
    const userStr = localStorage.getItem('heyla_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const sub = user?.subscription;
      if (sub && sub.status === 'expired') {
        throw redirect({ to: '/payment' });
      }
    }
  } catch {
    // ignore parse errors
  }
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <CookieConsent />
      <Suspense fallback={<CountryFallback />}>
        <Outlet />
      </Suspense>
    </>
  ),
});

const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: RegisterPage });
const registerIndividualRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register/individual', component: RegisterIndividualPage });
const registerCompanyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register/company', component: RegisterCompanyPage });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: GeoLanding });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/privacy', component: PrivacyPage });
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/terms', component: TermsPage });
const careersRoute = createRoute({ getParentRoute: () => rootRoute, path: '/careers', component: CareersPage });
const paymentRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment', component: PaymentPage });

const COUNTRY_CODES = ['ke', 'ng', 'za', 'gh', 'tz', 'ug', 'rw', 'et', 'eg', 'us', 'gb', 'de', 'fr', 'in', 'ae', 'br', 'cn', 'jp', 'au', 'ca'];

function countryRouteComponent(code: string, section: string) {
  const country = getCountry(code.toUpperCase())!;
  switch (section) {
    case 'home':
      const data = getCountryData(code);
      return () => <CountryHomePage country={country} highlights={data.highlights} testimonial={data.testimonial} />;
    case 'features':
      return () => <CountryFeaturesPage country={country} industries={getCountryData(code).industries} />;
    case 'pricing':
      return () => <CountryPricingPage country={country} />;
    case 'about':
      return () => <CountryAboutPage country={country} />;
    case 'blog':
      return () => <CountryBlogPage country={country} />;
    case 'blog-article':
      return () => <CountryBlogArticlePage country={country} />;
    default:
      const defaultData = getCountryData(code);
      return () => <CountryHomePage country={country} highlights={defaultData.highlights} testimonial={defaultData.testimonial} />;
  }
}

const countryRoutes = COUNTRY_CODES.flatMap((code) => [
  createRoute({ getParentRoute: () => rootRoute, path: `/country/${code}`, component: countryRouteComponent(code, 'home') }),
  createRoute({ getParentRoute: () => rootRoute, path: `/country/${code}/features`, component: countryRouteComponent(code, 'features') }),
  createRoute({ getParentRoute: () => rootRoute, path: `/country/${code}/pricing`, component: countryRouteComponent(code, 'pricing') }),
  createRoute({ getParentRoute: () => rootRoute, path: `/country/${code}/about`, component: countryRouteComponent(code, 'about') }),
  createRoute({ getParentRoute: () => rootRoute, path: `/country/${code}/blog`, component: countryRouteComponent(code, 'blog') }),
  createRoute({ getParentRoute: () => rootRoute, path: `/country/${code}/blog/$slug`, component: countryRouteComponent(code, 'blog-article') }),
]);

const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: () => requireAuth(),
  component: () => <AppLayoutWithBot />,
});

const dashboardRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/dashboard', component: DashboardPage });
const hrRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr', component: HRPage });
const hrEmployeeRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/employee/$id', component: EmployeeProfilePage });
const hrAttendanceRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/attendance', component: AttendancePage });
const hrLeaveRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/leave', component: LeavePage });
const hrPerformanceRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/performance', component: PerformancePage });
const hrWibaRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/wiba', component: WIBAPage });
const hrInjuriesRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/injuries', component: InjuryPage });
const hrBlacklistRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/blacklist', component: BlacklistPage });
const hrDocumentsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/documents', component: DocumentsPage });
const hrPayrollRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/hr/payroll', component: HRPayrollPage });
const jobsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/jobs', component: JobsPage });
const ehsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs', component: EHSPage });
const engineeringRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/engineering', component: EngineeringPage });
const crmRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm', component: CRMPage });
const accountingRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/accounting', component: AccountingPage });
const accountingPayrollRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/accounting/payroll', component: PayrollPage });
const inventoryRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/inventory', component: InventoryPage });
const transportRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport', component: TransportPage });
const fuelRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/fuel', component: FuelPage });
const networkingRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/networking', component: NetworkingPage });
const marketplaceRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/marketplace', component: MarketplacePage });
const settingsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/settings', component: SettingsPage });
const adminRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/admin', component: AdminPage });

const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: '/$', component: NotFound });

const protectedChildren = [
  dashboardRoute, hrRoute, hrEmployeeRoute, hrAttendanceRoute, hrLeaveRoute,
  hrPerformanceRoute, hrWibaRoute, hrInjuriesRoute, hrBlacklistRoute,
  hrDocumentsRoute, hrPayrollRoute, jobsRoute, ehsRoute, engineeringRoute,
  crmRoute, accountingRoute, accountingPayrollRoute, inventoryRoute,
  transportRoute, fuelRoute, networkingRoute, marketplaceRoute,
  settingsRoute, adminRoute,
];

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  registerIndividualRoute,
  registerCompanyRoute,
  homeRoute,
  privacyRoute,
  termsRoute,
  careersRoute,
  paymentRoute,
  ...countryRoutes,
  protectedLayoutRoute.addChildren(protectedChildren),
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export { router };
