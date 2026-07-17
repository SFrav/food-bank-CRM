import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from '@/hooks/useNotificationsContext';
import { CRMLayout } from "@/components/layout/CRMLayout";
import Forbidden from "./pages/Forbidden";
import Index from "./Index";
import PendingApproval from "./pages/PendingApproval";
import Auth from "./pages/Auth";
import Notifications from "./pages/Notifications";
import Beneficiaries from "./pages/Beneficiaries";
// import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
// import AdminUsers from "./pages/AdminUsers";
// import AdminLogs from "./pages/AdminLogs";
// import AdminOther from "./pages/AdminOther";
// import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";

const queryClient = new QueryClient(); // Force rebuild to clear cache

export const lazyPages = {
  Settings: lazy(() => import('./pages/Settings')),
  Profile:   lazy(() => import('./pages/Profile')),
  AdminUsers: lazy(() => import('./pages/AdminUsers')),
  AdminLogs: lazy(() => import('./pages/AdminLogs')),
  AdminOther: lazy(() => import('./pages/AdminOther')),
  // Services: lazy(() => import('./pages/Services')),
  // Calendar: lazy(() => import('./pages/Calendar')),
  // Tasks: lazy(() => import('./pages/Tasks')),
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <NotificationProvider>
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
                    <Suspense fallback={<div className="p-4">Loading User Data &hellip;</div>}>
                    <lazyPages.AdminUsers/>
                  </Suspense>
                    {/* <AdminUsers /> */}
                  </CRMLayout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <CRMLayout>
                    <Suspense fallback={<div className="p-4">Loading Logs &hellip;</div>}>
                    <lazyPages.AdminLogs/>
                  </Suspense>
                    {/* <AdminLogs /> */}
                  </CRMLayout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['admin']}>
                  <CRMLayout>
                    <Suspense fallback={<div className="p-4">Loading Org. Management &hellip;</div>}>
                    <lazyPages.AdminOther/>
                  </Suspense>
                    {/* <AdminOther /> */}
                  </CRMLayout>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />      
            {/* Dashboards */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['referrer', 'volunteer', 'staff', 'branch_manager', 'manager', 'head', 'admin']}>
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
                  <Calendar />
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
                  <Beneficiaries />
                </CRMLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <CRMLayout>
                  <Suspense fallback={<div className="p-4">Loading Settings &hellip;</div>}>
                    <lazyPages.Settings/>
                  </Suspense>
                  {/* <Settings /> */}
                </CRMLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <CRMLayout>
                  <Suspense fallback={<div className="p-4">Loading Profile &hellip;</div>}>
                    <lazyPages.Profile/>
                  </Suspense>
                  {/* <Profile /> */}
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
        </NotificationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
