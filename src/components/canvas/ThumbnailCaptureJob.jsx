import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fitModelToBounds, computeBoundingBox } from '../../utils/modelBounds';

/**
 * Loads ONE model, auto-frames a camera around its normalized bounding box
 * (works for anything from a flat rug to a tall bookshelf — no per-item
 * tuning needed), waits a couple of painted frames so lighting/materials
 * settle, then captures a PNG snapshot of the canvas and reports it up via
 * `onDone`. Exclusively used by ThumbnailRenderer's offscreen queue — never
 * rendered in the visible room scene.
 *
 * No `targetSize` is passed to `fitModelToBounds` here (unlike
 * GLTFFurnitureModel, which fits to the catalog item's real-world
 * dimensions) — thumbnails just need something nicely centered and
 * consistently scaled, not real-world accuracy.
 *
 * @param {{ modelUrl: string, onDone: (dataUrl: string) => void, onError: () => void }} props
 */
export default function ThumbnailCaptureJob({ modelUrl, onDone, onError }) {
  const { scene } = useGLTF(modelUrl);
  const { camera, gl } = useThree();
  const capturedRef = useRef(false);

  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true);
    fitModelToBounds(clone, {});
    return clone;
  }, [scene]);

  // Auto-frame: fit a perspective camera to whatever this model's actual
  // proportions are, from a fixed pleasant 3/4 angle.
  useEffect(() => {
    const box = computeBoundingBox(normalizedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z, 0.1);
    const distance = maxDim * 1.7;

    camera.position.set(center.x + distance * 0.62, center.y + distance * 0.52, center.z + distance * 0.62);
    camera.lookAt(center);
    if (typeof camera.updateProjectionMatrix === 'function') camera.updateProjectionMatrix();
  }, [normalizedScene, camera]);

  // Capture two animation frames after mount: the first lets R3F actually
  // paint the repositioned camera + newly-mounted model, the second gives
  // late-arriving environment/lighting textures one more pass before the
  // snapshot is taken.
  useEffect(() => {
    capturedRef.current = false;
    let raf1;
    let raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (capturedRef.current) return;
        capturedRef.current = true;
        try {
          const dataUrl = gl.domElement.toDataURL('image/png');
          onDone(dataUrl);
        } catch (err) {
          console.warn('ThumbnailCaptureJob: capture failed for', modelUrl, err);
          onError();
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedScene, gl, modelUrl]);

  return <primitive object={normalizedScene} />;
}
