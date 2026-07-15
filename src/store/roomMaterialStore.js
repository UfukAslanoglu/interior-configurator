import { create } from 'zustand';

const WALL_STORAGE_KEY = 'interior_configurator_wall_color_v1';
const FLOOR_STORAGE_KEY = 'interior_configurator_floor_color_v1';
const DEFAULT_WALL = 'warmWhite';
const DEFAULT_FLOOR = 'lightOak';

/**
 * Curated wall paint palette. Deliberately just a flat `color` (no texture
 * maps) — every wall is a plain `meshStandardMaterial`, so this is a zero-risk
 * change: no new network requests, no images, nothing that could taint the
 * canvas the way an external HDRI could (see backgroundStore.js's comment on
 * the "Gökdelen" option). `roughness` stays close to the original 0.9 for all
 * options so lighting behavior doesn't shift underneath the furniture.
 */
export const WALL_OPTIONS = [
  { id: 'warmWhite', label: 'Sıcak Beyaz', color: '#f2f0ec', roughness: 0.9 },
  { id: 'cloudGrey', label: 'Bulut Grisi', color: '#dcdcda', roughness: 0.9 },
  { id: 'sage', label: 'Adaçayı Yeşili', color: '#a8b79b', roughness: 0.85 },
  { id: 'dustyBlue', label: 'Toz Mavisi', color: '#8fa4b8', roughness: 0.85 },
  { id: 'terracotta', label: 'Terracotta', color: '#c07a52', roughness: 0.85 },
  { id: 'blush', label: 'Pudra Pembe', color: '#e3c3bd', roughness: 0.85 },
  { id: 'greige', label: 'Greige', color: '#c9bfae', roughness: 0.9 },
  { id: 'charcoal', label: 'Antrasit', color: '#4a4a48', roughness: 0.8 },
];

/**
 * Curated floor palette. Same zero-risk approach as walls: solid colors
 * only, `roughness` tuned per option so wood-like tones read matte/warm and
 * stone-like tones read a bit more reflective, without adding any texture
 * images.
 */
export const FLOOR_OPTIONS = [
  { id: 'lightOak', label: 'Açık Meşe', color: '#d8cdbf', roughness: 0.95 },
  { id: 'walnut', label: 'Ceviz', color: '#6b4a37', roughness: 0.7 },
  { id: 'whiteOak', label: 'Beyaz Meşe', color: '#e8ddd0', roughness: 0.9 },
  { id: 'concrete', label: 'Beton Gri', color: '#a8a8a3', roughness: 0.6 },
  { id: 'marble', label: 'Mermer', color: '#e4e0d8', roughness: 0.25 },
  { id: 'darkWalnut', label: 'Koyu Ceviz', color: '#3d2b22', roughness: 0.65 },
];

function loadColorId(key, options, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return options.some((option) => option.id === stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function persist(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage full/unavailable — the choice just won't persist across reloads, not fatal.
  }
}

/**
 * Wall + floor color preferences. Same reasoning as backgroundStore.js: a
 * per-browser VIEWING preference, not part of a saved room design — not sent
 * to Supabase, doesn't travel with `designs.design_data`, and can't affect
 * (or be affected by) designService.js / designStore.js. Persisted to
 * localStorage only.
 */
export const useRoomMaterialStore = create((set) => ({
  wallColorId: loadColorId(WALL_STORAGE_KEY, WALL_OPTIONS, DEFAULT_WALL),
  floorColorId: loadColorId(FLOOR_STORAGE_KEY, FLOOR_OPTIONS, DEFAULT_FLOOR),

  /** @param {string} wallColorId - one of WALL_OPTIONS' ids */
  setWallColorId: (wallColorId) => {
    set({ wallColorId });
    persist(WALL_STORAGE_KEY, wallColorId);
  },

  /** @param {string} floorColorId - one of FLOOR_OPTIONS' ids */
  setFloorColorId: (floorColorId) => {
    set({ floorColorId });
    persist(FLOOR_STORAGE_KEY, floorColorId);
  },
}));
