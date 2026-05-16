import React, { useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import DoctorDashboard from './Appointments/DoctorDashboard';
import PatientDashboard from './Appointments/PatientDashboard';

function Dashboard() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  const isDoctor = user?.roles?.includes('ROLE_DOCTOR');
  const isPatient = user?.roles?.includes('ROLE_PATIENT');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setTimeout(() => navigate('/login'), 1000);
      } else if (isAdmin) {
        setTimeout(() => navigate('/admin'), 1000);
      }
    }
  }, [user, navigate, isLoading, isAdmin]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'black' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.id || (!isDoctor && !isPatient)) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: '100%', boxSizing: 'border-box' }}>
      {isDoctor ? <DoctorDashboard userId={user.id} /> : <PatientDashboard userId={user.id} />}
    </Box>
  );
}

export default Dashboard;
