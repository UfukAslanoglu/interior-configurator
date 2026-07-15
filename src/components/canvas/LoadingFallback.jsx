import { Html } from '@react-three/drei';

/** Suspense fallback shown inside the 3D canvas while assets stream in. */
export default function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-neutral-600 shadow-lg backdrop-blur">
        <span className="h-2 w-2 animate-ping rounded-full bg-neutral-400" />
        Yükleniyor...
      </div>
    </Html>
  );
}
