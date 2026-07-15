/**
 * Desktop "side-sheet": a minimal, translucent panel anchored to the right
 * edge of the viewport. Uses an explicit `backdropFilter: blur(10px)`
 * (rather than a Tailwind blur utility, which only ships a few fixed
 * steps) to hit an exact frosted-glass spec, layered over a low-opacity
 * white fill so the 3D scene reads through faintly — the core of the
 * Apple-esque "glass" material.
 *
 * Open/close: slides fully off-screen (further than 100%, so its shadow
 * clears the viewport too) rather than unmounting, so the slide
 * transition is visible in both directions. The 3D scene underneath is
 * already an absolutely-positioned full-viewport canvas (see
 * RoomScene.jsx), so closing this panel automatically gives it the whole
 * screen — nothing else has to change for the "fullscreen when closed"
 * requirement.
 *
 * @param {{ isOpen: boolean, children: React.ReactNode }} props
 */
export default function FloatingPanel({ isOpen, children }) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={[
        'pointer-events-auto fixed right-5 top-5 z-20 flex h-[calc(100vh-2.5rem)] w-[22rem] flex-col overflow-hidden rounded-2xl border border-white/50 shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out',
        isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-[120%]',
      ].join(' ')}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </aside>
  );
}
