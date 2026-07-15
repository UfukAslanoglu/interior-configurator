import { useRef, useCallback } from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { CAMERA, ROOM } from '../../utils/constants';
import { useDesignStore } from '../../store/designStore';

/**
 * Perspective camera + orbit controls, confined to the fixed room.
 *
 * Panning is enabled for a premium, exploratory feel, but the orbit target
 * is clamped back inside a safety margin from the walls/floor/ceiling on
 * every interaction. Combined with a min/maxDistance range and a polar-angle
 * limit, the camera effectively never leaves the room — a soft geometric
 * constraint rather than a full frustum/wall collision solver, which is the
 * right trade-off for a fixed, known room size.
 *
 * While the user is dragging a piece of furniture (see FurnitureItem.jsx),
 * OrbitControls is disabled so the camera doesn't rotate/pan underneath the
 * drag gesture — both interactions listen to the same pointer otherwise.
 */
export default function CameraRig() {
  const controlsRef = useRef(null);
  const isDraggingFurniture = useDesignStore((s) => s.isDraggingFurniture);

  /**
   * Clamps the OrbitControls target to the room's interior volume. Runs on
   * every 'change' event (drag, zoom, pan). We only constrain `target`
   * (not `camera.position` directly) because OrbitControls recomputes the
   * camera's position from target + spherical offset on its own update
   * loop — mutating position directly here would just get overwritten a
   * frame later and cause jitter.
   */
  const handleControlsChange = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { panMargin } = CAMERA;
    const halfW = ROOM.width / 2 - panMargin;
    const halfD = ROOM.depth / 2 - panMargin;
    const minY = 0.3;
    const maxY = ROOM.height - 0.3;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    controls.target.x = clamp(controls.target.x, -halfW, halfW);
    controls.target.y = clamp(controls.target.y, minY, maxY);
    controls.target.z = clamp(controls.target.z, -halfD, halfD);
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault fov={CAMERA.fov} position={CAMERA.position} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!isDraggingFurniture}
        target={[0, ROOM.height / 3, 0]}
        enableDamping
        dampingFactor={0.08}
        enablePan
        screenSpacePanning={false}
        panSpeed={0.6}
        zoomSpeed={CAMERA.zoomSpeed}
        minDistance={CAMERA.minDistance}
        maxDistance={CAMERA.maxDistance}
        minPolarAngle={CAMERA.minPolarAngle}
        maxPolarAngle={CAMERA.maxPolarAngle}
        onChange={handleControlsChange}
      />
    </>
  );
}
