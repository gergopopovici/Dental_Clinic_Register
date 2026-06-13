import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import AppointmentCard from '../components/AppointmentCard';
import DoctorActionModal from '../components/DoctorActionModal';
import { getDoctorDailyAppointments, cancelAppointmentByDoctor, markAsNoShow } from '../services/AppointmentService';
import { ResponseAppointmentDTO } from '../models/Appointment';

interface DoctorDashboardProps {
  userId: number;
}

function DoctorDashboard({ userId }: DoctorDashboardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split('T')[0];

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);
  const [modalInitialDateTime, setModalInitialDateTime] = useState<string>('');
  const [modalInitialNotes, setModalInitialNotes] = useState<string>('');
  const [modalInitialResourceLink, setModalInitialResourceLink] = useState<string>('');
  const [modalInitialTreatmentPlanId, setModalInitialTreatmentPlanId] = useState<number | null>(null);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryApptId, setSummaryApptId] = useState<number | null>(null);
  const [summaryStartTime, setSummaryStartTime] = useState<string>('');
  const [summaryExistingNotes, setSummaryExistingNotes] = useState('');
  const [summaryExistingData, setSummaryExistingData] = useState<any>(undefined);
  const [summaryPlanId, setSummaryPlanId] = useState<number | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery<ResponseAppointmentDTO[]>({
    queryKey: ['doctorAppointments', userId, today],
    queryFn: () => getDoctorDailyAppointments(userId, today),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => cancelAppointmentByDoctor(userId, id, reason),
    onSuccess: () => handleSuccess('appointmentCancelled'),
    onError: handleError,
  });

  const noShowMutation = useMutation({
    mutationFn: (id: number) => markAsNoShow(userId, id),
    onSuccess: () => handleSuccess('markedAsNoShow'),
    onError: handleError,
  });

  function handleSuccess(msgKey: string) {
    setSnackbar({ open: true, message: t(msgKey), severity: 'success' });
    queryClient.invalidateQueries({ queryKey: ['doctorAppointments', userId] });
  }

  function handleError(error: any) {
    const backendErrorKey = error.response?.data?.message || 'error.unknown';
    setSnackbar({ open: true, message: t(backendErrorKey), severity: 'error' });
  }

  const openRescheduleModal = (apt: ResponseAppointmentDTO) => {
    setSelectedApptId(apt.id);
    setModalInitialDateTime(apt.startTime ? apt.startTime.substring(0, 16) : '');
    setModalInitialNotes(apt.notes || '');
    setModalInitialResourceLink(apt.resourceLink || '');
    setModalInitialTreatmentPlanId(apt.treatmentPlanId || null);
    setIsActionModalOpen(true);
  };

  const openSummaryModal = (apt: ResponseAppointmentDTO) => {
    setSummaryApptId(apt.id);
    setSummaryStartTime(apt.startTime ? apt.startTime.substring(0, 16) : '');
    setSummaryExistingNotes(apt.summary?.notes || '');
    setSummaryExistingData(apt.summary);
    setSummaryPlanId(apt.treatmentPlanId || null);
    setIsSummaryModalOpen(true);
  };

  const { nextAppointments, totalToday, remainingToday } = useMemo(() => {
    if (!appointments) return { nextAppointments: [], totalToday: 0, remainingToday: 0 };

    const now = new Date().getTime();

    const confirmedList = appointments
      .filter((a) => a.status === 'CONFIRMED' && new Date(a.startTime).getTime() > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      nextAppointments: confirmedList.slice(0, 2),
      totalToday: appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length,
      remainingToday: appointments.filter((a) => a.status === 'CONFIRMED').length,
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
        <Grid container spacing={4} alignItems="flex-start">
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('dailySchedule')}
                </Typography>
                <Typography variant="h5">
                  {totalToday > 0
                    ? t('dailySummary', { total: totalToday, remaining: remainingToday })
                    : t('noAppointmentsToday')}
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
                    <AppointmentCard
                      appointment={apt}
                      userRole="DOCTOR"
                      onCancel={() => {
                        setAppointmentToCancel(apt.id);
                        setCancelDialogOpen(true);
                      }}
                      onUpdate={() => openRescheduleModal(apt)}
                      onComplete={() => openSummaryModal(apt)}
                      onNoShow={() => noShowMutation.mutate(apt.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      )}

      <DoctorActionModal
        open={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        userId={userId}
        appointmentId={selectedApptId}
        initialNotes={modalInitialNotes}
        initialResourceLink={modalInitialResourceLink}
        initialTreatmentPlanId={modalInitialTreatmentPlanId}
        initialStartTime={modalInitialDateTime}
        mode="RESCHEDULE"
        onSuccess={() => {
          setIsActionModalOpen(false);
          handleSuccess('appointmentUpdated');
        }}
      />

      <DoctorActionModal
        open={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        userId={userId}
        appointmentId={summaryApptId}
        mode="COMPLETE"
        initialStartTime={summaryStartTime}
        initialTreatmentPlanId={summaryPlanId}
        initialNotes={summaryExistingNotes}
        existingSummary={summaryExistingData}
        onSuccess={() => {
          setIsSummaryModalOpen(false);
          handleSuccess('appointmentCompleted');
        }}
      />

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>{t('cancelAppointment')}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('pleaseProvideReason')}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label={t('reason')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)}>{t('back')}</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!cancelReason.trim() || cancelMutation.isPending}
            onClick={async () => {
              if (appointmentToCancel) {
                await cancelMutation.mutateAsync({ id: appointmentToCancel, reason: cancelReason });
              }
              setCancelDialogOpen(false);
              setCancelReason('');
            }}
          >
            {cancelMutation.isPending ? <CircularProgress size={20} color="inherit" /> : t('confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DoctorDashboard;
