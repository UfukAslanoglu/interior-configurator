import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useBackgroundStore, BACKGROUND_OPTIONS } from '../../store/backgroundStore';
import EnvironmentPreviewJob from './EnvironmentPreviewJob';
import ModelErrorBoundary from './ModelErrorBoundary';

/** Renders nothing — just fires `onError` once if a preset's HDRI fails to load/capture, so the queue can move on instead of stalling. */
function CaptureFailed({ onError }) {
  useEffect(() => {
    onError();
  }, [onError]);
  return null;
}

/**
 * Invisible, always-mounted 3D renderer that builds REAL photographic
 * preview thumbnails for every curated background "vibe" (see
 * store/backgroundStore.js) by actually loading each HDRI once and
 * snapshotting it — the same technique ThumbnailRenderer.jsx uses for
 * furniture models. BackgroundPicker.jsx's cards show these instead of the
 * hand-drawn CSS gradient placeholder.
 *
 * Proactively enqueues ALL curated presets on mount (there are only 6 —
 * small enough to just warm the whole set up front) rather than waiting for
 * the picker to be opened, so cards are ready by the time a visitor looks.
 * As a side benefit, this also warms drei's shared HDRI loader cache, so
 * actually switching the live room background later (RoomScene.jsx) is
 * instant even the very first time.
 */
export default function EnvironmentPreviewRenderer() {
  const previewQueue = useBackgroundStore((s) => s.previewQueue);
  const previews = useBackgroundStore((s) => s.previews);
  const requestPreview = useBackgroundStore((s) => s.requestPreview);
  const completePreview = useBackgroundStore((s) => s.completePreview);
  const failPreview = useBackgroundStore((s) => s.failPreview);
  const currentPresetId = previewQueue[0] ?? null;

  useEffect(() => {
    BACKGROUND_OPTIONS.forEach((option) => {
      if (!previews[option.id]) requestPreview(option.id);
    });
    // Only ever needs to run once — BACKGROUND_OPTIONS is a static list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ fov: 50 }}
        style={{ width: 256, height: 160 }}
      >
        <Suspense fallback={null}>
          {currentPresetId && (
            <ModelErrorBoundary
              key={currentPresetId}
              fallback={<CaptureFailed onError={() => failPreview(currentPresetId)} />}
            >
              <EnvironmentPreviewJob
                presetId={currentPresetId}
                onDone={(dataUrl) => completePreview(currentPresetId, dataUrl)}
                onError={() => failPreview(currentPresetId)}
              />
            </ModelErrorBoundary>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
