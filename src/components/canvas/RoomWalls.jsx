import { useMemo } from 'react';
import { ROOM } from '../../utils/constants';
import { useRoomMaterialStore, WALL_OPTIONS } from '../../store/roomMaterialStore';

/**
 * Renders the room's three fixed walls (back + two sides). The front side
 * is intentionally left open so the orbit camera can always see inside.
 *
 * Coordinate note: the scene origin is the floor center, so each wall mesh
 * is offset by half the room's width/depth plus half its own thickness —
 * this places the wall's INNER face exactly at `room.<axis>/2 - wallThickness`,
 * which is the same boundary utils/math3d.js clamps furniture against.
 *
 * Wall color is user-selectable (see RoomMaterialPicker.jsx /
 * store/roomMaterialStore.js) — everything else about the wall geometry is
 * unchanged.
 */
export default function RoomWalls() {
  const { width, depth, height, wallThickness } = ROOM;
  const wallColorId = useRoomMaterialStore((s) => s.wallColorId);
  const wallOption = useMemo(
    () => WALL_OPTIONS.find((option) => option.id === wallColorId) ?? WALL_OPTIONS[0],
    [wallColorId]
  );

  const wallMaterialProps = useMemo(
    // envMapIntensity düşük tutuluyor: matte duvar boyası gerçek hayatta
    // ortamı neredeyse hiç yansıtmaz. Bu olmadan `<Environment>`'ın arka
    // plan fotoğrafı (özellikle renkli/parlak olanlar) duvarın normal
    // yönüne göre farklı miktarda "sızıyor" ve seçilen renk her duvarda
    // — ve arka plan değiştikçe — farklı görünüyordu (bildirilen hata).
    () => ({ color: wallOption.color, roughness: wallOption.roughness, metalness: 0, envMapIntensity: 0.25 }),
    [wallOption]
  );

  return (
    <group>
      {/* Back wall, fixed on +Z */}
      <mesh position={[0, height / 2, depth / 2 - wallThickness / 2]} receiveShadow>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>

      {/* Left wall, fixed on -X */}
      <mesh position={[-width / 2 + wallThickness / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>

      {/* Right wall, fixed on +X */}
      <mesh position={[width / 2 - wallThickness / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial {...wallMaterialProps} />
      </mesh>
    </group>
  );
}
