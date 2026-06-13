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
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [primaryService, setPrimaryService] = useState<ResponseServiceDTO | null>(null);
  const [requires3DModel, setRequires3DModel] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED'>('ACTIVE');
  const [generalNotes, setGeneralNotes] = useState('');
  const [plannedServices, setPlannedServices] = useState<ResponseServiceDTO[]>([]);

  const { data: availableServices, isLoading: isLoadingServices } = useQuery({
    queryKey: ['allServices'],
    queryFn: getAllServices,
  });

  useEffect(() => {
    if (open && existingPlan) {
      setRequires3DModel(existingPlan.requires3DModel || false);
      setStartDate(existingPlan.startDate);
      setEndDate(existingPlan.endDate || '');
      setStatus(existingPlan.status);
      setGeneralNotes(existingPlan.generalNotes || '');
      if (availableServices) {
        setPrimaryService(availableServices.find((s) => s.id === existingPlan.primaryServiceId) || null);
        setPlannedServices(availableServices.filter((s) => existingPlan.plannedServiceIds?.includes(s.id)));
      }
    } else {
      setPrimaryService(null);
      setRequires3DModel(false);
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setStatus('ACTIVE');
      setGeneralNotes('');
      setPlannedServices([]);
    }
  }, [open, existingPlan, availableServices]);

  const mutation = useMutation({
    mutationFn: (payload: TreatmentPlanDTO) =>
      existingPlan?.id ? updatePlan(existingPlan.id, payload) : createPlan(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      onSuccess();
    },
    onError: (error: any) => onErrorAction(t(error.response?.data?.message || 'error.unknown')),
  });

  const handleSubmit = () => {
    if (!primaryService || !startDate) return onErrorAction(t('pleaseFillRequiredFields'));
    mutation.mutate({
      patientId,
      primaryServiceId: primaryService.id,
      requires3DModel,
      startDate,
      endDate: endDate || undefined,
      status,
      generalNotes,
      plannedServiceIds: plannedServices.map((s) => s.id),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{existingPlan ? t('editTreatmentPlan') : t('createNewPlan')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        <Autocomplete
          options={availableServices || []}
          getOptionLabel={(opt) => opt.name}
          loading={isLoadingServices}
          value={primaryService}
          onChange={(_, val) => setPrimaryService(val)}
          renderInput={(params) => <TextField {...params} label={t('primaryServiceCategory')} required />}
        />
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
          getOptionLabel={(opt) => opt.name}
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
