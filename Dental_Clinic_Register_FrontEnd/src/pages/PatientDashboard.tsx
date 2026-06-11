import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import AppointmentCard from '../components/AppointmentCard';
import { cancelAppointmentByPatient, getPatientAppointments } from '../services/AppointmentService';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { ResponseAppointmentDTO } from '../models/Appointment';
import { TreatmentPlanDTO } from '../models/TreatmentPlan';

interface PatientDashboardProps {
  userId: number;
}

function PatientDashboard({ userId }: PatientDashboardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  const {
    data: appointments,
    isLoading: isAppointmentsLoading,
    isError: isAppointmentsError,
  } = useQuery<ResponseAppointmentDTO[]>({
    queryKey: ['patientAppointments', userId],
    queryFn: () => getPatientAppointments(userId),
  });

  const { data: treatmentPlans, isLoading: isPlansLoading } = useQuery<TreatmentPlanDTO[]>({
    queryKey: ['patientTreatmentPlans', userId],
    queryFn: () => getPlansByPatientId(userId),
  });

  const nextAppointment = useMemo(() => {
    if (!appointments) return null;
    const now = new Date().getTime();
    const upcoming = appointments
      .filter((a) => a.status === 'CONFIRMED' && new Date(a.startTime).getTime() > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return upcoming.length > 0 ? upcoming[0] : null;
  }, [appointments]);

  const activePlan = useMemo(() => {
    if (!treatmentPlans || treatmentPlans.length === 0) return null;
    return treatmentPlans[0];
  }, [treatmentPlans]);

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: number) => cancelAppointmentByPatient(userId, appointmentId),
    onSuccess: async () => {
      setSnackbar({
        open: true,
        message: t('appointmentCancelled'),
        severity: 'success',
      });
      await queryClient.invalidateQueries({ queryKey: ['patientAppointments', userId] });
    },
    onError: (error: any) => {
      const backendErrorKey = error.response?.data?.message || 'error.unknown';
      setSnackbar({ open: true, message: t(backendErrorKey), severity: 'error' });
    },
  });

  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t('dashboard')}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('nextAppointment')}</Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/appointments')}
              sx={{ '&:focus': { outline: 'none' } }}
            >
              {`${t('viewAll').toUpperCase()} >`}
            </Button>
          </Box>

          {isAppointmentsLoading && <CircularProgress sx={{ display: 'block' }} />}
          {isAppointmentsError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

          {!isAppointmentsLoading && !isAppointmentsError && !nextAppointment && (
            <Typography sx={{ fontStyle: 'italic' }}>{t('noUpcomingAppointments')}</Typography>
          )}

          {!isAppointmentsLoading && !isAppointmentsError && nextAppointment && (
            <AppointmentCard
              appointment={nextAppointment}
              userRole="PATIENT"
              onCancel={(id) => {
                setAppointmentToCancel(id);
                setCancelDialogOpen(true);
              }}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{t('activePlans')}</Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/treatment-plans')}
              sx={{ '&:focus': { outline: 'none' } }}
            >
              {`${t('viewAll').toUpperCase()} >`}
            </Button>
          </Box>

          {isPlansLoading && <CircularProgress sx={{ display: 'block' }} />}

          {!isPlansLoading && !activePlan && <Typography sx={{ fontStyle: 'italic' }}>{t('noActivePlans')}</Typography>}

          {!isPlansLoading && activePlan && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {activePlan.planName || t('planName')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {t('status')}: {t(activePlan.status)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/treatment-plans/${activePlan.id}/braces`)}
                  sx={{ textTransform: 'uppercase', '&:focus': { outline: 'none' } }}
                >
                  {t('view3DModel')}
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>{t('cancelAppointment')}</DialogTitle>
        <DialogContent>
          <Typography>{t('confirmCancelPatientMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} sx={{ '&:focus': { outline: 'none' } }}>
            {t('back')}
          </Button>
          <Button
            color="error"
            onClick={async () => {
              if (appointmentToCancel) await cancelMutation.mutateAsync(appointmentToCancel);
              setCancelDialogOpen(false);
            }}
            sx={{ '&:focus': { outline: 'none' } }}
          >
            {t('confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PatientDashboard;
