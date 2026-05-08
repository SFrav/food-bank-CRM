import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CRMLayout } from "@/components/layout/CRMLayout";
import Forbidden from "./pages/Forbidden";
import Index from "./pages/Index";
import Activities from "./pages/Activities";
import CalendarPage from "./pages/CalendarPage";
import Contacts from "./pages/Contacts";
import Customers from "./pages/Customers";
import EndUsers from "./pages/EndUsers";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import StrategicDashboard from "./pages/StrategicDashboard";
import OperationalDashboard from "./pages/OperationalDashboard";
import PendingApproval from "./pages/PendingApproval";
import AccountManagerDashboard from "./pages/AccountManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOther from "./pages/AdminOther";
import AdminUsers from "./pages/AdminUsers";
import AdminLogs from "./pages/AdminLogs";
import Auth from "./pages/Auth";
import ManagerSalesSummary from "./pages/ManagerSalesSummary";
import HeadSalesSummary from "./pages/HeadSalesSummary";
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
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <CRMLayout>
                  <AdminDashboard />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/sales-dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['account_manager', 'staff']}>
                <CRMLayout>
                  <AccountManagerDashboard />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          {/* Head-specific routes */}
          <Route path="/head/executive-dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['head', 'admin']}>
                <CRMLayout>
                  <StrategicDashboard />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Redirect old executive-dashboard to new head route */}
          <Route path="/executive-dashboard" element={
            <Navigate to="/head/executive-dashboard" replace />
          } />
          <Route path="/team-dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['manager', 'head', 'admin']}>
                <CRMLayout>
                  <OperationalDashboard />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/activities" element={
            <ProtectedRoute>
              <CRMLayout>
                <Activities />
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
          <Route path="/contacts" element={
            <ProtectedRoute>
              <CRMLayout>
                <Contacts />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <CRMLayout>
                <Customers />
              </CRMLayout>
            </ProtectedRoute>
          } />
          <Route path="/end-users" element={
            <ProtectedRoute>
              <CRMLayout>
                <EndUsers />
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
          <Route path="/am/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['account_manager', 'staff']}>
                <CRMLayout>
                  <AccountManagerDashboard />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          {/* Backward compatibility redirects for old dashboard routes */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute>
              <Navigate to="/admin-dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/account-manager" element={
            <ProtectedRoute>
              <Navigate to="/sales-dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/strategic" element={
            <ProtectedRoute>
              <Navigate to="/executive-dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/operational" element={
            <ProtectedRoute>
              <Navigate to="/team-dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/manager/team-dashboard" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['manager', 'head', 'admin']}>
                <CRMLayout>
                  <OperationalDashboard />
                </CRMLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <CRMLayout>
                  <Settings />
                </CRMLayout>
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
