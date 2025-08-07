import * as THREE from 'three';
import { ThreeElements } from '@react-three/fiber';
import { useRef, useState } from 'react';

type BraceProps = ThreeElements['mesh'] & {
  position: THREE.Vector3;
  onClick: () => void;
};

function Brace({ position, onClick, ...props }: BraceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshStandardMaterial({ color: hovered ? 'orange' : 'silver' });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      {...props}
    ></mesh>
  );
}

export default Brace;
