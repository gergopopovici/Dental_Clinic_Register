import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addSummaryToAppointment } from '../services/AppointmentService';

interface DoctorSummaryModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  appointmentId: number | null;
  existingNotes?: string;
}

function DoctorSummaryModal({ open, onClose, userId, appointmentId, existingNotes }: DoctorSummaryModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setNotes(existingNotes || '');
      setAudioFile(null);
      setImageFile(null);
      setDocumentFile(null);
    }
  }, [open, existingNotes]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!appointmentId) {
        throw new Error('No appointment ID');
      }
      return addSummaryToAppointment(userId, appointmentId, notes, audioFile, imageFile, documentFile);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments', userId] });
      await queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('addSummary', 'Add Post-Appointment Summary')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField
          label={t('summaryNotes', 'Clinical Notes')}
          multiline
          rows={4}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Box>
          <Typography variant="body2">{t('uploadAudio', 'Audio Record (Optional)')}</Typography>
          <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
        </Box>
        <Box>
          <Typography variant="body2">{t('uploadImage', 'Image (Optional)')}</Typography>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </Box>
        <Box>
          <Typography variant="body2">{t('uploadDocument', 'PDF Document (Optional)')}</Typography>
          <input type="file" accept=".pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button variant="contained" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? <CircularProgress size={24} /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DoctorSummaryModal;
