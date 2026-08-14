import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createService, deleteService, getAllServices, updateService } from '../services/ProvidedServiceService';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export interface ServiceProvided {
  id?: number;
  nameHu: string;
  nameEn: string;
  nameRo: string;
  descriptionHu?: string;
  descriptionEn?: string;
  descriptionRo?: string;
  price: number;
  durationMinutes: number;
}

const emptyService: ServiceProvided = {
  nameHu: '',
  nameEn: '',
  nameRo: '',
  descriptionHu: '',
  descriptionEn: '',
  descriptionRo: '',
  price: 0,
  durationMinutes: 0,
};

function ServiceTable() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceProvided>(emptyService);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    data: services = [],
    isLoading,
    isError,
  } = useQuery<ServiceProvided[]>({
    queryKey: ['adminServices'],
    queryFn: getAllServices,
  });

  const getLocalizedName = (service: ServiceProvided) => {
    if (i18n.language.startsWith('hu')) return service.nameHu;
    if (i18n.language.startsWith('ro')) return service.nameRo;
    return service.nameEn;
  };

  const getLocalizedDescription = (service: ServiceProvided) => {
    if (i18n.language.startsWith('hu')) return service.descriptionHu;
    if (i18n.language.startsWith('ro')) return service.descriptionRo;
    return service.descriptionEn;
  };

  const handleOpenModal = (service: ServiceProvided = emptyService) => {
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentService(emptyService);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (currentService.id) {
      updateMutation.mutate(currentService);
    } else {
      createMutation.mutate(currentService);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t('confirmDeleteService') || 'Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };

  const createMutation = useMutation({
    mutationFn: (newService: ServiceProvided) => createService(newService),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      setSnackbar({ open: true, message: t('success.service.created'), severity: 'success' });
      handleCloseModal();
    },
    onError: (error: Error) => {
      console.error('Failed to create service:', error);
      setSnackbar({ open: true, message: t('error.create.service'), severity: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedService: ServiceProvided) => updateService(updatedService.id!, updatedService),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      setSnackbar({ open: true, message: t('success.service.updated'), severity: 'success' });
      handleCloseModal();
    },
    onError: (error: Error) => {
      console.error('Failed to update service:', error);
      setSnackbar({ open: true, message: t('error.update.service'), severity: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteService(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      setSnackbar({ open: true, message: t('success.service.deleted'), severity: 'success' });
    },
    onError: (error: Error) => {
      console.error('Failed to delete service:', error);
      setSnackbar({ open: true, message: t('error.delete.service'), severity: 'error' });
    },
  });

  const isFormValid =
    currentService.nameHu &&
    currentService.nameEn &&
    currentService.nameRo &&
    currentService.price > 0 &&
    currentService.durationMinutes > 0;

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Paper sx={{ mt: 4, overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {t('manageServices')}
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          {t('addService')}
        </Button>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          {t('error.fetch_services')}
        </Alert>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('serviceName')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('description')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('price')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('duration')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                {t('actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress color="primary" />
                </TableCell>
              </TableRow>
            ) : services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{getLocalizedName(service)}</TableCell>
                  <TableCell>{getLocalizedDescription(service) || '-'}</TableCell>
                  <TableCell>{service.price.toFixed(2)} RON</TableCell>
                  <TableCell>{service.durationMinutes}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenModal(service)} disabled={deleteMutation.isPending}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(service.id!)} disabled={deleteMutation.isPending}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  {t('noServicesFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentService.id ? t('editService') || 'Edit Service' : t('addService')}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('serviceName')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField fullWidth label="Magyar (HU)" required value={currentService.nameHu} onChange={(e) => setCurrentService({ ...currentService, nameHu: e.target.value })} />
            <TextField fullWidth label="English (EN)" required value={currentService.nameEn} onChange={(e) => setCurrentService({ ...currentService, nameEn: e.target.value })} />
            <TextField fullWidth label="Română (RO)" required value={currentService.nameRo} onChange={(e) => setCurrentService({ ...currentService, nameRo: e.target.value })} />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('description')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField fullWidth label="Magyar (HU)" multiline rows={2} value={currentService.descriptionHu || ''} onChange={(e) => setCurrentService({ ...currentService, descriptionHu: e.target.value })} />
            <TextField fullWidth label="English (EN)" multiline rows={2} value={currentService.descriptionEn || ''} onChange={(e) => setCurrentService({ ...currentService, descriptionEn: e.target.value })} />
            <TextField fullWidth label="Română (RO)" multiline rows={2} value={currentService.descriptionRo || ''} onChange={(e) => setCurrentService({ ...currentService, descriptionRo: e.target.value })} />
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('details')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label={t('price')} type="number" required value={currentService.price} onChange={(e) => setCurrentService({ ...currentService, price: parseFloat(e.target.value) || 0 })} />
            <TextField fullWidth label={t('duration')} type="number" required value={currentService.durationMinutes} onChange={(e) => setCurrentService({ ...currentService, durationMinutes: parseInt(e.target.value) || 0 })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseModal}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending || !isFormValid}>
            {createMutation.isPending || updateMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="standard">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default ServiceTable;