import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Grid,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  getGlobalHolidays,
  addGlobalHoliday,
  deleteTimeOff,
  getSettings,
  createAndUpdateSettings,
} from '../../services/ScheduleService';
import { ClinicSettingsDTO, TimeOffDTO } from '../../models/Schedule';

function AdminHolidayManager() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', reasonHu: '', reasonEn: '', reasonRo: '' });
  const [settingsForm, setSettingsForm] = useState({ defaultStartTime: '', defaultEndTime: '' });

  const { data: holidays, isLoading: isLoadingHolidays } = useQuery({
    queryKey: ['globalHolidays'],
    queryFn: getGlobalHolidays,
  });

  const { data: clinicSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['clinicSettings'],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (clinicSettings) {
      setSettingsForm({
        defaultStartTime: clinicSettings.defaultStartTime.substring(0, 5),
        defaultEndTime: clinicSettings.defaultEndTime.substring(0, 5),
      });
    }
  }, [clinicSettings]);

  const getLocalizedReason = (holiday: TimeOffDTO) => {
    if (i18n.language.startsWith('hu')) return holiday.reasonHu;
    if (i18n.language.startsWith('ro')) return holiday.reasonRo;
    return holiday.reasonEn;
  };

  const addHolidayMutation = useMutation({
    mutationFn: (request: TimeOffDTO) => addGlobalHoliday(request),
    onSuccess: () => {
      setSnackbar({ open: true, message: t('time.off.added.successfully'), severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['globalHolidays'] });
      setIsModalOpen(false);
      setForm({ startDate: '', endDate: '', reasonHu: '', reasonEn: '', reasonRo: '' });
    },
    onError: () => setSnackbar({ open: true, message: t('error.unknown'), severity: 'error' }),
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: (id: number) => deleteTimeOff(id),
    onSuccess: () => {
      setSnackbar({ open: true, message: t('time.off.deleted.successfully'), severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['globalHolidays'] });
    },
    onError: () => setSnackbar({ open: true, message: t('error.unknown'), severity: 'error' }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (dto: ClinicSettingsDTO) => createAndUpdateSettings(dto),
    onSuccess: () => {
      setSnackbar({ open: true, message: t('clinic.settings.updated.successfully'), severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['clinicSettings'] });
    },
    onError: () => setSnackbar({ open: true, message: t('error.unknown'), severity: 'error' }),
  });

  const handleAddHoliday = () => {
    addHolidayMutation.mutate({
      doctorId: null,
      startDate: form.startDate,
      endDate: form.endDate,
      reasonHu: form.reasonHu,
      reasonEn: form.reasonEn,
      reasonRo: form.reasonRo,
    });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      id: clinicSettings?.id,
      defaultStartTime: `${settingsForm.defaultStartTime}:00`,
      defaultEndTime: `${settingsForm.defaultEndTime}:00`,
    });
  };

  if (isLoadingHolidays || isLoadingSettings) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <AccessTimeIcon color="primary" />
          <Typography variant="h6">{t('clinicSettings')}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('clinicSettingsDescription')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            type="time"
            label={t('defaultStartTime')}
            value={settingsForm.defaultStartTime}
            onChange={(e) => setSettingsForm({ ...settingsForm, defaultStartTime: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            type="time"
            label={t('defaultEndTime')}
            value={settingsForm.defaultEndTime}
            onChange={(e) => setSettingsForm({ ...settingsForm, defaultEndTime: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 180 }}
          />
          <Button
            variant="contained"
            onClick={handleSaveSettings}
            disabled={
              !settingsForm.defaultStartTime || !settingsForm.defaultEndTime || updateSettingsMutation.isPending
            }
            sx={{ height: 56 }}
          >
            {updateSettingsMutation.isPending ? <CircularProgress size={24} /> : t('saveSettings')}
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">{t('globalHolidays')}</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>
          + {t('addHoliday')}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {holidays?.length === 0 && <Typography sx={{ fontStyle: 'italic', ml: 2 }}>{t('noGlobalHolidays')}</Typography>}
        {holidays?.map((holiday) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={holiday.id}>
            <Card variant="outlined">
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {getLocalizedReason(holiday)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {holiday.startDate} - {holiday.endDate}
                  </Typography>
                </Box>
                <IconButton color="error" onClick={() => holiday.id && deleteHolidayMutation.mutate(holiday.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('addHoliday')}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="date"
              label={t('startDate')}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              type="date"
              label={t('endDate')}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2">{t('reason') || 'Ok / Megnevezés'}</Typography>
          <TextField
            label="Magyar (HU)"
            value={form.reasonHu}
            onChange={(e) => setForm({ ...form, reasonHu: e.target.value })}
            fullWidth
          />
          <TextField
            label="English (EN)"
            value={form.reasonEn}
            onChange={(e) => setForm({ ...form, reasonEn: e.target.value })}
            fullWidth
          />
          <TextField
            label="Română (RO)"
            value={form.reasonRo}
            onChange={(e) => setForm({ ...form, reasonRo: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleAddHoliday}
            disabled={!form.startDate || !form.endDate || !form.reasonHu || !form.reasonEn || !form.reasonRo || addHolidayMutation.isPending}
          >
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminHolidayManager;