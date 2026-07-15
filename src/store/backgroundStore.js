import { create } from 'zustand';

const STORAGE_KEY = 'interior_configurator_background_preset_v1';
const PREVIEW_STORAGE_KEY = 'interior_configurator_background_previews_v1';
const DEFAULT_PRESET = 'sunset';

/**
 * Curated set of 3D scene "vibes" — each maps directly to a real drei
 * `<Environment preset>` (a photographed HDRI), so picking one changes
 * both the visible backdrop AND the lighting/reflections on the furniture,
 * not just a flat color. Deliberately a short, hand-picked list rather
 * than free-form choice: every option here is guaranteed to look good and
 * load fast, which an open-ended picker couldn't promise.
 *
 * `swatch` is a small hand-authored CSS gradient shown ONLY as an instant
 * placeholder before the real thing is ready — see EnvironmentPreviewRenderer.jsx,
 * which renders each preset's actual HDRI in an invisible offscreen canvas
 * and reports back a real photographic preview (cached below in `previews`),
 * which BackgroundPicker.jsx then shows instead.
 */
export const BACKGROUND_OPTIONS = [
  {
    id: 'sunset',
    label: 'Gün Batımı',
    description: 'Sıcak, altın ışıklı bir gökyüzü.',
    swatch: 'linear-gradient(180deg, #f6c68a 0%, #e8875a 45%, #7a4a3a 100%)',
  },
  {
    id: 'skyscraper',
    label: 'Gökdelen',
    description: 'Gece ışıklarıyla parıldayan gerçek bir gökdelen manzarası.',
    swatch: 'linear-gradient(180deg, #1b2a4a 0%, #2c3f66 40%, #d98a3d 78%, #3a2418 100%)',
    // drei'nin hazır preset'leri yerine gerçek bir fotoğraf (Poly Haven, CC0
    // lisanslı "Shanghai Bund" HDRI'si) kullanılıyor — çünkü drei'nin kendi
    // 'city' preset'i (Potsdamer Platz) bu tarayıcıda bozuk yükleniyordu.
    // RGBELoader bunu fetch() ile indirir; Poly Haven CDN'i CORS'a açık
    // olduğundan mevcut canvas.toDataURL() galeri-önizleme özelliği
    // etkilenmiyor (img/video tag'i değil, ham byte indirme).
    files: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/shanghai_bund_1k.hdr',
  },
  {
    id: 'night',
    label: 'Gece Şehri',
    description: 'Işıkları yanan bir gece manzarası.',
    swatch: 'linear-gradient(180deg, #2a2f4a 0%, #1a1c30 55%, #0c0d18 100%)',
  },
  {
    id: 'apartment',
    label: 'Sıcak Salon',
    description: 'Yumuşak, ev içi bir aydınlatma.',
    swatch: 'linear-gradient(180deg, #f3e4cf 0%, #d9b98d 55%, #a9835c 100%)',
  },
  {
    id: 'studio',
    label: 'Stüdyo',
    description: 'Nötr, temiz bir fotoğraf stüdyosu.',
    swatch: 'linear-gradient(180deg, #f2f2f0 0%, #d4d4d0 55%, #a8a8a3 100%)',
  },
  {
    id: 'dawn',
    label: 'Şafak',
    description: 'Yumuşak pembe-lavanta bir sabah ışığı.',
    swatch: 'linear-gradient(180deg, #f0d9e6 0%, #cbb8dd 50%, #8f7fae 100%)',
  },
];

function loadPreset() {
  if (typeof window === 'undefined') return DEFAULT_PRESET;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return BACKGROUND_OPTIONS.some((option) => option.id === stored) ? stored : DEFAULT_PRESET;
  } catch {
    return DEFAULT_PRESET;
  }
}

function loadPreviewCache() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(PREVIEW_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function persistPreviewCache(previews) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(previews));
  } catch {
    // localStorage full/unavailable — previews just regenerate next visit, not fatal.
  }
}

/**
 * The visitor's chosen 3D scene backdrop. This is a per-browser VIEWING
 * preference, not part of a saved room design — it's not sent to Supabase
 * and doesn't travel with `designs.design_data`, so it can't affect (or be
 * affected by) anything in services/designService.js or designStore.js.
 * Persisted to localStorage only, so it's remembered on this device across
 * reloads.
 */
export const useBackgroundStore = create((set, get) => ({
  preset: loadPreset(),
  /** @param {string} preset - one of BACKGROUND_OPTIONS' ids */
  setPreset: (preset) => {
    set({ preset });
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, preset);
    } catch {
      // localStorage full/unavailable — the choice just won't persist across reloads, not fatal.
    }
  },

  /** @type {Record<string, string>} preset id -> data URL, real HDRI snapshot */
  previews: loadPreviewCache(),
  /** @type {string[]} FIFO of preset ids waiting for EnvironmentPreviewRenderer to capture. */
  previewQueue: [],

  /** Enqueues a preset's real preview render if it isn't cached/queued yet. @param {string} presetId */
  requestPreview: (presetId) => {
    const { previews, previewQueue } = get();
    if (previews[presetId] || previewQueue.includes(presetId)) return;
    set({ previewQueue: [...previewQueue, presetId] });
  },

  /** @param {string} presetId @param {string} dataUrl */
  completePreview: (presetId, dataUrl) => {
    set((state) => {
      const previews = { ...state.previews, [presetId]: dataUrl };
      persistPreviewCache(previews);
      return { previews, previewQueue: state.previewQueue.filter((id) => id !== presetId) };
    });
  },

  /** @param {string} presetId */
  failPreview: (presetId) => {
    set((state) => ({ previewQueue: state.previewQueue.filter((id) => id !== presetId) }));
  },
}));
