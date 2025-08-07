import React, { Suspense, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Button, Typography } from '@mui/material';
import * as THREE from 'three';

import DentureModel from './DentureModel';
import Brace from './Brace';
import RubberBand from './RubberBand';

type BraceData = THREE.Vector3;

type RubberBandData = {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  color: string;
};

type PlacementMode = 'none' | 'brace' | 'rubberBand' | 'delete';

function DenturesScene() {
  const [braces, setBraces] = useState<BraceData[]>([]);
  const [rubberBands, setRubberBands] = useState<RubberBandData[]>([]);
  const [placementMode, setPlacementMode] = useState<PlacementMode>('none');
  const [rubberBandStartPoint, setRubberBandStartPoint] = useState<THREE.Vector3 | null>(null);
  const [rubberBandColor, setRubberBandColor] = useState<string>('#FF0000');

  const handleRemoveBrace = useCallback((indexToRemove: number) => {
    setBraces((prevBraces) => prevBraces.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleRemoveRubberBand = useCallback((indexToRemove: number) => {
    setRubberBands((prevBands) => prevBands.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleModelClick = (point: THREE.Vector3) => {
    if (placementMode === 'brace') {
      setBraces((prevBraces) => [...prevBraces, point]);
    } else if (placementMode === 'rubberBand') {
      if (!rubberBandStartPoint) {
        setRubberBandStartPoint(point);
      } else {
        setRubberBands((prevBands) => [
          ...prevBands,
          { startPosition: rubberBandStartPoint, endPosition: point, color: rubberBandColor },
        ]);
        setRubberBandStartPoint(null);
      }
    }
  };

  const handleClearAll = () => {
    setBraces([]);
    setRubberBands([]);
    setRubberBandStartPoint(null);
  };

  const handleSetBraceMode = () => {
    if (placementMode === 'brace') {
      setPlacementMode('none');
    } else {
      setPlacementMode('brace');
    }
    setRubberBandStartPoint(null);
  };

  const handleSetRubberBandMode = () => {
    if (placementMode === 'rubberBand') {
      setPlacementMode('none');
    } else {
      setPlacementMode('rubberBand');
    }
    setRubberBandStartPoint(null);
  };

  const handleSetDeleteMode = () => {
    if (placementMode === 'delete') {
      setPlacementMode('none');
    } else {
      setPlacementMode('delete');
    }
    setRubberBandStartPoint(null);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRubberBandColor(event.target.value);
  };

  const MODEL_PATH = '/denture_model.glb';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '100vh',
        mx: 'auto',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <Button variant={placementMode === 'brace' ? 'contained' : 'outlined'} onClick={handleSetBraceMode}>
          Place Brace
        </Button>
        <Button variant={placementMode === 'rubberBand' ? 'contained' : 'outlined'} onClick={handleSetRubberBandMode}>
          Place Rubber Band
        </Button>
        {/* New Delete button */}
        <Button variant={placementMode === 'delete' ? 'contained' : 'outlined'} onClick={handleSetDeleteMode}>
          Delete
        </Button>
        <Button variant="outlined" color="error" onClick={handleClearAll}>
          Clear All
        </Button>
      </Box>

      {placementMode === 'rubberBand' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            zIndex: 10,
          }}
        >
          <Typography>Rubber Band Color:</Typography>
          <input type="color" value={rubberBandColor} onChange={handleColorChange} />
          {rubberBandStartPoint && (
            <Typography variant="body2" color="primary">
              Click again for end point...
            </Typography>
          )}
        </Box>
      )}

      <Canvas
        camera={{
          position: [0.00003453758318994637, 1.6543756293575801e-15, 27.018004383109798],
          fov: 75,
        }}
        style={{
          width: '400px',
          height: '300px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          background: '#f0f0f0',
          zIndex: 1,
        }}
      >
        <CameraLogger />
        <Suspense fallback={null}>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 10, 5]} intensity={2.0} castShadow />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[-5, -5, 5]} intensity={1.5} />

          <group position={[0, 0, 0]}>
            <DentureModel modelPath={MODEL_PATH} onModelClick={handleModelClick} />
          </group>

          {braces.map((position, index) => (
            <Brace
              key={`brace-${index}`}
              position={position}
              onClick={() => {
                if (placementMode === 'delete') {
                  handleRemoveBrace(index);
                }
              }}
            />
          ))}

          {rubberBands.map((band, index) => (
            <RubberBand
              key={`band-${index}`}
              startPosition={band.startPosition}
              endPosition={band.endPosition}
              color={band.color}
              onClick={() => {
                if (placementMode === 'delete') {
                  handleRemoveRubberBand(index);
                }
              }}
            />
          ))}

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={50}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
            minAzimuthAngle={-Infinity}
            maxAzimuthAngle={Infinity}
          />
        </Suspense>
      </Canvas>

      <Box
        sx={{
          mt: 4,
          maxHeight: 200,
          overflowY: 'auto',
          p: 2,
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '600px',
          bgcolor: '#f9f9f9',
          zIndex: 10,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Placed Components
        </Typography>
        {braces.length === 0 && rubberBands.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No components placed yet.
          </Typography>
        )}
        {braces.map((pos, index) => (
          <Typography key={`display-brace-${index}`} variant="body2">
            Brace {index + 1}: ({pos.x.toFixed(3)}, {pos.y.toFixed(3)}, {pos.z.toFixed(3)})
          </Typography>
        ))}
        {rubberBands.map((band, index) => (
          <Typography key={`display-band-${index}`} variant="body2">
            Rubber Band {index + 1} ({band.color}): Start({band.startPosition.x.toFixed(3)},{' '}
            {band.startPosition.y.toFixed(3)}, {band.startPosition.z.toFixed(3)}) - End({band.endPosition.x.toFixed(3)},{' '}
            {band.endPosition.y.toFixed(3)}, {band.endPosition.z.toFixed(3)})
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default DenturesScene;

function CameraLogger() {
  const { camera } = useThree();

  useFrame(() => {
    console.log('Camera position:', camera.position);
    console.log('Camera rotation:', camera.rotation);
  });

  return null;
}
