import { ROOM } from '../../utils/constants';

/**
 * Performance-conscious lighting rig: a single shadow-casting key light plus
 * soft ambient/hemisphere fill. Shadow map size is capped at 1024 so this
 * stays smooth on mid-range mobile GPUs.
 *
 * Balance note: the key light's intensity is kept modest relative to
 * ambient/hemisphere fill on purpose — a strong directional light makes
 * each wall face (back vs. side, each facing a different direction) pick up
 * very different amounts of light, so the SAME picked wall color
 * (RoomWalls.jsx / RoomMaterialPicker.jsx) looked like different colors on
 * different walls. Leaning more on flat, non-directional fill keeps wall
 * tone consistent across all three walls while the key light still gives
 * furniture soft directional shadows/depth.
 */
export default function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        castShadow
        position={[ROOM.width / 2, ROOM.height * 1.8, ROOM.depth / 2]}
        intensity={0.6}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-ROOM.width}
        shadow-camera-right={ROOM.width}
        shadow-camera-top={ROOM.depth}
        shadow-camera-bottom={-ROOM.depth}
        shadow-bias={-0.0015}
      />
      <hemisphereLight args={['#fff7ec', '#3a3a3a', 0.5]} />
    </>
  );
}
