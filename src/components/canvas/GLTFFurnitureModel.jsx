import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { fitModelToBounds, computeBoundingBox } from '../../utils/modelBounds';

/**
 * Loads a real .glb/.gltf furniture asset and normalizes it so EVERY model
 * — regardless of what units/scale/pivot it was exported with — ends up
 * the right physical size and sitting correctly on the floor. See
 * utils/modelBounds.js for the actual fit/re-center math; this component's
 * job is just wiring that up correctly around `useGLTF`.
 *
 * Why clone: `useGLTF`'s returned `scene` is cached and SHARED across every
 * instance that loads the same URL. If two placed "Modern Kanepe" pieces
 * both mutated that shared object's scale/position, they'd fight over one
 * transform. Cloning once per mounted instance (memoized on `[scene,
 * targetSize]`) gives each placed item its own independent Object3D.
 *
 * @param {{
 *   url: string,
 *   targetSize?: {width:number, height:number, depth:number} - Catalog item's real-world dimensions. Every item in data/catalogData.js has one, so this is the normal path. Omit only for a model with no catalog entry yet — it then falls back to a generic "largest edge ≈ 1.75 units" normalize (see DEFAULT_LARGEST_EDGE in utils/modelBounds.js).
 *   debugBounds?: boolean - Dev aid: draws a wireframe Box3Helper around the normalized model so you can visually confirm a new .glb ended up the right size/position. Leave off in production.
 * }} props
 */
export default function GLTFFurnitureModel({ url, targetSize, debugBounds = false }) {
  const { scene } = useGLTF(url);

  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true);
    fitModelToBounds(clone, { targetSize });
    return clone;
  }, [scene, targetSize]);

  // Keep the debug Box3Helper's box in sync whenever the normalized model
  // changes — cheap since it only runs when normalizedScene itself changes,
  // not every frame.
  const debugBox = useMemo(() => (debugBounds ? computeBoundingBox(normalizedScene) : null), [normalizedScene, debugBounds]);

  return (
    <group>
      <primitive object={normalizedScene} castShadow receiveShadow />
      {debugBox && <box3Helper args={[debugBox, 0xff00ff]} />}
    </group>
  );
}

/**
 * Preloads a .glb ahead of time — call this on catalog-card hover so
 * selecting the item feels instant instead of popping in after a network
 * round trip. Safe to call repeatedly; drei/three dedupe by URL.
 * @param {string} url
 */
export function preloadFurnitureModel(url) {
  useGLTF.preload(url);
}
