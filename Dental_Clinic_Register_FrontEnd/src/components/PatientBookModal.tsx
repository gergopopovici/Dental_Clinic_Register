import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Typography,
  Autocomplete,
  Box,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllServices } from '../services/ProvidedServiceService';
import { getDoctorsByService } from '../services/DoctorService';
import { requestAppointment, getBookedSlotsForDoctor } from '../services/AppointmentService';
import { getDoctorSchedule, getDoctorTimeOffs, getGlobalHolidays } from '../services/ScheduleService';
import { RequestPatientAppointmentDTO } from '../models/Appointment';

interface PatientBookModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  onSuccess?: () => void;
}

function PatientBookModal({ open, onClose, userId, onSuccess }: PatientBookModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [serviceId, setServiceId] = useState<number | ''>('');
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const APPOINTMENT_BUFFER_MINUTES = 5;

  useEffect(() => {
    if (!open) {
      setServiceId('');
      setDoctorId('');
      setDate('');
      setSelectedTime('');
      setErrorMessage('');
    }
  }, [open]);

  useEffect(() => {
    setSelectedTime('');
  }, [date, doctorId, serviceId]);

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: getAllServices,
    enabled: open,
  });

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctorsByService', serviceId],
    queryFn: () => getDoctorsByService(serviceId as number),
    enabled: !!serviceId && open,
  });

  const {
    data: bookedSlots,
    isLoading: isLoadingSlots,
    isError: isErrorSlots,
  } = useQuery({
    queryKey: ['bookedSlots', doctorId, date],
    queryFn: () => getBookedSlotsForDoctor(doctorId as number, date),
    enabled: !!doctorId && !!date && open,
    retry: 1,
  });

  const {
    data: weeklySchedule,
    isLoading: isLoadingSchedule,
    isError: isErrorSchedule,
  } = useQuery({
    queryKey: ['doctorSchedule', doctorId],
    queryFn: () => getDoctorSchedule(doctorId as number),
    enabled: !!doctorId && open,
    retry: 1,
  });

  const {
    data: timeOffs,
    isLoading: isLoadingTimeOffs,
    isError: isErrorTimeOffs,
  } = useQuery({
    queryKey: ['doctorTimeOffs', doctorId],
    queryFn: () => getDoctorTimeOffs(doctorId as number),
    enabled: !!doctorId && open,
    retry: 1,
  });

  const {
    data: globalHolidays,
    isLoading: isLoadingGlobal,
    isError: isErrorGlobal,
  } = useQuery({
    queryKey: ['globalHolidays'],
    queryFn: getGlobalHolidays,
    enabled: open,
    retry: 1,
  });

  const sortedServices = useMemo(
    () => (services ? [...services].sort((a, b) => a.name.localeCompare(b.name)) : []),
    [services],
  );

  const sortedDoctors = useMemo(
    () => (doctors ? [...doctors].sort((a, b) => a.fullName.localeCompare(b.fullName)) : []),
    [doctors],
  );

  const selectedService = useMemo(() => sortedServices.find((s) => s.id === serviceId), [sortedServices, serviceId]);

  const availableSlots = useMemo(() => {
    if (!date || !doctorId || !selectedService || !weeklySchedule) return [];

    const allTimeOffs = [...(timeOffs || []), ...(globalHolidays || [])];
    const isTimeOff = allTimeOffs.some((off) => date >= off.startDate && date <= off.endDate);

    if (isTimeOff) return [];

    const dateObj = new Date(date);
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeekStr = daysOfWeek[dateObj.getDay()];

    const daySchedule = weeklySchedule.find((s) => s.dayOfWeek === dayOfWeekStr);

    if (!daySchedule || !daySchedule.isWorking) return [];

    const duration = selectedService.durationMinutes;
    const [year, month, day] = date.split('-').map(Number);
    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);

    let current = new Date(year, month - 1, day, startH, startM, 0);
    const endOfDay = new Date(year, month - 1, day, endH, endM, 0);
    const now = new Date();

    const slots: string[] = [];

    let iterations = 0;
    const MAX_ITERATIONS = 50;

    while (current < endOfDay && iterations < MAX_ITERATIONS) {
      iterations++;

      const slotEnd = new Date(current.getTime() + duration * 60000);

      if (slotEnd > endOfDay) break;

      let isOverlapping = false;
      let nextAvailableStart = null;

      if (bookedSlots && bookedSlots.length > 0) {
        for (const b of bookedSlots) {
          const bStart = new Date(b.startTime);
          const bEnd = new Date(b.endTime);

          if (current < bEnd && slotEnd > bStart) {
            isOverlapping = true;
            nextAvailableStart = bEnd;
            break;
          }
        }
      }

      if (isOverlapping && nextAvailableStart) {
        current = new Date(nextAvailableStart.getTime() + APPOINTMENT_BUFFER_MINUTES * 60000);
        continue;
      }

      if (current > now) {
        const h = current.getHours().toString().padStart(2, '0');
        const m = current.getMinutes().toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }

      current = new Date(current.getTime() + (duration + APPOINTMENT_BUFFER_MINUTES) * 60000);
    }
    return slots;
  }, [date, doctorId, selectedService, bookedSlots, weeklySchedule, timeOffs, globalHolidays]);

  const bookMutation = useMutation({
    mutationFn: (request: RequestPatientAppointmentDTO) => requestAppointment(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments', userId] });
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    },
    onError: (error: any) => {
      const backendErrorKey = error.response?.data?.message || 'error.unknown';
      setErrorMessage(t(backendErrorKey));
    },
  });

  const handleSubmit = () => {
    if (!serviceId || !doctorId || !date || !selectedTime) {
      setErrorMessage(t('pleaseFillAllFields'));
      return;
    }
    bookMutation.mutate({
      serviceId: serviceId as number,
      doctorId: doctorId as number,
      startTime: `${date}T${selectedTime}:00`,
    });
  };

  const isScheduleLoading = isLoadingSlots || isLoadingSchedule || isLoadingTimeOffs || isLoadingGlobal;
  const isScheduleError = isErrorSlots || isErrorSchedule || isErrorTimeOffs || isErrorGlobal;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableRestoreFocus>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('requestNewAppointment')}</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
            {errorMessage}
          </Typography>
        )}

        <FormControl fullWidth variant="outlined">
          <InputLabel shrink>{t('selectService')}</InputLabel>
          <Select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value as number);
              setDoctorId('');
            }}
            label={t('selectService')}
            notched
            autoFocus
          >
            {isLoadingServices ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 2 }} /> {t('loading')}
              </MenuItem>
            ) : (
              sortedServices.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {s.name} ({s.durationMinutes} min)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
                      {s.price} {t('currency')}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Autocomplete
          disabled={!serviceId}
          options={sortedDoctors}
          loading={isLoadingDoctors}
          getOptionLabel={(option) => option.fullName || ''}
          value={sortedDoctors.find((d) => d.userId === doctorId) || null}
          onChange={(_, newValue) => setDoctorId(newValue ? newValue.userId : '')}
          noOptionsText={serviceId ? t('noDoctorsFoundForService') : t('selectServiceFirst')}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('selectDoctor')}
              placeholder={t('searchDoctorByName')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />

        <TextField
          type="date"
          label={t('date')}
          fullWidth
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: new Date().toISOString().split('T')[0] },
          }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {date && doctorId && selectedService && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
              {t('selectTime')}
            </Typography>
            {isScheduleLoading ? (
              <CircularProgress size={24} />
            ) : isScheduleError ? (
              <Typography variant="body2" color="error">
                {t('errorLoadingSchedule', 'Hiba történt a menetrend betöltésekor.')}
              </Typography>
            ) : availableSlots.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                {t('noAvailableSlots')}
              </Typography>
            ) : (
              <Grid container spacing={1}>
                {availableSlots.map((time) => (
                  <Grid size={{ xs: 3 }} key={time}>
                    <Button
                      variant={selectedTime === time ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setSelectedTime(time)}
                      fullWidth
                      sx={{ fontWeight: 'bold', '&:focus': { outline: 'none' } }}
                    >
                      {time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 'bold',
            '&:focus': { outline: 'none' },
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={bookMutation.isPending || !selectedTime}
          sx={{
            fontWeight: 'bold',
          }}
        >
          {bookMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('requestAppointment')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PatientBookModal;
