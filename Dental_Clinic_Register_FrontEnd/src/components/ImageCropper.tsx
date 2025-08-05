import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Box, Button, Slider, Typography, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import getCroppedImg from '../utils/cropImage';

interface Props {
  imageSrc: string;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onCropCompleteCallback: (croppedImage: Blob) => void;
  open: boolean;
}

export default function ImageCropper({ imageSrc, onClose, onCropCompleteCallback, open }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    if (croppedImage) {
      onCropCompleteCallback(croppedImage);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Crop Your Image</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 400,
            background: '#333',
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </Box>
        <Box mt={2}>
          <Typography variant="body2">Zoom</Typography>
          <Slider value={zoom} min={1} max={3} step={0.1} onChange={(_, newValue) => setZoom(newValue as number)} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleCrop} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
