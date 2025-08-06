import type { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: ThreeElements[keyof ThreeElements];
    }
  }
}
