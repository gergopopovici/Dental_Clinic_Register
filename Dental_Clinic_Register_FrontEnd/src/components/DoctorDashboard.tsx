import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
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
} from '../services/AppointmentService';
import AppointmentCard from '../components/AppointmentCard';
import DoctorActionModal from '../components/DoctorActionModal';
import DoctorBookModal from '../components/DoctorBookModal';
import { useUser } from '../context/UserContext';
import { ResponseAppointmentDTO } from '../models/Appointment';

function DoctorDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const userId = user?.id;

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
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
  } = useQuery<ResponseAppointmentDTO[]>({
    queryKey: ['doctorAppointments', userId, selectedDate],
    queryFn: () => getDoctorDailyAppointments(userId!, selectedDate),
    enabled: !!userId,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => cancelAppointmentByDoctor(userId!, id, reason),
    onSuccess: async () => await handleSuccess('appointmentCancelled'),
    onError: handleError,
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => markAsCompleted(userId!, id),
    onSuccess: async () => await handleSuccess('appointmentCompleted'),
    onError: handleError,
  });

  const noShowMutation = useMutation({
    mutationFn: (id: number) => markAsNoShow(userId!, id),
    onSuccess: async () => await handleSuccess('markedAsNoShow'),
    onError: handleError,
  });

  async function handleSuccess(msgKey: string) {
    setSnackbar({ open: true, message: t(msgKey), severity: 'success' });
    await queryClient.invalidateQueries({ queryKey: ['doctorAppointments', userId] });
  }

  function handleError(error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    const backendErrorKey = err.response?.data?.message || 'error.unknown';
    setSnackbar({ open: true, message: t(backendErrorKey), severity: 'error' });
  }

  const openRescheduleModal = (apt: ResponseAppointmentDTO) => {
    setSelectedApptId(apt.id);
    setModalInitialDateTime(apt.startTime ? apt.startTime.substring(0, 16) : '');
    setModalInitialNotes(apt.notes || '');
    setModalInitialResourceLink(apt.resourceLink || '');
    setIsActionModalOpen(true);
  };

  const statusPriority: Record<string, number> = {
    CONFIRMED: 1,
    COMPLETED: 2,
    NO_SHOW: 3,
    CANCELLED: 4,
  };

  const sortedAppointments = appointments
    ? [...appointments].sort((a, b) => {
        const timeA = new Date(a.startTime).getTime();
        const timeB = new Date(b.startTime).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return (statusPriority[a.status] || 9) - (statusPriority[b.status] || 9);
      })
    : [];

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', py: 4 }}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'flex-start' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            mb: 6,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('appointments', 'Appointments')}
            </Typography>

            <Typography variant="body1" sx={{ maxWidth: '700px', lineHeight: 1.7 }}>
              {t('doctorAppointmentsSubtitle', 'Manage your daily schedule and update appointments.')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsBookModalOpen(true)}
              sx={{ height: '56px', px: 3, fontWeight: 600 }}
            >
              + {t('bookForPatient', 'Book for Patient')}
            </Button>

            <TextField
              type="date"
              label={t('selectDate', 'Select Date')}
              slotProps={{ inputLabel: { shrink: true } }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ minWidth: '180px' }}
            />
          </Box>
        </Box>

        {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 6 }} />}

        {isError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {t('scheduledAppointments', 'Scheduled Appointments')}
          </Typography>

          {sortedAppointments.length === 0 && !isLoading && (
            <Typography sx={{ fontStyle: 'italic' }}>{t('noScheduledAppointments')}</Typography>
          )}

          <Grid container spacing={4}>
            {sortedAppointments.map((apt: ResponseAppointmentDTO) => {
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
                          ? (id: number) => {
                              setAppointmentToCancel(id);
                              setCancelDialogOpen(true);
                            }
                          : undefined
                      }
                      onUpdate={!isDeleted && apt.status === 'CONFIRMED' ? () => openRescheduleModal(apt) : undefined}
                      onComplete={
                        !isDeleted && apt.status === 'CONFIRMED'
                          ? (id: number) => completeMutation.mutate(id)
                          : undefined
                      }
                      onNoShow={
                        !isDeleted && apt.status === 'CONFIRMED' ? (id: number) => noShowMutation.mutate(id) : undefined
                      }
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
          userId={userId!}
          appointmentId={selectedApptId}
          initialNotes={modalInitialNotes}
          initialResourceLink={modalInitialResourceLink}
        />

        <DoctorBookModal open={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} doctorId={userId!} />

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
                  await cancelMutation.mutateAsync({
                    id: appointmentToCancel,
                    reason: cancelReason,
                  });
                }
                setCancelDialogOpen(false);
                setCancelReason('');
              }}
            >
              {cancelMutation.isPending ? <CircularProgress size={20} color="inherit" /> : t('confirmCancel')}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default DoctorDashboard;
