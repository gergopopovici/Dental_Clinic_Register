import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ResponseAppointmentDTO } from '../models/Appointment';

interface AppointmentCardProps {
  appointment: ResponseAppointmentDTO;
  userRole: 'PATIENT' | 'DOCTOR';
  onCancel?: (id: number) => void;
  onUpdate?: (id: number) => void;
  onComplete?: (id: number) => void;
  onNoShow?: (id: number) => void;
}

function AppointmentCard({ appointment, userRole, onCancel, onUpdate, onComplete, onNoShow }: AppointmentCardProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      case 'NO_SHOW':
        return 'default';
      default:
        return 'default';
    }
  };

  const displayDate = appointment.startTime?.split('T')[0];
  const displayTime = appointment.startTime?.split('T')[1].substring(0, 5);

  const isInactive = ['CANCELLED', 'NO_SHOW'].includes(appointment.status);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isInactive ? 0.7 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={t(appointment.status.toLowerCase()) || appointment.status}
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

        <Typography variant="body1" sx={{ mb: 0.5 }}>
          {userRole === 'PATIENT'
            ? `${t('doctor')}: Dr. ${appointment.doctorName}`
            : `${t('patient')}: ${appointment.patientName}`}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {appointment.serviceDurationMinutes} {t('minutes')}
          <Box component="span">•</Box>
          <Box
            component="span"
            sx={{
              fontWeight: 'bold',
              textDecoration: isInactive ? 'line-through' : 'none',
            }}
          >
            {appointment.price} {t('currency')}
          </Box>
        </Typography>

        {appointment.notes && (
          <Box sx={{ p: 1.5, borderRadius: 1, mb: 2 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
              {appointment.status === 'CANCELLED' ? t('cancelReason') : t('notes')}:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {appointment.notes}
            </Typography>
          </Box>
        )}

        {appointment.resourceLink && (
          <Box sx={{ mb: 2 }}>
            <Button
              component="a"
              href={
                appointment.resourceLink.startsWith('http')
                  ? appointment.resourceLink
                  : `https://${appointment.resourceLink}`
              }
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              color="primary"
              sx={{
                textTransform: 'none',
                p: 0,
                minWidth: 0,
                fontWeight: 'bold',
                '&:hover': { background: 'none', textDecoration: 'underline' },
                '&:focus': { outline: 'none' },
              }}
            >
              🔗 {t('resourceLink')}
            </Button>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            mt: 'auto',
            flexWrap: 'wrap',
            pt: 2,
          }}
        >
          {appointment.status === 'CONFIRMED' && onCancel && (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => onCancel(appointment.id)}
              sx={{
                fontWeight: 'bold',
                '&:focus': {
                  outline: 'none',
                },
              }}
            >
              {t('cancel')}
            </Button>
          )}

          {userRole === 'DOCTOR' && (
            <>
              {appointment.status === 'CONFIRMED' && onUpdate && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => onUpdate(appointment.id)}
                  sx={{ fontWeight: 'bold', '&:focus': { outline: 'none' } }}
                >
                  {t('reschedule')}
                </Button>
              )}
              {appointment.status === 'CONFIRMED' && onComplete && (
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  onClick={() => onComplete(appointment.id)}
                  sx={{ fontWeight: 'bold', '&:focus': { outline: 'none' } }}
                >
                  {t('complete')}
                </Button>
              )}
              {appointment.status === 'CONFIRMED' && onNoShow && (
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={() => onNoShow(appointment.id)}
                  sx={{ fontWeight: 'bold', '&:focus': { outline: 'none' } }}
                >
                  {t('noShow')}
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
