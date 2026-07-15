import { useRef, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/** Finger travel (px) past which a touch counts as a swipe instead of a tap. */
const SWIPE_THRESHOLD = 40;

/**
 * Mobile bottom sheet: same frosted-glass material as the desktop
 * FloatingPanel (explicit `backdropFilter: blur(10px)`, rounded-2xl top
 * corners). Two independent states, layered:
 *  - `isOpen` (from App.jsx): whole sheet slides off the bottom of the
 *    screen when closed, same idea as FloatingPanel's slide-out.
 *  - `expanded` (local): while open, a short "peek" height vs a taller
 *    "expanded" height, controlled by the handle bar.
 *
 * Gesture handling is deliberately minimal: only `onPointerDown` +
 * `onPointerUp` on the handle, comparing the Y position at press vs release
 * — no live-follow drag, no `onPointerMove` streaming, no touch/pointer
 * branching. Earlier, fancier versions (tracking movement live, splitting
 * touch vs mouse handling) kept failing on real phones in ways that were
 * impossible to diagnose without a physical device to test on — this
 * simpler up/down comparison has far fewer moving parts and works
 * uniformly for touch AND mouse via the Pointer Events API, so there's much
 * less that can silently go wrong:
 *  - released roughly where pressed (< threshold) → tap → toggle
 *  - released clearly BELOW where pressed → swipe down → collapse (or, if
 *    already collapsed, fully close the panel via `onClose`, same as the
 *    Toolbar's X button)
 *  - released clearly ABOVE → swipe up → expand
 *
 * @param {{ isOpen: boolean, onClose?: () => void, children: React.ReactNode }} props
 */
export default function BottomSheet({ isOpen, onClose, children }) {
  const [expanded, setExpanded] = useState(true);
  const startYRef = useRef(null);

  const handlePointerDown = (event) => {
    startYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event) => {
    if (startYRef.current === null) return;
    const delta = event.clientY - startYRef.current;
    startYRef.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) {
      setExpanded((value) => !value);
    } else if (delta > 0) {
      if (expanded) setExpanded(false);
      else onClose?.();
    } else {
      setExpanded(true);
    }
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={[
        'pointer-events-auto fixed inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t border-white/50 shadow-[0_-8px_40px_rgba(0,0,0,0.14)] transition-all duration-300 ease-out',
        expanded ? 'h-[70vh]' : 'h-[32vh]',
        isOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      ].join(' ')}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        role="button"
        tabIndex={0}
        aria-label={expanded ? 'Paneli küçült' : 'Paneli büyüt/kapat'}
        className="flex touch-none items-center justify-center gap-1.5 py-4 text-neutral-400"
        style={{ minHeight: 44 }}
      >
        <span className="h-1.5 w-12 rounded-full bg-neutral-300" />
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
