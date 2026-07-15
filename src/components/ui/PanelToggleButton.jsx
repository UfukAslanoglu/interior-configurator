import { Menu } from 'lucide-react';

/**
 * The panel's "reopen" trigger. Deliberately only ever rendered while the
 * panel is CLOSED (see App.jsx) — while it's open, the panel has its own
 * close (X) button in Toolbar.jsx. Keeping these as two separate buttons
 * instead of one that moves around avoids ever having to position a
 * floating button on top of the panel's own header.
 *
 * Fixed top-right on both desktop and mobile: FloatingPanel occupies the
 * right edge and BottomSheet occupies the bottom when open, so top-right
 * is free real estate in both layouts while the panel is closed.
 */
export default function PanelToggleButton({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Kataloğu aç"
      className="pointer-events-auto fixed right-5 top-[calc(env(safe-area-inset-top,0px)+1.25rem)] z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-neutral-700 shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 active:scale-95"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <Menu size={20} />
    </button>
  );
}
