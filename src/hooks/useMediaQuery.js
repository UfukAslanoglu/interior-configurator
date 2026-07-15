import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * @param {string} query - e.g. '(max-width: 767px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);
    mediaQueryList.addEventListener('change', listener);
    setMatches(mediaQueryList.matches);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/** Convenience hook matching Tailwind's `md` breakpoint (768px). */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}
