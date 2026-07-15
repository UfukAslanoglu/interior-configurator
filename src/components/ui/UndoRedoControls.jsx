import { Undo2, Redo2, Trash2 } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import IconButton from './IconButton';

export default function UndoRedoControls() {
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const reset = useDesignStore((s) => s.reset);
  const canUndo = useDesignStore((s) => s.past.length > 0);
  const canRedo = useDesignStore((s) => s.future.length > 0);

  return (
    <div className="flex items-center gap-2">
      <IconButton icon={Undo2} label="Geri al" onClick={undo} disabled={!canUndo} />
      <IconButton icon={Redo2} label="Yinele" onClick={redo} disabled={!canRedo} />
      <IconButton icon={Trash2} label="Odayı temizle" onClick={reset} />
    </div>
  );
}
