import React from 'react';
import { Box, Typography, CircularProgress, Card, CardContent, Chip, Divider, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { TreatmentPlanDTO } from '../models/TreatmentPlan';

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

  const renderPlanCard = (plan: TreatmentPlanDTO) => {
    const isBracesPlan = plan.planName.toLowerCase().match(/(brace|aparat|ortho|orto|fogszab)/i);
    return (
      <Card key={plan.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">{plan.planName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isBracesPlan && (
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
            {plan.notes || t('noNotesProvided')}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h6" gutterBottom color="primary.light">
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
        <Typography variant="h6" gutterBottom color="primary.light">
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
