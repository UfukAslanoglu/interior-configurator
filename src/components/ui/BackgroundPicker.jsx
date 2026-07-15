import { Check, X } from 'lucide-react';
import { BACKGROUND_OPTIONS, useBackgroundStore } from '../../store/backgroundStore';

/**
 * Lets the visitor pick the 3D scene's ambience from a short curated list
 * (see store/backgroundStore.js) — same frosted-glass modal language as
 * Gallery/AuthModal/ConfirmDialog. Picking a card updates the store
 * immediately; RoomScene.jsx reacts to that and swaps the live
 * `<Environment preset>`, so the change is visible the instant this modal
 * closes (or even before, if you can see the room behind it).
 *
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function BackgroundPicker({ isOpen, onClose }) {
  const preset = useBackgroundStore((s) => s.preset);
  const setPreset = useBackgroundStore((s) => s.setPreset);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm animate-backdrop-fade-in"
      onClick={onClose}
    >
      <div
        className="animate-modal-pop-in relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Arka Plan</h2>
            <p className="text-xs text-neutral-500">Odanın çevresindeki ortamı seç.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="text-neutral-400 hover:text-neutral-700">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-5">
          {BACKGROUND_OPTIONS.map((option) => {
            const isActive = option.id === preset;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPreset(option.id)}
                aria-pressed={isActive}
                className={[
                  'group flex flex-col overflow-hidden rounded-2xl border text-left transition',
                  isActive
                    ? 'border-neutral-900 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-400',
                ].join(' ')}
              >
                <div className="relative h-24 w-full shrink-0" style={{ background: option.swatch }}>
                  {isActive && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-0.5 bg-white px-3 py-2">
                  <span className="block text-xs font-medium text-neutral-900">{option.label}</span>
                  <span className="block text-[11px] text-neutral-500">{option.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
