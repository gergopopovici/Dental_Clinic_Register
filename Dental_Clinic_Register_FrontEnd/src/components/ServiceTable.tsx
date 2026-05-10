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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export interface ServiceProvided {
  id?: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}
const emptyService: ServiceProvided = {
  name: '',
  description: '',
  price: 0,
  durationMinutes: 0,
};

function ServiceTable() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceProvided>(emptyService);

  const {
    data: services = [],
    isLoading,
    isError,
  } = useQuery<ServiceProvided[]>({
    queryKey: ['adminServices'],
    queryFn: getAllServices,
  });

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

  const textFieldStyles = {
    input: { color: 'white' },
    bgcolor: '#2c2c2c',
    borderRadius: 1,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
    mb: 2,
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t('confirmDeleteService') || 'Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };
  const createMutation = useMutation({
    mutationFn: (newService: ServiceProvided) => createService(newService),
    onSuccess: async (newlyCreatedService) => {
      queryClient.setQueryData<ServiceProvided[]>(['adminServices'], (oldData) => {
        return oldData ? [newlyCreatedService, ...oldData] : [newlyCreatedService];
      });
      await queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      console.error('Failed to create service:', error);
      alert(t('error.create.service') || 'Failed to create service');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedService: ServiceProvided) => updateService(updatedService.id!, updatedService),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      console.error('Failed to update service:', error);
      alert(t('error.update.service') || 'Failed to update service');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete service:', error);
      alert(t('error.delete.service') || 'Failed to delete service');
    },
  });

  return (
    <Paper sx={{ bgcolor: '#1e1e1e', mt: 4, overflow: 'hidden' }}>
      <Box
        sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
      >
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
          {t('manageServices') || 'Manage Services'}
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          {t('addService') || 'Add Service'}
        </Button>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          {t('error.fetch_services') || 'Failed to load services'}
        </Alert>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#2c2c2c' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('serviceName') || 'Name'}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('description') || 'Description'}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('price') || 'Price'}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{t('duration') || 'Duration (mins)'}</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                {t('actions') || 'Actions'}
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
                  <TableCell sx={{ color: 'white' }}>{service.name}</TableCell>
                  <TableCell sx={{ color: '#aaaaaa' }}>{service.description || '-'}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{service.price.toFixed(2)} RON</TableCell>
                  <TableCell sx={{ color: 'white' }}>{service.durationMinutes}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenModal(service)}
                      disabled={deleteMutation.isPending}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(service.id!)}
                      disabled={deleteMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: '#aaaaaa', py: 3 }}>
                  {t('noServicesFound') || 'No services found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        PaperProps={{ sx: { bgcolor: '#1e1e1e', color: 'white', minWidth: { xs: '300px', sm: '500px' } } }}
      >
        <DialogTitle>
          {currentService.id ? t('editService') || 'Edit Service' : t('addService') || 'Add New Service'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label={t('serviceName') || 'Service Name'}
            InputLabelProps={{ style: { color: '#aaaaaa' } }}
            sx={textFieldStyles}
            value={currentService.name}
            onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
          />
          <TextField
            fullWidth
            label={t('description') || 'Description'}
            multiline
            rows={3}
            InputLabelProps={{ style: { color: '#aaaaaa' } }}
            sx={{ ...textFieldStyles, textarea: { color: 'white' } }}
            value={currentService.description || ''}
            onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label={t('price') || 'Price'}
              type="number"
              InputLabelProps={{ style: { color: '#aaaaaa' } }}
              sx={textFieldStyles}
              value={currentService.price}
              onChange={(e) => setCurrentService({ ...currentService, price: parseFloat(e.target.value) || 0 })}
            />
            <TextField
              fullWidth
              label={t('duration') || 'Duration (mins)'}
              type="number"
              InputLabelProps={{ style: { color: '#aaaaaa' } }}
              sx={textFieldStyles}
              value={currentService.durationMinutes}
              onChange={(e) => setCurrentService({ ...currentService, durationMinutes: parseInt(e.target.value) || 0 })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#aaaaaa' }}>
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending || !currentService.name}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('save') || 'Save'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default ServiceTable;
