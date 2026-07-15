import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { TransformControls, Outlines } from '@react-three/drei';
import FurnitureLoader from './FurnitureLoader';
import { useDesignStore } from '../../store/designStore';
import { getVariationById } from '../../data/catalogData';
import { TRANSFORM_MODES, WALL_ART_PRIMITIVE_TYPE } from '../../utils/constants';
import { degToRad } from '../../utils/math3d';

const ROTATION_SNAP_RADIANS = degToRad(15);

// Reused across every drag gesture (any object) — avoids allocating a new
// THREE.Plane/Vector3 on every pointer-move frame.
const dragPlane = new THREE.Plane();
const dragPoint = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
// Back-wall normal — v1 wall-mount support is back-wall-only, see
// WALL_MOUNT's doc comment in utils/constants.js.
const WALL_NORMAL = new THREE.Vector3(0, 0, 1);

/**
 * A single furnished item in the scene. Resolves its own catalog data —
 * `{ item, variation }` — from `placedItem.itemId` / `activeVariationId`
 * via data/catalogData.js, so RoomScene doesn't need to build or pass down
 * a lookup map, and swapping `activeVariationId` (see PropertiesPanel) is
 * all it takes to change what's rendered here.
 *
 * Movement: click-and-hold ANYWHERE on the object and drag — no axis
 * arrows. Two drag-plane orientations, chosen by the active variation's
 * `primitiveType`:
 *  - Floor items (the default): drags across a HORIZONTAL plane at the
 *    item's current height, so it never lifts off the floor.
 *  - Wall art (`primitiveType: 'tablo'`): drags across a VERTICAL plane
 *    coplanar with the back wall, so it slides sideways/up/down but never
 *    off the wall surface. `updateItemTransform` in designStore.js pins
 *    the Z coordinate to the wall via `clampWallPosition` regardless of
 *    what this component computes, so this is belt-and-suspenders safe.
 * Either way, a fixed offset (captured at drag-start) keeps the object
 * jumping to re-center under the cursor.
 *
 * Rotation: switching to "Döndür" mode (see PropertiesPanel) swaps in a
 * `TransformControls` rotate ring restricted to the vertical axis — but
 * ONLY for floor items. Rotating a flat wall-mounted piece around the
 * vertical axis would turn it edge-on into the wall, so wall art skips
 * this entirely (see PropertiesPanel.jsx, which also hides the rotate
 * buttons for a selected wall-art item).
 *
 * @param {{
 *   placedItem: import('../../store/designStore').PlacedItem,
 *   isSelected: boolean
 * }} props
 */
export default function FurnitureItem({ placedItem, isSelected }) {
  const groupRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef(new THREE.Vector3());

  const selectItem = useDesignStore((s) => s.selectItem);
  const updateItemTransform = useDesignStore((s) => s.updateItemTransform);
  const transformMode = useDesignStore((s) => s.transformMode);
  const setIsDraggingFurniture = useDesignStore((s) => s.setIsDraggingFurniture);

  const resolved = getVariationById(placedItem.activeVariationId);
  const isWallMounted = resolved?.variation.primitiveType === WALL_ART_PRIMITIVE_TYPE;

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation();
      selectItem(placedItem.id);
    },
    [placedItem.id, selectItem]
  );

  /** Starts a free drag: lay a plane (horizontal for floor items, vertical-on-the-wall for wall art) and remember the cursor's offset from the object's center. */
  const handlePointerDown = useCallback(
    (event) => {
      event.stopPropagation();
      selectItem(placedItem.id);
      if (transformMode !== TRANSFORM_MODES.TRANSLATE) return;

      const object = groupRef.current;
      if (!object) return;

      const planeNormal = isWallMounted ? WALL_NORMAL : UP;
      dragPlane.setFromNormalAndCoplanarPoint(planeNormal, object.position);
      if (event.ray.intersectPlane(dragPlane, dragPoint)) {
        dragOffsetRef.current.copy(object.position).sub(dragPoint);
      } else {
        dragOffsetRef.current.set(0, 0, 0);
      }

      isDraggingRef.current = true;
      setIsDraggingFurniture(true);
      event.target.setPointerCapture(event.pointerId);
    },
    [placedItem.id, selectItem, transformMode, setIsDraggingFurniture, isWallMounted]
  );

  /** Follows the cursor along the drag plane every frame; commit:false keeps this out of the undo stack until release. */
  const handlePointerMove = useCallback(
    (event) => {
      if (!isDraggingRef.current) return;
      const object = groupRef.current;
      if (!object) return;

      if (!event.ray.intersectPlane(dragPlane, dragPoint)) return;

      if (isWallMounted) {
        const nextX = dragPoint.x + dragOffsetRef.current.x;
        const nextY = dragPoint.y + dragOffsetRef.current.y;
        updateItemTransform(placedItem.id, { position: [nextX, nextY, object.position.z] }, { commit: false });
      } else {
        const nextX = dragPoint.x + dragOffsetRef.current.x;
        const nextZ = dragPoint.z + dragOffsetRef.current.z;
        updateItemTransform(placedItem.id, { position: [nextX, object.position.y, nextZ] }, { commit: false });
      }
    },
    [placedItem.id, updateItemTransform, isWallMounted]
  );

  /** Ends the drag and persists exactly one undo-able history entry. */
  const endDrag = useCallback(
    (event) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDraggingFurniture(false);
      if (event?.target?.releasePointerCapture && event.pointerId != null) {
        event.target.releasePointerCapture(event.pointerId);
      }
      const object = groupRef.current;
      if (!object) return;
      updateItemTransform(
        placedItem.id,
        { position: [object.position.x, object.position.y, object.position.z] },
        { commit: true }
      );
    },
    [placedItem.id, updateItemTransform, setIsDraggingFurniture]
  );

  /** Live rotation update while the rotate-ring gizmo is being dragged. */
  const handleRotateChange = useCallback(() => {
    const object = groupRef.current;
    if (!object) return;
    updateItemTransform(placedItem.id, { rotationY: object.rotation.y }, { commit: false });
  }, [placedItem.id, updateItemTransform]);

  /** Persists exactly one undo-able entry once the rotate gesture ends. */
  const handleRotateChangeEnd = useCallback(() => {
    const object = groupRef.current;
    if (!object) return;
    updateItemTransform(placedItem.id, { rotationY: object.rotation.y }, { commit: true });
  }, [placedItem.id, updateItemTransform]);

  if (!resolved) return null;
  const { variation } = resolved;

  const content = (
    <group
      ref={groupRef}
      position={placedItem.position}
      rotation={[0, placedItem.rotationY, 0]}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {isSelected && <Outlines thickness={2} color="#0a84ff" screenspace transparent opacity={0.9} />}
      <FurnitureLoader
        primitiveType={variation.primitiveType}
        color={variation.color}
        size={placedItem.size}
        modelUrl={variation.modelUrl}
      />
    </group>
  );

  const isRotateMode = isSelected && !isWallMounted && transformMode === TRANSFORM_MODES.ROTATE;

  if (!isRotateMode) return content;

  return (
    <TransformControls
      mode="rotate"
      showX={false}
      showZ={false}
      showY
      rotationSnap={ROTATION_SNAP_RADIANS}
      onObjectChange={handleRotateChange}
      onMouseUp={handleRotateChangeEnd}
    >
      {content}
    </TransformControls>
  );
}
