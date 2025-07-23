import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Box, CircularProgress } from '@mui/material';

export function ProtectedRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    console.log('ProtectedRoute: User data is loading, showing spinner.');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: User not authenticated after loading, redirecting to /login.');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: User authenticated, allowing access to protected route.');
  return <Outlet />;
}
