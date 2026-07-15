import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { useThumbnailStore } from '../../store/thumbnailStore';
import ThumbnailCaptureJob from './ThumbnailCaptureJob';
import ModelErrorBoundary from './ModelErrorBoundary';

/** Renders nothing itself — just fires `onError` once when ModelErrorBoundary catches a broken/missing .glb, so the queue can move on instead of stalling. */
function CaptureFailed({ onError }) {
  useEffect(() => {
    onError();
  }, [onError]);
  return null;
}

/**
 * Invisible, always-mounted 3D renderer that auto-generates catalog
 * thumbnail images from the real .glb models — one at a time, off a shared
 * queue (see store/thumbnailStore.js) — so catalog/variation cards can show
 * an actual photo of the furniture instead of a flat color swatch. There is
 * no offline/server render step: this quietly does the work in the
 * visitor's own browser the first time each model is needed, and the
 * result is cached in localStorage so it only ever happens once per model
 * per browser.
 *
 * Mounted once near the app root (see App.jsx) — NOT display:none (that can
 * suspend WebGL rendering in some browsers) but visually clipped to 1x1px
 * via an ancestor with `overflow: hidden`, so its GL context stays warm
 * across the whole queue instead of being torn down and recreated per
 * model. The Canvas itself is still sized to a real 256x256 drawing
 * buffer so captured images aren't blurry.
 */
export default function ThumbnailRenderer() {
  const queue = useThumbnailStore((s) => s.queue);
  const completeCurrent = useThumbnailStore((s) => s.completeCurrent);
  const failCurrent = useThumbnailStore((s) => s.failCurrent);
  const currentUrl = queue[0] ?? null;

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
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        camera={{ fov: 32 }}
        style={{ width: 256, height: 256 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 2]} intensity={1.5} />
        <Suspense fallback={null}>
          {/* Reuses the "city" preset RoomScene.jsx already loads, so this
              rarely triggers its own network fetch — same cached HDR. */}
          <Environment preset="city" />
          {currentUrl && (
            <ModelErrorBoundary
              key={currentUrl}
              fallback={<CaptureFailed onError={() => failCurrent(currentUrl)} />}
            >
              <ThumbnailCaptureJob
                modelUrl={currentUrl}
                onDone={(dataUrl) => completeCurrent(currentUrl, dataUrl)}
                onError={() => failCurrent(currentUrl)}
              />
            </ModelErrorBoundary>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
