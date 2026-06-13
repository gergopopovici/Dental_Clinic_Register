import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { cancelAppointmentByPatient, getPatientAppointments } from '../../services/AppointmentService';
import PatientBookModal from '../../components/PatientBookModal';
import AppointmentCard from '../../components/AppointmentCard';
import { ResponseAppointmentDTO } from '../../models/Appointment';

interface PatientAppointmentsProps {
  userId: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

function PatientAppointments({ userId }: PatientAppointmentsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState<number>(0);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<ResponseAppointmentDTO[]>({
    queryKey: ['patientAppointments', userId],
    queryFn: () => getPatientAppointments(userId),
  });

  const processedLists = useMemo(() => {
    if (!appointments) return { upcoming: [] as ResponseAppointmentDTO[], history: [] as ResponseAppointmentDTO[] };

    const now = new Date().getTime();

    const upcoming = [...appointments]
      .filter((a) => a.status === 'CONFIRMED' && new Date(a.startTime).getTime() > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const history = [...appointments]
      .filter((a) => {
        if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status)) return true;
        if (a.status === 'CONFIRMED' && new Date(a.startTime).getTime() <= now) return true;
        return false;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return { upcoming, history };
  }, [appointments]);

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: number) => cancelAppointmentByPatient(userId, appointmentId),
    onSuccess: async () => {
      setSnackbar({ open: true, message: t('appointmentCancelled'), severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['patientAppointments', userId] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const backendErrorKey = err.response?.data?.message || 'error.unknown';
      setSnackbar({ open: true, message: t(backendErrorKey), severity: 'error' });
    },
  });

  const currentDisplayList = tabValue === 0 ? processedLists.upcoming : processedLists.history;

  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t('myAppointments')}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setIsBookModalOpen(true)}>
          + {t('bookNewAppointment')}
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue: number) => setTabValue(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={t('upcoming')} />
          <Tab label={t('history')} />
        </Tabs>
      </Box>

      {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />}
      {isError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

      {!isLoading && !isError && currentDisplayList.length === 0 && (
        <Typography sx={{ fontStyle: 'italic', mt: 2 }}>
          {tabValue === 0 ? t('noUpcomingAppointments') : t('noPastAppointments')}
        </Typography>
      )}

      <Grid container spacing={3}>
        {currentDisplayList.map((apt: ResponseAppointmentDTO) => (
          <Grid key={apt.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <AppointmentCard
              appointment={apt}
              userRole="PATIENT"
              onCancel={
                apt.status === 'CONFIRMED' && tabValue === 0
                  ? (id: number) => {
                      setAppointmentToCancel(id);
                      setCancelDialogOpen(true);
                    }
                  : undefined
              }
            />
          </Grid>
        ))}
      </Grid>

      <PatientBookModal open={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} userId={userId} />

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>{t('cancelAppointment')}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Typography variant="body1">{t('confirmCancelPatientMessage')}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)}>{t('back')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (appointmentToCancel) await cancelMutation.mutateAsync(appointmentToCancel);
              setCancelDialogOpen(false);
            }}
          >
            {t('confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="standard"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PatientAppointments;
