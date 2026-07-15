import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useDesignStore } from '../../store/designStore';

/**
 * Renders nothing — just registers the R3F canvas' DOM element into the
 * design store on mount so UI outside the <Canvas> tree (SaveButton) can
 * call `canvasElement.toDataURL()` to snapshot a gallery thumbnail without
 * needing its own render loop or a second offscreen renderer.
 */
export default function CanvasCapture() {
  const { gl } = useThree();
  const setCanvasElement = useDesignStore((s) => s.setCanvasElement);

  useEffect(() => {
    setCanvasElement(gl.domElement);
    return () => setCanvasElement(null);
  }, [gl, setCanvasElement]);

  return null;
}
