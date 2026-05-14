import * as THREE from 'three';
import { useMemo } from 'react';

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
export default Archwire;
