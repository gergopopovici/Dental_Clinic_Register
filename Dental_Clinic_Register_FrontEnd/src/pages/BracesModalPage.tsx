import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import DenturesScene from '../components/DenturesScene';
import { useUser } from '../context/UserContext';

function BracesModelPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();

  const planId = parseInt(id || '0', 10);

  const isPatient = user?.roles?.includes('ROLE_PATIENT');
  const isDoctor = user?.roles?.includes('ROLE_DOCTOR');
  const isReadOnly = isPatient && !isDoctor;

  if (!planId) {
    return (
      <Typography color="error" sx={{ p: 4 }}>
        {}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#121212', minHeight: '100vh', color: 'white' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, color: '#aaa' }}>
        {t('back', 'Back')}
      </Button>

      <Typography variant="h4" gutterBottom fontWeight="bold">
        {t('bracesConfigurator', '3D Braces Configurator')}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        {t('managingPlanId', 'Plan #')}
        {planId}
      </Typography>

      <DenturesScene treatmentPlanId={planId} readOnly={isReadOnly} />
    </Box>
  );
}

export default BracesModelPage;
