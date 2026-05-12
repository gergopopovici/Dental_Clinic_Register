import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RequestPatientAppointmentDTO, TimePreference } from '../models/Appointment';
import { getDoctorsByService } from '../services/DoctorService';
import { requestAppointment } from '../services/AppointmentService';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { getAllServices } from '../services/ProvidedServiceService';
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
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctorsByService', serviceId],
    queryFn: () => getDoctorsByService(serviceId as number),
    enabled: !!serviceId && open,
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: getAllServices,
    enabled: open,
  });

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
    const payload: RequestPatientAppointmentDTO = {
      serviceId: serviceId as number,
      doctorId: doctorId as number,
      requestedDate: date,
      timePreference: timePreference as TimePreference,
    };
    bookMutation.mutate(payload);
  };

  const darkFieldStyles = {
    bgcolor: '#2c2c2c',
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
    '& .MuiSvgIcon-root': { color: 'white' },
    color: 'white',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: '#1e1e1e', color: 'white' } } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #333' }}>
        {t('requestNewAppointment')}
      </DialogTitle>
      <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>
            {errorMessage}
          </Typography>
        )}
        <FormControl fullWidth variant="outlined">
          <InputLabel sx={{ color: '#aaa' }}>{t('selectService')}</InputLabel>
          <Select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value as number);
              setDoctorId('');
            }}
            label={t('selectService')}
            sx={darkFieldStyles}
          >
            {isLoadingServices ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 2 }} /> {t('loading')}
              </MenuItem>
            ) : (
              services?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth variant="outlined" disabled={!serviceId}>
          <InputLabel sx={{ color: '#aaa' }}>{t('selectDoctors')}</InputLabel>
          <Select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value as number)}
            label={t('selectDoctor')}
            sx={darkFieldStyles}
          >
            {isLoadingDoctors ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 2 }} /> {t('loading')}
              </MenuItem>
            ) : !doctors || doctors.length === 0 ? (
              <MenuItem disabled>{serviceId ? t('noDoctorsFoundForService') : t('selectServiceFirst')}</MenuItem>
            ) : (
              doctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.fullName}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <TextField
          type="date"
          label={t('date')}
          fullWidth
          slotProps={{
            inputLabel: { shrink: true, sx: { color: '#aaa' } },
            htmlInput: { min: new Date().toISOString().split('T')[0] },
          }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ input: { color: 'white' }, ...darkFieldStyles }}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel sx={{ color: '#aaa' }}>{t('timePreference')}</InputLabel>
          <Select
            value={timePreference}
            onChange={(e) => setTimePreference(e.target.value as TimePreference)}
            label={t('timePreference')}
            sx={darkFieldStyles}
          >
            <MenuItem value="MORNING">{t('morning')}</MenuItem>
            <MenuItem value="AFTERNOON">{t('afternoon')}</MenuItem>
            <MenuItem value="EVENING">{t('evening')}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
        <Button onClick={onClose} sx={{ color: '#aaa' }} disabled={bookMutation.isPending}>
          {t('cancel')}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={bookMutation.isPending}>
          {bookMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('requestAppointment')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default PatientBookModal;
