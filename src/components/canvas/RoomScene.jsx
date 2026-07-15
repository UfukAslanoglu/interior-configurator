import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, AdaptiveDpr, BakeShadows, SoftShadows } from '@react-three/drei';
import RoomWalls from './RoomWalls';
import RoomFloor from './RoomFloor';
import SceneLighting from './SceneLighting';
import CameraRig from './CameraRig';
import FurnitureItem from './FurnitureItem';
import LoadingFallback from './LoadingFallback';
import CanvasCapture from './CanvasCapture';
import ModelErrorBoundary from './ModelErrorBoundary';
import { useDesignStore } from '../../store/designStore';
import { useBackgroundStore, BACKGROUND_OPTIONS } from '../../store/backgroundStore';

/**
 * Root 3D scene: a single fixed room the user furnishes. Performance-first
 * choices: capped device-pixel-ratio range, static shadow baking once the
 * scene settles, and a per-canvas Suspense boundary so slow assets show a
 * loading state instead of blanking the scene.
 *
 * Catalog/variation resolution happens inside each `FurnitureItem`, not
 * here — this component just maps `placedItems` straight from the store,
 * with no catalog lookup map to build or keep in sync.
 *
 * Visual quality: `SoftShadows` patches the shadow material with a
 * percentage-closer filter so furniture reads as physically resting on the
 * floor rather than floating, and `ContactShadows` adds a tight, high-res
 * contact shadow directly under each piece for the same reason at close
 * camera distances. `Environment` supplies image-based lighting so PBR
 * materials (metal legs, matte fabric, etc.) don't look flat under a single
 * directional light.
 */
export default function RoomScene() {
  const placedItems = useDesignStore((s) => s.placedItems);
  const selectedItemId = useDesignStore((s) => s.selectedItemId);
  const clearSelection = useDesignStore((s) => s.clearSelection);
  const backgroundPresetId = useBackgroundStore((s) => s.preset);
  const activeBackground =
    BACKGROUND_OPTIONS.find((option) => option.id === backgroundPresetId) ?? BACKGROUND_OPTIONS[0];

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
      onPointerMissed={clearSelection}
      className="!absolute inset-0"
    >
      <CanvasCapture />
      <AdaptiveDpr pixelated={false} />
      {/* Modest sample count keeps this affordable on mid-range mobile GPUs. */}
      <SoftShadows size={22} samples={10} focus={0.5} />

      <Suspense fallback={<LoadingFallback />}>
        <SceneLighting />
        <RoomFloor />
        <RoomWalls />
        {/* Gerçek bir HDRI gökyüzü/ortam fotoğrafı — hem malzemelere gerçekçi
            ışık/yansıma veriyor (eskiden de böyleydi) HEM DE artık görünür
            arka plan olarak render ediliyor (background prop). Blur değeri
            düşük tutuluyor (0) — 0.7 gibi yüksek bir değer fotoğrafı (bina
            siluetleri, ışıklar vb.) tamamen bulanık gri bir lekeye
            çeviriyordu, artık ortam tanınabilir kalıyor ama yine de yumuşak.
            Hangi ortamın kullanılacağı BackgroundPicker.jsx'ten seçilip
            store/backgroundStore.js'te (localStorage'da) saklanıyor.
            Çoğu seçenek drei'nin hazır `preset` isimlerinden biri; "Gökdelen"
            ise dışarıdan gerçek bir fotoğraf HDRI'si (`files`) kullanıyor.
            ModelErrorBoundary bu dış dosya ağ hatası verirse sahneyi
            çökertmeden sessizce Gün Batımı'na geri düşer. */}
        <ModelErrorBoundary
          key={activeBackground.id}
          fallback={<Environment preset="sunset" background blur={0} />}
        >
          {activeBackground.files ? (
            <Environment files={activeBackground.files} background blur={0} />
          ) : (
            <Environment preset={activeBackground.preset ?? activeBackground.id} background blur={0} />
          )}
        </ModelErrorBoundary>
        <ContactShadows
          position={[0, 0.005, 0]}
          opacity={0.45}
          scale={10}
          blur={2}
          far={3.5}
          resolution={1024}
        />

        {placedItems.map((placedItem) => (
          <FurnitureItem
            key={placedItem.id}
            placedItem={placedItem}
            isSelected={placedItem.id === selectedItemId}
          />
        ))}

        <BakeShadows />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
