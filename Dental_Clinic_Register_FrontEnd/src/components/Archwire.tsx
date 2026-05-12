import * as THREE from 'three';
import { useMemo } from 'react';

function Archwire({ points, color = '#d3d3d3' }: { points: THREE.Vector3[]; color?: string }) {
  const tubeGeometry = useMemo(() => {
    if (points.length < 2) return null;

    const leftSide = points.filter((p) => p.x <= 0).sort((a, b) => a.z - b.z);
    const rightSide = points.filter((p) => p.x > 0).sort((a, b) => b.z - a.z);
    const sortedPoints = [...leftSide, ...rightSide];

    const curve = new THREE.CatmullRomCurve3(sortedPoints, false, 'centripetal');
    return new THREE.TubeGeometry(curve, 128, 0.18, 12, false);
  }, [points]);

  if (!tubeGeometry) return null;

  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial color={color} metalness={1} roughness={0.1} depthWrite={true} depthTest={true} />
    </mesh>
  );
}

export default Archwire;
