import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cancelAppointmentByPatient, getPatientAppointments } from '../../services/AppointmentService';
import { Alert, Box, Button, CircularProgress, Grid, Snackbar, Typography } from '@mui/material';
import PatientBookModal from '../../components/PatientBookModal';
import AppointmentCard from '../../components/AppointmentCard';

interface PatientDashboardProps {
  userId: number;
}

function PatientDashboard({ userId }: PatientDashboardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['patientAppointments', userId],
    queryFn: () => getPatientAppointments(userId),
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: number) => cancelAppointmentByPatient(userId, appointmentId),
    onSuccess: () => {
      setSnackbar({ open: true, message: t('appointmentCancelled'), severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments', userId] });
    },
    onError: (error: any) => {
      const backendErrorKey = error.response?.data?.message || 'error.unknown';
      setSnackbar({ open: true, message: t(backendErrorKey), severity: 'error' });
    },
  });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t('myAppointments')}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setIsBookModalOpen(true)}>
          + {t('bookNewAppointment')}
        </Button>
      </Box>
      {isLoading && <CircularProgress sx={{ color: 'white', display: 'block', mx: 'auto', mt: 4 }} />}
      {isError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

      {appointments && appointments.length === 0 && !isLoading && (
        <Typography sx={{ color: '#aaa' }}>{t('noAppointmentsFound')}</Typography>
      )}
      <Grid container spacing={3}>
        {appointments?.map((apt) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={apt.id}>
            <AppointmentCard
              appointment={apt}
              userRole="PATIENT"
              onCancel={
                apt.status === 'PENDING' || apt.status === 'CONFIRMED' ? (id) => cancelMutation.mutate(id) : undefined
              }
            />
          </Grid>
        ))}
      </Grid>
      <PatientBookModal open={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} userId={userId} />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export default PatientDashboard;
