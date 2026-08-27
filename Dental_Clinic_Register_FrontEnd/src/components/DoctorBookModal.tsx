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
  SelectChangeEvent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointmentByDoctor, getBookedSlotsForDoctor } from '../services/AppointmentService';
import { getAllPatientsForDropdown } from '../services/PatientService';
import { getDoctorSchedule, getDoctorTimeOffs, getGlobalHolidays } from '../services/ScheduleService';
import { PatientDropDownDTO, BookedSlotDTO, DoctorCreateAppointmentDTO } from '../models/Appointment';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { TreatmentPlanDTO } from '../models/TreatmentPlan';
import { DoctorScheduleDTO, TimeOffDTO } from '../models/Schedule';
import { ResponseServiceDTO } from '../models/Service';
import { getMyServices } from '../services/DoctorService';

interface DoctorBookModalProps {
  open: boolean;
  onClose: () => void;
  doctorId: number;
  onSuccess?: () => void;
  initialPatientId?: number;
  initialPlanId?: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function DoctorBookModal({ open, onClose, doctorId, onSuccess, initialPatientId, initialPlanId }: DoctorBookModalProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [patientId, setPatientId] = useState<number | ''>('');
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [treatmentPlanId, setTreatmentPlanId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customDuration, setCustomDuration] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');
  const [resourceLink, setResourceLink] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const APPOINTMENT_BUFFER_MINUTES = 5;

  useEffect(() => {
    if (!open) {
      setPatientId('');
      setServiceId('');
      setTreatmentPlanId('');
      setDate('');
      setSelectedTime('');
      setCustomDuration('');
      setNotes('');
      setResourceLink('');
      setErrorMessage('');
    } else {
      if (initialPatientId) setPatientId(initialPatientId);
      if (initialPlanId) setTreatmentPlanId(initialPlanId);
    }
  }, [open, initialPatientId, initialPlanId]);

  useEffect(() => {
    setSelectedTime('');
  }, [date, doctorId, serviceId, customDuration]);

  const { data: patients, isLoading: isLoadingPatients } = useQuery<PatientDropDownDTO[]>({
    queryKey: ['patients'],
    queryFn: getAllPatientsForDropdown,
    enabled: open,
  });

  const { data: services, isLoading: isLoadingServices } = useQuery<ResponseServiceDTO[]>({
    queryKey: ['services'],
    queryFn: getMyServices,
    enabled: open,
  });

  const { data: bookedSlots, isLoading: isLoadingSlots } = useQuery<BookedSlotDTO[]>({
    queryKey: ['bookedSlots', doctorId, date],
    queryFn: () => getBookedSlotsForDoctor(doctorId, date),
    enabled: !!doctorId && !!date && open,
    retry: 1,
  });

  const { data: weeklySchedule, isLoading: isLoadingSchedule } = useQuery<DoctorScheduleDTO[]>({
    queryKey: ['doctorSchedule', doctorId],
    queryFn: () => getDoctorSchedule(doctorId),
    enabled: !!doctorId && open,
    retry: 1,
  });

  const { data: timeOffs, isLoading: isLoadingTimeOffs } = useQuery<TimeOffDTO[]>({
    queryKey: ['doctorTimeOffs', doctorId],
    queryFn: () => getDoctorTimeOffs(doctorId),
    enabled: !!doctorId && open,
    retry: 1,
  });

  const { data: globalHolidays, isLoading: isLoadingGlobal } = useQuery<TimeOffDTO[]>({
    queryKey: ['globalHolidays'],
    queryFn: getGlobalHolidays,
    enabled: open,
    retry: 1,
  });

  const { data: patientPlans, isLoading: isLoadingPlans } = useQuery<TreatmentPlanDTO[]>({
    queryKey: ['treatmentPlans', patientId],
    queryFn: () => getPlansByPatientId(Number(patientId)),
    enabled: !!patientId && open,
  });

  const getLocalizedName = (service: any) => {
    if (i18n.language.startsWith('hu')) return service.nameHu;
    if (i18n.language.startsWith('ro')) return service.nameRo;
    return service.nameEn;
  };

  const activeAndSortedPatients = useMemo(() => {
    if (!patients) return [];
    return patients
      .filter((p: PatientDropDownDTO) => !p.email.includes('@anonymised.com'))
      .sort((a: PatientDropDownDTO, b: PatientDropDownDTO) =>
        (a.fullName || '').toLowerCase().localeCompare((b.fullName || '').toLowerCase()),
      );
  }, [patients]);

  const selectedService = useMemo(() => {
    return services?.find((s: ResponseServiceDTO) => s.id === serviceId);
  }, [services, serviceId]);

  useEffect(() => {
    if (selectedService) {
      setCustomDuration(selectedService.durationMinutes);
    }
  }, [selectedService]);

  const availableSlots = useMemo(() => {
    if (!date || !doctorId || !selectedService || !weeklySchedule) return [];

    const allTimeOffs = [...(timeOffs || []), ...(globalHolidays || [])];
    if (allTimeOffs.some((off: TimeOffDTO) => date >= off.startDate && date <= off.endDate)) return [];

    const dateObj = new Date(date);
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const daySchedule = weeklySchedule.find((s: DoctorScheduleDTO) => s.dayOfWeek === daysOfWeek[dateObj.getDay()]);

    if (!daySchedule || !daySchedule.isWorking) return [];

    const duration = customDuration !== '' ? Number(customDuration) : selectedService.durationMinutes;
    const [year, month, day] = date.split('-').map(Number);
    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);

    let current = new Date(year, month - 1, day, startH, startM, 0);
    const endOfDay = new Date(year, month - 1, day, endH, endM, 0);
    const now = new Date();

    const slots: string[] = [];
    let iterations = 0;

    while (current.getTime() < endOfDay.getTime() && iterations < 50) {
      iterations++;
      const slotEnd = new Date(current.getTime() + duration * 60000);
      if (slotEnd.getTime() > endOfDay.getTime()) break;

      const isOverlapping = (bookedSlots || []).some((b: BookedSlotDTO) => {
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        return current.getTime() < bEnd && slotEnd.getTime() > bStart;
      });

      if (!isOverlapping && current.getTime() > now.getTime()) {
        const timeString = `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`;
        if (!slots.includes(timeString)) {
          slots.push(timeString);
        }
      }

      current = new Date(current.getTime() + (duration + APPOINTMENT_BUFFER_MINUTES) * 60000);
    }
    return slots;
  }, [date, doctorId, selectedService, customDuration, bookedSlots, weeklySchedule, timeOffs, globalHolidays]);

  const bookMutation = useMutation({
    mutationFn: (payload: DoctorCreateAppointmentDTO) => createAppointmentByDoctor(doctorId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    },
    onError: (error: unknown) => {
      const err = error as ApiError;
      setErrorMessage(t(err.response?.data?.message || 'error.unknown'));
    },
  });

  const handlePatientChange = (_: React.SyntheticEvent, value: PatientDropDownDTO | null) => {
    setPatientId(value ? value.userId : '');
    setTreatmentPlanId('');
  };

  const handleServiceChange = (e: SelectChangeEvent<number | ''>) => {
    setServiceId(e.target.value === '' ? '' : Number(e.target.value));
  };

  const handleTreatmentPlanChange = (e: SelectChangeEvent<number | ''>) => {
    setTreatmentPlanId(e.target.value === '' ? '' : Number(e.target.value));
  };

  const handleSubmit = () => {
    if (patientId === '' || serviceId === '' || !date || !selectedTime) {
      setErrorMessage(t('pleaseFillAllFields'));
      return;
    }

    bookMutation.mutate({
      patientId: Number(patientId),
      serviceId: Number(serviceId),
      treatmentPlanId: treatmentPlanId === '' ? null : Number(treatmentPlanId),
      startTime: `${date}T${selectedTime}:00`,
      notes,
      resourceLink,
      customDurationMinutes: customDuration !== '' ? Number(customDuration) : undefined,
    });
  };

  const isScheduleLoading = isLoadingSlots || isLoadingSchedule || isLoadingTimeOffs || isLoadingGlobal;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('bookForPatient')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>
            {errorMessage}
          </Typography>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Autocomplete
                options={activeAndSortedPatients}
                loading={isLoadingPatients}
                getOptionLabel={(p: PatientDropDownDTO) => `${p.fullName} (${p.email})`}
                value={activeAndSortedPatients.find((p: PatientDropDownDTO) => p.userId === patientId) || null}
                onChange={handlePatientChange}
                renderInput={(params) => <TextField {...params} label={t('selectPatient')} />}
              />

              {patientId !== '' && (
                <FormControl fullWidth>
                  <InputLabel shrink>{t('selectTreatmentPlan')}</InputLabel>
                  <Select
                    value={treatmentPlanId}
                    onChange={handleTreatmentPlanChange}
                    label={t('selectTreatmentPlan')}
                    notched
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>{t('none')}</em>
                    </MenuItem>
                    {isLoadingPlans ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      patientPlans
                        ?.filter((p: TreatmentPlanDTO) => p.status === 'ACTIVE')
                        .map((plan: TreatmentPlanDTO) => (
                          <MenuItem key={plan.id} value={plan.id as number}>
                            {plan.planType ? t(`plan.${plan.planType}`) : `Plan #${plan.id}`}
                          </MenuItem>
                        ))
                    )}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth>
                <InputLabel shrink>{t('selectService')}</InputLabel>
                <Select value={serviceId} onChange={handleServiceChange} label={t('selectService')} notched>
                  {services?.map((s: ResponseServiceDTO) => (
                    <MenuItem key={s.id} value={s.id}>
                      {getLocalizedName(s)} ({s.durationMinutes} min)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedService && (
                <TextField
                  label={t('customDuration', 'Időtartam (perc)')}
                  type="number"
                  fullWidth
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  inputProps={{ min: 5, step: 5 }}
                />
              )}

              <TextField
                label={t('notesOptions')}
                multiline
                rows={2}
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
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {doctorId && selectedService ? (
              <Box>
               <TextField
                type="date"
                label={t('date')}
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { 
                    min: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` 
                  },
                }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

                {date && (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('selectTime')}
                    </Typography>
                    {isScheduleLoading ? (
                      <CircularProgress size={24} />
                    ) : availableSlots.length === 0 ? (
                      <Typography>{t('noAvailableSlots')}</Typography>
                    ) : (
                      <Grid container spacing={1}>
                        {availableSlots.map((time: string) => (
                          <Grid size={{ xs: 3 }} key={time}>
                            <Button
                              variant={selectedTime === time ? 'contained' : 'outlined'}
                              onClick={() => setSelectedTime(time)}
                              fullWidth
                              size="small"
                            >
                              {time}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </>
                )}
              </Box>
            ) : (
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">{t('selectServiceFirst')}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={bookMutation.isPending || !selectedTime}>
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DoctorBookModal;