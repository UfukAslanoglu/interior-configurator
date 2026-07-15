import * as THREE from 'three';

/** Default target for the largest edge when no per-axis catalog size is known (meters). Midpoint of the 1.5–2 "reasonable in a room" range. */
export const DEFAULT_LARGEST_EDGE = 1.75;

const EPSILON = 1e-6;

/**
 * Computes a fresh WORLD-SPACE bounding box for an Object3D subtree.
 * `Box3.setFromObject` walks current world matrices, so callers should call
 * `object3D.updateMatrixWorld(true)` first if they just changed a
 * transform (fitModelToBounds below does this for you at every step).
 *
 * @param {THREE.Object3D} object3D
 * @returns {THREE.Box3}
 */
export function computeBoundingBox(object3D) {
  return new THREE.Box3().setFromObject(object3D);
}

/**
 * Re-measures `object3D` and shifts it so its bounding box is centered on
 * X/Z and its lowest point sits at exactly Y=0. This is the step that
 * actually fixes models "flying" above the floor or sinking into it —
 * most GLTF exports don't put the mesh's pivot anywhere sane, so without
 * this every model would sit wherever its original modeling software's
 * origin happened to be.
 * @param {THREE.Object3D} object3D
 */
function alignToFloorAndCenter(object3D) {
  object3D.updateMatrixWorld(true);
  const box = computeBoundingBox(object3D);
  const center = new THREE.Vector3();
  box.getCenter(center);

  object3D.position.x -= center.x;
  object3D.position.z -= center.z;
  object3D.position.y -= box.min.y;
  object3D.updateMatrixWorld(true);
}

/**
 * Normalizes an arbitrary loaded GLTF scene graph so it behaves like a
 * predictable, room-scale piece of furniture — this is what fixes both
 * "the model is huge/tiny" and "the model flies/sinks", which are really
 * the SAME root cause: raw exports come with whatever local scale/units/
 * pivot the source software (Blender, etc.) happened to use.
 *
 * Two scaling strategies, chosen automatically by what you pass in:
 *
 *  - `targetSize` given (preferred): scales so the model's largest
 *    RELATIVE axis exactly fits the given `{width, height, depth}` — i.e.
 *    the catalog item's real-world dimensions in meters, the same numbers
 *    already used for room-bounds clamping elsewhere. This is what
 *    GLTFFurnitureModel.jsx uses for every item in data/catalogData.js, so
 *    a "3'lü Kanepe" actually measures ~2m wide in the room, not just
 *    "some reasonable-looking size".
 *  - `targetSize` omitted: falls back to a generic normalize — scales
 *    uniformly so the model's single LARGEST edge (whichever axis that is)
 *    becomes `targetLargestEdge` (default 1.75, i.e. the middle of a
 *    1.5–2 unit "looks right in a room" range). Use this for a model you
 *    haven't measured/catalogued yet, or a quick preview path — anywhere
 *    you don't have real dimensions to fit against.
 *
 * Either way, the model is then re-centered on X/Z and rested exactly on
 * Y=0 (see alignToFloorAndCenter). Mutates `object3D`'s scale/position in
 * place — call this on a clone, never on a `useGLTF` cache's shared scene
 * (see GLTFFurnitureModel.jsx) — and is idempotent: calling it twice on
 * the same object produces the same result, since scale/position are
 * reset to identity before measuring.
 *
 * @param {THREE.Object3D} object3D
 * @param {{
 *   targetSize?: {width:number, height:number, depth:number},
 *   targetLargestEdge?: number
 * }} [options]
 * @returns {number} The uniform scale factor that was applied.
 */
export function fitModelToBounds(object3D, { targetSize, targetLargestEdge = DEFAULT_LARGEST_EDGE } = {}) {
  object3D.scale.set(1, 1, 1);
  object3D.position.set(0, 0, 0);
  object3D.updateMatrixWorld(true);

  const rawBox = computeBoundingBox(object3D);
  const rawSize = new THREE.Vector3();
  rawBox.getSize(rawSize);

  // Guards against degenerate geometry (empty mesh, single point, etc.)
  // producing a divide-by-zero or Infinity scale.
  const safeWidth = Math.max(rawSize.x, EPSILON);
  const safeHeight = Math.max(rawSize.y, EPSILON);
  const safeDepth = Math.max(rawSize.z, EPSILON);

  const scale = targetSize
    ? Math.min(targetSize.width / safeWidth, targetSize.height / safeHeight, targetSize.depth / safeDepth)
    : targetLargestEdge / Math.max(safeWidth, safeHeight, safeDepth);

  object3D.scale.setScalar(scale);
  alignToFloorAndCenter(object3D);

  return scale;
}
