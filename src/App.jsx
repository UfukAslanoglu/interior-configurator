import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import RoomScene from './components/canvas/RoomScene';
import ThumbnailRenderer from './components/canvas/ThumbnailRenderer';
import ResponsivePanel from './components/ui/ResponsivePanel';
import Toolbar from './components/ui/Toolbar';
import FurnitureCatalog from './components/ui/FurnitureCatalog';
import PropertiesPanel from './components/ui/PropertiesPanel';
import PanelToggleButton from './components/ui/PanelToggleButton';
import AccountButton from './components/ui/AccountButton';
import Gallery from './components/ui/Gallery';
import BackgroundPicker from './components/ui/BackgroundPicker';
import RoomMaterialPicker from './components/ui/RoomMaterialPicker';
import { useDesignStore } from './store/designStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAuth } from './hooks/useAuth';

export default function App() {
  useKeyboardShortcuts();
  const { isLoading } = useAuth();
  const selectedItemId = useDesignStore((s) => s.selectedItemId);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isBackgroundPickerOpen, setIsBackgroundPickerOpen] = useState(false);
  const [isMaterialPickerOpen, setIsMaterialPickerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-3 bg-neutral-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-lg">
          <Loader2 size={20} className="animate-spin" />
        </div>
        <p className="animate-gentle-pulse text-sm font-medium text-neutral-400">Oda hazırlanıyor…</p>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-neutral-100">
      <RoomScene />
      <ThumbnailRenderer />

      <AccountButton />
      <Gallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      <BackgroundPicker isOpen={isBackgroundPickerOpen} onClose={() => setIsBackgroundPickerOpen(false)} />
      <RoomMaterialPicker isOpen={isMaterialPickerOpen} onClose={() => setIsMaterialPickerOpen(false)} />

      <ResponsivePanel isOpen={isCatalogOpen}>
        <Toolbar
          title={selectedItemId ? 'Özellikler' : 'Katalog'}
          onClose={() => setIsCatalogOpen(false)}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onOpenBackgroundPicker={() => setIsBackgroundPickerOpen(true)}
          onOpenMaterialPicker={() => setIsMaterialPickerOpen(true)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {selectedItemId ? <PropertiesPanel itemId={selectedItemId} /> : <FurnitureCatalog />}
        </div>
      </ResponsivePanel>

      {!isCatalogOpen && <PanelToggleButton onOpen={() => setIsCatalogOpen(true)} />}
    </div>
  );
}
