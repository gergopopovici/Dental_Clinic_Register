/* eslint-disable no-unused-vars */
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

type DentureModelProps = {
  modelPath: string;
  onModelClick: (point: THREE.Vector3) => void;
};

export default function DentureModel({ modelPath, onModelClick }: DentureModelProps) {
  const meshRef = useRef(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { viewport } = useThree();

  const gltf = useGLTF(modelPath);

  const handleClick = (event: { intersections: Array<{ point: THREE.Vector3 }> }) => {
    if (event.intersections.length > 0) {
      const intersectionPoint = event.intersections[0].point;
      onModelClick(intersectionPoint);
    }
  };

  return (
    <group ref={meshRef} position={[0, 0, 0]} onPointerDown={handleClick}>
      <primitive object={gltf.scene} scale={1.0} />
    </group>
  );
}

useGLTF.preload('/denture_model.glb');
