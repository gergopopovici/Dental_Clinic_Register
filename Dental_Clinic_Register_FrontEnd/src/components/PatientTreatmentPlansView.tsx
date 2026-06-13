import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { TreatmentPlanDTO, PlanAppointmentDTO } from '../models/TreatmentPlan';

interface PatientViewProps {
  patientId: number;
}

function PatientTreatmentPlansView({ patientId }: PatientViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['myTreatmentPlans', patientId],
    queryFn: () => getPlansByPatientId(patientId),
  });

  if (isLoading) return <CircularProgress />;

  const activePlans = plans?.filter((p) => p.status === 'ACTIVE' || p.status === 'SUSPENDED') || [];
  const pastPlans = plans?.filter((p) => p.status === 'COMPLETED' || p.status === 'CANCELLED') || [];
  const getFileUrl = (url: string) => `http://localhost:8080/api/files/${url.split('/').pop()}`;

  const renderAppointmentHistory = (appointments?: PlanAppointmentDTO[]) => {
    if (!appointments || appointments.length === 0)
      return <Typography variant="body2">{t('noAppointmentsYet', 'No appointments yet.')}</Typography>;
    return [...appointments]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .map((apt) => (
        <Box
          key={apt.id}
          sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {new Date(apt.startTime).toLocaleString()} - {apt.serviceName}
          </Typography>
          {apt.summary ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">{apt.summary.notes}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {apt.summary.audioUrl && (
                  <Button
                    size="small"
                    startIcon={<AudiotrackIcon />}
                    href={getFileUrl(apt.summary.audioUrl)}
                    target="_blank"
                  >
                    {t('audio')}
                  </Button>
                )}
                {apt.summary.imageUrl && (
                  <Button
                    size="small"
                    startIcon={<ImageIcon />}
                    href={getFileUrl(apt.summary.imageUrl)}
                    target="_blank"
                  >
                    {t('image')}
                  </Button>
                )}
                {apt.summary.documentUrl && (
                  <Button
                    size="small"
                    startIcon={<PictureAsPdfIcon />}
                    href={getFileUrl(apt.summary.documentUrl)}
                    target="_blank"
                  >
                    {t('document')}
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Typography variant="caption">{t('noSummaryYet', 'No summary attached.')}</Typography>
          )}
        </Box>
      ));
  };

  const renderPlanCard = (plan: TreatmentPlanDTO) => (
    <Card key={plan.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{plan.primaryServiceName}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {plan.requires3DModel && (
              <Button
                variant="contained"
                color="info"
                size="small"
                onClick={() => navigate(`/treatment-plans/${plan.id}/braces`)}
              >
                {t('view3DModel', 'View 3D Model')}
              </Button>
            )}
            <Chip
              label={t(plan.status)}
              color={plan.status === 'ACTIVE' ? 'success' : plan.status === 'CANCELLED' ? 'error' : 'default'}
            />
          </Box>
        </Box>
        <Typography variant="body2" gutterBottom>
          {t('startDate')}: {plan.startDate} | {t('endDate')}: {plan.endDate || t('ongoing')}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {plan.generalNotes || t('noNotesProvided')}
        </Typography>

        {plan.plannedServiceNames && plan.plannedServiceNames.length > 0 && (
          <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {plan.plannedServiceNames.map((name, i) => (
              <Chip key={i} label={name} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        <Accordion variant="outlined" sx={{ mt: 2, bgcolor: 'background.default' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{t('appointmentHistory', 'Appointment History & Summaries')}</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderAppointmentHistory(plan.appointments)}</AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" color="primary.light">
          {t('activePlans', 'Active Plans')}
        </Typography>
        {activePlans.length === 0 ? (
          <Typography>{t('noActivePlans', 'No active plans.')}</Typography>
        ) : (
          activePlans.map(renderPlanCard)
        )}
      </Box>
      <Divider />
      <Box>
        <Typography variant="h6" color="primary.light">
          {t('pastPlans', 'Past Plans')}
        </Typography>
        {pastPlans.length === 0 ? (
          <Typography>{t('noPastPlans', 'No past plans.')}</Typography>
        ) : (
          pastPlans.map(renderPlanCard)
        )}
      </Box>
    </Box>
  );
}

export default PatientTreatmentPlansView;
