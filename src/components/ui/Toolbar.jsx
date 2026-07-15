import { X, FolderOpen, Image, Palette } from 'lucide-react';
import UndoRedoControls from './UndoRedoControls';
import SaveButton from './SaveButton';
import IconButton from './IconButton';

/** @param {{ title: string, onClose: () => void, onOpenGallery: () => void, onOpenBackgroundPicker: () => void, onOpenMaterialPicker: () => void }} props */
export default function Toolbar({ title, onClose, onOpenGallery, onOpenBackgroundPicker, onOpenMaterialPicker }) {
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-200/60 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-neutral-900">{title}</h2>
        <IconButton icon={FolderOpen} label="Galeri" onClick={onOpenGallery} />
        <IconButton icon={Image} label="Arka Plan" onClick={onOpenBackgroundPicker} />
        <IconButton icon={Palette} label="Duvar & Zemin" onClick={onOpenMaterialPicker} />
        <SaveButton />
        <IconButton icon={X} label="Paneli kapat" onClick={onClose} />
      </div>
      <UndoRedoControls />
    </div>
  );
}
