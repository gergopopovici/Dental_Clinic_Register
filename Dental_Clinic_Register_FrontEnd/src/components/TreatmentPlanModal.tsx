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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPlan, updatePlan } from '../services/TreatmentPlanService';
import { TreatmentPlanDTO, TreatmentPlanStatus } from '../models/TreatmentPlan';
import { ResponseServiceDTO } from '../models/Service';
import { getAllServices } from '../services/ProvidedServiceService';

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

  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<TreatmentPlanStatus>(TreatmentPlanStatus.ACTIVE);
  const [notes, setNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<ResponseServiceDTO[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: availableServices, isLoading: isLoadingServices } = useQuery({
    queryKey: ['allServices'],
    queryFn: getAllServices,
  });

  useEffect(() => {
    if (open && existingPlan) {
      setPlanName(existingPlan.planName);
      setStartDate(existingPlan.startDate);
      setEndDate(existingPlan.endDate || '');
      setStatus(existingPlan.status);
      setNotes(existingPlan.notes || '');

      if (availableServices && existingPlan.serviceIds) {
        const preSelected = availableServices.filter((s) => existingPlan.serviceIds?.includes(s.id));
        setSelectedServices(preSelected);
      }
    } else {
      setPlanName('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setStatus(TreatmentPlanStatus.ACTIVE);
      setNotes('');
      setSelectedServices([]);
      setErrorMessage('');
    }
  }, [open, existingPlan, availableServices]);

  const mutation = useMutation({
    mutationFn: (payload: TreatmentPlanDTO) => {
      if (existingPlan?.id) {
        return updatePlan(existingPlan.id, payload);
      }
      return createPlan(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      onSuccess();
    },
    onError: (error: any) => {
      const backendErrorKey = error.response?.data?.message || 'error.unknown';
      const translatedError = t(backendErrorKey);

      setErrorMessage(translatedError);
      onErrorAction(translatedError);
    },
  });

  const handleSubmit = () => {
    if (!planName || !startDate) {
      setErrorMessage(t('pleaseFillRequiredFields'));
      return;
    }

    const payload: TreatmentPlanDTO = {
      patientId,
      planName,
      startDate,
      endDate: endDate || undefined,
      status,
      notes,
      serviceIds: selectedServices.map((s) => s.id),
    };

    mutation.mutate(payload);
  };

  const darkFieldStyles = {
    bgcolor: '#2c2c2c',
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
    '& .MuiInputLabel-root': { color: '#aaa' },
    color: 'white',
    input: { color: 'white' },
    textarea: { color: 'white' },
    '& .MuiSelect-select': { color: 'white' },
    '& .MuiChip-root': { color: 'white', bgcolor: '#444' },
    '& .MuiChip-deleteIcon': { color: '#aaa', '&:hover': { color: 'white' } },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: '#1e1e1e', color: 'white' } } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #333' }}>
        {existingPlan ? t('editTreatmentPlan') : t('createNewPlan')}
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '24px !important' }}>
        {errorMessage && (
          <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
            {errorMessage}
          </Typography>
        )}

        <TextField
          label={t('planName')}
          required
          fullWidth
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          sx={darkFieldStyles}
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
            sx={darkFieldStyles}
          />
          <TextField
            type="date"
            label={t('endDateOptional')}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={darkFieldStyles}
          />
        </Box>

        <TextField
          select
          label={t('status')}
          fullWidth
          value={status}
          onChange={(e) => setStatus(e.target.value as TreatmentPlanStatus)}
          sx={darkFieldStyles}
          SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: '#2c2c2c', color: 'white' } } } }}
        >
          {Object.values(TreatmentPlanStatus).map((s) => (
            <MenuItem key={s} value={s}>
              {t(s)}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          multiple
          options={availableServices || []}
          getOptionLabel={(option) => option.name}
          loading={isLoadingServices}
          value={selectedServices}
          onChange={(event, newValue) => setSelectedServices(newValue)}
          noOptionsText={t('noServicesFound', 'No services found')}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('selectServicesOptional')}
              sx={darkFieldStyles}
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {isLoadingServices ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                },
              }}
            />
          )}
        />

        <TextField
          label={t('notes')}
          multiline
          rows={4}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={darkFieldStyles}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
        <Button onClick={onClose} sx={{ color: '#aaa' }}>
          {t('cancel')}
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={mutation.isPending}>
          {mutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TreatmentPlanModal;
