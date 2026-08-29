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
  LinearProgress,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AppointmentCard from '../components/AppointmentCard';
import PatientServiceList from '../components/PatientServiceList';
import { cancelAppointmentByPatient, getPatientAppointments } from '../services/AppointmentService';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { getAllServices } from '../services/ProvidedServiceService';
import { ResponseAppointmentDTO } from '../models/Appointment';
import { TreatmentPlanDTO, PlanAppointmentDTO } from '../models/TreatmentPlan';
import PanoramaViewerModal from '../components/PanoramaViewerModal';

interface PatientDashboardProps {
  userId: number;
}

function PatientDashboard({ userId }: PatientDashboardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  const [isPanoramaModalOpen, setIsPanoramaModalOpen] = useState(false);
  const [selectedPlanForPanorama, setSelectedPlanForPanorama] = useState<TreatmentPlanDTO | null>(null);

  const openPanoramaModal = (plan: TreatmentPlanDTO) => {
    setSelectedPlanForPanorama(plan);
    setIsPanoramaModalOpen(true);
  };

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

  const { data: allServices } = useQuery({
    queryKey: ['allServices'],
    queryFn: getAllServices,
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
    const active = treatmentPlans.find(plan => plan.status === 'ACTIVE');
    return active || null; 
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

  const getLocalizedServiceName = (serviceName: string) => {
    if (!allServices) return serviceName;
    const service = allServices.find((s) => s.nameEn === serviceName || s.nameHu === serviceName || s.nameRo === serviceName);
    if (!service) return serviceName;
    if (i18n.language.startsWith('hu')) return service.nameHu;
    if (i18n.language.startsWith('ro')) return service.nameRo;
    return service.nameEn;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 33) return 'error';
    if (progress < 66) return 'warning';
    if (progress < 100) return 'primary';
    return 'success';
  };

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
            {new Date(apt.startTime).toLocaleString()} - {getLocalizedServiceName(apt.serviceName)}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {activePlan.planType ? t(`plan.${activePlan.planType}`) : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {activePlan.requires3DModel && (
                      <Button
                        variant="contained"
                        color="info"
                        size="small"
                        onClick={() => navigate(`/treatment-plans/${activePlan.id}/braces`)}
                      >
                        {t('view3DModel', 'View 3D Model')}
                      </Button>
                    )}
                    <Chip
                      label={t(activePlan.status)}
                      color={activePlan.status === 'ACTIVE' ? 'success' : activePlan.status === 'CANCELLED' ? 'error' : 'default'}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" gutterBottom>
                  {t('startDate')}: {activePlan.startDate} | {t('endDate')}: {activePlan.endDate || t('ongoing')}
                </Typography>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      {t('estimatedDuration', 'Estimated duration')}: {activePlan.estimatedDurationMonths || 0} {t('months', 'months')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" fontWeight={"bold"}>
                      {activePlan.progressPercentage || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={activePlan.progressPercentage || 0}
                    sx={{ height: 10, borderRadius: 5 }}
                    color={getProgressColor(activePlan.progressPercentage || 0)}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Button variant="outlined" size="small" onClick={() => openPanoramaModal(activePlan)}>
                    {t('viewPanoramaImages', 'Panorama Images')}
                  </Button>
                </Box>

                <Typography variant="body1" sx={{ mt: 2 }}>
                  {activePlan.generalNotes || t('noNotesProvided')}
                </Typography>

                {activePlan.plannedServiceNames && activePlan.plannedServiceNames.length > 0 && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {t('plannedServices', 'Várható szolgáltatások:')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {activePlan.plannedServiceNames.map((name, i) => (
                        <Chip key={i} label={getLocalizedServiceName(name)} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                <Accordion variant="outlined" sx={{ mt: 2, bgcolor: 'background.default' }}>
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

      <PatientServiceList />

      <PanoramaViewerModal
        open={isPanoramaModalOpen}
        onClose={() => setIsPanoramaModalOpen(false)}
        plan={selectedPlanForPanorama}
        isDoctor={false}
      />

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