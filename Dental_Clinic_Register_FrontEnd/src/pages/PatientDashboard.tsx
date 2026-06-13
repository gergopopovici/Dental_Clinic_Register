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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AppointmentCard from '../components/AppointmentCard';
import { cancelAppointmentByPatient, getPatientAppointments } from '../services/AppointmentService';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { ResponseAppointmentDTO } from '../models/Appointment';
import { TreatmentPlanDTO, PlanAppointmentDTO } from '../models/TreatmentPlan';

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

  const getFileUrl = (url: string) => `http://localhost:8080/api/files/${url.split('/').pop()}`;

  const renderAppointmentHistory = (planAppointments?: PlanAppointmentDTO[]) => {
    if (!planAppointments || planAppointments.length === 0)
      return <Typography variant="body2">{t('noAppointmentsYet', 'No appointments yet.')}</Typography>;
    return [...planAppointments]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .map((apt) => (
        <Box
          key={apt.id}
          sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {new Date(apt.startTime).toLocaleString()} - {apt.serviceName}
          </Typography>
          {apt.summary ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">{apt.summary.notes}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {apt.summary.audioUrl && (
                  <Button
                    size="small"
                    startIcon={<AudiotrackIcon />}
                    href={getFileUrl(apt.summary.audioUrl)}
                    target="_blank"
                  >
                    {t('audio')}
                  </Button>
                )}
                {apt.summary.imageUrl && (
                  <Button
                    size="small"
                    startIcon={<ImageIcon />}
                    href={getFileUrl(apt.summary.imageUrl)}
                    target="_blank"
                  >
                    {t('image')}
                  </Button>
                )}
                {apt.summary.documentUrl && (
                  <Button
                    size="small"
                    startIcon={<PictureAsPdfIcon />}
                    href={getFileUrl(apt.summary.documentUrl)}
                    target="_blank"
                  >
                    {t('document')}
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Typography variant="caption">{t('noSummaryYet', 'No summary attached.')}</Typography>
          )}
        </Box>
      ));
  };

  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t('dashboard')}
        </Typography>
      </Box>

      <Grid container spacing={4} alignItems="flex-start">
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
                  {activePlan.primaryServiceName || t('planName')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {t('status')}: {t(activePlan.status)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/treatment-plans/${activePlan.id}/braces`)}
                  sx={{ textTransform: 'uppercase', '&:focus': { outline: 'none' }, mb: 2 }}
                >
                  {t('view3DModel')}
                </Button>

                <Accordion variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="bold">
                      {t('appointmentHistory', 'Appointment History & Summaries')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>{renderAppointmentHistory(activePlan.appointments)}</AccordionDetails>
                </Accordion>
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
        <Alert severity={snackbar.severity} variant="standard">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PatientDashboard;
