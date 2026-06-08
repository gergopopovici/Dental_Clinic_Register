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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllServices } from '../services/ProvidedServiceService';
import { getDoctorsByService } from '../services/DoctorService';
import { requestAppointment } from '../services/AppointmentService';
import { RequestPatientAppointmentDTO, TimePreference } from '../models/Appointment';

interface PatientBookModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
}

function PatientBookModal({ open, onClose, userId }: PatientBookModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [serviceId, setServiceId] = useState<number | ''>('');
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [timePreference, setTimePreference] = useState<TimePreference | ''>('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setServiceId('');
      setDoctorId('');
      setDate('');
      setTimePreference('');
      setErrorMessage('');
    }
  }, [open]);

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

  const sortedServices = useMemo(
    () => (services ? [...services].sort((a, b) => a.name.localeCompare(b.name)) : []),
    [services],
  );

  const sortedDoctors = useMemo(
    () => (doctors ? [...doctors].sort((a, b) => a.fullName.localeCompare(b.fullName)) : []),
    [doctors],
  );

  const bookMutation = useMutation({
    mutationFn: (request: RequestPatientAppointmentDTO) => requestAppointment(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientAppointments', userId] });
      onClose();
    },
    onError: (error: any) => {
      const backendErrorKey = error.response?.data?.message || 'error.unknown';
      setErrorMessage(t(backendErrorKey));
    },
  });

  const handleSubmit = () => {
    if (!serviceId || !doctorId || !date || !timePreference) {
      setErrorMessage(t('pleaseFillAllFields'));
      return;
    }
    bookMutation.mutate({
      serviceId: serviceId as number,
      doctorId: doctorId as number,
      requestedDate: date,
      timePreference: timePreference as TimePreference,
    });
  };

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
          value={sortedDoctors.find((d) => d.id === doctorId) || null}
          onChange={(_, newValue) => setDoctorId(newValue ? newValue.id : '')}
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

        <FormControl fullWidth variant="outlined">
          <InputLabel shrink>{t('timePreference')}</InputLabel>
          <Select
            value={timePreference}
            onChange={(e) => setTimePreference(e.target.value as TimePreference)}
            label={t('timePreference')}
            notched
          >
            <MenuItem value="MORNING">{t('morning')}</MenuItem>
            <MenuItem value="AFTERNOON">{t('afternoon')}</MenuItem>
            <MenuItem value="EVENING">{t('evening')}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            fontWeight: 'bold',
            '&:focus': {
              outline: 'none',
            },
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={bookMutation.isPending}
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
