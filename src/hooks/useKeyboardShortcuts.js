import { useEffect } from 'react';
import { useDesignStore } from '../store/designStore';

/**
 * Wires global keyboard shortcuts:
 *  - Ctrl/Cmd+Z: undo
 *  - Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y: redo
 *  - Delete/Backspace: remove the selected item
 *  - Escape: clear selection
 */
export function useKeyboardShortcuts() {
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const removeItem = useDesignStore((s) => s.removeItem);
  const clearSelection = useDesignStore((s) => s.clearSelection);
  const selectedItemId = useDesignStore((s) => s.selectedItemId);

  useEffect(() => {
    /** @param {KeyboardEvent} event */
    function handleKeyDown(event) {
      const isMeta = event.ctrlKey || event.metaKey;

      if (isMeta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        (isMeta && event.key.toLowerCase() === 'z' && event.shiftKey) ||
        (isMeta && event.key.toLowerCase() === 'y')
      ) {
        event.preventDefault();
        redo();
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedItemId) {
        const target = /** @type {HTMLElement} */ (event.target);
        const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        if (!isTyping) {
          event.preventDefault();
          removeItem(selectedItemId);
        }
      } else if (event.key === 'Escape') {
        clearSelection();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, removeItem, clearSelection, selectedItemId]);
}
