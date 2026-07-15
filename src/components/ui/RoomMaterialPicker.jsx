import { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  useRoomMaterialStore,
  WALL_OPTIONS,
  FLOOR_OPTIONS,
} from '../../store/roomMaterialStore';

/**
 * Lets the visitor pick the room's wall paint color and floor color from two
 * short curated palettes (see store/roomMaterialStore.js) — same
 * frosted-glass modal language as Gallery/AuthModal/BackgroundPicker.
 * Picking a swatch updates the store immediately; RoomWalls.jsx /
 * RoomFloor.jsx react to that and swap the live material color, so the
 * change is visible the instant this modal closes (or even before, if the
 * room is visible behind it).
 *
 * A small internal tab switch (Duvar / Zemin) keeps this a single modal
 * instead of two separate buttons/panels, matching BackgroundPicker's single
 * scrollable grid layout.
 *
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */
export default function RoomMaterialPicker({ isOpen, onClose }) {
  const [tab, setTab] = useState('wall');
  const wallColorId = useRoomMaterialStore((s) => s.wallColorId);
  const setWallColorId = useRoomMaterialStore((s) => s.setWallColorId);
  const floorColorId = useRoomMaterialStore((s) => s.floorColorId);
  const setFloorColorId = useRoomMaterialStore((s) => s.setFloorColorId);

  if (!isOpen) return null;

  const options = tab === 'wall' ? WALL_OPTIONS : FLOOR_OPTIONS;
  const activeId = tab === 'wall' ? wallColorId : floorColorId;
  const setActiveId = tab === 'wall' ? setWallColorId : setFloorColorId;

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
            <h2 className="text-lg font-semibold text-neutral-900">Duvar &amp; Zemin</h2>
            <p className="text-xs text-neutral-500">Odanın duvar ve zemin rengini seç.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="text-neutral-400 hover:text-neutral-700">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4">
          {[
            { id: 'wall', label: 'Duvar' },
            { id: 'floor', label: 'Zemin' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                'flex-1 rounded-xl py-2 text-sm font-medium transition',
                tab === t.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 overflow-y-auto p-5">
          {options.map((option) => {
            const isActive = option.id === activeId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveId(option.id)}
                aria-pressed={isActive}
                className={[
                  'group flex flex-col items-center gap-1.5 rounded-2xl border p-2 text-center transition',
                  isActive
                    ? 'border-neutral-900 shadow-sm'
                    : 'border-transparent hover:border-neutral-300',
                ].join(' ')}
              >
                <div
                  className="relative h-12 w-12 shrink-0 rounded-full border border-black/5 shadow-inner"
                  style={{ backgroundColor: option.color }}
                >
                  {isActive && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white ring-2 ring-white">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <span className="block text-[11px] font-medium leading-tight text-neutral-700">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
