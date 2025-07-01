import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import PageNotFound from './pages/PageNotFound';
import EmailConfirmation from './pages/EmailConfirmation';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<EmailConfirmation />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Page (Coming Soon)</div>} />
          <Route path="/" element={<div>Home Page (Coming Soon)</div>} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
