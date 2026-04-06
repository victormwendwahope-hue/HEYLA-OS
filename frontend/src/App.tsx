import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import HRPage from "@/pages/hr/HRPage";
import EmployeeProfilePage from "@/pages/hr/EmployeeProfilePage";
import AttendancePage from "@/pages/hr/AttendancePage";
import LeavePage from "@/pages/hr/LeavePage";
import PerformancePage from "@/pages/hr/PerformancePage";
import BlacklistPage from "@/pages/hr/BlacklistPage";
import DocumentsPage from "@/pages/hr/DocumentsPage";
import CRMPage from "@/pages/crm/CRMPage";
import AccountingPage from "@/pages/accounting/AccountingPage";
import PayrollPage from "@/pages/accounting/PayrollPage";
import InventoryPage from "@/pages/inventory/InventoryPage";
import NetworkingPage from "@/pages/networking/NetworkingPage";
import MarketplacePage from "@/pages/marketplace/MarketplacePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import TransportPage from "@/pages/transport/TransportPage";
import FuelPage from "@/pages/fuel/FuelPage";
import JobsPage from "@/pages/jobs/JobsPage";
import NotFound from "@/pages/NotFound";
import CountrySelectPage from "@/components/landing-pages/CountrySelectPage";
import { lazy, Suspense } from "react";

const KenyaLanding = lazy(() => import("@/components/landing-pages/ke/KenyaLanding"));
const NigeriaLanding = lazy(() => import("@/components/landing-pages/ng/NigeriaLanding"));
const SouthAfricaLanding = lazy(() => import("@/components/landing-pages/za/SouthAfricaLanding"));
const GhanaLanding = lazy(() => import("@/components/landing-pages/gh/GhanaLanding"));
const TanzaniaLanding = lazy(() => import("@/components/landing-pages/tz/TanzaniaLanding"));
const UgandaLanding = lazy(() => import("@/components/landing-pages/ug/UgandaLanding"));
const RwandaLanding = lazy(() => import("@/components/landing-pages/rw/RwandaLanding"));
const EthiopiaLanding = lazy(() => import("@/components/landing-pages/et/EthiopiaLanding"));
const EgyptLanding = lazy(() => import("@/components/landing-pages/eg/EgyptLanding"));
const USALanding = lazy(() => import("@/components/landing-pages/us/USALanding"));
const UKLanding = lazy(() => import("@/components/landing-pages/gb/UKLanding"));
const GermanyLanding = lazy(() => import("@/components/landing-pages/de/GermanyLanding"));
const FranceLanding = lazy(() => import("@/components/landing-pages/fr/FranceLanding"));
const IndiaLanding = lazy(() => import("@/components/landing-pages/in/IndiaLanding"));
const UAELanding = lazy(() => import("@/components/landing-pages/ae/UAELanding"));
const BrazilLanding = lazy(() => import("@/components/landing-pages/br/BrazilLanding"));
const ChinaLanding = lazy(() => import("@/components/landing-pages/cn/ChinaLanding"));
const JapanLanding = lazy(() => import("@/components/landing-pages/jp/JapanLanding"));
const AustraliaLanding = lazy(() => import("@/components/landing-pages/au/AustraliaLanding"));
const CanadaLanding = lazy(() => import("@/components/landing-pages/ca/CanadaLanding"));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const CountryFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<CountryFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<CountrySelectPage />} />
            
            {/* Country Landing Pages */}
            <Route path="/country/ke" element={<KenyaLanding />} />
            <Route path="/country/ng" element={<NigeriaLanding />} />
            <Route path="/country/za" element={<SouthAfricaLanding />} />
            <Route path="/country/gh" element={<GhanaLanding />} />
            <Route path="/country/tz" element={<TanzaniaLanding />} />
            <Route path="/country/ug" element={<UgandaLanding />} />
            <Route path="/country/rw" element={<RwandaLanding />} />
            <Route path="/country/et" element={<EthiopiaLanding />} />
            <Route path="/country/eg" element={<EgyptLanding />} />
            <Route path="/country/us" element={<USALanding />} />
            <Route path="/country/gb" element={<UKLanding />} />
            <Route path="/country/de" element={<GermanyLanding />} />
            <Route path="/country/fr" element={<FranceLanding />} />
            <Route path="/country/in" element={<IndiaLanding />} />
            <Route path="/country/ae" element={<UAELanding />} />
            <Route path="/country/br" element={<BrazilLanding />} />
            <Route path="/country/cn" element={<ChinaLanding />} />
            <Route path="/country/jp" element={<JapanLanding />} />
            <Route path="/country/au" element={<AustraliaLanding />} />
            <Route path="/country/ca" element={<CanadaLanding />} />
            <Route path="/countries" element={<CountrySelectPage />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/hr" element={<HRPage />} />
              <Route path="/hr/employee/:id" element={<EmployeeProfilePage />} />
              <Route path="/hr/attendance" element={<AttendancePage />} />
              <Route path="/hr/leave" element={<LeavePage />} />
              <Route path="/hr/performance" element={<PerformancePage />} />
              <Route path="/hr/blacklist" element={<BlacklistPage />} />
              <Route path="/hr/documents" element={<DocumentsPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/crm" element={<CRMPage />} />
              <Route path="/accounting" element={<AccountingPage />} />
              <Route path="/accounting/payroll" element={<PayrollPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/fuel" element={<FuelPage />} />
              <Route path="/networking" element={<NetworkingPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
