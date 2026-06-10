import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DAYS_OF_WEEK, DoctorScheduleDTO, TimeOffDTO } from '../../models/Schedule';
import {
  addDoctorTimeOff,
  deleteTimeOff,
  getDoctorSchedule,
  getDoctorTimeOffs,
  getGlobalHolidays,
  getSettings,
  updateDoctorSchedule,
} from '../../services/ScheduleService';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DoctorScheduleManagerProps {
  userId: number;
}

function DoctorScheduleManager({ userId }: DoctorScheduleManagerProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [weeklySchedule, setWeeklySchedule] = useState<DoctorScheduleDTO[]>([]);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [timeOffForm, setTimeOffForm] = useState({ startDate: '', endDate: '', reason: '' });

  const { data: scheduleData, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['doctorSchedule', userId],
    queryFn: () => getDoctorSchedule(userId),
  });

  const { data: timeOffs, isLoading: isLoadingTimeOffs } = useQuery({
    queryKey: ['doctorTimeOffs', userId],
    queryFn: () => getDoctorTimeOffs(userId),
  });

  const { data: globalHolidays, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ['globalHolidays'],
    queryFn: getGlobalHolidays,
  });

  const { data: clinicSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['clinicSettings'],
    queryFn: getSettings,
  });

  const updateScheduleMutation = useMutation({
    mutationFn: (schedules: DoctorScheduleDTO[]) => updateDoctorSchedule(userId, schedules),
    onSuccess: () => {
      setSnackbar({ open: true, message: t('schedule.updated.successfully'), severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['doctorSchedule', userId] });
    },
    onError: () => setSnackbar({ open: true, message: t('error.unknown'), severity: 'error' }),
  });

  const addTimeOffMutation = useMutation({
    mutationFn: (request: TimeOffDTO) => addDoctorTimeOff(request),
    onSuccess: () => {
      setSnackbar({ open: true, message: t('time.off.added.successfully'), severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['doctorTimeOffs', userId] });
      setIsTimeOffModalOpen(false);
      setTimeOffForm({ startDate: '', endDate: '', reason: '' });
    },
    onError: (error) => {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'error.unknown';
      setSnackbar({ open: true, message: t(errorMsg), severity: 'error' });
    },
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: (timeOffId: number) => deleteTimeOff(timeOffId),
    onSuccess: () => {
      setSnackbar({ open: true, message: t('time.off.deleted.successfully'), severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['doctorTimeOffs', userId] });
    },
    onError: () => setSnackbar({ open: true, message: t('error.unknown'), severity: 'error' }),
  });

  useEffect(() => {
    if (scheduleData) {
      const merged = DAYS_OF_WEEK.map((day) => {
        const existing = scheduleData.find((s) => s.dayOfWeek === day);
        return (
          existing || {
            doctorId: userId,
            dayOfWeek: day,
            startTime: clinicSettings?.defaultStartTime ?? '',
            endTime: clinicSettings?.defaultEndTime ?? '',
            isWorking: false,
          }
        );
      });
      setWeeklySchedule(merged);
    }
  }, [scheduleData, clinicSettings, userId]);

  const handleScheduleChange = (index: number, field: keyof DoctorScheduleDTO, value: any) => {
    const updated = [...weeklySchedule];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklySchedule(updated);
  };

  const handleSaveSchedule = () => {
    updateScheduleMutation.mutate(weeklySchedule);
  };

  const handleAddTimeOff = () => {
    addTimeOffMutation.mutate({
      doctorId: userId,
      startDate: timeOffForm.startDate,
      endDate: timeOffForm.endDate,
      reason: timeOffForm.reason,
    });
  };

  const allTimeOffs = [
    ...(timeOffs || []).map((t) => ({ ...t, isGlobal: false })),
    ...(globalHolidays || []).map((t) => ({ ...t, isGlobal: true })),
  ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (isLoadingSchedule || isLoadingTimeOffs || isLoadingGlobal || isLoadingSettings) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  return (
    <Box>
      <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} sx={{ mb: 4 }}>
        <Tab label={t('weeklySchedule')} />
        <Tab label={t('personalTimeOff')} />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Grid container spacing={2}>
            {weeklySchedule.map((day, index) => (
              <Grid size={{ xs: 12 }} key={day.dayOfWeek}>
                <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={day.isWorking}
                          onChange={(e) => handleScheduleChange(index, 'isWorking', e.target.checked)}
                        />
                      }
                      label={t(day.dayOfWeek)}
                      sx={{ minWidth: 150 }}
                    />
                    <TextField
                      type="time"
                      label={t('startTime')}
                      value={day.startTime ? day.startTime.substring(0, 5) : ''}
                      onChange={(e) => handleScheduleChange(index, 'startTime', `${e.target.value}:00`)}
                      disabled={!day.isWorking}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                      type="time"
                      label={t('endTime')}
                      value={day.endTime ? day.endTime.substring(0, 5) : ''}
                      onChange={(e) => handleScheduleChange(index, 'endTime', `${e.target.value}:00`)}
                      disabled={!day.isWorking}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSchedule}
            sx={{ mt: 3 }}
            disabled={updateScheduleMutation.isPending}
          >
            {updateScheduleMutation.isPending ? <CircularProgress size={24} /> : t('saveSchedule')}
          </Button>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Button variant="contained" onClick={() => setIsTimeOffModalOpen(true)} sx={{ mb: 3 }}>
            + {t('addTimeOff')}
          </Button>
          <Grid container spacing={2}>
            {allTimeOffs.length === 0 && <Typography sx={{ fontStyle: 'italic', ml: 2 }}>{t('noTimeOffs')}</Typography>}
            {allTimeOffs.map((pto) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${pto.id}-${pto.isGlobal}`}>
                <Card variant="outlined" sx={{ bgcolor: pto.isGlobal ? 'action.hover' : 'background.paper' }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        {pto.reason}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {pto.startDate} - {pto.endDate}
                      </Typography>
                      {pto.isGlobal && <Chip label={t('clinicHoliday')} size="small" color="info" variant="outlined" />}
                    </Box>
                    {!pto.isGlobal && (
                      <IconButton color="error" onClick={() => pto.id && deleteTimeOffMutation.mutate(pto.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Dialog open={isTimeOffModalOpen} onClose={() => setIsTimeOffModalOpen(false)}>
        <DialogTitle>{t('addTimeOff')}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="date"
            label={t('startDate')}
            value={timeOffForm.startDate}
            onChange={(e) => setTimeOffForm({ ...timeOffForm, startDate: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            type="date"
            label={t('endDate')}
            value={timeOffForm.endDate}
            onChange={(e) => setTimeOffForm({ ...timeOffForm, endDate: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label={t('reason')}
            value={timeOffForm.reason}
            onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsTimeOffModalOpen(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleAddTimeOff}
            disabled={
              !timeOffForm.startDate || !timeOffForm.endDate || !timeOffForm.reason || addTimeOffMutation.isPending
            }
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

export default DoctorScheduleManager;
