import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmAppointment, updateAppointment } from '../services/AppointmentService';
import { DoctorConfirmDTO, DoctorUpdateAppointmentDTO } from '../models/Appointment';

interface DoctorActionModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  appointmentId: number | null;
  actionType: 'CONFIRM' | 'RESCHEDULE';
  initialDateTime?: string;
  initialNotes?: string;
  initialResourceLink?: string;
}

function DoctorActionModal({
  open,
  onClose,
  userId,
  appointmentId,
  actionType,
  initialDateTime,
  initialNotes,
  initialResourceLink,
}: DoctorActionModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dateTime, setDateTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [resourceLink, setResourceLink] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (open) {
      setDateTime(initialDateTime || '');
      setNotes(initialNotes || '');
      setResourceLink(initialResourceLink || '');
    } else {
      setDateTime('');
      setNotes('');
      setResourceLink('');
      setErrorMessage('');
    }
  }, [open, initialDateTime, initialNotes, initialResourceLink]);

  const actionMutation = useMutation({
    mutationFn: (payload: DoctorConfirmDTO | DoctorUpdateAppointmentDTO) => {
      if (!appointmentId) throw new Error(t('no.appointment.id'));

      if (actionType === 'CONFIRM') {
        return confirmAppointment(userId, appointmentId, payload as DoctorConfirmDTO);
      } else {
        return updateAppointment(userId, appointmentId, payload as DoctorUpdateAppointmentDTO);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments', userId] });
      onClose();
    },
    onError: (error: any) => {
      const backendErrorKey = error.response?.data?.message || 'error.unknown';
      setErrorMessage(t(backendErrorKey));
    },
  });

  const handleSubmit = () => {
    if (!dateTime) {
      setErrorMessage(t('pleaseSelectDateTime'));
      return;
    }
    const payload =
      actionType === 'CONFIRM'
        ? ({ exactStartTime: dateTime, notes, resourceLink } as DoctorConfirmDTO)
        : ({ newStartTime: dateTime, notes, resourceLink } as DoctorUpdateAppointmentDTO);
    actionMutation.mutate(payload);
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
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #333' }}>
        {actionType === 'CONFIRM' ? t('confirmAppointmentTime') : t('rescheduleAppointment')}
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
            {errorMessage}
          </Typography>
        )}

        <TextField
          type="datetime-local"
          label={t('exactStartTime')}
          fullWidth
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: new Date().toISOString().slice(0, 16) },
          }}
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
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
        <Button
          onClick={onClose}
          sx={{
            color: 'white',
            fontWeight: 'bold',
            backgroundColor: '#d82215',
            '&:hover': {
              backgroundColor: 'darkred',
            },
            '&:focus': {
              outline: 'none',
            },
          }}
        >
          {t('cancel')}
        </Button>
        <Button
          variant="contained"
          color={actionType === 'CONFIRM' ? 'success' : 'primary'}
          onClick={handleSubmit}
          disabled={actionMutation.isPending}
          sx={{
            fontWeight: 'bold',
          }}
        >
          {actionMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DoctorActionModal;
