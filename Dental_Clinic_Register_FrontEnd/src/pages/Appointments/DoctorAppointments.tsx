import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDoctorDailyAppointments,
  cancelAppointmentByDoctor,
  markAsCompleted,
  markAsNoShow,
} from '../../services/AppointmentService';
import AppointmentCard from '../../components/AppointmentCard';
import DoctorActionModal from '../../components/DoctorActionModal';
import DoctorBookModal from '../../components/DoctorBookModal';

interface DoctorAppointmentsProps {
  userId: number;
}

function DoctorAppointments({ userId }: DoctorAppointmentsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'CONFIRM' | 'RESCHEDULE'>('CONFIRM');
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);

  const [modalInitialDateTime, setModalInitialDateTime] = useState<string>('');
  const [modalInitialNotes, setModalInitialNotes] = useState<string>('');
  const [modalInitialResourceLink, setModalInitialResourceLink] = useState<string>('');

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['doctorAppointments', userId, selectedDate],
    queryFn: () => getDoctorDailyAppointments(userId, selectedDate),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => cancelAppointmentByDoctor(userId, id, reason),
    onSuccess: async () => {
      await handleSuccess('appointmentCancelled');
    },
    onError: handleError,
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => markAsCompleted(userId, id),
    onSuccess: async () => {
      await handleSuccess('appointmentCompleted');
    },
    onError: handleError,
  });

  const noShowMutation = useMutation({
    mutationFn: (id: number) => markAsNoShow(userId, id),
    onSuccess: async () => {
      await handleSuccess('markedAsNoShow');
    },
    onError: handleError,
  });

  async function handleSuccess(msgKey: string) {
    setSnackbar({ open: true, message: t(msgKey), severity: 'success' });
    await queryClient.invalidateQueries({ queryKey: ['doctorAppointments', userId] });
  }

  function handleError(error: any) {
    const backendErrorKey = error.response?.data?.message || 'error.unknown';
    setSnackbar({ open: true, message: t(backendErrorKey), severity: 'error' });
  }

  const openModal = (apt: any, type: 'CONFIRM' | 'RESCHEDULE') => {
    setSelectedApptId(apt.id);
    setActionType(type);

    let dt = apt.startTime || '';
    if (!dt && apt.requestedDate) {
      const hr = apt.timePreference === 'MORNING' ? '09:00' : apt.timePreference === 'EVENING' ? '18:00' : '14:00';
      dt = `${apt.requestedDate}T${hr}`;
    }

    setModalInitialDateTime(dt ? dt.substring(0, 16) : '');
    setModalInitialNotes(apt.notes || '');
    setModalInitialResourceLink(apt.resourceLink || '');
    setIsActionModalOpen(true);
  };

  const statusPriority: Record<string, number> = {
    CONFIRMED: 1,
    COMPLETED: 2,
    PENDING: 3,
    NO_SHOW: 4,
    CANCELLED: 5,
  };

  const sortedAppointments = appointments
    ? [...appointments].sort((a, b) => {
        const timeA = new Date(a.startTime || a.requestedDate).getTime();
        const timeB = new Date(b.startTime || b.requestedDate).getTime();

        if (timeA !== timeB) return timeA - timeB;

        return (statusPriority[a.status] || 9) - (statusPriority[b.status] || 9);
      })
    : [];

  const pendingAppointments = sortedAppointments.filter((a) => a.status === 'PENDING');
  const confirmedAppointments = sortedAppointments.filter((a) => a.status !== 'PENDING');

  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {t('dailySchedule')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant="contained" color="primary" onClick={() => setIsBookModalOpen(true)} sx={{ height: '56px' }}>
            + {t('bookForPatient')}
          </Button>
          <TextField
            type="date"
            label={t('selectDate')}
            slotProps={{ inputLabel: { shrink: true } }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Box>
      </Box>

      {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />}
      {isError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('pendingRequests')}
        </Typography>
        {pendingAppointments.length === 0 && !isLoading && (
          <Typography sx={{ fontStyle: 'italic' }}>{t('noPendingRequestsForThisDate')}</Typography>
        )}
        <Grid container spacing={3}>
          {pendingAppointments.map((apt) => {
            const isDeleted = apt.patientName?.toLowerCase().includes('deleted');
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={apt.id}>
                <Box sx={{ opacity: isDeleted ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                  <AppointmentCard
                    appointment={apt}
                    userRole="DOCTOR"
                    onCancel={
                      !isDeleted
                        ? (id) => {
                            setAppointmentToCancel(id);
                            setCancelDialogOpen(true);
                          }
                        : undefined
                    }
                    onConfirm={!isDeleted ? () => openModal(apt, 'CONFIRM') : undefined}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('scheduledAppointments')}
        </Typography>
        {confirmedAppointments.length === 0 && !isLoading && (
          <Typography sx={{ fontStyle: 'italic' }}>{t('noScheduledAppointments')}</Typography>
        )}
        <Grid container spacing={3}>
          {confirmedAppointments.map((apt) => {
            const isDeleted = apt.patientName?.toLowerCase().includes('deleted');
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={apt.id}>
                <Box
                  sx={{
                    opacity: isDeleted ? 0.5 : 1,
                    pointerEvents: isDeleted ? 'none' : 'auto',
                    transition: 'opacity 0.3s',
                  }}
                >
                  <AppointmentCard
                    appointment={apt}
                    userRole="DOCTOR"
                    onCancel={
                      !isDeleted && apt.status === 'CONFIRMED'
                        ? (id) => {
                            setAppointmentToCancel(id);
                            setCancelDialogOpen(true);
                          }
                        : undefined
                    }
                    onUpdate={!isDeleted && apt.status === 'CONFIRMED' ? () => openModal(apt, 'RESCHEDULE') : undefined}
                    onComplete={
                      !isDeleted && apt.status === 'CONFIRMED' ? (id) => completeMutation.mutate(id) : undefined
                    }
                    onNoShow={!isDeleted && apt.status === 'CONFIRMED' ? (id) => noShowMutation.mutate(id) : undefined}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <DoctorActionModal
        open={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        userId={userId}
        appointmentId={selectedApptId}
        actionType={actionType}
        initialDateTime={modalInitialDateTime}
        initialNotes={modalInitialNotes}
        initialResourceLink={modalInitialResourceLink}
      />

      <DoctorBookModal open={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} doctorId={userId} />

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
            disabled={!cancelReason.trim()}
            onClick={async () => {
              if (appointmentToCancel) {
                await cancelMutation.mutateAsync({ id: appointmentToCancel, reason: cancelReason });
              }
              setCancelDialogOpen(false);
              setCancelReason('');
            }}
          >
            {t('confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DoctorAppointments;
