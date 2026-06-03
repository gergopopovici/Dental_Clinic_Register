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

const getSortString = (apt: ResponseAppointmentDTO) => {
  if (apt.startTime) return apt.startTime;
  if (apt.requestedDate) {
    const hour =
      apt.timePreference === 'MORNING' ? '09:00:00' : apt.timePreference === 'EVENING' ? '18:00:00' : '14:00:00';
    return `${apt.requestedDate}T${hour}`;
  }
  return '0000-00-00T00:00:00';
};

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
      .filter((a) => {
        if (a.status === 'PENDING') return true;
        if (a.status === 'CONFIRMED' && new Date(getSortString(a)).getTime() > now) return true;
        return false;
      })
      .sort((a, b) => getSortString(a).localeCompare(getSortString(b)));

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
    <Box sx={{ color: 'white' }}>
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
            <Typography variant="h6" sx={{ color: 'white' }}>
              {t('nextAppointment')}
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/appointments')}
              sx={{ '&:focus': { outline: 'none' } }}
            >
              {`${t('viewAll').toUpperCase()} >`}
            </Button>
          </Box>

          {isAppointmentsLoading && <CircularProgress sx={{ color: 'white', display: 'block' }} />}
          {isAppointmentsError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

          {!isAppointmentsLoading && !isAppointmentsError && !nextAppointment && (
            <Typography sx={{ color: '#aaa', fontStyle: 'italic' }}>{t('noUpcomingAppointments')}</Typography>
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
            <Typography variant="h6" sx={{ color: 'white' }}>
              {t('activePlans')}
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => navigate('/treatment-plans')}
              sx={{ '&:focus': { outline: 'none' } }}
            >
              {`${t('viewAll').toUpperCase()} >`}
            </Button>
          </Box>

          {isPlansLoading && <CircularProgress sx={{ color: 'white', display: 'block' }} />}

          {!isPlansLoading && !activePlan && (
            <Typography sx={{ color: '#aaa', fontStyle: 'italic' }}>{t('noActivePlans')}</Typography>
          )}

          {!isPlansLoading && activePlan && (
            <Card sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', border: '1px solid #2196f3', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#6fb6fc', mb: 1, fontWeight: 'bold' }}>
                  {activePlan.planName || t('planName')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
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

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        slotProps={{ paper: { sx: { bgcolor: '#1e1e1e', color: 'white' } } }}
      >
        <DialogTitle>{t('cancelAppointment')}</DialogTitle>
        <DialogContent>
          <Typography>{t('confirmCancelPatientMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} sx={{ color: '#aaa', '&:focus': { outline: 'none' } }}>
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
