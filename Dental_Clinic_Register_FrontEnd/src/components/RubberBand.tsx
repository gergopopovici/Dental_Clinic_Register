import * as THREE from 'three';
import { useMemo, useState } from 'react';

type RubberBandProps = {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  color?: string;
  onClick: () => void;
};

function RubberBand({ startPosition, endPosition, color = '#FF0000', onClick }: RubberBandProps) {
  const [hovered, setHover] = useState(false);

  const { tubeGeometry } = useMemo(() => {
    const path = new THREE.LineCurve3(startPosition, endPosition);
    return { tubeGeometry: new THREE.TubeGeometry(path, 20, 0.15, 8, false) };
  }, [startPosition, endPosition]);

  return (
    <mesh
      geometry={tubeGeometry}
      onClick={onClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <meshStandardMaterial color={hovered ? 'orange' : color} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

export default RubberBand;
