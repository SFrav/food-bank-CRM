import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CRMLayout } from "@/components/layout/CRMLayout";
import Forbidden from "./pages/Forbidden";
import Index from "./Index";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/CalendarPage";
import Beneficiaries from "./pages/Beneficiaries";
import Services from "./pages/Services";
import Referrals from "./pages/Referrals";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
// import OperationalDashboard from "./pages/DashboardOperational";
// import AccountManagerDashboard from "./pages/DashboardAccountManager";
// import StaffDashboard from "./pages/DashboardStaff";
import PendingApproval from "./pages/PendingApproval";
import AdminOther from "./pages/AdminOther";
import AdminUsers from "./pages/AdminUsers";
import AdminLogs from "./pages/AdminLogs";
import Auth from "./pages/Auth";
// import ManagerSalesSummary from "./pages/ManagerSalesSummary";
// import HeadSalesSummary from "./pages/HeadSalesSummary";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";

const queryClient = new QueryClient(); // Force rebuild to clear cache

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />

          {/* Admin specific routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <CRMLayout>
                  <AdminDashboard />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin', 'head']}>
                <CRMLayout>
                  <AdminUsers />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/logs" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <CRMLayout>
                  <AdminLogs />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <CRMLayout>
                  <AdminOther />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />      
          {/* Dashboards */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['staff', 'account_manager', 'manager', 'head', 'admin']}>
                <CRMLayout>
                  <Dashboard />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          {/* Main routes */}
          <Route path="/tasks" element={
            <ProtectedRoute>
              <CRMLayout>
                <Tasks />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <CRMLayout>
                <CalendarPage />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <CRMLayout>
                <Notifications />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/beneficiaries" element={
            <ProtectedRoute>
              <CRMLayout>
                <Beneficiaries />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/services" element={
            <ProtectedRoute>
              <CRMLayout>
                <Services />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/referrals" element={
            <ProtectedRoute>
              <CRMLayout>
                <Referrals />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <CRMLayout>
                <Settings />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <CRMLayout>
                <Profile />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/pending" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['pending']}>
                <PendingApproval />
              </RoleBasedRoute>
            </ProtectedRoute>
          } />    
          <Route path="/auth" element={<Auth />} />
          <Route path="/403" element={<Forbidden />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
