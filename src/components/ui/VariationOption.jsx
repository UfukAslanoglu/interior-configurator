import { useCallback } from 'react';
import { Check } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useModelThumbnail } from '../../hooks/useModelThumbnail';

/**
 * One selectable variation (style/finish) of a catalog item, laid out as a
 * grid card (thumbnail on top, name/price below) so it tiles cleanly in
 * ItemVariations.jsx's CSS grid regardless of how many variations exist.
 *
 * Deliberately shared between two very different call sites: the catalog's
 * "add a new one" flow (FurnitureCatalog.jsx) and the properties panel's
 * "swap the model on what's already there" flow (PropertiesPanel.jsx).
 * Neither this component nor its layout cares which — the caller supplies
 * `onSelect` and, optionally, `isActive`.
 *
 * @param {{
 *   variation: import('../../data/catalogData').CatalogVariation,
 *   isActive?: boolean,
 *   onSelect: (variation: object) => void
 * }} props
 */
export default function VariationOption({ variation, isActive = false, onSelect }) {
  /** Warms the GLTF cache on hover intent so selecting feels instant. */
  const handleMouseEnter = useCallback(() => {
    if (!variation.modelUrl) return;
    import('../canvas/GLTFFurnitureModel').then((mod) => mod.preloadFurnitureModel(variation.modelUrl));
  }, [variation.modelUrl]);

  // Gerçek model önizlemesi hazır olana kadar (ilk açılışta arka planda
  // render ediliyor — bkz. ThumbnailRenderer.jsx) renk karesi gösterilir.
  const renderedThumbnail = useModelThumbnail(variation.modelUrl);
  const thumbnail = variation.thumbnail ?? renderedThumbnail;

  return (
    <button
      type="button"
      onClick={() => onSelect(variation)}
      onMouseEnter={handleMouseEnter}
      aria-pressed={isActive}
      className={[
        'flex flex-col items-stretch gap-1.5 rounded-xl border p-2 text-left transition',
        isActive
          ? 'border-neutral-900 bg-white shadow-sm'
          : 'border-transparent bg-white/60 hover:border-neutral-300 hover:bg-white',
      ].join(' ')}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full" style={{ backgroundColor: variation.color }} />
        )}
        {isActive && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-white">
            <Check size={10} />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium leading-tight text-neutral-800">{variation.name}</p>
        <p className="text-[10px] text-neutral-500">{formatPrice(variation.price)}</p>
      </div>
    </button>
  );
}
