import React from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Chip, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { TreatmentPlanDTO } from '../models/TreatmentPlan';

interface PatientViewProps {
  patientId: number;
}

function PatientTreatmentPlansView({ patientId }: PatientViewProps) {
  const { t } = useTranslation();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['myTreatmentPlans', patientId],
    queryFn: () => getPlansByPatientId(patientId),
  });

  if (isLoading) return <CircularProgress />;

  const activePlans = plans?.filter((p) => p.status === 'ACTIVE' || p.status === 'SUSPENDED') || [];
  const pastPlans = plans?.filter((p) => p.status === 'COMPLETED' || p.status === 'CANCELLED') || [];

  const renderPlanCard = (plan: TreatmentPlanDTO) => (
    <Card key={plan.id} sx={{ bgcolor: '#1e1e1e', color: 'white', border: '1px solid #333', mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{plan.planName}</Typography>
          <Chip
            label={t(plan.status)}
            color={plan.status === 'ACTIVE' ? 'success' : plan.status === 'CANCELLED' ? 'error' : 'default'}
          />
        </Box>
        <Typography variant="body2" color="#aaa" gutterBottom>
          {t('startDate')}: {plan.startDate} | {t('endDate')}: {plan.endDate || t('ongoing')}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {plan.notes || t('noNotesProvided')}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" gutterBottom color="primary.light">
          {t('activePlans', 'Active Plans')}
        </Typography>
        {activePlans.length === 0 ? (
          <Typography color="textSecondary">{t('noActivePlans', 'No active plans.')}</Typography>
        ) : (
          activePlans.map(renderPlanCard)
        )}
      </Box>

      <Divider sx={{ borderColor: '#333' }} />

      <Box>
        <Typography variant="h6" gutterBottom color="textSecondary">
          {t('pastPlans', 'Past Plans')}
        </Typography>
        {pastPlans.length === 0 ? (
          <Typography color="textSecondary">{t('noPastPlans', 'No past plans.')}</Typography>
        ) : (
          pastPlans.map(renderPlanCard)
        )}
      </Box>
    </Box>
  );
}

export default PatientTreatmentPlansView;
