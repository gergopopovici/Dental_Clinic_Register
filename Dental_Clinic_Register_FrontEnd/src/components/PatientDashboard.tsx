import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Divider,
  Chip,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { getPatientAppointments } from '../services/AppointmentService';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { useUser } from '../context/UserContext';

function PatientDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const userId = user?.id;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const { data: appointments, isLoading: isLoadingAppts } = useQuery({
    queryKey: ['patientAppointments', userId],
    queryFn: () => getPatientAppointments(userId!),
    enabled: !!userId,
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['myTreatmentPlans', userId],
    queryFn: () => getPlansByPatientId(userId!),
    enabled: !!userId,
  });

  const nextAppointment = useMemo(() => {
    if (!appointments) return null;
    const now = new Date().getTime();
    const upcoming = appointments.filter((apt) => {
      const aptTime = new Date(apt.startTime || apt.requestedDate).getTime();
      return aptTime > now && (apt.status === 'CONFIRMED' || apt.status === 'PENDING');
    });
    upcoming.sort(
      (a, b) => new Date(a.startTime || a.requestedDate).getTime() - new Date(b.startTime || b.requestedDate).getTime(),
    );
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [appointments]);

  const activePlans = useMemo(() => {
    if (!plans) return [];
    return plans.filter((p) => p.status === 'ACTIVE' || p.status === 'SUSPENDED');
  }, [plans]);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (isLoadingAppts || isLoadingPlans) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
        {t('welcomeBack')}, {user?.firstName || t('patient')}!
      </Typography>
      <Typography variant="body1" sx={{ color: '#aaa', mb: 4 }}>
        {t('dashboardSubtitle')}
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#1e1e1e', border: '1px solid #333', borderRadius: 2, mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarMonthIcon color="primary" />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {t('nextAppointment')}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: '#333', mb: 2 }} />

              {nextAppointment ? (
                <Box>
                  <Typography variant="h5" sx={{ color: '#4fc3f7', fontWeight: 'bold', mb: 1 }}>
                    {new Date(nextAppointment.startTime || nextAppointment.requestedDate).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {t('doctor')}: {nextAppointment.doctorName || t('pending')}
                  </Typography>
                  <Chip
                    label={t(nextAppointment.status)}
                    color={nextAppointment.status === 'CONFIRMED' ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 2 }}
                  />
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: '#aaa' }}>
                  {t('noUpcomingAppointments')}
                </Typography>
              )}

              <Button
                variant="text"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 3, p: 0 }}
                onClick={() => navigate('/appointments')}
              >
                {t('viewAllAppointments')}
              </Button>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            {t('quickActions')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/appointments')}>
              {t('requestNewAppointment')}
            </Button>
            <Button
              variant="outlined"
              sx={{ color: 'white', borderColor: '#444' }}
              onClick={() => navigate('/profile')}
            >
              {t('updateProfile')}
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#1e1e1e', border: '1px solid #333', borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MedicalServicesIcon color="success" />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {t('activePlans')}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: '#333', mb: 2 }} />

              {activePlans.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activePlans.map((plan) => (
                    <Box key={plan.id} sx={{ p: 2, bgcolor: '#2c2c2c', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                          {plan.planName}
                        </Typography>
                        <Chip label={t(plan.status)} color="success" size="small" variant="outlined" />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#aaa' }}>
                        {t('startDate')}: {plan.startDate}
                      </Typography>
                      {plan.planName.toLowerCase().match(/(brace|aparat|ortho|orto|fogszab)/i) && (
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          sx={{ mt: 1 }}
                          onClick={() => navigate(`/treatment-plans/${plan.id}/braces`)}
                        >
                          {t('view3DModel')}
                        </Button>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: '#aaa' }}>
                  {t('noActivePlans')}
                </Typography>
              )}

              <Button
                variant="text"
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 3, p: 0 }}
                onClick={() => navigate('/treatment-plans')}
              >
                {t('viewAllPlans')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PatientDashboard;
