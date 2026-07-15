import { useMemo } from 'react';
import { ROOM } from '../../utils/constants';
import { useRoomMaterialStore, FLOOR_OPTIONS } from '../../store/roomMaterialStore';

/**
 * Renders the fixed floor plane sized to the room's fixed footprint. Color
 * is user-selectable (see RoomMaterialPicker.jsx / store/roomMaterialStore.js).
 */
export default function RoomFloor() {
  const { width, depth } = ROOM;
  const floorColorId = useRoomMaterialStore((s) => s.floorColorId);
  const floorOption = useMemo(
    () => FLOOR_OPTIONS.find((option) => option.id === floorColorId) ?? FLOOR_OPTIONS[0],
    [floorColorId]
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color={floorOption.color}
        roughness={floorOption.roughness}
        envMapIntensity={0.25}
      />
    </mesh>
  );
}
