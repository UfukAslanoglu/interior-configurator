import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Mobile bottom sheet: same frosted-glass material as the desktop
 * FloatingPanel (explicit `backdropFilter: blur(10px)`, rounded-2xl top
 * corners). Two independent states, layered:
 *  - `isOpen` (from App.jsx): whole sheet slides off the bottom of the
 *    screen when closed, same idea as FloatingPanel's slide-out.
 *  - `expanded` (local): while open, a short "peek" height vs a taller
 *    "expanded" height, toggled via the handle — unrelated to open/close.
 *
 * A real gesture-drag (e.g. with @use-gesture/react) can be layered on
 * later without changing this component's public API.
 *
 * @param {{ isOpen: boolean, children: React.ReactNode }} props
 */
export default function BottomSheet({ isOpen, children }) {
  const [expanded, setExpanded] = useState(true);

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
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex items-center justify-center gap-1 py-2 text-neutral-400"
        aria-label={expanded ? 'Paneli küçült' : 'Paneli büyüt'}
      >
        <span className="h-1 w-10 rounded-full bg-neutral-300" />
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
