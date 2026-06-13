import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ResponseAppointmentDTO } from '../models/Appointment';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface AppointmentCardProps {
  appointment: ResponseAppointmentDTO;
  userRole: 'PATIENT' | 'DOCTOR';
  onCancel?: (id: number) => void;
  onUpdate?: (id: number) => void;
  onComplete?: (id: number) => void;
  onNoShow?: (id: number) => void;
  onAddSummary?: (id: number, notes?: string) => void;
}

function AppointmentCard({
  appointment,
  userRole,
  onCancel,
  onUpdate,
  onComplete,
  onNoShow,
  onAddSummary,
}: AppointmentCardProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const displayDate = appointment.startTime?.split('T')[0];
  const displayTime = appointment.startTime?.split('T')[1].substring(0, 5);
  const isInactive = ['CANCELLED', 'NO_SHOW'].includes(appointment.status);

  const getFileUrl = (url: string) => `http://localhost:8080/api/files/${url.split('/').pop()}`;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: isInactive ? 0.7 : 1 }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={t(appointment.status)}
            color={getStatusColor(appointment.status) as any}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {displayDate}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {displayTime}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          {appointment.serviceName}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {userRole === 'PATIENT'
            ? `${t('doctor')}: Dr. ${appointment.doctorName}`
            : `${t('patient')}: ${appointment.patientName}`}
        </Typography>

        {appointment.summary && (
          <Box sx={{ mt: 1, mb: 2, p: 2, bgcolor: 'summaryBox', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary" fontWeight="bold">
              {t('postAppointmentSummary', 'Summary')}:
            </Typography>
            {appointment.summary.notes && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {appointment.summary.notes}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {appointment.summary.audioUrl && (
                <Button
                  size="small"
                  startIcon={<AudiotrackIcon />}
                  href={getFileUrl(appointment.summary.audioUrl)}
                  target="_blank"
                >
                  {t('audio')}
                </Button>
              )}
              {appointment.summary.imageUrl && (
                <Button
                  size="small"
                  startIcon={<ImageIcon />}
                  href={getFileUrl(appointment.summary.imageUrl)}
                  target="_blank"
                >
                  {t('image')}
                </Button>
              )}
              {appointment.summary.documentUrl && (
                <Button
                  size="small"
                  startIcon={<PictureAsPdfIcon />}
                  href={getFileUrl(appointment.summary.documentUrl)}
                  target="_blank"
                >
                  {t('document')}
                </Button>
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', flexWrap: 'wrap', pt: 2 }}>
          {appointment.status === 'CONFIRMED' && onCancel && (
            <Button variant="contained" color="error" size="small" onClick={() => onCancel(appointment.id)}>
              {t('cancel')}
            </Button>
          )}

          {userRole === 'DOCTOR' && (
            <>
              {appointment.status === 'CONFIRMED' && onUpdate && (
                <Button variant="outlined" size="small" onClick={() => onUpdate(appointment.id)}>
                  {t('reschedule')}
                </Button>
              )}
              {appointment.status === 'CONFIRMED' && onComplete && (
                <Button variant="contained" color="info" size="small" onClick={() => onComplete(appointment.id)}>
                  {t('complete')}
                </Button>
              )}
              {appointment.status === 'CONFIRMED' && onNoShow && (
                <Button variant="outlined" color="warning" size="small" onClick={() => onNoShow(appointment.id)}>
                  {t('noShow')}
                </Button>
              )}
              {appointment.status === 'COMPLETED' && onAddSummary && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => onAddSummary(appointment.id, appointment.summary?.notes)}
                >
                  {appointment.summary ? t('editSummary', 'Edit Summary') : t('addSummary', 'Add Summary')}
                </Button>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default AppointmentCard;
