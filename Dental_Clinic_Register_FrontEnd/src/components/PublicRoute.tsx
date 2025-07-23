import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Box, CircularProgress } from '@mui/material';

export function PublicRoute() {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  const publicOnlyPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify'];

  if (user && publicOnlyPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
