import React, { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Button, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import * as THREE from 'three';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import DentureModel from './DentureModel';
import Brace from './Brace';
import RubberBand from './RubberBand';
import Archwire from './Archwire';
import { BraceComponentDTO } from '../models/BraceComponentDTO';
import { getBraceComponents, syncBraceComponents } from '../services/BraceComponentService';

type PlacementMode = 'none' | 'rubberBand' | 'delete';

const DUMMY_TOOTH_CENTERS = [
  { x: -1.208, y: 2.718, z: 13.259 },
  { x: 3.266, y: 2.621, z: 12.964 },
  { x: -5.406, y: 2.562, z: 11.638 },
  { x: 7.087, y: 2.704, z: 10.857 },
  { x: -8.577, y: 3.036, z: 9.449 },
  { x: 9.892, y: 2.603, z: 7.854 },
  { x: -11.688, y: 2.836, z: 5.658 },
  { x: 12.223, y: 2.697, z: 4.4 },
  { x: -13.486, y: 2.637, z: 2.213 },
  { x: 13.581, y: 2.646, z: 0.722 },
  { x: -15.055, y: 2.702, z: -2.07 },
  { x: 14.649, y: 2.777, z: -4.205 },
  { x: -0.69, y: -2.715, z: 11.596 },
  { x: 2.311, y: -2.857, z: 11.458 },
  { x: -3.584, y: -3.075, z: 10.257 },
  { x: 4.659, y: -3.008, z: 10.061 },
  { x: -6.412, y: -2.852, z: 8.532 },
  { x: 7.479, y: -2.907, z: 7.752 },
  { x: -9.532, y: -3.063, z: 5.617 },
  { x: 10.113, y: -3.122, z: 4.375 },
  { x: -12.087, y: -3.45, z: 1.662 },
  { x: 11.828, y: -3.072, z: 0.512 },
  { x: -13.999, y: -3.52, z: -2.864 },
  { x: 13.051, y: -3.162, z: -3.943 },
];

interface DenturesSceneProps {
  treatmentPlanId?: number;
  readOnly?: boolean;
}

function DenturesScene({ treatmentPlanId = 1, readOnly = false }: DenturesSceneProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [components, setComponents] = useState<BraceComponentDTO[]>([]);
  const [placementMode, setPlacementMode] = useState<PlacementMode>('none');
  const [rubberBandStartPoint, setRubberBandStartPoint] = useState<THREE.Vector3 | null>(null);
  const [rubberBandColor, setRubberBandColor] = useState<string>('#FF0000');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const {
    data: serverComponents,
    isLoading: isFetching,
    isError,
  } = useQuery({
    queryKey: ['braceComponents', treatmentPlanId],
    queryFn: () => getBraceComponents(treatmentPlanId),
    retry: false,
  });

  useEffect(() => {
    if (serverComponents) {
      setComponents(serverComponents);
    }
  }, [serverComponents]);

  const saveMutation = useMutation({
    mutationFn: (newComponents: BraceComponentDTO[]) => syncBraceComponents(treatmentPlanId, newComponents),
    onSuccess: (savedData) => {
      setComponents(savedData);
      queryClient.invalidateQueries({ queryKey: ['braceComponents', treatmentPlanId] });
      setSnackbar({ open: true, message: t('planSavedSuccessfully'), severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: t('failedToSavePlan'), severity: 'error' });
    },
  });

  const handleSave = () => {
    if (readOnly) return;
    saveMutation.mutate(components);
  };

  const handleAutoPlace = () => {
    if (readOnly) return;
    const autoBraces: BraceComponentDTO[] = DUMMY_TOOTH_CENTERS.map((point) => ({
      treatmentPlanId,
      type: 'BRACE',
      positionX: point.x,
      positionY: point.y,
      positionZ: point.z,
      colour: '#C0C0C0',
    }));
    setComponents(autoBraces);
  };

  const handleRemoveComponent = useCallback(
    (indexToRemove: number) => {
      if (readOnly) return;
      setComponents((prev) => prev.filter((_, index) => index !== indexToRemove));
    },
    [readOnly],
  );

  const handleModelClick = (point: THREE.Vector3) => {
    if (readOnly) {
      return;
    }
    if (placementMode === 'rubberBand') {
      if (!rubberBandStartPoint) {
        setRubberBandStartPoint(point);
      } else {
        const newBand: BraceComponentDTO = {
          treatmentPlanId,
          type: 'RUBBER_BAND',
          startPositionX: rubberBandStartPoint.x,
          startPositionY: rubberBandStartPoint.y,
          startPositionZ: rubberBandStartPoint.z,
          endPositionX: point.x,
          endPositionY: point.y,
          endPositionZ: point.z,
          colour: rubberBandColor,
        };
        setComponents((prev) => [...prev, newBand]);
        setRubberBandStartPoint(null);
      }
    }
  };

  const toggleMode = (mode: PlacementMode) => {
    if (readOnly) return;
    setPlacementMode((prev) => (prev === mode ? 'none' : mode));
    setRubberBandStartPoint(null);
  };

  const upperBrackets = useMemo(
    () =>
      components
        .filter((c) => c.type === 'BRACE' && (c.positionY ?? 0) > 0)
        .map(
          (c) =>
            new THREE.Vector3(
              c.positionX ?? 0,
              c.positionY ?? 0,
              (c.positionZ ?? 0) + ((c.positionZ ?? 0) < 5 ? 1.4 : 0.6),
            ),
        ),
    [components],
  );
  const lowerBrackets = useMemo(
    () =>
      components
        .filter((c) => c.type === 'BRACE' && (c.positionY ?? 0) < 0)
        .map(
          (c) =>
            new THREE.Vector3(
              c.positionX ?? 0,
              c.positionY ?? 0,
              (c.positionZ ?? 0) + ((c.positionZ ?? 0) < 5 ? 1.4 : 0.6),
            ),
        ),
    [components],
  );

  if (isError) {
    return (
      <Typography color="error" variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
        {t('unauthorizedOrNotFound')}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {!readOnly && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleAutoPlace}>
              {t('autoPlace')}
            </Button>
            <Button
              variant={placementMode === 'rubberBand' ? 'contained' : 'outlined'}
              onClick={() => toggleMode('rubberBand')}
            >
              {t('placeRubberBand')}
            </Button>
            <Button
              variant={placementMode === 'delete' ? 'contained' : 'outlined'}
              onClick={() => toggleMode('delete')}
            >
              {t('delete')}
            </Button>
            <Button variant="contained" color="error" onClick={() => setComponents([])}>
              {t('clearAll')}
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleSave}
              disabled={saveMutation.isPending || isFetching}
            >
              {saveMutation.isPending ? <CircularProgress size={24} /> : t('savePlan')}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{t('rubberBandLabel')}</Typography>
              <input type="color" value={rubberBandColor} onChange={(e) => setRubberBandColor(e.target.value)} />
            </Box>
          </Box>
        </>
      )}

      {isFetching && <CircularProgress sx={{ mb: 2 }} />}

      <Canvas
        camera={{ position: [0, 0, 45], fov: 45 }}
        style={{ width: '800px', height: '600px', borderRadius: '8px' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 10, 5]} intensity={2.0} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <DentureModel modelPath="/denture_model.glb" onModelClick={handleModelClick} />z
          {upperBrackets.length > 1 && <Archwire points={upperBrackets} color="#d3d3d3" />}
          {lowerBrackets.length > 1 && <Archwire points={lowerBrackets} color="#d3d3d3" />}
          {components.map((comp, index) => {
            const pos = new THREE.Vector3(comp.positionX ?? 0, comp.positionY ?? 0, comp.positionZ ?? 0);
            if (comp.type === 'BRACE' && comp.positionX != null) {
              return (
                <Brace
                  key={index}
                  position={pos}
                  scale={[1.8, 1.8, 1.8]}
                  onClick={() => placementMode === 'delete' && handleRemoveComponent(index)}
                />
              );
            }
            if (comp.type === 'RUBBER_BAND' && comp.startPositionX != null) {
              const startZ = comp.startPositionZ ?? 0;
              const startOffset = startZ < 5 ? 1.6 : 0.8;
              const start = new THREE.Vector3(comp.startPositionX ?? 0, comp.startPositionY ?? 0, startZ + startOffset);

              const endZ = comp.endPositionZ ?? 0;
              const endOffset = endZ < 5 ? 1.6 : 0.8;
              const end = new THREE.Vector3(comp.endPositionX ?? 0, comp.endPositionY ?? 0, endZ + endOffset);
              return (
                <RubberBand
                  key={index}
                  startPosition={start}
                  endPosition={end}
                  color={comp.colour || '#FF0000'}
                  onClick={() => placementMode === 'delete' && handleRemoveComponent(index)}
                />
              );
            }
            return null;
          })}
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} target={[0, 0, 0]} />
        </Suspense>
      </Canvas>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DenturesScene;
