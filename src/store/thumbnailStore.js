import { create } from 'zustand';

const STORAGE_KEY = 'interior_configurator_model_thumbnails_v1';

function loadCache() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function persistCache(thumbnails) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(thumbnails));
  } catch {
    // localStorage full/unavailable (private mode, quota, ...) — thumbnails
    // just won't survive a reload, not fatal, they'll regenerate next visit.
  }
}

/**
 * Caches auto-rendered 3D model thumbnails, keyed by `modelUrl`
 * (public/models/*.glb). There is no server-side render step anywhere in
 * this app — see components/canvas/ThumbnailRenderer.jsx, which renders
 * each model once in an invisible offscreen <Canvas> the first time a card
 * needs it, then reports the resulting image back here. Cached in
 * localStorage so that "once" really means once per browser, not once per
 * page load.
 *
 * `queue` is a simple FIFO of modelUrls waiting to be rendered.
 * ThumbnailRenderer always works on `queue[0]` and calls `completeCurrent`/
 * `failCurrent` when done, which is what actually drains the queue.
 */
export const useThumbnailStore = create((set, get) => ({
  /** @type {Record<string, string>} modelUrl -> data URL */
  thumbnails: loadCache(),
  /** @type {string[]} */
  queue: [],
  /** @type {Set<string>} modelUrls that failed this session — not retried until the next full page load. */
  failed: new Set(),

  /**
   * Enqueues a model for rendering if it isn't already cached, pending, or
   * known to be broken this session. Safe to call from every card that
   * shows this model — duplicates are ignored.
   * @param {string | undefined | null} modelUrl
   */
  requestThumbnail: (modelUrl) => {
    if (!modelUrl) return;
    const { thumbnails, queue, failed } = get();
    if (thumbnails[modelUrl] || queue.includes(modelUrl) || failed.has(modelUrl)) return;
    set({ queue: [...queue, modelUrl] });
  },

  /** @param {string} modelUrl @param {string} dataUrl */
  completeCurrent: (modelUrl, dataUrl) => {
    set((state) => {
      const thumbnails = { ...state.thumbnails, [modelUrl]: dataUrl };
      persistCache(thumbnails);
      return { thumbnails, queue: state.queue.filter((u) => u !== modelUrl) };
    });
  },

  /** @param {string} modelUrl */
  failCurrent: (modelUrl) => {
    set((state) => {
      const failed = new Set(state.failed);
      failed.add(modelUrl);
      return { failed, queue: state.queue.filter((u) => u !== modelUrl) };
    });
  },
}));
