import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ResponseAppointmentDTO } from '../models/Appointment';

interface AppointmentCardProps {
  appointment: ResponseAppointmentDTO;
  userRole: 'PATIENT' | 'DOCTOR';
  onCancel?: (id: number) => void;
  onConfirm?: (id: number) => void;
  onUpdate?: (id: number) => void;
  onComplete?: (id: number) => void;
  onNoShow?: (id: number) => void;
}

function AppointmentCard({
  appointment,
  userRole,
  onCancel,
  onConfirm,
  onUpdate,
  onComplete,
  onNoShow,
}: AppointmentCardProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
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

  const displayDate = appointment.requestedDate || appointment.startTime?.split('T')[0];
  const displayTime = appointment.startTime
    ? appointment.startTime.split('T')[1].substring(0, 5)
    : appointment.timePreference;

  return (
    <Card sx={{ bgcolor: '#1e1e1e', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={t(appointment.status.toLowerCase()) || appointment.status}
            color={getStatusColor(appointment.status) as any}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#aaaaaa' }}>
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
        <Typography variant="body1" sx={{ color: '#aaaaaa', mb: 0.5 }}>
          {userRole === 'PATIENT'
            ? `${t('doctor')}: Dr. ${appointment.doctorName}`
            : `${t('patient')}: ${appointment.patientName}`}
        </Typography>
        <Typography variant="body2" sx={{ color: '#777777', mb: 2 }}>
          {appointment.serviceDurationMinutes} {t('minutes')}
        </Typography>

        {appointment.notes && (
          <Typography variant="body2" sx={{ bgcolor: '#2c2c2c', p: 1, borderRadius: 1, mb: 2, fontStyle: 'italic' }}>
            {appointment.notes}
          </Typography>
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
              sx={{ textTransform: 'none', p: 0, '&:hover': { background: 'none', textDecoration: 'underline' } }}
            >
              🔗 {t('resourceLink')}
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, mt: 'auto', flexWrap: 'wrap' }}>
          {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && onCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onCancel(appointment.id)}
              sx={{ flex: 1 }}
            >
              {t('cancel')}
            </Button>
          )}

          {userRole === 'DOCTOR' && (
            <>
              {appointment.status === 'PENDING' && onConfirm && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => onConfirm(appointment.id)}
                  sx={{ flex: 1 }}
                >
                  {t('confirm')}
                </Button>
              )}
              {appointment.status === 'CONFIRMED' && onUpdate && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => onUpdate(appointment.id)}
                  sx={{ flex: 1 }}
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
                  sx={{ flex: 1 }}
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
                  sx={{ flex: 1 }}
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
