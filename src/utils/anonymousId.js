const STORAGE_KEY = 'interior_configurator_anonymous_id';

/**
 * Returns this browser's persistent anonymous identifier, creating one on
 * first use. No account or login is required anywhere in this app —
 * designs saved to the (future) backend are tagged with this ID alone and
 * stored as "Public Design" records, addressable only by whoever holds the
 * ID or a shared link built from it.
 *
 * The ID is created once and cached in `localStorage`, so it survives
 * reloads and future visits from the same browser but is NOT synced across
 * devices (by design — there is no account system to sync through).
 *
 * @returns {string} A stable UUID (or UUID-like fallback) for this browser.
 */
export function getAnonymousId() {
  if (typeof window === 'undefined') return '';

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(STORAGE_KEY, generated);
  return generated;
}
