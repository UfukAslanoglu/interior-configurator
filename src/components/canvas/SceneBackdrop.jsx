import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Paints a high-end "editorial furniture photography" studio backdrop
 * directly onto `scene.background` using a canvas-generated texture — the
 * kind of moody-top/warm-glow-bottom infinity-cove look real furniture
 * brands shoot product photos against, not a flat two-stop gradient.
 *
 * Built from four layered passes on one canvas (in order):
 *  1. A five-stop vertical gradient — deep warm espresso at the top (like
 *     the shadowed upper corner of a studio cove) easing down through
 *     amber into a soft cream/terracotta glow at the bottom (like warm
 *     light bouncing off an infinity-curve floor).
 *  2. A soft radial "spotlight" glow, offset toward the upper-middle, so
 *     the backdrop reads as actually LIT rather than a flat printed color.
 *  3. A radial vignette that gently darkens the far corners for depth.
 *  4. A light scatter of single-pixel grain at low opacity — the texture
 *     that separates a "photographed backdrop" from a "digital gradient".
 *
 * All four passes run ONCE (memoized, empty deps) and get baked into a
 * single static texture — there's no per-frame cost, this is exactly as
 * cheap as the flat color it replaces.
 *
 * A previous version of this tried to get a similar look by making the
 * Canvas transparent (`gl={{ alpha: true }}`) and painting a CSS gradient
 * on the DOM element behind it. That's fragile in practice — whether it's
 * visible depends on the exact interplay of WebGL alpha compositing,
 * `scene.background`/`Environment` state, and DOM stacking, and it didn't
 * render reliably. Setting `scene.background` to a texture is the
 * standard, guaranteed-to-work three.js technique.
 *
 * The texture is a flat 2D image (not an equirectangular/cube map), so
 * three.js renders it as a fixed, screen-space backdrop behind everything
 * — it doesn't shift as the camera orbits, exactly like a real studio
 * backdrop doesn't move relative to the camera.
 */
export default function SceneBackdrop() {
  const { scene } = useThree();

  const texture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Pass 1 — base vertical gradient: moody espresso top -> warm amber ->
    // soft cream/terracotta glow at the bottom.
    const base = ctx.createLinearGradient(0, 0, 0, size);
    base.addColorStop(0, '#241a16');
    base.addColorStop(0.32, '#5b4034');
    base.addColorStop(0.6, '#c08a5c');
    base.addColorStop(0.82, '#f2ddc2');
    base.addColorStop(1, '#fbf4ea');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    // Pass 2 — soft studio spotlight glow, offset upper-middle so the
    // scene reads as lit rather than a printed flat color.
    const glow = ctx.createRadialGradient(
      size * 0.5, size * 0.34, size * 0.04,
      size * 0.5, size * 0.34, size * 0.72
    );
    glow.addColorStop(0, 'rgba(255, 238, 214, 0.5)');
    glow.addColorStop(0.5, 'rgba(255, 224, 189, 0.18)');
    glow.addColorStop(1, 'rgba(255, 224, 189, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    // Pass 3 — radial vignette: gently darkens the far corners for depth.
    const vignette = ctx.createRadialGradient(
      size * 0.5, size * 0.5, size * 0.32,
      size * 0.5, size * 0.5, size * 0.78
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(18, 12, 9, 0.32)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, size, size);

    // Pass 4 — fine grain: a light scatter of single-pixel specks at low,
    // randomized opacity. This is what keeps the result from reading as a
    // slick digital gradient — real backdrops have texture.
    const grainCount = Math.round(size * size * 0.035);
    for (let i = 0; i < grainCount; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const isLight = Math.random() > 0.5;
      const alpha = Math.random() * 0.05;
      ctx.fillStyle = isLight ? `rgba(255,255,255,${alpha})` : `rgba(20,12,8,${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    return canvasTexture;
  }, []);

  useEffect(() => {
    scene.background = texture;
    return () => {
      scene.background = null;
    };
  }, [scene, texture]);

  useEffect(() => () => texture.dispose(), [texture]);

  return null;
}
