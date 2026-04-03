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
import CRMPage from "@/pages/crm/CRMPage";
import AccountingPage from "@/pages/accounting/AccountingPage";
import InventoryPage from "@/pages/inventory/InventoryPage";
import NetworkingPage from "@/pages/networking/NetworkingPage";
import MarketplacePage from "@/pages/marketplace/MarketplacePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/hr" element={<HRPage />} />
            <Route path="/hr/employee/:id" element={<EmployeeProfilePage />} />
            <Route path="/crm" element={<CRMPage />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/networking" element={<NetworkingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
