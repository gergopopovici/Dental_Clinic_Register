import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import PageNotFound from './pages/PageNotFound';
import EmailConfirmation from './pages/EmailConfirmation';
import Login from './pages/Login';
import ProfileSettings from './pages/ProfileSettings';

import { ProtectedRoute } from './components/ProtectedRoute'; // Your updated ProtectedRoute
import { PublicRoute } from './components/PublicRoute'; // Your updated PublicRoute
import DashboardLayout from './components/DashboardLayout'; // Your DashboardLayout

import { UserProvider } from './context/UserContext';

import { Box, Typography } from '@mui/material';

const DashboardPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Dashboard Content
    </Typography>
    <Typography>
      Welcome to your patient dashboard! This is where you can see an overview of your health, upcoming appointments,
      and more.
    </Typography>
  </Box>
);

const AppointmentsPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Appointments
    </Typography>
    <Typography>Manage your appointments here. View past, current, and schedule new ones.</Typography>
  </Box>
);

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
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/profile" element={<ProfileSettings />} />
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
