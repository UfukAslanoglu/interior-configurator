import { lazy, Suspense, useMemo } from 'react';
import ModelErrorBoundary from './ModelErrorBoundary';

// Production pattern: real GLB models are code-split and lazy-loaded behind
// Suspense so the initial JS bundle stays small — three.js's GLTFLoader is
// only fetched once a catalog item actually needs a real model.
const GLTFFurnitureModel = lazy(() => import('./GLTFFurnitureModel'));

/**
 * Dynamic model loader for a single furniture instance. Reads a catalog
 * variation's `modelUrl` (a path under `public/models/*.glb`) and:
 *  1. Shows a lightweight primitive placeholder immediately (no pop-in).
 *  2. Streams the real GLTF model in behind a Suspense boundary.
 *  3. Falls back to the SAME primitive permanently if loading throws
 *     (404, bad asset, offline), via ModelErrorBoundary.
 *
 * Model swapping: this component is deliberately "dumb" — it has no
 * zustand dependency of its own. When the user picks a different
 * variation, the store's `setActiveModel` action updates
 * `placedItem.activeVariationId`; FurnitureItem re-resolves the catalog
 * variation and passes a NEW `modelUrl` prop down here. React re-renders
 * with the new url, and the `key={modelUrl}` below forces a clean remount
 * of both the Suspense boundary and the error boundary — otherwise a
 * *previous* variation's load error (or a stale cached GLTF scene graph)
 * could leak into the new selection. That's the whole "swap" mechanism:
 * plain unidirectional data flow, no imperative model-swap API needed.
 *
 * Catalog items with no `modelUrl` render the primitive only, which is how
 * the demo catalog works today with zero real 3D assets.
 *
 * @param {{
 *   primitiveType: 'sofa'|'table'|'lamp'|'box',
 *   color: string,
 *   size: {width:number, height:number, depth:number},
 *   modelUrl?: string
 * }} props
 */
export default function FurnitureLoader({ primitiveType, color, size, modelUrl }) {
  const fallback = (
    <PrimitiveFurniture primitiveType={primitiveType} color={color} size={size} />
  );

  if (!modelUrl) return fallback;

  return (
    <ModelErrorBoundary key={modelUrl} fallback={fallback}>
      <Suspense fallback={fallback}>
        {/* `size` here is the catalog item's real-world dimensions (meters) —
            GLTFFurnitureModel uses it as the fit target so any .glb, no
            matter what scale it was exported at, ends up this exact size
            and centered on the floor. See utils/modelBounds.js. */}
        <GLTFFurnitureModel url={modelUrl} targetSize={size} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

/** Cheap procedural stand-ins so the app is fully usable without real 3D assets. */
function PrimitiveFurniture({ primitiveType, color, size }) {
  const { width, height, depth } = size;

  const geometry = useMemo(() => {
    switch (primitiveType) {
      case 'lamp':
        return <cylinderGeometry args={[width / 2, width / 3, height, 20]} />;
      case 'table':
        return <cylinderGeometry args={[width / 2, width / 2, height, 24]} />;
      default:
        return <boxGeometry args={[width, height, depth]} />;
    }
  }, [primitiveType, width, height, depth]);

  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
    </mesh>
  );
}
