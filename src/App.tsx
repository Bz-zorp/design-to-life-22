import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppointmentsProvider } from "@/context/AppointmentsContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useRole } from "@/hooks/useRole";
import AppLayout from "./components/AppLayout";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import Hospitals from "./pages/Hospitals";
import Reservations from "./pages/Reservations";
import MedicalRecords from "./pages/MedicalRecords";
import HealthCamps from "./pages/HealthCamps";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHospitals from "./pages/admin/AdminHospitals";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminAppointments from "./pages/admin/AdminAppointments";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LocationProvider>
            <AppointmentsProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/hospitals" element={<Hospitals />} />
                    <Route path="/reservations" element={<Reservations />} />
                    <Route path="/records" element={<MedicalRecords />} />
                    <Route path="/health-camps" element={<HealthCamps />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/support" element={<Support />} />
                  </Route>
                  <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/hospitals" element={<AdminHospitals />} />
                    <Route path="/admin/doctors" element={<AdminDoctors />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/reservations" element={<AdminReservations />} />
                    <Route path="/admin/appointments" element={<AdminAppointments />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AppointmentsProvider>
          </LocationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
