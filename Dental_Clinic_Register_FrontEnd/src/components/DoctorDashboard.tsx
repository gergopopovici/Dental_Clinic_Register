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
} from '../services/AppointmentService';
import AppointmentCard from '../components/AppointmentCard';
import DoctorActionModal from '../components/DoctorActionModal';
import DoctorBookModal from '../components/DoctorBookModal';
import { useUser } from '../context/UserContext';

function DoctorDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const userId = user?.id;

  // State for filtering and UI
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // State for Action Modals (Confirm/Reschedule)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'CONFIRM' | 'RESCHEDULE'>('CONFIRM');
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);
  const [modalInitialDateTime, setModalInitialDateTime] = useState<string>('');
  const [modalInitialNotes, setModalInitialNotes] = useState<string>('');
  const [modalInitialResourceLink, setModalInitialResourceLink] = useState<string>('');

  // State for Booking and Cancelling
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // 1. Fetch Daily Appointments
  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['doctorAppointments', userId, selectedDate],
    queryFn: () => getDoctorDailyAppointments(userId!, selectedDate),
    enabled: !!userId,
  });

  // 2. Mutations for Status Updates
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

  // Helpers
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

  // Sort and Filter Logic
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
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'black',
        boxSizing: 'border-box',
        color: 'white',
        py: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Header & Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: {
              xs: 'stretch',
              md: 'flex-start',
            },
            flexDirection: {
              xs: 'column',
              md: 'row',
            },
            gap: 4,
            mb: 6,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                mb: 1,
              }}
            >
              {t('appointments', 'Appointments')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#aaa',
                maxWidth: '700px',
                lineHeight: 1.7,
              }}
            >
              {t(
                'doctorAppointmentsSubtitle',
                'Manage your daily schedule, review pending requests, and update appointments.',
              )}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsBookModalOpen(true)}
              sx={{
                height: '56px',
                px: 3,
                fontWeight: 600,
              }}
            >
              + {t('bookForPatient', 'Book for Patient')}
            </Button>

            <TextField
              type="date"
              label={t('selectDate', 'Select Date')}
              slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: { color: '#aaa' },
                },
              }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{
                minWidth: '180px',
                bgcolor: '#2c2c2c',
                borderRadius: 1,
                input: { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#444',
                },
              }}
            />
          </Box>
        </Box>

        {isLoading && (
          <CircularProgress
            sx={{
              color: 'white',
              display: 'block',
              mx: 'auto',
              mt: 6,
            }}
          />
        )}

        {isError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

        {/* PENDING REQUESTS SECTION */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#ffb74d',
              mb: 3,
              fontWeight: 'bold',
            }}
          >
            {t('pendingRequests', 'Pending Requests')}
          </Typography>

          {pendingAppointments.length === 0 && !isLoading && (
            <Typography
              sx={{
                color: '#aaa',
                fontStyle: 'italic',
              }}
            >
              {t('noPendingRequestsForThisDate')}
            </Typography>
          )}

          <Grid container spacing={4}>
            {pendingAppointments.map((apt) => {
              const isDeleted = apt.patientName?.toLowerCase().includes('deleted');

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={apt.id}>
                  <Box
                    sx={{
                      opacity: isDeleted ? 0.5 : 1,
                      transition: 'opacity 0.3s',
                    }}
                  >
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

        <Divider
          sx={{
            borderColor: '#333',
            my: 6,
          }}
        />

        {/* SCHEDULED APPOINTMENTS SECTION */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: '#81c784',
              mb: 3,
              fontWeight: 'bold',
            }}
          >
            {t('scheduledAppointments', 'Scheduled Appointments')}
          </Typography>

          {confirmedAppointments.length === 0 && !isLoading && (
            <Typography
              sx={{
                color: '#aaa',
                fontStyle: 'italic',
              }}
            >
              {t('noScheduledAppointments')}
            </Typography>
          )}

          <Grid container spacing={4}>
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
                      onUpdate={
                        !isDeleted && apt.status === 'CONFIRMED' ? () => openModal(apt, 'RESCHEDULE') : undefined
                      }
                      onComplete={
                        !isDeleted && apt.status === 'CONFIRMED' ? (id) => completeMutation.mutate(id) : undefined
                      }
                      onNoShow={
                        !isDeleted && apt.status === 'CONFIRMED' ? (id) => noShowMutation.mutate(id) : undefined
                      }
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Modals */}
        <DoctorActionModal
          open={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          userId={userId!}
          appointmentId={selectedApptId}
          actionType={actionType}
          initialDateTime={modalInitialDateTime}
          initialNotes={modalInitialNotes}
          initialResourceLink={modalInitialResourceLink}
        />

        <DoctorBookModal open={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} doctorId={userId!} />

        {/* Cancellation Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          slotProps={{
            paper: {
              sx: {
                bgcolor: '#1e1e1e',
                color: 'white',
                minWidth: '400px',
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              borderBottom: '1px solid #333',
            }}
          >
            {t('cancelAppointment')}
          </DialogTitle>

          <DialogContent sx={{ pt: '24px !important' }}>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: '#aaa',
              }}
            >
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
              sx={{
                bgcolor: '#2c2c2c',
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#444',
                },
                '& .MuiInputLabel-root': {
                  color: '#aaa',
                },
                textarea: {
                  color: 'white',
                },
              }}
            />
          </DialogContent>

          <DialogActions
            sx={{
              borderTop: '1px solid #333',
              p: 2,
            }}
          >
            <Button onClick={() => setCancelDialogOpen(false)} sx={{ color: '#aaa' }}>
              {t('back')}
            </Button>

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
          onClose={() =>
            setSnackbar({
              ...snackbar,
              open: false,
            })
          }
        >
          <Alert
            onClose={() =>
              setSnackbar({
                ...snackbar,
                open: false,
              })
            }
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default DoctorDashboard;
