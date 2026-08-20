import React, { useState, useEffect, useMemo } from 'react';
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
  LinearProgress,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getAllPatientsForDropdown } from '../services/PatientService';
import { getPlansByPatientId } from '../services/TreatmentPlanService';
import { getAllServices } from '../services/ProvidedServiceService';
import { PatientDropDownDTO } from '../models/Appointment';
import { TreatmentPlanDTO, PlanAppointmentDTO, AppointmentSummaryDTO } from '../models/TreatmentPlan';
import TreatmentPlanModal from './TreatmentPlanModal';
import { apiURL } from '../config/apiUrl';
import { cancelAppointmentByDoctor, markAsNoShow, detachFromTreatmentPlan } from '../services/AppointmentService';
import DoctorActionModal from './DoctorActionModal';
import PanoramaViewerModal from './PanoramaViewerModal';
import DoctorBookModal from './DoctorBookModal';

interface DoctorViewProps {
  doctorId: number;
}

function DoctorTreatmentPlansView({ doctorId }: DoctorViewProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPatient, setSelectedPatient] = useState<PatientDropDownDTO | null>(() => {
    const saved = sessionStorage.getItem('selectedPatient');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedPatient) {
      sessionStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
    } else {
      sessionStorage.removeItem('selectedPatient');
    }
  }, [selectedPatient]);

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

  const [detachDialogOpen, setDetachDialogOpen] = useState(false);
  const [appointmentToDetach, setAppointmentToDetach] = useState<number | null>(null);

  const [isPanoramaModalOpen, setIsPanoramaModalOpen] = useState(false);
  const [selectedPlanForPanorama, setSelectedPlanForPanorama] = useState<TreatmentPlanDTO | null>(null);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookModalPlanId, setBookModalPlanId] = useState<number | undefined>(undefined);

  // Állapotok a "További műveletek" (három pont) menühöz
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuAptId, setActiveMenuAptId] = useState<number | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, aptId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuAptId(aptId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveMenuAptId(null);
  };

  const openPanoramaModal = (plan: TreatmentPlanDTO) => {
    setSelectedPlanForPanorama(plan);
    setIsPanoramaModalOpen(true);
  }

  const getProgressColor = (progress: number) => {
    if (progress < 33) return 'error';     
    if (progress < 66) return 'warning';  
    if (progress < 100) return 'primary';  
    return 'success';                      
  };

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patientsDropdown'],
    queryFn: getAllPatientsForDropdown,
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['treatmentPlans', selectedPatient?.userId],
    queryFn: () => getPlansByPatientId(selectedPatient!.userId),
    enabled: !!selectedPatient,
  });

  const { data: allServices } = useQuery({
    queryKey: ['allServices'],
    queryFn: getAllServices,
  });

  const getLocalizedServiceName = (serviceName: string) => {
    if (!allServices) return serviceName;
    const service = allServices.find(s => s.nameEn === serviceName || s.nameHu === serviceName || s.nameRo === serviceName);
    if (!service) return serviceName;
    if (i18n.language.startsWith('hu')) return service.nameHu;
    if (i18n.language.startsWith('ro')) return service.nameRo;
    return service.nameEn;
  };

  const activePlans = plans?.filter((p) => p.status === 'ACTIVE' || p.status === 'SUSPENDED') || [];
  const pastPlans = plans?.filter((p) => p.status === 'COMPLETED' || p.status === 'CANCELLED') || [];
  const activePatients = patients?.filter((p) => !p.email.includes('@anonymised.com')) || [];

  const getFileUrl = (url: string) => `${apiURL}/api/files/${url.split('/').pop()}`;

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => cancelAppointmentByDoctor(doctorId, id, reason),
    onSuccess: async () => {
      setSnackbar({ open: true, message: t('appointmentCancelled'), severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: t(error.response?.data?.message || 'error.unknown'), severity: 'error' });
    },
  });

  const noShowMutation = useMutation({
    mutationFn: (id: number) => markAsNoShow(doctorId, id),
    onSuccess: async () => {
      setSnackbar({ open: true, message: t('markedAsNoShow'), severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: t(error.response?.data?.message || 'error.unknown'), severity: 'error' });
    },
  });

  const detachPlanMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      await detachFromTreatmentPlan(doctorId, appointmentId);
    },
    onSuccess: async () => {
      setSnackbar({ open: true, message: t('appointmentDetached'), severity: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      await queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
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

  const openBookModalForPlan = (planId: number) => {
    setBookModalPlanId(planId);
    setIsBookModalOpen(true);
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
            {new Date(apt.startTime).toLocaleString()} - {getLocalizedServiceName(apt.serviceName)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {apt.status === 'CONFIRMED' && (
              <>
                <Button size="small" variant="outlined" onClick={() => openRescheduleModal(apt, planId)}>
                  {t('edit')}
                </Button>
                <Button size="small" variant="contained" color="primary" onClick={() => openSummaryModal(apt, planId)}>
                  {t('complete')}
                </Button>
                
                {/* Menü gomb */}
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, apt.id)}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl) && activeMenuAptId === apt.id}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => {
                    handleMenuClose();
                    setAppointmentToDetach(apt.id);
                    setDetachDialogOpen(true);
                  }}>
                    <Typography color="warning.main" variant="body2">{t('detachFromPlan')}</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleMenuClose();
                    noShowMutation.mutate(apt.id);
                  }}>
                    <Typography color="warning.main" variant="body2">{t('noShow')}</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleMenuClose();
                    setAppointmentToCancel(apt.id);
                    setCancelDialogOpen(true);
                  }}>
                    <Typography color="error.main" variant="body2">{t('cancel')}</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
            
            {apt.status === 'COMPLETED' && (
              <>
                <Button size="small" variant="outlined" onClick={() => openSummaryModal(apt, planId)}>
                  {t('editSummary')}
                </Button>

                <IconButton size="small" onClick={(e) => handleMenuOpen(e, apt.id)}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl) && activeMenuAptId === apt.id}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => {
                    handleMenuClose();
                    setAppointmentToDetach(apt.id);
                    setDetachDialogOpen(true);
                  }}>
                    <Typography color="warning.main" variant="body2">{t('detachFromPlan')}</Typography>
                  </MenuItem>
                </Menu>
              </>
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
                {plan.planType ? t(`plan.${plan.planType}`) : ''}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('startDate')}: {plan.startDate} | {t('endDate')}: {plan.endDate || t('ongoing')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {plan.status === 'ACTIVE' && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => openBookModalForPlan(plan.id as number)}
                >
                  {t('bookNewAppointment')} 
                </Button>
              )}
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
          <Box sx={{mt:2,mb:2}}>
            <Box sx={{display:'flex', justifyContent:'space-between',mb:0.5}}>
              <Typography variant="body2" color="textSecondary">
                {t('estimatedDuration','Estimated Duration')}: {plan.estimatedDurationMonths || 0} {t('months','months')}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontWeight="bold">
                {plan.progressPercentage || 0}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate"
              value={plan.progressPercentage || 0}
              sx={{height:10, borderRadius:5}}
              color={getProgressColor(plan.progressPercentage || 0)}
              />
          </Box>
          <Box sx={{mb:2}}>
            <Button variant="outlined" size="small" onClick={()=>openPanoramaModal(plan)}>
              {t('viewPanoramaImages','Panorama Images')}
            </Button>
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
                  <Chip key={idx} label={getLocalizedServiceName(serviceName)} size="small" variant="outlined" />
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
          onSuccess={ async () => {
            setIsModalOpen(false);
            setSnackbar({ open: true, message: t('planSavedSuccessfully'), severity: 'success' });
            await queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
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
        onSuccess={() => {
          setIsActionModalOpen(false);
          setSnackbar({ open: true, message: t('appointmentUpdated'), severity: 'success' });
          queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
          queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
        }}
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
        onSuccess={() => {
          setIsSummaryModalOpen(false);
          setSnackbar({ open: true, message: t('appointmentCompleted'), severity: 'success' });
          queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
          queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
        }}
      />
      <PanoramaViewerModal
       open={isPanoramaModalOpen}
       onClose={()=>setIsPanoramaModalOpen(false)}
       plan={selectedPlanForPanorama}
       isDoctor={true}
       />
      <DoctorBookModal
        open={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        doctorId={doctorId}
        initialPatientId={selectedPatient?.userId}
        initialPlanId={bookModalPlanId}
        onSuccess={() => {
          setIsBookModalOpen(false);
          setSnackbar({ open: true, message: t('appointmentCreated'), severity: 'success' });
          queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
        }}
      />
      
      {/* Mégse megerősítő ablak */}
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
      
      {/* Leválasztás megerősítő ablak */}
      <Dialog open={detachDialogOpen} onClose={() => setDetachDialogOpen(false)}>
        <DialogTitle>{t('confirmDetachTitle')}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Typography variant="body2">
            {t('confirmDetachMessage')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetachDialogOpen(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={detachPlanMutation.isPending}
            onClick={async () => {
              if (appointmentToDetach) {
                await detachPlanMutation.mutateAsync(appointmentToDetach);
              }
              setDetachDialogOpen(false);
              setAppointmentToDetach(null);
            }}
          >
            {detachPlanMutation.isPending ? <CircularProgress size={24} /> : t('detachFromPlan')}
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