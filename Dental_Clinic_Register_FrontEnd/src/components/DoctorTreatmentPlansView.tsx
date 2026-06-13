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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { getAllPatientsForDropdown } from '../services/PatientService';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { PatientDropDownDTO } from '../models/Appointment';
import { TreatmentPlanDTO, PlanAppointmentDTO, AppointmentSummaryDTO } from '../models/TreatmentPlan';
import TreatmentPlanModal from './TreatmentPlanModal';
import { apiURL } from '../config/apiUrl';
import { cancelAppointmentByDoctor, markAsNoShow } from '../services/AppointmentService';
import DoctorActionModal from './DoctorActionModal';

interface DoctorViewProps {
  doctorId: number;
}

function DoctorTreatmentPlansView({ doctorId }: DoctorViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPatient, setSelectedPatient] = useState<PatientDropDownDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TreatmentPlanDTO | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionApptId, setActionApptId] = useState<number | null>(null);
  const [actionPlanId, setActionPlanId] = useState<number | null>(null);
  const [actionStartTime, setActionStartTime] = useState<string>('');

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryApptId, setSummaryApptId] = useState<number | null>(null);
  const [summaryPlanId, setSummaryPlanId] = useState<number | null>(null);
  const [summaryStartTime, setSummaryStartTime] = useState<string>('');
  const [summaryExistingNotes, setSummaryExistingNotes] = useState('');
  const [summaryExistingData, setSummaryExistingData] = useState<AppointmentSummaryDTO | undefined>(undefined);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patientsDropdown'],
    queryFn: getAllPatientsForDropdown,
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['treatmentPlans', selectedPatient?.userId],
    queryFn: () => getPlansByPatientId(selectedPatient!.userId),
    enabled: !!selectedPatient,
  });

  const activePlans = plans?.filter((p) => p.status === 'ACTIVE' || p.status === 'SUSPENDED') || [];
  const pastPlans = plans?.filter((p) => p.status === 'COMPLETED' || p.status === 'CANCELLED') || [];
  const activePatients = patients?.filter((p) => !p.email.includes('@anonymised.com')) || [];

  const getFileUrl = (url: string) => `${apiURL}/api/files/${url.split('/').pop()}`;

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => cancelAppointmentByDoctor(doctorId, id, reason),
    onSuccess: async () => {
      setSnackbar({ open: true, message: t('appointmentCancelled'), severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['treatmentPlans', selectedPatient?.userId] });
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments', doctorId] });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: t(error.response?.data?.message || 'error.unknown'), severity: 'error' });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: number) => markAsNoShow(doctorId, id),
    onSuccess: async () => {
      setSnackbar({ open: true, message: t('markedAsNoShow'), severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['treatmentPlans', selectedPatient?.userId] });
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments', doctorId] });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: t(error.response?.data?.message || 'error.unknown'), severity: 'error' });
    },
  });

  const openRescheduleModal = (apt: PlanAppointmentDTO, planId: number) => {
    setActionApptId(apt.id);
    setActionPlanId(planId);
    setActionStartTime(apt.startTime);
    setIsActionModalOpen(true);
  };

  const openSummaryModal = (apt: PlanAppointmentDTO, planId: number) => {
    setSummaryApptId(apt.id);
    setSummaryPlanId(planId);
    setSummaryStartTime(apt.startTime);
    setSummaryExistingNotes(apt.summary?.notes || '');
    setSummaryExistingData(apt.summary);
    setIsSummaryModalOpen(true);
  };

  const renderAppointmentHistory = (appointments: PlanAppointmentDTO[] | undefined, planId: number) => {
    if (!appointments || appointments.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary">
          {t('noAppointmentsYet')}
        </Typography>
      );
    }

    const sorted = [...appointments].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return sorted.map((apt) => (
      <Box key={apt.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {new Date(apt.startTime).toLocaleString()} - {apt.serviceName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {apt.status === 'CONFIRMED' && (
              <>
                <Button size="small" variant="outlined" onClick={() => openRescheduleModal(apt, planId)}>
                  {t('edit')}
                </Button>
                <Button size="small" variant="outlined" color="warning" onClick={() => noShowMutation.mutate(apt.id)}>
                  {t('noShow')}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setAppointmentToCancel(apt.id);
                    setCancelDialogOpen(true);
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button size="small" variant="contained" color="primary" onClick={() => openSummaryModal(apt, planId)}>
                  {t('complete')}
                </Button>
              </>
            )}
            {apt.status === 'COMPLETED' && (
              <Button size="small" variant="outlined" onClick={() => openSummaryModal(apt, planId)}>
                {t('editSummary')}
              </Button>
            )}
            <Chip size="small" label={t(apt.status)} color={apt.status === 'COMPLETED' ? 'success' : 'default'} />
          </Box>
        </Box>

        {apt.summary ? (
          <Box sx={{ mt: 1 }}>
            {apt.summary.notes && (
              <Typography variant="body2" paragraph>
                {apt.summary.notes}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                <Button size="small" startIcon={<ImageIcon />} href={getFileUrl(apt.summary.imageUrl)} target="_blank">
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
          <Typography variant="caption" color="textSecondary">
            {t('noSummaryYet')}
          </Typography>
        )}
      </Box>
    ));
  };

  const renderPlanCard = (plan: TreatmentPlanDTO) => {
    return (
      <Card key={plan.id} sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" color="primary.main">
                {plan.primaryServiceName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('startDate')}: {plan.startDate} | {t('endDate')}: {plan.endDate || t('ongoing')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {plan.requires3DModel && (
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  onClick={() => navigate(`/treatment-plans/${plan.id}/braces`)}
                  sx={{ '&:focus': { outline: 'none' } }}
                >
                  {t('open3DModel')}
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setEditingPlan(plan);
                  setIsModalOpen(true);
                }}
                sx={{ '&:focus': { outline: 'none' } }}
              >
                {t('edit')}
              </Button>
              <Chip
                label={t(plan.status)}
                color={plan.status === 'ACTIVE' ? 'success' : plan.status === 'CANCELLED' ? 'error' : 'default'}
              />
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
            {plan.generalNotes || t('noNotesProvided')}
          </Typography>
          {plan.plannedServiceNames && plan.plannedServiceNames.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                {t('plannedServicesOptional')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {plan.plannedServiceNames.map((serviceName, idx) => (
                  <Chip key={idx} label={serviceName} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
          <Accordion variant="outlined" sx={{ mt: 2, bgcolor: 'background.default' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">{t('appointmentHistory')}</Typography>
            </AccordionSummary>
            <AccordionDetails>{renderAppointmentHistory(plan.appointments, plan.id as number)}</AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ maxWidth: 400 }}>
        <Autocomplete
          options={activePatients}
          getOptionLabel={(option) => `${option.fullName} (${option.email})`}
          loading={isLoadingPatients}
          value={selectedPatient}
          onChange={(e, newValue) => setSelectedPatient(newValue)}
          noOptionsText={t('noPatientsFound')}
          renderInput={(params) => <TextField {...params} label={t('searchPatient')} />}
        />
      </Box>
      {selectedPatient && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6">
              {t('plansFor')} {selectedPatient.fullName}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingPlan(null);
                setIsModalOpen(true);
              }}
              sx={{ '&:focus': { outline: 'none' } }}
            >
              {t('createNewPlan')}
            </Button>
          </Box>
          {isLoadingPlans ? (
            <CircularProgress />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" color="primary.light" fontWeight="bold">
                {t('activePlans')}
              </Typography>
              {activePlans.length === 0 ? (
                <Typography>{t('noActivePlans')}</Typography>
              ) : (
                activePlans.map(renderPlanCard)
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" color="primary.light" fontWeight="bold">
                {t('pastPlans')}
              </Typography>
              {pastPlans.length === 0 ? <Typography>{t('noPastPlans')}</Typography> : pastPlans.map(renderPlanCard)}
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
            setSnackbar({ open: true, message: t('planSavedSuccessfully'), severity: 'success' });
          }}
          onErrorAction={(message) => {
            setSnackbar({ open: true, message: message, severity: 'error' });
          }}
        />
      )}
      <DoctorActionModal
        open={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        userId={doctorId}
        appointmentId={actionApptId}
        mode="RESCHEDULE"
        patientId={selectedPatient?.userId}
        initialStartTime={actionStartTime}
        initialTreatmentPlanId={actionPlanId}
      />
      <DoctorActionModal
        open={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        userId={doctorId}
        appointmentId={summaryApptId}
        mode="COMPLETE"
        patientId={selectedPatient?.userId}
        initialStartTime={summaryStartTime}
        initialTreatmentPlanId={summaryPlanId}
        initialNotes={summaryExistingNotes}
        existingSummary={summaryExistingData}
      />
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>{t('cancelAppointment')}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('pleaseProvideReason')}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label={t('reason')}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)}>{t('back')}</Button>
          <Button
            variant="contained"
            color="error"
            disabled={!cancelReason.trim()}
            onClick={async () => {
              if (appointmentToCancel) {
                await cancelMutation.mutateAsync({ id: appointmentToCancel, reason: cancelReason });
              }
              setCancelDialogOpen(false);
              setCancelReason('');
            }}
          >
            {t('confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DoctorTreatmentPlansView;
