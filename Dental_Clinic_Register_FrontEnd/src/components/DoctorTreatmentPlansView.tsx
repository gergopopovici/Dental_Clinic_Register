import React, { useState } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { getAllPatientsForDropdown } from '../services/PatientService';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { PatientDropDownDTO } from '../models/Appointment';
import { TreatmentPlanDTO } from '../models/TreatmentPlan';
import TreatmentPlanModal from './TreatmentPlanModal';

interface DoctorViewProps {
  doctorId: number;
}

function DoctorTreatmentPlansView({ doctorId }: DoctorViewProps) {
  const { t } = useTranslation();
  const [selectedPatient, setSelectedPatient] = useState<PatientDropDownDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlanDTO | null>(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patientsDropdown'],
    queryFn: getAllPatientsForDropdown,
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['treatmentPlans', selectedPatient?.userId],
    queryFn: () => getPlansByPatientId(selectedPatient!.userId),
    enabled: !!selectedPatient,
  });

  const handleOpenModal = (plan?: TreatmentPlanDTO) => {
    setEditingPlan(plan || null);
    setIsModalOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const activePlans = plans?.filter((p) => p.status === 'ACTIVE' || p.status === 'SUSPENDED') || [];
  const pastPlans = plans?.filter((p) => p.status === 'COMPLETED' || p.status === 'CANCELLED') || [];

  // FILTER OUT DELETED PATIENTS
  const activePatients = patients?.filter((p) => !p.email.includes('@anonymised.com')) || [];

  const darkFieldStyles = {
    bgcolor: '#2c2c2c',
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
    '& .MuiInputLabel-root': { color: '#aaa' },
    input: { color: 'white' },
  };

  const renderPlanCard = (plan: TreatmentPlanDTO) => (
    <Card key={plan.id} sx={{ bgcolor: '#1e1e1e', color: 'white', border: '1px solid #333', mb: 2 }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">{plan.planName}</Typography>
          <Typography variant="body2" color="#aaa">
            {t('startDate')}: {plan.startDate} | {t('endDate')}: {plan.endDate || t('ongoing')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={t(plan.status)}
            color={plan.status === 'ACTIVE' ? 'success' : plan.status === 'CANCELLED' ? 'error' : 'default'}
            variant="outlined"
          />
          <Button variant="outlined" size="small" onClick={() => handleOpenModal(plan)}>
            {t('edit')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ maxWidth: 400 }}>
        <Autocomplete
          options={activePatients} // <-- USED FILTERED LIST HERE
          getOptionLabel={(option) => `${option.fullName} (${option.email})`}
          loading={isLoadingPatients}
          value={selectedPatient}
          onChange={(e, newValue) => setSelectedPatient(newValue)}
          noOptionsText={t('noPatientsFound', 'No patients found')}
          renderInput={(params) => <TextField {...params} label={t('searchPatient')} sx={darkFieldStyles} />}
        />
      </Box>

      {selectedPatient && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6">
              {t('plansFor')} {selectedPatient.fullName}
            </Typography>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
              {t('createNewPlan')}
            </Button>
          </Box>

          {isLoadingPlans ? (
            <CircularProgress />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" color="primary.light">
                {t('activePlans', 'Active Plans')}
              </Typography>
              {activePlans.length === 0 ? (
                <Typography color="textSecondary">{t('noActivePlans', 'No active plans.')}</Typography>
              ) : (
                activePlans.map(renderPlanCard)
              )}

              <Divider sx={{ borderColor: '#333', my: 2 }} />

              <Typography variant="subtitle1" color="textSecondary">
                {t('pastPlans', 'Past Plans')}
              </Typography>
              {pastPlans.length === 0 ? (
                <Typography color="textSecondary">{t('noPastPlans', 'No past plans.')}</Typography>
              ) : (
                pastPlans.map(renderPlanCard)
              )}
            </Box>
          )}
        </>
      )}

      {selectedPatient && (
        <TreatmentPlanModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patientId={selectedPatient.userId}
          existingPlan={editingPlan}
          onSuccess={() => {
            setIsModalOpen(false);
            setSnackbar({
              open: true,
              message: t('planSavedSuccessfully', 'Plan saved successfully!'),
              severity: 'success',
            });
          }}
          onErrorAction={(message) => {
            setSnackbar({ open: true, message: message, severity: 'error' });
          }}
        />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DoctorTreatmentPlansView;
