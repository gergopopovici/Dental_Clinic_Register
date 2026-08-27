import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllServices } from '../services/ProvidedServiceService';
import { useTranslation } from 'react-i18next';
import { ResponseServiceDTO } from '../models/Service';
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from '@mui/material';

function PatientServiceList() {
  const { t, i18n } = useTranslation();

  const {
    data: services = [],
    isLoading,
    isError,
  } = useQuery<ResponseServiceDTO[]>({
    queryKey: ['patientServicesList'],
    queryFn: getAllServices,
  });

  const getLocalizedName = (service: ResponseServiceDTO) => {
    if (i18n.language.startsWith('hu')) return service.nameHu;
    if (i18n.language.startsWith('ro')) return service.nameRo;
    return service.nameEn;
  };

  const getLocalizedDescription = (service: ResponseServiceDTO) => {
    if (i18n.language.startsWith('hu')) return service.descriptionHu;
    if (i18n.language.startsWith('ro')) return service.descriptionRo;
    return service.descriptionEn;
  };

  return (
    <Paper sx={{ mt: 4, p: 2, overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        {t('ourServicesAndPrices', 'Szolgáltatások és árak')}
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('error.fetch_services')}
        </Alert>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('serviceName')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('description')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('duration')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('price')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress color="primary" size={24} />
                </TableCell>
              </TableRow>
            ) : services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 'medium' }}>{getLocalizedName(service)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{getLocalizedDescription(service) || '-'}</TableCell>
                  <TableCell>{service.durationMinutes} {i18n.language.startsWith('hu') ? 'perc' : 'min'}</TableCell>                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {service.price.toFixed(2)} RON
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  {t('noServicesFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default PatientServiceList;