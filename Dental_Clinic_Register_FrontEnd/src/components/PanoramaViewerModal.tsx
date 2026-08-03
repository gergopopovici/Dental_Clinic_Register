import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box,
  Button, Typography, CircularProgress, Divider, IconButton, Tooltip
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { uploadPanoramaImage, getPlanById } from '../services/TreatmentPlanService';
import { TreatmentPlanDTO } from '../models/TreatmentPlan';
import { apiURL } from '../config/apiUrl';

interface PanoramaViewerModalProps {
  open: boolean;
  onClose: () => void;
  plan: TreatmentPlanDTO | null;
  isDoctor: boolean;
}

export default function PanoramaViewerModal({ open, onClose, plan, isDoctor }: PanoramaViewerModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: activePlan, isLoading } = useQuery({
    queryKey: ['treatmentPlan', plan?.id],
    queryFn: () => getPlanById(plan!.id!),
    enabled: !!plan?.id && open,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadPanoramaImage(plan!.id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPlan', plan?.id] });
      queryClient.invalidateQueries({ queryKey: ['treatmentPlans'] });
      queryClient.invalidateQueries({ queryKey: ['myTreatmentPlans'] });
      setSelectedFile(null);
    }
  });

  const getFileUrl = (url: string) => `${apiURL}/api/files/${url.split('/').pop()}`;

  const handleDownload = (url: string, filename: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      });
  };

  if (!plan) return null;

  const images = activePlan?.panoramaImages || [];
  const firstImage = images.length > 0 ? images[0] : null;
  const latestImage = images.length > 1 ? images[images.length - 1] : firstImage;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{t('panoramaImages', 'Panoráma Képek')} - {plan.primaryServiceName}</DialogTitle>
      
      <DialogContent dividers>
        {isDoctor && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              {t('selectFile', 'Új kép kiválasztása')}
              <input type="file" hidden accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </Button>
            {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
            <Button 
              variant="contained" 
              onClick={() => selectedFile && uploadMutation.mutate(selectedFile)} 
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? <CircularProgress size={24} /> : t('upload', 'Feltöltés')}
            </Button>
          </Box>
        )}

        {isLoading ? (
          <CircularProgress />
        ) : images.length === 0 ? (
          <Typography>{t('noImagesYet', 'Még nincsenek feltöltve képek.')}</Typography>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" align="center" gutterBottom>
                  Kezdeti állapot ({firstImage ? new Date(firstImage.uploadDate).toLocaleDateString() : ''})
                </Typography>
                {firstImage && (
                  <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <img 
                      src={getFileUrl(firstImage.url)} 
                      alt="Kezdeti" 
                      style={{ 
                        width: '100%', 
                        maxHeight: '300px',
                        objectFit: 'contain',
                        borderRadius: '8px', 
                        border: '1px solid #333',
                        backgroundColor: '#121212',
                        display: 'block'
                      }} 
                    />
                    <Tooltip title={t('download', 'Letöltés')}>
                      <IconButton 
                        onClick={() => handleDownload(getFileUrl(firstImage.url), `kezdeti_${firstImage.uploadDate}.jpg`)}
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          bgcolor: 'background.paper',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          '&:hover': { 
                            bgcolor: 'primary.main',
                            color: 'white',
                            '& svg': { color: 'white' }
                          } 
                        }}
                      >
                        <DownloadIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" align="center" gutterBottom>
                  Aktuális állapot ({latestImage ? new Date(latestImage.uploadDate).toLocaleDateString() : ''})
                </Typography>
                {latestImage && (
                  <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <img 
                      src={getFileUrl(latestImage.url)} 
                      alt="Aktuális" 
                      style={{ 
                        width: '100%', 
                        maxHeight: '300px',
                        objectFit: 'contain',
                        borderRadius: '8px', 
                        border: '1px solid #333',
                        backgroundColor: '#121212',
                        display: 'block'
                      }} 
                    />
                    <Tooltip title={t('download', 'Letöltés')}>
                      <IconButton 
                        onClick={() => handleDownload(getFileUrl(latestImage.url), `aktualis_${latestImage.uploadDate}.jpg`)}
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          bgcolor: 'background.paper',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          '&:hover': { 
                            bgcolor: 'primary.main',
                            color: 'white',
                            '& svg': { color: 'white' }
                          } 
                        }}
                      >
                        <DownloadIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>Összes felvétel időrendben:</Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {images.map((img) => (
                <Box key={img.id} sx={{ minWidth: 150, border: '1px solid #ccc', borderRadius: 1, p: 0.5, position: 'relative' }}>
                  <img 
                    src={getFileUrl(img.url)} 
                    alt="Thumbnail" 
                    style={{ 
                      width: '100%', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '4px',
                      display: 'block'
                    }} 
                  />
                  <IconButton 
                    size="small"
                    onClick={() => handleDownload(getFileUrl(img.url), `panorama_${img.uploadDate}.jpg`)}
                    sx={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4, 
                      bgcolor: 'background.paper',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '4px',
                      '&:hover': { 
                        bgcolor: 'primary.main',
                        color: 'white',
                        '& svg': { color: 'white' }
                      } 
                    }}
                  >
                    <DownloadIcon fontSize="small" color="primary" />
                  </IconButton>
                  <Typography variant="caption" display="block" align="center" sx={{ mt: 0.5 }}>
                    {new Date(img.uploadDate).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('close', 'Bezárás')}</Button>
      </DialogActions>
    </Dialog>
  );
}