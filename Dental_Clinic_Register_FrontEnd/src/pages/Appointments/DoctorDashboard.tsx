import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Snackbar, Alert, TextField, Divider, Button, Grid } from '@mui/material';
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

interface DoctorDashboardProps {
  userId: number;
}

function DoctorDashboard({ userId }: DoctorDashboardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'CONFIRM' | 'RESCHEDULE'>('CONFIRM');
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['doctorAppointments', userId, selectedDate],
    queryFn: () => getDoctorDailyAppointments(userId, selectedDate),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelAppointmentByDoctor(userId, id, t('cancelledByDoctor')),
    onSuccess: () => handleSuccess('appointmentCancelled'),
    onError: handleError,
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => markAsCompleted(userId, id),
    onSuccess: () => handleSuccess('appointmentCompleted'),
    onError: handleError,
  });

  const noShowMutation = useMutation({
    mutationFn: (id: number) => markAsNoShow(userId, id),
    onSuccess: () => handleSuccess('markedAsNoShow'),
    onError: handleError,
  });

  function handleSuccess(msgKey: string) {
    setSnackbar({ open: true, message: t(msgKey), severity: 'success' });
    queryClient.invalidateQueries({ queryKey: ['doctorAppointments', userId, selectedDate] });
  }

  function handleError(error: any) {
    const backendErrorKey = error.response?.data?.message || 'error.unknown';
    setSnackbar({ open: true, message: t(backendErrorKey), severity: 'error' });
  }

  const openModal = (id: number, type: 'CONFIRM' | 'RESCHEDULE') => {
    setSelectedApptId(id);
    setActionType(type);
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
            slotProps={{ inputLabel: { shrink: true, sx: { color: '#aaa' } } }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{
              bgcolor: '#2c2c2c',
              borderRadius: 1,
              input: { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
            }}
          />
        </Box>
      </Box>

      {isLoading && <CircularProgress sx={{ color: 'white', display: 'block', mx: 'auto', mt: 4 }} />}
      {isError && <Typography color="error">{t('failedToFetchAppointments')}</Typography>}

      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" sx={{ color: '#ffb74d', mb: 2, fontWeight: 'bold' }}>
          {t('pendingRequests')}
        </Typography>
        {pendingAppointments.length === 0 && !isLoading && (
          <Typography sx={{ color: '#aaa', fontStyle: 'italic' }}>{t('noPendingRequestsForThisDate')}</Typography>
        )}
        <Grid container spacing={3}>
          {pendingAppointments.map((apt) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={apt.id}>
              <AppointmentCard
                appointment={apt}
                userRole="DOCTOR"
                onCancel={(id) => cancelMutation.mutate(id)}
                onConfirm={(id) => openModal(id, 'CONFIRM')}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ borderColor: '#444', mb: 4 }} />

      <Box>
        <Typography variant="h6" sx={{ color: '#81c784', mb: 2, fontWeight: 'bold' }}>
          {t('scheduledAppointments')}
        </Typography>
        {confirmedAppointments.length === 0 && !isLoading && (
          <Typography sx={{ color: '#aaa', fontStyle: 'italic' }}>{t('noScheduledAppointments')}</Typography>
        )}
        <Grid container spacing={3}>
          {confirmedAppointments.map((apt) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={apt.id}>
              <AppointmentCard
                appointment={apt}
                userRole="DOCTOR"
                onCancel={apt.status === 'CONFIRMED' ? (id) => cancelMutation.mutate(id) : undefined}
                onUpdate={apt.status === 'CONFIRMED' ? (id) => openModal(id, 'RESCHEDULE') : undefined}
                onComplete={apt.status === 'CONFIRMED' ? (id) => completeMutation.mutate(id) : undefined}
                onNoShow={apt.status === 'CONFIRMED' ? (id) => noShowMutation.mutate(id) : undefined}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <DoctorActionModal
        open={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        userId={userId}
        appointmentId={selectedApptId}
        actionType={actionType}
      />

      <DoctorBookModal open={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} doctorId={userId} />

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DoctorDashboard;
