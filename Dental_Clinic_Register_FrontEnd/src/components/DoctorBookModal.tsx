import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllServices } from '../services/ProvidedServiceService';
import { createAppointmentByDoctor } from '../services/AppointmentService';
import { getAllPatientsForDropdown } from '../services/PatientService';
import { PatientDropDownDTO } from '../models/Appointment';

interface DoctorBookModalProps {
  open: boolean;
  onClose: () => void;
  doctorId: number;
}

function DoctorBookModal({ open, onClose, doctorId }: DoctorBookModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [patientId, setPatientId] = useState<number | ''>('');
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [datetime, setDatetime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [resourceLink, setResourceLink] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setPatientId('');
      setServiceId('');
      setDatetime('');
      setNotes('');
      setResourceLink('');
      setErrorMessage('');
    }
  }, [open]);

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: getAllPatientsForDropdown,
    enabled: open,
  });

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: getAllServices,
    enabled: open,
  });

  const activeAndSortedPatients = React.useMemo(() => {
    if (!patients) return [];
    return patients
      .filter((p: PatientDropDownDTO) => !p.email.includes('@anonymised.com'))
      .sort((a: PatientDropDownDTO, b: PatientDropDownDTO) => {
        const nameA = (a.fullName || '').toLowerCase();
        const nameB = (b.fullName || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [patients]);

  const bookMutation = useMutation({
    mutationFn: (payload: any) => createAppointmentByDoctor(doctorId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
      onClose();
    },
    onError: (error: any) => {
      const backendErrorKey = error.response?.data?.message || 'error.unknown';
      setErrorMessage(t(backendErrorKey));
    },
  });

  const handleSubmit = () => {
    if (!patientId || !serviceId || !datetime) {
      setErrorMessage(t('pleaseFillAllFields'));
      return;
    }

    const payload = {
      patientId: patientId as number,
      serviceId: serviceId as number,
      startTime: datetime,
      notes,
      resourceLink,
    };

    bookMutation.mutate(payload);
  };

  const darkFieldStyles = {
    bgcolor: '#2c2c2c',
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
    '& .MuiInputLabel-root': { color: '#aaa' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
    color: 'white',
    input: { color: 'white' },
    textarea: { color: 'white' },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: '#1e1e1e', color: 'white' } } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #333' }}>{t('bookForPatient')}</DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
            {errorMessage}
          </Typography>
        )}

        <Autocomplete
          options={activeAndSortedPatients}
          loading={isLoadingPatients}
          getOptionLabel={(option: PatientDropDownDTO) => `${option.fullName} (${option.email})`}
          value={activeAndSortedPatients.find((p) => p.userId === patientId) || null}
          onChange={(_, newValue) => setPatientId(newValue ? newValue.userId : '')}
          noOptionsText={t('noPatientsFound', 'No patients found')}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('selectPatient')}
              placeholder={t('searchPatientByName')}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingPatients ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
              sx={darkFieldStyles}
            />
          )}
          slotProps={{
            paper: {
              sx: {
                bgcolor: '#2c2c2c',
                color: 'white',
                '& .MuiAutocomplete-option[aria-selected="true"]': { bgcolor: '#444 !important' },
              },
            },
          }}
        />

        <FormControl fullWidth variant="outlined" sx={darkFieldStyles}>
          <InputLabel shrink>{t('selectService')}</InputLabel>
          <Select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value as number)}
            label={t('selectService')}
            notched
          >
            {isLoadingServices ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 2 }} /> {t('loading')}
              </MenuItem>
            ) : (
              services?.map((s: any) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min)
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <TextField
          type="datetime-local"
          label={t('exactStartTime')}
          fullWidth
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: new Date().toISOString().slice(0, 16) },
          }}
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          sx={darkFieldStyles}
        />

        <TextField
          label={t('notesOptions')}
          multiline
          rows={3}
          fullWidth
          placeholder={t('addAnyInstructionsForPatient')}
          slotProps={{ inputLabel: { shrink: true } }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={darkFieldStyles}
        />

        <TextField
          label={t('resourceLinkOptional')}
          fullWidth
          placeholder={t('addAnyResources')}
          slotProps={{ inputLabel: { shrink: true } }}
          value={resourceLink}
          onChange={(e) => setResourceLink(e.target.value)}
          sx={darkFieldStyles}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
        <Button onClick={onClose} sx={{ color: '#aaa' }}>
          {t('cancel')}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={bookMutation.isPending}>
          {bookMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DoctorBookModal;
