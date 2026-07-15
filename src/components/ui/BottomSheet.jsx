import { useCallback, useRef, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/** Minimum finger travel (px) before a drag counts instead of a tap. */
const DRAG_THRESHOLD = 30;

/**
 * Mobile bottom sheet: same frosted-glass material as the desktop
 * FloatingPanel (explicit `backdropFilter: blur(10px)`, rounded-2xl top
 * corners). Two independent states, layered:
 *  - `isOpen` (from App.jsx): whole sheet slides off the bottom of the
 *    screen when closed, same idea as FloatingPanel's slide-out.
 *  - `expanded` (local): while open, a short "peek" height vs a taller
 *    "expanded" height, toggled by the handle bar — unrelated to open/close.
 *
 * Drag handling uses native `onTouchStart/Move/End` for touch (the most
 * consistently supported path across mobile Safari/Chrome for this kind of
 * gesture) and separately `onPointer*` guarded to skip `pointerType ===
 * 'touch'` for desktop mouse-drag — the two never double-handle the same
 * interaction. The handle also got a much bigger hit area (44px+ tall,
 * matching Apple's minimum touch target) since the earlier, thinner strip
 * was easy to miss with a finger. A tap with no real movement still just
 * toggles, same as before.
 *
 * @param {{ isOpen: boolean, children: React.ReactNode }} props
 */
export default function BottomSheet({ isOpen, children }) {
  const [expanded, setExpanded] = useState(true);
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);

  const startDrag = useCallback((clientY) => {
    draggingRef.current = true;
    movedRef.current = false;
    startYRef.current = clientY;
  }, []);

  const moveDrag = useCallback((clientY) => {
    if (!draggingRef.current) return;
    const delta = clientY - startYRef.current;
    if (Math.abs(delta) > 4) movedRef.current = true;
    dragYRef.current = delta;
    setDragY(delta);
  }, []);

  const endDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (movedRef.current) {
      if (dragYRef.current > DRAG_THRESHOLD) setExpanded(false);
      else if (dragYRef.current < -DRAG_THRESHOLD) setExpanded(true);
    } else {
      setExpanded((value) => !value);
    }
    dragYRef.current = 0;
    setDragY(0);
  }, []);

  const handleTouchStart = useCallback((event) => startDrag(event.touches[0].clientY), [startDrag]);
  const handleTouchMove = useCallback((event) => moveDrag(event.touches[0].clientY), [moveDrag]);

  const handlePointerDown = useCallback(
    (event) => {
      if (event.pointerType === 'touch') return; // touch is handled above
      startDrag(event.clientY);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [startDrag]
  );
  const handlePointerMove = useCallback(
    (event) => {
      if (event.pointerType === 'touch') return;
      moveDrag(event.clientY);
    },
    [moveDrag]
  );
  const handlePointerUp = useCallback(
    (event) => {
      if (event.pointerType === 'touch') return;
      endDrag();
    },
    [endDrag]
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={endDrag}
        onTouchCancel={endDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="button"
        tabIndex={0}
        aria-label={expanded ? 'Paneli küçült' : 'Paneli büyüt'}
        className="flex touch-none items-center justify-center gap-1.5 py-4 text-neutral-400 active:cursor-grabbing"
        style={{ minHeight: 44 }}
      >
        <span className="h-1.5 w-12 rounded-full bg-neutral-300" />
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
