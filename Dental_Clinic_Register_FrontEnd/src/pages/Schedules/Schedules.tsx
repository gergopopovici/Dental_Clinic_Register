import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import DoctorScheduleManager from './DoctorScheduleManager';
import AdminHolidayManager from './AdminHolidayManager';

function Schedules() {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const { t } = useTranslation();

  const isDoctor = user?.roles?.includes('ROLE_DOCTOR');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isDoctor && !isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, isLoading, isDoctor, isAdmin]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.id || (!isDoctor && !isAdmin)) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t('scheduleManagement')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isDoctor ? t('doctorScheduleSubtitle') : t('adminHolidaySubtitle')}
          </Typography>
        </Box>
        {isDoctor ? <DoctorScheduleManager userId={user.id} /> : <AdminHolidayManager />}
      </Box>
    </Box>
  );
}

export default Schedules;
