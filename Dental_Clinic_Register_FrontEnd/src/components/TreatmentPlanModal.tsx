import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Autocomplete,
  MenuItem,
  Box,
  FormControlLabel,
  Checkbox,
  Slider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TreatmentPlanDTO } from '../models/TreatmentPlan';
import { ResponseServiceDTO } from '../models/Service';
import { getAllServices } from '../services/ProvidedServiceService';
import { createPlan, updatePlan } from '../services/TreatmentPlanService';

interface TreatmentPlanModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  existingPlan: TreatmentPlanDTO | null;
  onSuccess: () => void;
  onErrorAction: (message: string) => void;
}

function TreatmentPlanModal({
  open,
  onClose,
  patientId,
  existingPlan,
  onSuccess,
  onErrorAction,
}: TreatmentPlanModalProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [planType, setPlanType] = useState<TreatmentPlanDTO['planType'] | ''>('');
  const [requires3DModel, setRequires3DModel] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED'>('ACTIVE');
  const [generalNotes, setGeneralNotes] = useState('');
  const [plannedServices, setPlannedServices] = useState<ResponseServiceDTO[]>([]);
  const [estimatedDurationMonths, setEstimatedDurationMonths] = useState<number | ''>('');
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  const { data: availableServices, isLoading: isLoadingServices } = useQuery({
    queryKey: ['allServices'],
    queryFn: getAllServices,
  });

  const getLocalizedName = (opt: ResponseServiceDTO) => {
    if (i18n.language.startsWith('hu')) return opt.nameHu;
    if (i18n.language.startsWith('ro')) return opt.nameRo;
    return opt.nameEn;
  };

  useEffect(() => {
    if (open && existingPlan) {
      setPlanType(existingPlan.planType);
      setRequires3DModel(existingPlan.requires3DModel || false);
      setStartDate(existingPlan.startDate);
      setEndDate(existingPlan.endDate || '');
      setStatus(existingPlan.status);
      setGeneralNotes(existingPlan.generalNotes || '');
      setEstimatedDurationMonths(existingPlan.estimatedDurationMonths || '');
      setProgressPercentage(existingPlan.progressPercentage || 0);
      if (availableServices) {
        setPlannedServices(availableServices.filter((s) => existingPlan.plannedServiceIds?.includes(s.id)));
      }
    } else {
      setPlanType('');
      setRequires3DModel(false);
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setStatus('ACTIVE');
      setGeneralNotes('');
      setPlannedServices([]);
      setEstimatedDurationMonths('');
      setProgressPercentage(0);
    }
  }, [open, existingPlan, availableServices]);

  const mutation = useMutation({
    mutationFn: (payload: TreatmentPlanDTO) =>
      existingPlan?.id ? updatePlan(existingPlan.id, payload) : createPlan(payload),
    onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['treatmentPlans', patientId] });
      onSuccess();
    },
    onError: (error: any) => onErrorAction(t(error.response?.data?.message || 'error.unknown')),
  });

  const handleSubmit = () => {
    if (!planType || !startDate) return onErrorAction(t('pleaseFillRequiredFields'));
    
    mutation.mutate({
      patientId,
      planType: planType as TreatmentPlanDTO['planType'],
      requires3DModel,
      startDate,
      endDate: endDate || undefined,
      status,
      generalNotes,
      plannedServiceIds: plannedServices.map((s) => s.id),
      estimatedDurationMonths: estimatedDurationMonths === '' ? undefined : Number(estimatedDurationMonths),
      progressPercentage,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{existingPlan ? t('editTreatmentPlan') : t('createNewPlan')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        
        <TextField
          select
          label={t('primaryServiceCategory')}
          required
          fullWidth
          value={planType}
          onChange={(e) => setPlanType(e.target.value as TreatmentPlanDTO['planType'])}
        >
          {['ORTHO_FIXED', 'ORTHO_REMOVABLE', 'INVISALIGN', 'OTHER'].map((type) => (
            <MenuItem key={type} value={type}>
              {t(`plan.${type}`)}
            </MenuItem>
          ))}
        </TextField>

        <FormControlLabel
          control={
            <Checkbox
              checked={requires3DModel}
              onChange={(e) => setRequires3DModel(e.target.checked)}
              color="primary"
            />
          }
          label={t('requires3DModel', 'Requires 3D Dental Braces Model')}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="date"
            label={t('startDate')}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            type="date"
            label={t('endDateOptional')}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="number"
            label={t('estimatedDurationMonths')}
            fullWidth
            value={estimatedDurationMonths}
            onChange={(e) => setEstimatedDurationMonths(e.target.value === '' ? '' : Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
        </Box>

        <Box sx={{ px: 1 }}>
          <Typography gutterBottom color="textSecondary" variant="body2">
            {t('progressPercentage')}: {progressPercentage}%
          </Typography>
          <Slider
            value={progressPercentage}
            onChange={(_, val) => setProgressPercentage(val as number)}
            step={5}
            marks
            min={0}
            max={100}
            valueLabelDisplay="auto"
          />
        </Box>
        <TextField
          select
          label={t('status')}
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          {['ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED'].map((s) => (
            <MenuItem key={s} value={s}>
              {t(s)}
            </MenuItem>
          ))}
        </TextField>
        
        <Autocomplete
          multiple
          options={availableServices || []}
          getOptionLabel={getLocalizedName}
          loading={isLoadingServices}
          value={plannedServices}
          onChange={(_, val) => setPlannedServices(val)}
          renderInput={(params) => <TextField {...params} label={t('plannedServicesOptional', 'Planned Services')} />}
        />
        
        <TextField
          label={t('generalNotes')}
          multiline
          rows={4}
          fullWidth
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? <CircularProgress size={24} /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TreatmentPlanModal;