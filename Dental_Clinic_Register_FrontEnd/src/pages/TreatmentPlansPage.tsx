import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import DoctorTreatmentPlansView from '../components/DoctorTreatmentPlansView';
import PatientTreatmentPlansView from '../components/PatientTreatmentPlansView';

function TreatmentPlansPage() {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'black' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.id || (!isDoctor && !isPatient)) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: '2c2c2c',
        boxSizing: 'border-box',
        color: 'white',
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t('treatmentPlans')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#aaaaaa' }}>
            {isDoctor ? t('doctorTreatmentPlansSubtitle') : t('patientTreatmentPlansSubtitle')}
          </Typography>
        </Box>

        {isDoctor ? <DoctorTreatmentPlansView doctorId={user.id} /> : <PatientTreatmentPlansView patientId={user.id} />}
      </Box>
    </Box>
  );
}

export default TreatmentPlansPage;
