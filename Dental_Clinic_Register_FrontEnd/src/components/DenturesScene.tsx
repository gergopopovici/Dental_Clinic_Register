import React, { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
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

function Archwire({ points, color = '#d3d3d3' }: { points: THREE.Vector3[]; color?: string }) {
  const tubeGeometry = useMemo(() => {
    if (points.length < 2) return null;
    const center = new THREE.Vector3();
    points.forEach((p) => center.add(p));
    center.divideScalar(points.length);
    const pivotZ = center.z - 50;
    const sortedPoints = [...points].sort((a, b) => {
      const angleA = Math.atan2(a.x - center.x, a.z - pivotZ);
      const angleB = Math.atan2(b.x - center.x, b.z - pivotZ);
      return angleA - angleB;
    });
    const curve = new THREE.CatmullRomCurve3(sortedPoints, false, 'centripetal');
    return new THREE.TubeGeometry(curve, 256, 0.15, 8, false);
  }, [points]);

  if (!tubeGeometry) return null;

  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function DenturesScene({ treatmentPlanId = 1 }: { treatmentPlanId?: number }) {
  const [components, setComponents] = useState<BraceComponentDTO[]>([]);
  const [placementMode, setPlacementMode] = useState<PlacementMode>('none');
  const [rubberBandStartPoint, setRubberBandStartPoint] = useState<THREE.Vector3 | null>(null);
  const [rubberBandColor, setRubberBandColor] = useState<string>('#FF0000');
  const [archwireColor, setArchwireColor] = useState<string>('#d3d3d3');
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
    setComponents(autoBraces);
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

  const toggleMode = (mode: PlacementMode) => {
    setPlacementMode((prev) => (prev === mode ? 'none' : mode));
    setRubberBandStartPoint(null);
  };

  const upperBrackets = useMemo(
    () =>
      components
        .filter((c) => c.type === 'BRACE' && (c.positionY ?? 0) > 0)
        .map((c) => {
          const zOff = (c.positionZ ?? 0) < 5 ? 1.4 : 0.6;
          return new THREE.Vector3(c.positionX ?? 0, c.positionY ?? 0, (c.positionZ ?? 0) + zOff);
        }),
    [components],
  );

  const lowerBrackets = useMemo(
    () =>
      components
        .filter((c) => c.type === 'BRACE' && (c.positionY ?? 0) < 0)
        .map((c) => {
          const zOff = (c.positionZ ?? 0) < 5 ? 1.4 : 0.6;
          return new THREE.Vector3(c.positionX ?? 0, c.positionY ?? 0, (c.positionZ ?? 0) + zOff);
        }),
    [components],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
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
        <Button variant="outlined" color="error" onClick={() => setComponents([])}>
          Clear All
        </Button>
        <Button variant="contained" color="success" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Save Plan'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Rubber Band:</Typography>
          <input type="color" value={rubberBandColor} onChange={(e) => setRubberBandColor(e.target.value)} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Archwire:</Typography>
          <input type="color" value={archwireColor} onChange={(e) => setArchwireColor(e.target.value)} />
        </Box>
      </Box>

      <Canvas
        camera={{ position: [0, 0, 45], fov: 45 }}
        style={{ width: '800px', height: '600px', borderRadius: '8px', background: '#2c2c2c' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 10, 5]} intensity={2.0} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <DentureModel modelPath="/denture_model.glb" onModelClick={handleModelClick} />

          {upperBrackets.length > 1 && <Archwire points={upperBrackets} color={archwireColor} />}
          {lowerBrackets.length > 1 && <Archwire points={lowerBrackets} color={archwireColor} />}

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
              const start = new THREE.Vector3(
                comp.startPositionX ?? 0,
                comp.startPositionY ?? 0,
                comp.startPositionZ ?? 0,
              );
              const end = new THREE.Vector3(comp.endPositionX ?? 0, comp.endPositionY ?? 0, comp.endPositionZ ?? 0);
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
    </Box>
  );
}

export default DenturesScene;
