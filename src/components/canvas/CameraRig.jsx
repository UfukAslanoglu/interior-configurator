import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { CAMERA, ROOM } from '../../utils/constants';
import { useDesignStore } from '../../store/designStore';

/**
 * Perspective camera + orbit controls, confined to the fixed room.
 *
 * Panning is deliberately OFF (`enablePan={false}`) — it used to be on with
 * the orbit target re-clamped back inside the room on every 'change' event,
 * but on touch devices that live re-clamping fought the two-finger
 * pinch/pan gesture (`TOUCH.DOLLY_PAN` moves the target AND the distance in
 * the same gesture), which is what caused pinch-zoom to feel stuck/janky
 * and the camera to seem "pinned to one corner, spinning around it" on
 * mobile. With pan off, the target never moves (it's a fixed point at the
 * room's center), so pinch is pure zoom with nothing to fight — rotate
 * (one finger) and zoom (two fingers / scroll) are the only camera
 * interactions, which is really all a fixed-room configurator needs.
 *
 * While the user is dragging a piece of furniture (see FurnitureItem.jsx),
 * OrbitControls is disabled so the camera doesn't rotate underneath the
 * drag gesture — both interactions listen to the same pointer otherwise.
 */
export default function CameraRig() {
  const isDraggingFurniture = useDesignStore((s) => s.isDraggingFurniture);

  return (
    <>
      <PerspectiveCamera makeDefault fov={CAMERA.fov} position={CAMERA.position} />
      <OrbitControls
        makeDefault
        enabled={!isDraggingFurniture}
        target={[0, ROOM.height / 3, 0]}
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        zoomSpeed={CAMERA.zoomSpeed}
        minDistance={CAMERA.minDistance}
        maxDistance={CAMERA.maxDistance}
        minPolarAngle={CAMERA.minPolarAngle}
        maxPolarAngle={CAMERA.maxPolarAngle}
      />
    </>
  );
}
