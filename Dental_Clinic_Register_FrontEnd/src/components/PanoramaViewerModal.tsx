import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box,
  Button, Typography, CircularProgress, Divider, IconButton, Tooltip,
  DialogContentText, Snackbar, Alert
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { uploadPanoramaImage, getPlanById, deletePanoramaImage } from '../services/TreatmentPlanService';
import { TreatmentPlanDTO } from '../models/TreatmentPlan';
import { PanoramaImageDTO } from '../models/PanoramaImage';
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
  
  const [selectedImage, setSelectedImage] = useState<PanoramaImageDTO | null>(null);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: activePlan, isLoading } = useQuery({
    queryKey: ['treatmentPlan', plan?.id],
    queryFn: () => getPlanById(plan!.id!),
    enabled: !!plan?.id && open,
  });

  const images = activePlan?.panoramaImages || [];
  
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
  }, [images]);

  const firstImage = sortedImages.length > 0 ? sortedImages[0] : null;

  useEffect(() => {
    if (!isPlaying && sortedImages.length > 0) {
      setSelectedImage(sortedImages[sortedImages.length - 1]);
    } else if (sortedImages.length === 0) {
      setSelectedImage(null);
    }
  }, [sortedImages.length, isPlaying]);

  useEffect(() => {
    let interval: number;

    if (isPlaying && sortedImages.length > 0) {
      interval = window.setInterval(() => {
        setSelectedImage((prevSelected) => {
          const currentIndex = sortedImages.findIndex(img => img.id === prevSelected?.id);
          const nextIndex = currentIndex + 1;

          if (nextIndex < sortedImages.length) {
            return sortedImages[nextIndex]; 
          } else {
            setIsPlaying(false); 
            return prevSelected; 
          }
        });
      }, 1000);
    }

    return () => window.clearInterval(interval);
  }, [isPlaying, sortedImages]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadPanoramaImage(plan!.id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPlan', plan?.id] });
      queryClient.invalidateQueries({ queryKey: ['treatmentPlans', plan?.patientId] });
      queryClient.invalidateQueries({ queryKey: ['myTreatmentPlans', plan?.patientId] });
      setSelectedFile(null);
      setSnackbar({ open: true, message: t('success.panorama.uploaded'), severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: t('error.panorama.upload'), severity: 'error' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => deletePanoramaImage(plan!.id!, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentPlan', plan?.id] });
      queryClient.invalidateQueries({ queryKey: ['treatmentPlans', plan?.patientId] });
      queryClient.invalidateQueries({ queryKey: ['myTreatmentPlans', plan?.patientId] });
      setImageToDelete(null);
      setSnackbar({ open: true, message: t('success.panorama.deleted'), severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: t('error.panorama.delete'), severity: 'error' });
      setImageToDelete(null);
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

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (!plan) return null;

  return (
    <>
      <Dialog open={open} onClose={() => { setIsPlaying(false); onClose(); }} maxWidth="lg" fullWidth>
        <DialogTitle>
          {t('panoramaImages')} - {plan.planType ? t(`plan.${plan.planType}`) : ''}
        </DialogTitle>
        
        <DialogContent dividers>
          {isDoctor && (
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                {t('selectFile')}
                <input type="file" hidden accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              </Button>
              {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
              <Button 
                variant="contained" 
                onClick={() => selectedFile && uploadMutation.mutate(selectedFile)} 
                disabled={!selectedFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? <CircularProgress size={24} /> : t('upload')}
              </Button>
            </Box>
          )}

          {isLoading ? (
            <CircularProgress />
          ) : sortedImages.length === 0 ? (
            <Typography>{t('noImagesYet')}</Typography>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold" align="center" gutterBottom>
                    {t('initialState')} ({firstImage ? new Date(firstImage.uploadDate).toLocaleDateString() : ''})
                  </Typography>
                  {firstImage && (
                    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                      <img 
                        src={getFileUrl(firstImage.url)} 
                        alt="Kezdeti" 
                        style={{ 
                          width: '100%', maxHeight: '300px', objectFit: 'contain',
                          borderRadius: '8px', border: '1px solid #333',
                          backgroundColor: '#121212', display: 'block'
                        }} 
                      />
                      <Tooltip title={t('download')}>
                        <IconButton 
                          onClick={() => handleDownload(getFileUrl(firstImage.url), `kezdeti_${firstImage.uploadDate}.jpg`)}
                          sx={{ 
                            position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: 'primary.main', color: 'white', '& svg': { color: 'white' } } 
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
                    {t('selectedState')} ({selectedImage ? new Date(selectedImage.uploadDate).toLocaleDateString() : ''})
                  </Typography>
                  {selectedImage && (
                    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                      <img 
                        src={getFileUrl(selectedImage.url)} 
                        alt="Kiválasztott" 
                        style={{ 
                          width: '100%', maxHeight: '300px', objectFit: 'contain',
                          borderRadius: '8px', border: '1px solid #333',
                          backgroundColor: '#121212', display: 'block'
                        }} 
                      />
                      <Tooltip title={t('download')}>
                        <IconButton 
                          onClick={() => handleDownload(getFileUrl(selectedImage.url), `kivalasztott_${selectedImage.uploadDate}.jpg`)}
                          sx={{ 
                            position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: 'primary.main', color: 'white', '& svg': { color: 'white' } } 
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">{t('allRecordsChronological')}</Typography>
                
                <Button 
                  variant={isPlaying ? "outlined" : "contained"} 
                  color={isPlaying ? "error" : "primary"}
                  size="small"
                  startIcon={isPlaying ? <StopIcon /> : <PlayArrowIcon />}
                  onClick={() => {
                    if (!isPlaying && sortedImages.length > 0) {
                      setSelectedImage(sortedImages[0]);
                    }
                    setIsPlaying(!isPlaying);
                  }}
                  disabled={sortedImages.length < 2}
                >
                  {isPlaying ? t('stopAnimation') : t('playAnimation')}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                {sortedImages.map((img) => {
                  const isSelected = selectedImage?.id === img.id;
                  return (
                    <Box 
                      key={img.id} 
                      onClick={() => { setIsPlaying(false); setSelectedImage(img); }}
                      sx={{ 
                        minWidth: 150, 
                        border: isSelected ? '3px solid #1976d2' : '1px solid #ccc', 
                        borderRadius: 2, 
                        p: 0.5, 
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'border 0.2s ease',
                        '&:hover': { borderColor: '#1976d2' }
                      }}
                    >
                      <img 
                        src={getFileUrl(img.url)} 
                        alt="Thumbnail" 
                        style={{ 
                          width: '100%', height: '100px', objectFit: 'cover',
                          borderRadius: '4px', display: 'block'
                        }} 
                      />
                      
                      <IconButton 
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleDownload(getFileUrl(img.url), `panorama_${img.uploadDate}.jpg`); }}
                        sx={{ 
                          position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper',
                          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.8)', padding: '4px',
                          '&:hover': { bgcolor: 'primary.main', color: 'white', '& svg': { color: 'white' } } 
                        }}
                      >
                        <DownloadIcon fontSize="small" color="primary" />
                      </IconButton>

                      {isDoctor && (
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={(e) => { 
                            e.stopPropagation();
                            setImageToDelete(img.id); 
                          }}
                          sx={{ 
                            position: 'absolute', top: 4, left: 4, bgcolor: 'background.paper',
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.8)', padding: '4px',
                            '&:hover': { bgcolor: 'error.main', color: 'white', '& svg': { color: 'white' } } 
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}

                      <Typography variant="caption" display="block" align="center" sx={{ mt: 0.5, fontWeight: isSelected ? 'bold' : 'normal' }}>
                        {new Date(img.uploadDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsPlaying(false); onClose(); }}>{t('close')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!imageToDelete} onClose={() => setImageToDelete(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('areYouSureDeleteImage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageToDelete(null)} color="primary">
            {t('cancel')}
          </Button>
          <Button 
            onClick={() => imageToDelete && deleteMutation.mutate(imageToDelete)} 
            color="error" 
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={24} color="inherit" /> : t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="standard">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}