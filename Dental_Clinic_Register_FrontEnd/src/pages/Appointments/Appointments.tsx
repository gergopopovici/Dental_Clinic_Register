import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTranslation } from 'react-i18next';
import PatientAppointments from './PatientAppointments';
import DoctorAppointments from './DoctorAppointments';

function Appointments() {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const { t } = useTranslation();

  const isDoctor = user?.roles?.includes('ROLE_DOCTOR');
  const isPatient = user?.roles?.includes('ROLE_PATIENT');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (!isDoctor && !isPatient) {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, isLoading, isDoctor, isPatient]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.id || (!isDoctor && !isPatient)) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t('appointments')}
          </Typography>
          <Typography variant="body1">
            {isDoctor ? t('doctorAppointmentsSubtitle') : t('appointmentsSubtitle')}
          </Typography>
        </Box>
        {isDoctor ? <DoctorAppointments userId={user.id} /> : <PatientAppointments userId={user.id} />}
      </Box>
    </Box>
  );
}

export default Appointments;
