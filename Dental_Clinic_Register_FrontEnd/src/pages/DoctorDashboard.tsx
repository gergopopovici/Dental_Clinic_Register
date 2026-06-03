import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography, Card, CardContent, Grid } from '@mui/material';
import AppointmentCard from '../components/AppointmentCard';
import { getDoctorDailyAppointments } from '../services/AppointmentService';
import { ResponseAppointmentDTO } from '../models/Appointment'; // Frissítsd az import útvonalát!

interface DoctorDashboardProps {
  userId: number;
}

const getSortString = (apt: ResponseAppointmentDTO) => {
  if (apt.startTime) return apt.startTime;
  if (apt.requestedDate) {
    const hour =
      apt.timePreference === 'MORNING' ? '09:00:00' : apt.timePreference === 'EVENING' ? '18:00:00' : '14:00:00';
    return `${apt.requestedDate}T${hour}`;
  }
  return '0000-00-00T00:00:00';
};

function DoctorDashboard({ userId }: DoctorDashboardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<ResponseAppointmentDTO[]>({
    queryKey: ['doctorAppointments', userId, today],
    queryFn: () => getDoctorDailyAppointments(userId, today),
  });

  const { pending, nextAppointments, totalToday } = useMemo(() => {
    if (!appointments) return { pending: [], nextAppointments: [], totalToday: 0 };

    const now = new Date().getTime();

    const pendingList = appointments.filter((a) => a.status === 'PENDING');

    const confirmedList = appointments
      .filter((a) => a.status === 'CONFIRMED' && new Date(getSortString(a)).getTime() > now)
      .sort((a, b) => getSortString(a).localeCompare(getSortString(b)));

    return {
      pending: pendingList,
      nextAppointments: confirmedList.slice(0, 2),
      totalToday: appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length,
    };
  }, [appointments]);

  return (
    <Box sx={{ color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t('dashboard')}
        </Typography>
        <Button variant="text" size="small" onClick={() => navigate('/appointments')}>
          {`${t('viewAll').toUpperCase()} >`}
        </Button>
      </Box>

      {isLoading && <CircularProgress sx={{ color: 'white', display: 'block', mb: 4 }} />}
      {isError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

      {!isLoading && !isError && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ bgcolor: '#1e1e1e', color: 'white', border: '1px solid #333', mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#aaa', mb: 1 }}>
                  {t('dailySchedule')}
                </Typography>
                <Typography variant="h5">
                  {totalToday > 0 ? t('todaySummary', { count: totalToday }) : t('noAppointmentsToday')}
                </Typography>
              </CardContent>
            </Card>

            {pending.length > 0 && (
              <Card sx={{ bgcolor: 'rgba(255, 183, 77, 0.1)', border: '1px solid #ffb74d' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ffb74d', mb: 1, fontWeight: 'bold' }}>
                    {t('pendingRequests')}
                  </Typography>
                  <Typography sx={{ color: 'white', mb: 2 }}>
                    {t('pendingRequestsCount', { count: pending.length })}
                  </Typography>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => navigate('/appointments')}
                    sx={{ '&:focus': { outline: 'none' } }}
                  >
                    {t('viewAll')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {t('nextAppointment')}
              </Typography>
            </Box>

            {nextAppointments.length === 0 ? (
              <Typography sx={{ color: '#aaa', fontStyle: 'italic' }}>
                {totalToday > 0 ? t('noMoreAppointmentsToday') : t('noScheduledAppointments')}
              </Typography>
            ) : (
              <Grid container spacing={2} direction="column">
                {nextAppointments.map((apt) => (
                  <Grid key={apt.id}>
                    <AppointmentCard appointment={apt} userRole="DOCTOR" />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default DoctorDashboard;
