import { useState } from 'react';
import { Move3d, RotateCcw, RotateCw, Trash2, X, Palette } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { getItemById, getVariationById } from '../../data/catalogData';
import { formatCentimeters, formatDegrees } from '../../utils/formatters';
import { TRANSFORM_MODES, WALL_ART_PRIMITIVE_TYPE } from '../../utils/constants';
import IconButton from './IconButton';
import ItemVariations from './ItemVariations';

/** @param {{ itemId: string }} props */
export default function PropertiesPanel({ itemId }) {
  const placedItem = useDesignStore((s) => s.placedItems.find((i) => i.id === itemId));
  const transformMode = useDesignStore((s) => s.transformMode);
  const setTransformMode = useDesignStore((s) => s.setTransformMode);
  const rotateItem = useDesignStore((s) => s.rotateItem);
  const removeItem = useDesignStore((s) => s.removeItem);
  const clearSelection = useDesignStore((s) => s.clearSelection);
  const setActiveModel = useDesignStore((s) => s.setActiveModel);
  const [showVariations, setShowVariations] = useState(false);

  if (!placedItem) return null;

  const catalogItem = getItemById(placedItem.itemId);
  const resolved = getVariationById(placedItem.activeVariationId);
  if (!catalogItem || !resolved) return null;
  const { variation: activeVariation } = resolved;
  const isWallMounted = activeVariation.primitiveType === WALL_ART_PRIMITIVE_TYPE;

  const isTranslate = transformMode === TRANSFORM_MODES.TRANSLATE;
  const isRotate = transformMode === TRANSFORM_MODES.ROTATE;

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{catalogItem.displayName}</p>
          <p className="text-xs text-neutral-500">
            {activeVariation.name} · {formatCentimeters(placedItem.position[0])} , {formatCentimeters(placedItem.position[2])}
            {!isWallMounted && <> · {formatDegrees(placedItem.rotationY)}</>}
          </p>
        </div>
        <IconButton icon={X} label="Seçimi kaldır" onClick={clearSelection} />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">Etkileşim Modu</p>
        <div className="flex items-center gap-2">
          <IconButton
            icon={Move3d}
            label={isWallMounted ? 'Taşı (duvar üzerinde sürükle)' : 'Taşı (fareyle sürükle)'}
            active={isTranslate}
            onClick={() => setTransformMode(TRANSFORM_MODES.TRANSLATE)}
          />
          {/* Rotating a flat wall-mounted piece around the vertical axis
              would turn it edge-on into the wall, so both rotate controls
              are hidden entirely for wall art — see the isWallMounted
              branch in FurnitureItem.jsx for the matching gizmo change. */}
          {!isWallMounted && (
            <>
              <IconButton
                icon={RotateCcw}
                label="Döndür (halka)"
                active={isRotate}
                onClick={() => setTransformMode(TRANSFORM_MODES.ROTATE)}
              />
              <IconButton icon={RotateCw} label="90° hızlı çevir" onClick={() => rotateItem(placedItem.id)} />
            </>
          )}
          <IconButton
            icon={Palette}
            label="Modeli değiştir"
            active={showVariations}
            onClick={() => setShowVariations((value) => !value)}
          />
          <IconButton icon={Trash2} label="Sil" onClick={() => removeItem(placedItem.id)} />
        </div>
      </div>

      {showVariations && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {catalogItem.displayName} — Modeli Değiştir
          </p>
          <ItemVariations
            item={catalogItem}
            activeVariationId={placedItem.activeVariationId}
            onSelect={(variation) => setActiveModel(placedItem.id, variation.id)}
          />
        </div>
      )}

      <p className="text-xs leading-relaxed text-neutral-400">
        {isWallMounted
          ? 'Bu obje duvara monte edilmiştir — sahnede tıklayıp basılı tutarak duvar üzerinde yatay/dikey sürükleyebilirsiniz.'
          : isTranslate
            ? 'Nesneye tıklayıp basılı tutarak sahnede istediğiniz yere doğrudan sürükleyebilirsiniz — ok/gizmo yok.'
            : 'Sahnede beliren halkadan tutup serbestçe döndürebilirsiniz — 15° adımlarla snap\'lenir.'}
      </p>
    </div>
  );
}
