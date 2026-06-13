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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateAppointment,
  getBookedSlotsForDoctor,
  markAsCompleted,
  addSummaryToAppointment,
} from '../services/AppointmentService';
import { getDoctorSchedule, getDoctorTimeOffs, getGlobalHolidays } from '../services/ScheduleService';
import { DoctorUpdateAppointmentDTO, BookedSlotDTO } from '../models/Appointment';
import { AppointmentSummaryDTO, TreatmentPlanDTO } from '../models/TreatmentPlan';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { DoctorScheduleDTO, TimeOffDTO } from '../models/Schedule';

interface DoctorActionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: number;
  appointmentId: number | null;
  initialNotes?: string;
  patientId?: number;
  initialTreatmentPlanId?: number | null;
  initialStartTime?: string;
  initialResourceLink?: string;
  existingSummary?: AppointmentSummaryDTO;
  mode?: 'RESCHEDULE' | 'COMPLETE';
}

interface ApiError {
  response?: { data?: { message?: string } };
}

function DoctorActionModal({
  open,
  onClose,
  onSuccess,
  userId,
  appointmentId,
  patientId,
  initialTreatmentPlanId,
  initialStartTime,
  initialNotes,
  initialResourceLink,
  existingSummary,
  mode = 'RESCHEDULE',
}: DoctorActionModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [treatmentPlanId, setTreatmentPlanId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [resourceLink, setResourceLink] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const APPOINTMENT_BUFFER_MINUTES = 5;

  useEffect(() => {
    if (open) {
      setNotes(initialNotes || '');
      setResourceLink(initialResourceLink || '');
      setTreatmentPlanId(initialTreatmentPlanId || '');
      setAudioFile(null);
      setImageFile(null);
      setDocumentFile(null);

      if (initialStartTime && mode === 'RESCHEDULE') {
        const [dPart, tPart] = initialStartTime.split('T');
        setDate(dPart);
        const [h, m] = tPart.split(':');
        setSelectedTime(`${h}:${m}`);
      }
    }
  }, [open, initialNotes, initialResourceLink, initialTreatmentPlanId, initialStartTime, mode]);

  const { data: patientPlans, isLoading: isLoadingPlans } = useQuery<TreatmentPlanDTO[]>({
    queryKey: ['treatmentPlans', patientId],
    queryFn: () => getPlansByPatientId(Number(patientId)),
    enabled: !!patientId && open && mode === 'RESCHEDULE',
  });

  const { data: bookedSlots } = useQuery<BookedSlotDTO[]>({
    queryKey: ['bookedSlots', userId, date],
    queryFn: () => getBookedSlotsForDoctor(userId, date),
    enabled: !!userId && !!date && open && mode === 'RESCHEDULE',
  });

  const { data: weeklySchedule } = useQuery<DoctorScheduleDTO[]>({
    queryKey: ['doctorSchedule', userId],
    queryFn: () => getDoctorSchedule(userId),
    enabled: !!userId && open && mode === 'RESCHEDULE',
  });

  const { data: timeOffs } = useQuery<TimeOffDTO[]>({
    queryKey: ['doctorTimeOffs', userId],
    queryFn: () => getDoctorTimeOffs(userId),
    enabled: !!userId && open && mode === 'RESCHEDULE',
  });

  const availableSlots = useMemo(() => {
    if (mode !== 'RESCHEDULE' || !date || !userId || !weeklySchedule) return [];
    if (timeOffs?.some((off) => date >= off.startDate && date <= off.endDate)) return [];

    const dateObj = new Date(date);
    const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][dateObj.getDay()];
    const daySchedule = weeklySchedule.find((s) => s.dayOfWeek === dayName);

    if (!daySchedule || !daySchedule.isWorking) return [];

    const duration = 30;
    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);

    let current = new Date(dateObj.setHours(startH, startM, 0));
    const endOfDay = new Date(dateObj.setHours(endH, endM, 0));
    const now = new Date();

    const slots: string[] = [];
    while (current.getTime() < endOfDay.getTime()) {
      const slotEnd = new Date(current.getTime() + duration * 60000);
      if (slotEnd.getTime() > endOfDay.getTime()) break;

      const isOverlapping = (bookedSlots || []).some((b) => {
        if (initialStartTime && new Date(b.startTime).getTime() === new Date(initialStartTime).getTime()) return false;
        return current.getTime() < new Date(b.endTime).getTime() && slotEnd.getTime() > new Date(b.startTime).getTime();
      });

      if (!isOverlapping && current.getTime() > now.getTime()) {
        slots.push(
          `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`,
        );
      }
      current = new Date(current.getTime() + (duration + APPOINTMENT_BUFFER_MINUTES) * 60000);
    }
    return slots;
  }, [date, userId, bookedSlots, weeklySchedule, timeOffs, mode, initialStartTime]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!appointmentId) throw new Error(t('no.appointment.id'));
      if (mode === 'RESCHEDULE') {
        return updateAppointment(userId, appointmentId, {
          newStartTime: `${date}T${selectedTime}:00`,
          treatmentPlanId: treatmentPlanId === '' ? null : (treatmentPlanId as number),
          notes,
          resourceLink,
        });
      } else {
        await markAsCompleted(userId, appointmentId);
        return addSummaryToAppointment(userId, appointmentId, notes, audioFile, imageFile, documentFile);
      }
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      setErrorMessage(t(err.response?.data?.message || 'error.unknown'));
    },
  });

  const handleTreatmentPlanChange = (e: SelectChangeEvent<number | ''>) => {
    setTreatmentPlanId(e.target.value === '' ? '' : Number(e.target.value));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {mode === 'RESCHEDULE' ? t('rescheduleAppointment') : t('addSummary')}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}

        {mode === 'RESCHEDULE' ? (
          <>
            <TextField
              type="date"
              label={t('date')}
              fullWidth
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedTime('');
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            {date && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
                  {t('selectTime')}
                </Typography>
                {availableSlots.length === 0 ? (
                  <Typography>{t('noAvailableSlots')}</Typography>
                ) : (
                  <Grid container spacing={1}>
                    {availableSlots.map((time) => (
                      <Grid size={{ xs: 3 }} key={time}>
                        <Button
                          variant={selectedTime === time ? 'contained' : 'outlined'}
                          onClick={() => setSelectedTime(time)}
                          fullWidth
                        >
                          {time}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
            {patientId && (
              <FormControl fullWidth>
                <InputLabel shrink>{t('selectTreatmentPlan')}</InputLabel>
                <Select
                  value={treatmentPlanId}
                  onChange={handleTreatmentPlanChange}
                  notched
                  label={t('selectTreatmentPlan')}
                >
                  <MenuItem value="">{t('none')}</MenuItem>
                  {patientPlans
                    ?.filter((p) => p.status === 'ACTIVE')
                    .map((plan) => (
                      <MenuItem key={plan.id} value={plan.id as number}>
                        {plan.primaryServiceName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label={t('notesOptions')}
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <TextField
              label={t('resourceLinkOptional')}
              fullWidth
              value={resourceLink}
              onChange={(e) => setResourceLink(e.target.value)}
            />
          </>
        ) : (
          <>
            <TextField
              label={t('summaryNotes')}
              multiline
              rows={4}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Box>
              <Typography variant="body2">{t('uploadAudio')}</Typography>
              <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
            </Box>
            <Box>
              <Typography variant="body2">{t('uploadImage')}</Typography>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </Box>
            <Box>
              <Typography variant="body2">{t('uploadDocument')}</Typography>
              <input type="file" accept=".pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button variant="contained" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <CircularProgress size={24} /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DoctorActionModal;
