import React, { useRef } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

type DentureModelProps = {
  modelPath: string;
  onModelClick: (point: THREE.Vector3) => void;
};

export default function DentureModel({ modelPath, onModelClick }: DentureModelProps) {
  const meshRef = useRef(null);
  const gltf = useGLTF(modelPath);

  const handleClick = (event: { intersections: Array<{ point: THREE.Vector3 }> }) => {
    if (event.intersections.length > 0) {
      const intersectionPoint = event.intersections[0].point;
      onModelClick(intersectionPoint);
    }
  };

  return (
    <group ref={meshRef} onPointerDown={handleClick}>
      <Center>
        <primitive object={gltf.scene} scale={2.5} />
      </Center>
    </group>
  );
}

useGLTF.preload('/denture_model.glb');
