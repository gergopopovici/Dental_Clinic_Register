import './i18n/i18n';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import PageNotFound from './pages/PageNotFound';
import EmailConfirmation from './pages/EmailConfirmation';
import Login from './pages/Login';
import ProfileSettings from './pages/ProfileSettings';

import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import DashboardLayout from './components/DashboardLayout';

import { UserProvider } from './context/UserContext';

import AdminDashboard from './pages/Admin';
import Appointments from './pages/Appointments/Appointments';
import TreatmentPlansPage from './pages/TreatmentPlansPage';
import BracesModalPage from './pages/BracesModalPage';
import Dashboard from './pages/Dashboard';
import Schedules from './pages/Schedules/Schedules';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        {' '}
        <Router>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<EmailConfirmation />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <DashboardLayout>
                    <Outlet />
                  </DashboardLayout>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/treatment-plans" element={<TreatmentPlansPage />} />
                <Route path="/treatment-plans/:id/braces" element={<BracesModalPage />} />
                <Route path="/schedules" element={<Schedules />} />
              </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
