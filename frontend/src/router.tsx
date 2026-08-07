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
import CrmDashboardPage from '@/modules/crm/pages/CrmDashboardPage';
import CustomersPage from '@/modules/crm/pages/CustomersPage';
import CustomerDetailsPage from '@/modules/crm/pages/CustomerDetailsPage';
import LeadsPage from '@/modules/crm/pages/LeadsPage';
import LeadDetailsPage from '@/modules/crm/pages/LeadDetailsPage';
import OpportunitiesPage from '@/modules/crm/pages/OpportunitiesPage';
import PipelineBoardPage from '@/modules/crm/pages/PipelineBoardPage';
import QuotationsPage from '@/modules/crm/pages/QuotationsPage';
import QuotationBuilderPage from '@/modules/crm/pages/QuotationBuilderPage';
import CommunicationsPage from '@/modules/crm/pages/CommunicationsPage';
import TicketsPage from '@/modules/crm/pages/TicketsPage';
import CustomerSuccessPage from '@/modules/crm/pages/CustomerSuccessPage';
import ForecastingPage from '@/modules/crm/pages/ForecastingPage';
import SalesTeamPage from '@/modules/crm/pages/SalesTeamPage';
import AutomationsPage from '@/modules/crm/pages/AutomationsPage';
import CrmReportsPage from '@/modules/crm/pages/CrmReportsPage';
import AccountingPage from '@/pages/accounting/AccountingPage';
import PayrollPage from '@/pages/accounting/PayrollPage';
import InventoryPage from '@/pages/inventory/InventoryPage';
import NetworkingPage from '@/pages/networking/NetworkingPage';
import NetworkingProfilePage from '@/pages/networking/NetworkingProfilePage';
import NetworkingNetworkPage from '@/pages/networking/NetworkingNetworkPage';
import NetworkingDiscoverPage from '@/pages/networking/NetworkingDiscoverPage';
import NetworkingUserProfilePage from '@/pages/networking/NetworkingUserProfilePage';
import MarketplacePage from '@/pages/marketplace/MarketplacePage';
import SettingsPage from '@/pages/settings/SettingsPage';
import AdminPage from '@/pages/admin/AdminPage';
import ManageUsersPage from '@/pages/admin/ManageUsersPage';
import NetworkTapLanding from '@/pages/network-tap/LandingPage';
import NetworkTapDashboard from '@/pages/network-tap/DashboardPage';
import NetworkTapProfile from '@/pages/network-tap/ProfilePage';
import NetworkTapJobs from '@/pages/network-tap/JobsPage';
import NetworkTapConnections from '@/pages/network-tap/ConnectionsPage';
import NetworkTapMessages from '@/pages/network-tap/MessagesPage';
import NetworkTapNotifications from '@/pages/network-tap/NotificationsPage';
import CVBuilderPage from '@/pages/network-tap/CVBuilderPage';
import ProjectsPage from '@/pages/network-tap/ProjectsPage';
import PassportPage from '@/pages/network-tap/PassportPage';
import VerificationsPage from '@/pages/network-tap/VerificationsPage';
import WorklogPage from '@/pages/network-tap/WorklogPage';
import ReferencesPage from '@/pages/network-tap/ReferencesPage';
import CommunitiesPage from '@/pages/network-tap/CommunitiesPage';
import EventsPage from '@/pages/network-tap/EventsPage';
import MentorshipPage from '@/pages/network-tap/MentorshipPage';
import AiHubPage from '@/pages/network-tap/AiHubPage';
import PaymentPage from '@/pages/payment/PaymentPage';
import TransportPage from '@/pages/transport/TransportPage';
import FuelPage from '@/pages/fuel/FuelPage';
import FleetDashboardPage from '@/modules/transport/pages/FleetDashboardPage';
import VehiclesPage from '@/modules/transport/pages/VehiclesPage';
import VehicleDetailPage from '@/modules/transport/pages/VehicleDetailPage';
import FuelManagementPage from '@/modules/transport/pages/FuelManagementPage';
import FuelAnalyticsPage from '@/modules/transport/pages/FuelAnalyticsPage';
import TripManagementPage from '@/modules/transport/pages/TripManagementPage';
import FlexibleCostingPage from '@/modules/transport/pages/FlexibleCostingPage';
import WorkshopPage from '@/modules/transport/pages/WorkshopPage';
import PreventiveMaintenancePage from '@/modules/transport/pages/PreventiveMaintenancePage';
import TyreManagementPage from '@/modules/transport/pages/TyreManagementPage';
import BreakdownsPage from '@/modules/transport/pages/BreakdownsPage';
import DriverManagementPage from '@/modules/transport/pages/DriverManagementPage';
import DriverScorecardsPage from '@/modules/transport/pages/DriverScorecardsPage';
import ProfitabilityPage from '@/modules/transport/pages/ProfitabilityPage';
import HeavyEquipmentPage from '@/modules/transport/pages/HeavyEquipmentPage';
import TelematicsPage from '@/modules/transport/pages/TelematicsPage';
import ComplianceCenterPage from '@/modules/transport/pages/ComplianceCenterPage';
import TransportReportsPage from '@/modules/transport/pages/TransportReportsPage';
import JobsPage from '@/pages/jobs/JobsPage';
import CareersPage from '@/pages/careers/CareersPage';
import EhsDashboard from '@/modules/ehs/pages/DashboardPage';
import EhsIncidents from '@/modules/ehs/pages/IncidentsPage';
import EhsIncidentDetails from '@/modules/ehs/pages/IncidentDetailsPage';
import EhsInvestigations from '@/modules/ehs/pages/InvestigationsPage';
import EhsHazards from '@/modules/ehs/pages/HazardRegisterPage';
import EhsRiskAssessments from '@/modules/ehs/pages/RiskAssessmentsPage';
import EhsPPE from '@/modules/ehs/pages/PPEManagementPage';
import EhsInspections from '@/modules/ehs/pages/InspectionsPage';
import EhsAudits from '@/modules/ehs/pages/AuditCenterPage';
import EhsPermits from '@/modules/ehs/pages/PermitsToWorkPage';
import EhsTraining from '@/modules/ehs/pages/SafetyTrainingPage';
import EhsEnvironmental from '@/modules/ehs/pages/EnvironmentalManagementPage';
import EhsFleet from '@/modules/ehs/pages/FleetSafetyPage';
import EhsOccupationalHealth from '@/modules/ehs/pages/OccupationalHealthPage';
import EhsCompliance from '@/modules/ehs/pages/ComplianceCenterPage';
import EhsCorrectiveActions from '@/modules/ehs/pages/CorrectiveActionsPage';
import EhsToolboxTalks from '@/modules/ehs/pages/ToolboxTalksPage';
import EhsReports from '@/modules/ehs/pages/EHSReportsPage';
import EngineeringPage from '@/pages/engineering/EngineeringPage';
import NotFound from '@/pages/NotFound';
import GeoLanding from '@/components/landing-pages/GeoLanding';
import PrivacyPage from '@/pages/legal/PrivacyPage';
import TermsPage from '@/pages/legal/TermsPage';
import { AppLayoutWithBot } from '@/components/layout/AppLayout';
import { NtvLayout } from '@/components/layout/NtvLayout';
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

function readStoredUser(): { role?: string; subscription?: { status?: string } } | null {
  try {
    const userStr = localStorage.getItem('heyla_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

function requireAuth() {
  const token = localStorage.getItem('heyla_token');
  if (!token) throw redirect({ to: '/login' });
  const user = readStoredUser();
  const sub = user?.subscription;
  if (sub && sub.status === 'expired') {
    throw redirect({ to: '/payment' });
  }
}

function requireCompany() {
  requireAuth();
  // Individual accounts only have access to the networking platform
  if (readStoredUser()?.role === 'individual') {
    throw redirect({ to: '/network-tap/dashboard' });
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
const networkTapRoute = createRoute({ getParentRoute: () => rootRoute, path: '/network-tap', component: NetworkTapLanding });

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
  beforeLoad: () => requireCompany(),
  component: () => <AppLayoutWithBot />,
});

const ntvLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'ntv',
  beforeLoad: () => requireAuth(),
  component: () => <NtvLayout />,
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
const ehsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs', component: EhsDashboard });
const ehsIncidentsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/incidents', component: EhsIncidents });
const ehsIncidentDetailRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/incidents/$id', component: EhsIncidentDetails });
const ehsInvestigationsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/investigations', component: EhsInvestigations });
const ehsHazardsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/hazards', component: EhsHazards });
const ehsRiskAssessmentsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/risk-assessments', component: EhsRiskAssessments });
const ehsPpeRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/ppe', component: EhsPPE });
const ehsInspectionsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/inspections', component: EhsInspections });
const ehsAuditsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/audits', component: EhsAudits });
const ehsPermitsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/permits', component: EhsPermits });
const ehsTrainingRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/training', component: EhsTraining });
const ehsEnvironmentalRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/environmental', component: EhsEnvironmental });
const ehsFleetRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/fleet', component: EhsFleet });
const ehsOccupationalHealthRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/occupational-health', component: EhsOccupationalHealth });
const ehsComplianceRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/compliance', component: EhsCompliance });
const ehsCorrectiveActionsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/corrective-actions', component: EhsCorrectiveActions });
const ehsToolboxTalksRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/toolbox-talks', component: EhsToolboxTalks });
const ehsReportsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/ehs/reports', component: EhsReports });
const engineeringRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/engineering', component: EngineeringPage });
const crmRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm', component: CrmDashboardPage });
const crmCustomersRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/customers', component: CustomersPage });
const crmCustomerDetailRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/customers/$id', component: CustomerDetailsPage });
const crmLeadsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/leads', component: LeadsPage });
const crmLeadDetailRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/leads/$id', component: LeadDetailsPage });
const crmOpportunitiesRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/opportunities', component: OpportunitiesPage });
const crmPipelineRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/pipeline', component: PipelineBoardPage });
const crmQuotationsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/quotations', component: QuotationsPage });
const crmQuotationBuilderRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/quotations/builder', component: QuotationBuilderPage });
const crmCommunicationsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/communications', component: CommunicationsPage });
const crmTicketsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/tickets', component: TicketsPage });
const crmCustomerSuccessRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/customer-success', component: CustomerSuccessPage });
const crmForecastingRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/forecasting', component: ForecastingPage });
const crmSalesTeamRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/sales-team', component: SalesTeamPage });
const crmAutomationsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/automations', component: AutomationsPage });
const crmReportsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/crm/reports', component: CrmReportsPage });
const accountingRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/accounting', component: AccountingPage });
const accountingPayrollRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/accounting/payroll', component: PayrollPage });
const inventoryRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/inventory', component: InventoryPage });
const transportRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport', component: TransportPage });
const fuelRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/fuel', component: FuelPage });
const ftiDashboardRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/fti', component: FleetDashboardPage });
const ftiVehiclesRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/vehicles', component: VehiclesPage });
const ftiVehicleDetailRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/vehicles/$id', component: VehicleDetailPage });
const ftiFuelRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/fuel', component: FuelManagementPage });
const ftiFuelAnalyticsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/fuel-analytics', component: FuelAnalyticsPage });
const ftiTripsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/trips', component: TripManagementPage });
const ftiCostingRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/costing', component: FlexibleCostingPage });
const ftiWorkshopRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/workshop', component: WorkshopPage });
const ftiMaintenanceRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/maintenance', component: PreventiveMaintenancePage });
const ftiTyresRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/tyres', component: TyreManagementPage });
const ftiBreakdownsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/breakdowns', component: BreakdownsPage });
const ftiDriversRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/drivers', component: DriverManagementPage });
const ftiDriverScoresRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/driver-scores', component: DriverScorecardsPage });
const ftiProfitabilityRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/profitability', component: ProfitabilityPage });
const ftiHeavyEquipmentRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/heavy-equipment', component: HeavyEquipmentPage });
const ftiTelematicsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/telematics', component: TelematicsPage });
const ftiComplianceRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/compliance', component: ComplianceCenterPage });
const ftiReportsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/transport/reports', component: TransportReportsPage });
const networkingRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/networking', component: NetworkingPage });
const networkingProfileRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/networking/profile', component: NetworkingProfilePage });
const networkingUserProfileRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/networking/profile/$userId', component: NetworkingUserProfilePage });
const networkingNetworkRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/networking/network', component: NetworkingNetworkPage });
const networkingDiscoverRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/networking/discover', component: NetworkingDiscoverPage });
const marketplaceRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/marketplace', component: MarketplacePage });
const settingsRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/settings', component: SettingsPage });
const adminRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/admin', component: AdminPage });
const manageUsersRoute = createRoute({ getParentRoute: () => protectedLayoutRoute, path: '/manage-users', component: ManageUsersPage });

const networkTapDashboardRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/dashboard', component: NetworkTapDashboard });
const networkTapProfileRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/profile', component: NetworkTapProfile });
const networkTapJobsRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/jobs', component: NetworkTapJobs });
const networkTapConnectionsRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/connections', component: NetworkTapConnections });
const networkTapMessagesRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/messages', component: NetworkTapMessages });
const networkTapNotificationsRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/notifications', component: NetworkTapNotifications });
const networkTapCvRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/cv', component: CVBuilderPage });
const networkTapProjectsRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/projects', component: ProjectsPage });
const networkTapPassportRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/passport', component: PassportPage });
const networkTapVerificationsRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/verifications', component: VerificationsPage });
const networkTapWorklogRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/worklog', component: WorklogPage });
const networkTapReferencesRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/references', component: ReferencesPage });
const networkTapCommunitiesRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/communities', component: CommunitiesPage });
const networkTapEventsRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/events', component: EventsPage });
const networkTapMentorshipRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/mentorship', component: MentorshipPage });
const networkTapAiRoute = createRoute({ getParentRoute: () => ntvLayoutRoute, path: '/network-tap/ai', component: AiHubPage });

const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: '/$', component: NotFound });

const protectedChildren = [
  dashboardRoute, hrRoute, hrEmployeeRoute, hrAttendanceRoute, hrLeaveRoute,
  hrPerformanceRoute, hrWibaRoute, hrInjuriesRoute, hrBlacklistRoute,
  hrDocumentsRoute, hrPayrollRoute, jobsRoute, ehsRoute,
  ehsIncidentsRoute, ehsIncidentDetailRoute, ehsInvestigationsRoute, ehsHazardsRoute,
  ehsRiskAssessmentsRoute, ehsPpeRoute, ehsInspectionsRoute, ehsAuditsRoute, ehsPermitsRoute,
  ehsTrainingRoute, ehsEnvironmentalRoute, ehsFleetRoute, ehsOccupationalHealthRoute,
  ehsComplianceRoute, ehsCorrectiveActionsRoute, ehsToolboxTalksRoute, ehsReportsRoute,
  engineeringRoute,
  crmRoute, crmCustomersRoute, crmCustomerDetailRoute, crmLeadsRoute, crmLeadDetailRoute,
  crmOpportunitiesRoute, crmPipelineRoute, crmQuotationsRoute, crmQuotationBuilderRoute,
  crmCommunicationsRoute, crmTicketsRoute, crmCustomerSuccessRoute, crmForecastingRoute,
  crmSalesTeamRoute, crmAutomationsRoute, crmReportsRoute, accountingRoute, accountingPayrollRoute, inventoryRoute,
  transportRoute, fuelRoute,
  ftiDashboardRoute, ftiVehiclesRoute, ftiVehicleDetailRoute, ftiFuelRoute,
  ftiFuelAnalyticsRoute, ftiTripsRoute, ftiCostingRoute, ftiWorkshopRoute,
  ftiMaintenanceRoute, ftiTyresRoute, ftiBreakdownsRoute, ftiDriversRoute,
  ftiDriverScoresRoute, ftiProfitabilityRoute, ftiHeavyEquipmentRoute,
  ftiTelematicsRoute, ftiComplianceRoute, ftiReportsRoute,
  networkingRoute, networkingProfileRoute, networkingUserProfileRoute, networkingNetworkRoute, networkingDiscoverRoute, marketplaceRoute,
  settingsRoute, adminRoute, manageUsersRoute,
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
  networkTapRoute,
  ...countryRoutes,
  protectedLayoutRoute.addChildren(protectedChildren),
  ntvLayoutRoute.addChildren([
    networkTapDashboardRoute, networkTapProfileRoute, networkTapJobsRoute,
    networkTapConnectionsRoute, networkTapMessagesRoute, networkTapNotificationsRoute,
    networkTapCvRoute, networkTapProjectsRoute,
    networkTapPassportRoute, networkTapVerificationsRoute, networkTapWorklogRoute,
    networkTapReferencesRoute, networkTapCommunitiesRoute, networkTapEventsRoute,
    networkTapMentorshipRoute, networkTapAiRoute,
  ]),
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export { router };
