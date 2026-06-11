import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppointment, getBookedSlotsForDoctor } from '../services/AppointmentService';
import { getDoctorSchedule, getDoctorTimeOffs, getGlobalHolidays } from '../services/ScheduleService';
import { DoctorUpdateAppointmentDTO } from '../models/Appointment';

interface DoctorActionModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  appointmentId: number | null;
  initialNotes?: string;
  initialResourceLink?: string;
}

function DoctorActionModal({
  open,
  onClose,
  userId,
  appointmentId,
  initialNotes,
  initialResourceLink,
}: DoctorActionModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [resourceLink, setResourceLink] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const APPOINTMENT_BUFFER_MINUTES = 5;

  useEffect(() => {
    if (open) {
      setNotes(initialNotes || '');
      setResourceLink(initialResourceLink || '');
    } else {
      setDate('');
      setSelectedTime('');
      setNotes('');
      setResourceLink('');
      setErrorMessage('');
    }
  }, [open, initialNotes, initialResourceLink]);

  const { data: bookedSlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['bookedSlots', userId, date],
    queryFn: () => getBookedSlotsForDoctor(userId, date),
    enabled: !!userId && !!date && open,
    retry: 1,
  });

  const { data: weeklySchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['doctorSchedule', userId],
    queryFn: () => getDoctorSchedule(userId),
    enabled: !!userId && open,
    retry: 1,
  });

  const { data: timeOffs, isLoading: isLoadingTimeOffs } = useQuery({
    queryKey: ['doctorTimeOffs', userId],
    queryFn: () => getDoctorTimeOffs(userId),
    enabled: !!userId && open,
    retry: 1,
  });

  const { data: globalHolidays, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ['globalHolidays'],
    queryFn: getGlobalHolidays,
    enabled: open,
    retry: 1,
  });

  const availableSlots = useMemo(() => {
    if (!date || !userId || !weeklySchedule) return [];

    const allTimeOffs = [...(timeOffs || []), ...(globalHolidays || [])];
    if (allTimeOffs.some((off) => date >= off.startDate && date <= off.endDate)) return [];

    const dateObj = new Date(date);
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const daySchedule = weeklySchedule.find((s) => s.dayOfWeek === daysOfWeek[dateObj.getDay()]);

    if (!daySchedule || !daySchedule.isWorking) return [];

    const duration = 30; // Alapértelmezett, ha nincs serviceID, vagy állítsd be fixre
    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);

    let current = new Date(date);
    current.setHours(startH, startM, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(endH, endM, 0, 0);

    const now = new Date();
    const slots: string[] = [];

    while (new Date(current.getTime() + duration * 60000) <= endOfDay) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + duration * 60000);

      const isOverlapping = (bookedSlots || []).some((b) => {
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        return slotStart < bEnd && slotEnd > bStart;
      });

      if (!isOverlapping && slotStart > now) {
        slots.push(
          `${slotStart.getHours().toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`,
        );
      }
      current = new Date(slotEnd.getTime() + APPOINTMENT_BUFFER_MINUTES * 60000);
    }
    return slots;
  }, [date, userId, bookedSlots, weeklySchedule, timeOffs, globalHolidays]);

  const actionMutation = useMutation({
    mutationFn: (payload: DoctorUpdateAppointmentDTO) => {
      if (!appointmentId) throw new Error(t('no.appointment.id'));
      return updateAppointment(userId, appointmentId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments', userId] });
      onClose();
    },
    onError: (error: any) => setErrorMessage(t(error.response?.data?.message || 'error.unknown')),
  });

  const handleSubmit = () => {
    if (!date || !selectedTime) {
      setErrorMessage(t('pleaseSelectDateTime'));
      return;
    }
    actionMutation.mutate({
      newStartTime: `${date}T${selectedTime}:00`,
      notes,
      resourceLink,
    });
  };

  const isScheduleLoading = isLoadingSlots || isLoadingSchedule || isLoadingTimeOffs || isLoadingGlobal;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('rescheduleAppointment')}</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>
            {errorMessage}
          </Typography>
        )}

        <TextField
          type="date"
          label={t('date')}
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {date && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
              {t('selectTime')}
            </Typography>
            {isScheduleLoading ? (
              <CircularProgress size={24} />
            ) : availableSlots.length === 0 ? (
              <Typography>{t('noAvailableSlots')}</Typography>
            ) : (
              <Grid container spacing={1}>
                {availableSlots.map((time) => (
                  <Grid size={{ xs: 3 }} key={time}>
                    <Button
                      variant={selectedTime === time ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setSelectedTime(time)}
                      fullWidth
                      sx={{ fontWeight: 'bold' }}
                    >
                      {time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        <TextField
          label={t('notesOptions')}
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label={t('resourceLinkOptional')}
          fullWidth
          value={resourceLink}
          onChange={(e) => setResourceLink(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ fontWeight: 'bold' }}>
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={actionMutation.isPending || !selectedTime}
          sx={{ fontWeight: 'bold' }}
        >
          {actionMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DoctorActionModal;
