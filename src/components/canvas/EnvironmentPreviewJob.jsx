import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useEnvironment } from '@react-three/drei';

/**
 * Loads ONE real HDRI preset (the same `useEnvironment` hook drei's
 * `<Environment>` uses internally) into an invisible offscreen scene, sets
 * it as `scene.background` with a touch of blur so it reads as a soft photo
 * rather than a harsh skybox, waits a couple of painted frames, then
 * captures a JPEG snapshot and reports it up via `onDone`. Used exclusively
 * by EnvironmentPreviewRenderer's queue to build real photographic preview
 * thumbnails for BackgroundPicker.jsx — never rendered in the visible room.
 *
 * @param {{ presetId: string, onDone: (dataUrl: string) => void, onError: () => void }} props
 */
export default function EnvironmentPreviewJob({ presetId, onDone, onError }) {
  const texture = useEnvironment({ preset: presetId });
  const { scene, gl } = useThree();
  const capturedRef = useRef(false);

  useEffect(() => {
    scene.background = texture;
    scene.backgroundBlurriness = 0.35;
    scene.backgroundIntensity = 1;
    return () => {
      scene.background = null;
    };
  }, [scene, texture]);

  useEffect(() => {
    capturedRef.current = false;
    let raf1;
    let raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (capturedRef.current) return;
        capturedRef.current = true;
        try {
          const dataUrl = gl.domElement.toDataURL('image/jpeg', 0.82);
          onDone(dataUrl);
        } catch (err) {
          console.warn('EnvironmentPreviewJob: capture failed for', presetId, err);
          onError();
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, gl, presetId]);

  return null;
}
