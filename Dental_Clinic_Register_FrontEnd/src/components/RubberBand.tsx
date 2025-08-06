import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';

type RubberBandProps = {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  color?: string;
  onClick: () => void;
};

function RubberBand({ startPosition, endPosition, color = 'red', onClick }: RubberBandProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const points = [startPosition, endPosition];

  const [position, rotation, length] = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(endPosition, startPosition);
    const length = direction.length();
    const position = new THREE.Vector3().addVectors(startPosition, endPosition).multiplyScalar(0.5);
    const rotation = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return [position, rotation, length];
  }, [startPosition, endPosition]);

  return (
    <group onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      <line>
        <bufferGeometry attach="geometry" args={[]} onUpdate={(self) => self.setFromPoints(points)} />
        <lineBasicMaterial attach="material" color={hovered ? 'orange' : color} linewidth={10} />
      </line>

      <mesh ref={meshRef} position={position} quaternion={rotation} renderOrder={1}>
        <cylinderGeometry args={[0.5, 0.5, length, 8]} />
        <meshBasicMaterial transparent opacity={0.0} />
      </mesh>
    </group>
  );
}

export default RubberBand;
