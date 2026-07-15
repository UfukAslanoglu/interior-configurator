import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ROOM, HISTORY_LIMIT, TRANSFORM_MODES, WALL_MOUNT, WALL_ART_PRIMITIVE_TYPE } from '../utils/constants';
import { clampPositionToRoom, clampWallPosition, rotateStep } from '../utils/math3d';
import { getItemById, getVariationById } from '../data/catalogData';

/**
 * @typedef {Object} PlacedItem
 * @property {string} id - Unique instance id (distinct from the catalog item/variation ids).
 * @property {string} itemId - References data/catalogData.js `CatalogItem.id` — defines displayName + the shared footprint used for room clamping.
 * @property {string} activeVariationId - References the currently active `CatalogVariation.id` within that item — this is the "activeModel" pointer: it determines which modelUrl/color/price is rendered for this instance. Swapped via `setActiveModel` without touching position/rotation.
 * @property {[number, number, number]} position - [x, y, z] in meters.
 * @property {number} rotationY - Rotation around the Y axis, in radians.
 * @property {{width:number,height:number,depth:number}} size - Bounding box, copied from the catalog item's `dimensions` at add-time.
 */

/**
 * Deep-clones a serializable value. Used for undo/redo history snapshots so
 * a past state can never be mutated in place by a later action.
 * @template T
 * @param {T} value
 * @returns {T}
 */
function deepClone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

let instanceCounter = 0;
/** @param {string} variationId */
function createInstanceId(variationId) {
  instanceCounter += 1;
  return `${variationId}__${Date.now()}__${instanceCounter}`;
}

const initialState = {
  /** @type {PlacedItem[]} */
  placedItems: [],
  /** @type {string | null} */
  selectedItemId: null,
  /** @type {PlacedItem[][]} */
  past: [],
  /** @type {PlacedItem[][]} */
  future: [],
  /** @type {'translate' | 'rotate'} Which interaction the selected item uses: free mouse-drag on the floor, or the TransformControls rotate ring. */
  transformMode: TRANSFORM_MODES.TRANSLATE,
  /** @type {boolean} True while a furniture item is being dragged by the mouse. CameraRig watches this to disable OrbitControls so the camera doesn't fight the drag. Deliberately NOT part of undo history — it's transient UI state, not room data. */
  isDraggingFurniture: false,
  /** @type {HTMLCanvasElement | null} The R3F canvas DOM node, registered by CanvasCapture on mount. SaveButton reads this to snapshot a thumbnail via toDataURL(). Not part of undo history — it's a DOM ref, not room data. */
  canvasElement: null,
  /** @type {string | null} The Supabase `designs.id` this room is currently editing, or null for "not tied to a saved design yet". Set by Gallery.loadDesign ONLY when the loader is allowed to edit that design (its own, or admin); SaveButton uses this to decide UPDATE (overwrite that row) vs INSERT (create a new one, subject to the 5-design cap). Cleared by `reset()` so clearing the room always starts a fresh design. */
  currentDesignId: null,
};

/**
 * Central design state: everything about the current room layout, plus a
 * bounded undo/redo history built from deep-cloned snapshots.
 *
 * Catalog resolution lives HERE, not in the UI or in FurnitureLoader: every
 * action below takes plain catalog/variation IDs and resolves them via
 * data/catalogData.js internally. That keeps the rendering components
 * (FurnitureItem, FurnitureLoader, VariationOption, ...) pure — they just
 * render whatever the store gives them — and means there is exactly one
 * place that decides what a given itemId/variationId pair actually is.
 *
 * History strategy: every *committed* mutation pushes a deep clone of the
 * pre-mutation `placedItems` onto `past` and clears `future` (standard
 * linear undo/redo branching). High-frequency updates (dragging a piece of
 * furniture every frame) should call `updateItemTransform` with
 * `{ commit: false }` and only commit once, when the gesture ends.
 */
export const useDesignStore = create(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    /**
     * Internal: snapshots the CURRENT placedItems onto the undo stack.
     * Call immediately before applying a mutation you want to be undoable.
     */
    _commitHistory: () => {
      set((state) => {
        const past = [...state.past, deepClone(state.placedItems)];
        if (past.length > HISTORY_LIMIT) past.shift();
        return { past, future: [] };
      });
    },

    /**
     * Adds a furniture instance to the scene: a catalog item (e.g.
     * "3'lü Kanepe") at a specific variation (e.g. "Modern Kanepe"). Falls
     * back to the item's first variation if `variationId` is omitted, so a
     * catalog card can call this immediately without forcing the user
     * through the variation picker first if that's ever desired.
     *
     * Default position is the room center, clamped to bounds. The new item
     * is auto-selected so its interaction affordances (drag / rotate ring)
     * are immediately available.
     *
     * @param {string} itemId
     * @param {string} [variationId]
     */
    addFurnitureToScene: (itemId, variationId) => {
      const item = getItemById(itemId);
      if (!item) return;
      const variation = variationId ? getVariationById(variationId)?.variation : item.variations[0];
      if (!variation) return;

      get()._commitHistory();
      const size = item.dimensions;
      const isWallMounted = variation.primitiveType === WALL_ART_PRIMITIVE_TYPE;
      // Wall art spawns centered on the back wall at eye level; everything
      // else spawns at the room's floor center, same as before.
      const defaultPosition = isWallMounted
        ? clampWallPosition([0, WALL_MOUNT.defaultHeight, 0], size)
        : clampPositionToRoom([0, 0, 0], size);
      /** @type {PlacedItem} */
      const newItem = {
        id: createInstanceId(variation.id),
        itemId: item.id,
        activeVariationId: variation.id,
        position: defaultPosition,
        // Çoğu model rotationY:0'da zaten kameraya bakıyor; birkaç dosya
        // farklı yönde modellenmiş olduğundan catalogData.js'teki
        // `defaultRotationY` ile bu düzeltiliyor (bkz. berjer-1, kitaplik-1).
        rotationY: item.defaultRotationY ?? 0,
        size,
      };
      set((state) => ({
        placedItems: [...state.placedItems, newItem],
        selectedItemId: newItem.id,
        transformMode: TRANSFORM_MODES.TRANSLATE,
      }));
    },

    /**
     * Swaps the active model of an ALREADY-PLACED instance — position,
     * rotation and instance id are untouched, only `activeVariationId`
     * changes. This is what the variation picker calls when the user picks
     * a different style/finish for something already in the room.
     * @param {string} placedItemId
     * @param {string} variationId
     */
    setActiveModel: (placedItemId, variationId) => {
      const resolved = getVariationById(variationId);
      if (!resolved) return;

      get()._commitHistory();
      set((state) => ({
        placedItems: state.placedItems.map((placed) =>
          placed.id === placedItemId ? { ...placed, activeVariationId: variationId } : placed
        ),
      }));
    },

    /** @param {string} id */
    removeItem: (id) => {
      get()._commitHistory();
      set((state) => ({
        placedItems: state.placedItems.filter((item) => item.id !== id),
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
      }));
    },

    /** @param {string | null} id */
    selectItem: (id) => set({ selectedItemId: id }),
    clearSelection: () => set({ selectedItemId: null }),

    /** @param {'translate' | 'rotate'} mode */
    setTransformMode: (mode) => set({ transformMode: mode }),

    /** @param {boolean} value */
    setIsDraggingFurniture: (value) => set({ isDraggingFurniture: value }),

    /** @param {HTMLCanvasElement | null} el */
    setCanvasElement: (el) => set({ canvasElement: el }),

    /** @param {string | null} id */
    setCurrentDesignId: (id) => set({ currentDesignId: id }),

    /**
     * Updates an item's transform (position and/or rotation), driven by
     * the free-drag / rotate-ring interactions in FurnitureItem.jsx.
     *
     * Pass `commit: false` for high-frequency live updates (every frame of
     * a drag/rotate gesture) to avoid flooding the undo stack, then call
     * once more with `commit: true` (the default) when the gesture ends.
     *
     * @param {string} id
     * @param {Partial<Pick<PlacedItem, 'position' | 'rotationY'>>} transform
     * @param {{commit?: boolean}} [options]
     */
    updateItemTransform: (id, transform, options = {}) => {
      const { commit = true } = options;
      if (commit) get()._commitHistory();
      set((state) => ({
        placedItems: state.placedItems.map((item) => {
          if (item.id !== id) return item;
          if (!transform.position) return { ...item, ...transform };

          // Which clamp applies depends on the item's CURRENT variation —
          // resolved fresh here (not stored on the item) so a model swap
          // via setActiveModel always takes effect immediately, with no
          // separate field to keep in sync.
          const resolved = getVariationById(item.activeVariationId);
          const isWallMounted = resolved?.variation.primitiveType === WALL_ART_PRIMITIVE_TYPE;
          const clampedPosition = isWallMounted
            ? clampWallPosition(transform.position, item.size)
            : clampPositionToRoom(transform.position, item.size);

          return { ...item, ...transform, position: clampedPosition };
        }),
      }));
    },

    /** Quick 90° nudge, independent of the current interaction mode. @param {string} id */
    rotateItem: (id) => {
      get()._commitHistory();
      set((state) => ({
        placedItems: state.placedItems.map((item) =>
          item.id === id ? { ...item, rotationY: rotateStep(item.rotationY, 90) } : item
        ),
      }));
    },

    undo: () => {
      const { past, placedItems, future } = get();
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      set({
        placedItems: previous,
        past: past.slice(0, -1),
        future: [deepClone(placedItems), ...future],
        selectedItemId: null,
      });
    },

    redo: () => {
      const { future, placedItems, past } = get();
      if (future.length === 0) return;
      const next = future[0];
      set({
        placedItems: next,
        future: future.slice(1),
        past: [...past, deepClone(placedItems)],
        selectedItemId: null,
      });
    },
    /**
     * Galeriden seçilen bir tasarımı odaya yükler (mevcut düzenin üzerine yazar).
     * @param {PlacedItem[]} items
     * @param {string | null} [designId] - Pass the design's id ONLY if the
     *   current user is allowed to overwrite it (their own design, or
     *   admin) — Gallery.jsx decides this. Omit/null it when loading
     *   someone else's design just to browse/remix: the next Kaydet will
     *   then create a brand new design instead of overwriting theirs.
     */
    loadDesign: (items, designId = null) => {
      get()._commitHistory();
      set({ placedItems: items, selectedItemId: null, currentDesignId: designId });
    },
    /** Clears the whole room and detaches from whatever design was being edited, so the next save starts a fresh one. This action is itself undoable. */
    reset: () => {
      get()._commitHistory();
      set({ placedItems: [], selectedItemId: null, currentDesignId: null });
    },
  }))
);

export const ROOM_DIMENSIONS = ROOM;
