import { useEffect } from 'react';
import { useThumbnailStore } from '../store/thumbnailStore';

/**
 * Reads the auto-rendered thumbnail for a catalog variation's `modelUrl`
 * (see store/thumbnailStore.js + components/canvas/ThumbnailRenderer.jsx),
 * and enqueues it for rendering if it isn't cached yet. Returns `null`
 * while nothing is available — callers should fall back to the
 * variation's color swatch during that window, same as before this
 * feature existed.
 *
 * @param {string | undefined | null} modelUrl
 * @returns {string | null} A data URL, or null while unavailable.
 */
export function useModelThumbnail(modelUrl) {
  const thumbnail = useThumbnailStore((s) => (modelUrl ? s.thumbnails[modelUrl] : undefined));
  const requestThumbnail = useThumbnailStore((s) => s.requestThumbnail);

  useEffect(() => {
    if (modelUrl && !thumbnail) requestThumbnail(modelUrl);
  }, [modelUrl, thumbnail, requestThumbnail]);

  return thumbnail ?? null;
}
