/**
 * Fixed room dimensions and global scene constants.
 * This app intentionally does NOT allow resizing the room (see project
 * scope: "Fixed Room Layout"). All lengths are in meters unless noted.
 */

export const ROOM = Object.freeze({
  width: 5, // X axis (meters)
  depth: 4, // Z axis (meters)
  height: 2.8, // Y axis (meters)
  wallThickness: 0.12,
});

export const GRID_SIZE = 0.05; // 5cm snapping grid for furniture placement

export const CAMERA = Object.freeze({
  fov: 48,
  position: [3.3, 2.0, 3.6], // pulled in tight for a product-shot feel
  minDistance: 0.9, // close enough to inspect furniture detail
  maxDistance: 7.2, // wide enough to see the whole room at once; target-clamping in CameraRig keeps this from poking through walls
  zoomSpeed: 1.15,
  minPolarAngle: Math.PI / 8,
  maxPolarAngle: Math.PI / 2.1, // keep the camera from diving under the floor
  panMargin: 0.4, // meters kept clear of walls/floor/ceiling when panning (see CameraRig)
});

/**
 * The catalog `primitiveType` value that marks a variation as wall-mounted
 * art (paintings, wall sculptures, etc.) rather than floor-standing
 * furniture. A single named constant instead of the raw string `'tablo'`
 * scattered across designStore.js / FurnitureItem.jsx / PropertiesPanel.jsx.
 */
export const WALL_ART_PRIMITIVE_TYPE = 'tablo';

export const TRANSFORM_MODES = Object.freeze({
  TRANSLATE: 'translate',
  ROTATE: 'rotate',
});

export const HISTORY_LIMIT = 50;

export const BREAKPOINTS = Object.freeze({
  mobile: 768, // px — matches Tailwind's `md` breakpoint
});

/**
 * The only account allowed to delete designs from the public gallery.
 * This is a UI-level check only (hides/shows the trash icon) — the real
 * enforcement is the "Only admin can delete designs" RLS policy on the
 * `designs` table in Supabase, which checks this same email server-side.
 * Keep the two in sync if this ever changes.
 */
export const ADMIN_EMAIL = 'aslanogluufuk13@gmail.com';

/**
 * Wall-mounted items (paintings/wall art — catalog `primitiveType: 'tablo'`)
 * use a completely different placement rule than floor items: pinned flat
 * against a wall surface instead of standing on the floor. v1 supports the
 * back wall only — see clampWallPosition in utils/math3d.js and the
 * isWallMounted branch in FurnitureItem.jsx for where a future
 * "nearest wall" pick (supporting the two side walls too) would plug in.
 */
export const WALL_MOUNT = Object.freeze({
  standoff: 0.02, // meters off the wall surface — avoids z-fighting with the wall mesh
  defaultHeight: 1.4, // meters — roughly eye level, used as the spawn height for a newly-added piece
  minHeight: 0.5, // meters — lowest a piece can be dragged before it'd look like it's resting on the floor
  maxHeight: ROOM.height - 0.3, // meters — highest a piece can be dragged before it crowds the ceiling
});
