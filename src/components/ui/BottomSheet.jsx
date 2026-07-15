import { useCallback, useRef, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/** Minimum finger travel (px) before a touch counts as a drag instead of a tap. */
const DRAG_THRESHOLD = 40;

/**
 * Mobile bottom sheet: same frosted-glass material as the desktop
 * FloatingPanel (explicit `backdropFilter: blur(10px)`, rounded-2xl top
 * corners). Two independent states, layered:
 *  - `isOpen` (from App.jsx): whole sheet slides off the bottom of the
 *    screen when closed, same idea as FloatingPanel's slide-out.
 *  - `expanded` (local): while open, a short "peek" height vs a taller
 *    "expanded" height, toggled by the handle bar — unrelated to open/close.
 *
 * The handle supports a real finger-drag (not just a tap): dragging it up
 * or down past `DRAG_THRESHOLD` expands/collapses the sheet, and it follows
 * the finger live via an inline `transform` while dragging (CSS transition
 * disabled during the drag so it doesn't fight the live movement, then
 * re-enabled on release so it snaps smoothly to the final height). A short
 * tap (no real movement) still just toggles, same as before.
 *
 * @param {{ isOpen: boolean, children: React.ReactNode }} props
 */
export default function BottomSheet({ isOpen, children }) {
  const [expanded, setExpanded] = useState(true);
  const [dragY, setDragY] = useState(0);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const handlePointerDown = useCallback((event) => {
    isDraggingRef.current = true;
    movedRef.current = false;
    startYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (!isDraggingRef.current) return;
    const delta = event.clientY - startYRef.current;
    if (Math.abs(delta) > 4) movedRef.current = true;
    setDragY(delta);
  }, []);

  const endDrag = useCallback(
    (event) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (event?.currentTarget?.releasePointerCapture && event.pointerId != null) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (!movedRef.current) {
        // No real drag happened — treat it as a tap, same as the old button.
        setExpanded((value) => !value);
      } else if (dragY > DRAG_THRESHOLD) {
        setExpanded(false);
      } else if (dragY < -DRAG_THRESHOLD) {
        setExpanded(true);
      }
      setDragY(0);
    },
    [dragY]
  );

  const isDragging = dragY !== 0;

  return (
    <div
      aria-hidden={!isOpen}
      className={[
        'pointer-events-auto fixed inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border-t border-white/50 shadow-[0_-8px_40px_rgba(0,0,0,0.14)]',
        isDragging ? '' : 'transition-all duration-300 ease-out',
        expanded ? 'h-[70vh]' : 'h-[32vh]',
        isOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      ].join(' ')}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        ...(isDragging ? { transform: `translateY(${Math.max(0, dragY)}px)` } : null),
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="button"
        tabIndex={0}
        aria-label={expanded ? 'Paneli küçült' : 'Paneli büyüt'}
        className="flex touch-none items-center justify-center gap-1 py-2.5 text-neutral-400 active:cursor-grabbing"
      >
        <span className="h-1 w-10 rounded-full bg-neutral-300" />
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
