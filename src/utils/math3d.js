import { ROOM, GRID_SIZE, WALL_MOUNT } from './constants';

export function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Snaps a single coordinate value to the nearest grid line.
 * @param {number} value - Raw coordinate in meters.
 * @param {number} [gridSize=GRID_SIZE] - Grid cell size in meters.
 * @returns {number} Snapped coordinate.
 */
export function snapToGrid(value, gridSize = GRID_SIZE) {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Clamps a furniture item's [x, y, z] world position so its footprint stays
 * fully inside the fixed room, accounting for wall thickness and item size.
 *
 * Room coordinate convention:
 *  - Origin (0, 0, 0) sits at the CENTER of the floor.
 *  - +X points toward the right wall, +Z points toward the back wall, +Y is up.
 *  - Usable half-extents are (room.width/2 - wallThickness) and
 *    (room.depth/2 - wallThickness) — i.e. the inner face of each wall.
 *
 * @param {[number, number, number]} position - Candidate [x, y, z] in meters.
 * @param {{width: number, height: number, depth: number}} size - Item's bounding box (meters).
 * @param {{width: number, depth: number, height: number, wallThickness: number}} [room=ROOM]
 * @returns {[number, number, number]} A position guaranteed to keep the item inside the walls/floor/ceiling.
 */
export function clampPositionToRoom(position, size, room = ROOM) {
  const halfW = room.width / 2 - room.wallThickness - size.width / 2;
  const halfD = room.depth / 2 - room.wallThickness - size.depth / 2;
  const maxY = Math.max(room.height - size.height, 0);

  const [x, y, z] = position;

  return [
    Math.min(Math.max(x, -halfW), halfW),
    Math.min(Math.max(y, 0), maxY),
    Math.min(Math.max(z, -halfD), halfD),
  ];
}

/**
 * Clamps a WALL-MOUNTED item's [x, y, z] position so it stays flat on the
 * back wall's surface: `x` is bounded by the wall's usable width, `y` is
 * bounded to WALL_MOUNT's hanging-height range, and `z` is FORCED to the
 * wall's inner face plus a small standoff (prevents z-fighting with the
 * wall mesh — the incoming z is ignored entirely, unlike x/y which are
 * clamped). This is the wall-plane equivalent of clampPositionToRoom,
 * used for catalog items with `primitiveType: 'tablo'`.
 *
 * v1 only supports the back wall (+Z) — see the WALL_MOUNT doc comment in
 * utils/constants.js for where a future "nearest wall" pick would extend
 * this to the two side walls.
 *
 * @param {[number, number, number]} position - Candidate [x, y, z] in meters (z is ignored).
 * @param {{width: number, height: number, depth: number}} size - Item's bounding box (meters).
 * @param {{width: number, depth: number, height: number, wallThickness: number}} [room=ROOM]
 * @returns {[number, number, number]} A position guaranteed to sit flat on the back wall.
 */
export function clampWallPosition(position, size, room = ROOM) {
  const halfW = room.width / 2 - room.wallThickness - size.width / 2;
  const minY = WALL_MOUNT.minHeight + size.height / 2;
  const maxY = Math.min(WALL_MOUNT.maxHeight, room.height - size.height / 2);
  const wallZ = room.depth / 2 - room.wallThickness - WALL_MOUNT.standoff;

  const [x, y] = position;

  return [
    Math.min(Math.max(x, -halfW), halfW),
    Math.min(Math.max(y, minY), maxY),
    wallZ,
  ];
}

/**
 * Computes an axis-aligned bounding box (AABB) for a furniture item's
 * footprint on the floor plane (X/Z). The box is conservatively expanded to
 * fully contain the item at any Y-rotation, by projecting width/depth onto
 * the world axes — cheap and good enough for soft placement guidance, but
 * NOT a substitute for exact oriented-box collision.
 *
 * @param {[number, number, number]} position - Item center [x, y, z].
 * @param {{width: number, depth: number}} size - Footprint size (meters).
 * @param {number} [rotationY=0] - Rotation around Y axis, in radians.
 * @returns {{minX: number, maxX: number, minZ: number, maxZ: number}}
 */
export function getFootprintAABB(position, size, rotationY = 0) {
  const cos = Math.abs(Math.cos(rotationY));
  const sin = Math.abs(Math.sin(rotationY));
  const effectiveWidth = size.width * cos + size.depth * sin;
  const effectiveDepth = size.width * sin + size.depth * cos;

  const [x, , z] = position;
  return {
    minX: x - effectiveWidth / 2,
    maxX: x + effectiveWidth / 2,
    minZ: z - effectiveDepth / 2,
    maxZ: z + effectiveDepth / 2,
  };
}

/**
 * Simple AABB overlap test on the floor plane. Useful for warning the user
 * when two placed items overlap (not enforced by default, left as a hook
 * for future "smart placement" UX).
 * @param {{minX:number,maxX:number,minZ:number,maxZ:number}} a
 * @param {{minX:number,maxX:number,minZ:number,maxZ:number}} b
 * @returns {boolean} True if the two footprints overlap.
 */
export function isFootprintOverlap(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

/**
 * Rotates a Y-axis rotation value by a fixed step (defaults to 90°) and
 * normalizes the result to the [0, 2π) range.
 * @param {number} currentRadians
 * @param {number} [stepDegrees=90]
 * @returns {number}
 */
export function rotateStep(currentRadians, stepDegrees = 90) {
  const twoPi = Math.PI * 2;
  const next = currentRadians + degToRad(stepDegrees);
  return ((next % twoPi) + twoPi) % twoPi;
}
