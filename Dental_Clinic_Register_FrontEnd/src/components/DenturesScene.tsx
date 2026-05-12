import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import * as THREE from 'three';

import DentureModel from './DentureModel';
import Brace from './Brace';
import RubberBand from './RubberBand';
import { BraceComponentDTO } from '../models/BraceComponentDTO';
import { getBraceComponents, syncBraceComponents } from '../services/BraceComponentService';

type PlacementMode = 'none' | 'brace' | 'rubberBand' | 'delete';

const DUMMY_TOOTH_CENTERS = [
  { x: -1.5, y: 1.0, z: 2.0 },
  { x: 1.5, y: 1.0, z: 2.0 },
  { x: -2.5, y: 1.2, z: 1.5 },
  { x: 2.5, y: 1.2, z: 1.5 },
];

function DenturesScene({ treatmentPlanId = 1 }: { treatmentPlanId?: number }) {
  const [components, setComponents] = useState<BraceComponentDTO[]>([]);
  const [placementMode, setPlacementMode] = useState<PlacementMode>('none');
  const [rubberBandStartPoint, setRubberBandStartPoint] = useState<THREE.Vector3 | null>(null);
  const [rubberBandColor, setRubberBandColor] = useState<string>('#FF0000');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchComponents = async () => {
      setIsLoading(true);
      try {
        const data = await getBraceComponents(treatmentPlanId);
        setComponents(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComponents();
  }, [treatmentPlanId]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const savedData = await syncBraceComponents(treatmentPlanId, components);
      setComponents(savedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoPlace = () => {
    const autoBraces: BraceComponentDTO[] = DUMMY_TOOTH_CENTERS.map((point) => ({
      treatmentPlanId,
      type: 'BRACE',
      positionX: point.x,
      positionY: point.y,
      positionZ: point.z,
      colour: '#C0C0C0',
    }));
    setComponents((prev) => [...prev, ...autoBraces]);
  };

  const handleRemoveComponent = useCallback((indexToRemove: number) => {
    setComponents((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleModelClick = (point: THREE.Vector3) => {
    if (placementMode === 'brace') {
      const newBrace: BraceComponentDTO = {
        treatmentPlanId,
        type: 'BRACE',
        positionX: point.x,
        positionY: point.y,
        positionZ: point.z,
        colour: '#C0C0C0',
      };
      setComponents((prev) => [...prev, newBrace]);
    } else if (placementMode === 'rubberBand') {
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

  const handleClearAll = () => {
    setComponents([]);
    setRubberBandStartPoint(null);
  };

  const toggleMode = (mode: PlacementMode) => {
    setPlacementMode((prev) => (prev === mode ? 'none' : mode));
    setRubberBandStartPoint(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant={placementMode === 'brace' ? 'contained' : 'outlined'} onClick={() => toggleMode('brace')}>
          Place Brace
        </Button>
        <Button
          variant={placementMode === 'rubberBand' ? 'contained' : 'outlined'}
          onClick={() => toggleMode('rubberBand')}
        >
          Place Rubber Band
        </Button>
        <Button variant={placementMode === 'delete' ? 'contained' : 'outlined'} onClick={() => toggleMode('delete')}>
          Delete
        </Button>
        <Button variant="outlined" color="primary" onClick={handleAutoPlace}>
          Auto-Place
        </Button>
        <Button variant="outlined" color="error" onClick={handleClearAll}>
          Clear All
        </Button>
        <Button variant="contained" color="success" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Save Plan'}
        </Button>
      </Box>

      {placementMode === 'rubberBand' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography>Rubber Band Color:</Typography>
          <input type="color" value={rubberBandColor} onChange={(e) => setRubberBandColor(e.target.value)} />
          {rubberBandStartPoint && <Typography color="primary">Click again for end point...</Typography>}
        </Box>
      )}

      <Canvas
        camera={{ position: [0, 0, 40], fov: 45 }}
        style={{ width: '800px', height: '600px', borderRadius: '8px', background: '#2c2c2c' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 10, 5]} intensity={2.0} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />

          <DentureModel modelPath="/denture_model.glb" onModelClick={handleModelClick} />

          {components.map((comp, index) => {
            if (comp.type === 'BRACE' && comp.positionX != null) {
              const pos = new THREE.Vector3(comp.positionX ?? 0, comp.positionY ?? 0, comp.positionZ ?? 0);
              return (
                <Brace
                  key={`comp-${index}`}
                  position={pos}
                  onClick={() => placementMode === 'delete' && handleRemoveComponent(index)}
                />
              );
            }
            if (comp.type === 'RUBBER_BAND' && comp.startPositionX != null && comp.endPositionX != null) {
              const start = new THREE.Vector3(
                comp.startPositionX ?? 0,
                comp.startPositionY ?? 0,
                comp.startPositionZ ?? 0,
              );
              const end = new THREE.Vector3(comp.endPositionX ?? 0, comp.endPositionY ?? 0, comp.endPositionZ ?? 0);
              return (
                <RubberBand
                  key={`comp-${index}`}
                  startPosition={start}
                  endPosition={end}
                  color={comp.colour || '#FF0000'}
                  onClick={() => placementMode === 'delete' && handleRemoveComponent(index)}
                />
              );
            }
            return null;
          })}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={80}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </Box>
  );
}

export default DenturesScene;
