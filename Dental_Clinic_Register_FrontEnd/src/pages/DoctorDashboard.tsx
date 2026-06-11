import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography, Card, CardContent, Grid } from '@mui/material';
import AppointmentCard from '../components/AppointmentCard';
import { getDoctorDailyAppointments } from '../services/AppointmentService';
import { ResponseAppointmentDTO } from '../models/Appointment';

interface DoctorDashboardProps {
  userId: number;
}

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

  const { nextAppointments, totalToday } = useMemo(() => {
    if (!appointments) return { nextAppointments: [], totalToday: 0 };

    const now = new Date().getTime();

    const confirmedList = appointments
      .filter((a) => a.status === 'CONFIRMED' && new Date(a.startTime).getTime() > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      nextAppointments: confirmedList.slice(0, 2),
      totalToday: appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length,
    };
  }, [appointments]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t('dashboard')}
        </Typography>
        <Button variant="text" size="small" onClick={() => navigate('/appointments')}>
          {`${t('viewAll').toUpperCase()} >`}
        </Button>
      </Box>

      {isLoading && <CircularProgress sx={{ display: 'block', mb: 4 }} />}
      {isError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

      {!isLoading && !isError && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('dailySchedule')}
                </Typography>
                <Typography variant="h5">
                  {totalToday > 0 ? t('todaySummary', { count: totalToday }) : t('noAppointmentsToday')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{t('nextAppointment')}</Typography>
            </Box>

            {nextAppointments.length === 0 ? (
              <Typography sx={{ fontStyle: 'italic' }}>
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
