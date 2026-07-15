import { ChevronDown, ChevronRight } from 'lucide-react';
import { getItemPriceRange } from '../../data/catalogData';
import { formatPrice, formatCentimeters } from '../../utils/formatters';
import { useModelThumbnail } from '../../hooks/useModelThumbnail';

/**
 * A catalog item's collapsed card — one per "thing" (e.g. "3'lü Kanepe"),
 * not per variation. Tapping it expands/collapses the item's
 * <ItemVariations> underneath (rendered by the parent, FurnitureCatalog.jsx)
 * rather than adding anything directly, since the item alone isn't
 * placeable — a variation is.
 *
 * @param {{
 *   item: import('../../data/catalogData').CatalogItem,
 *   expanded: boolean,
 *   onToggle: () => void
 * }} props
 */
export default function ItemCard({ item, expanded, onToggle }) {
  const { min, max } = getItemPriceRange(item);
  const priceLabel = min === max ? formatPrice(min) : `${formatPrice(min)}'den itibaren`;
  const firstVariation = item.variations[0];
  const swatchColor = firstVariation?.color ?? '#cccccc';
  // Gerçek model önizlemesi hazır olana kadar (ilk açılışta arka planda
  // render ediliyor — bkz. ThumbnailRenderer.jsx) renk karesi gösterilir.
  const renderedThumbnail = useModelThumbnail(firstVariation?.modelUrl);
  const swatchThumbnail = firstVariation?.thumbnail ?? renderedThumbnail;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className={[
        'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition',
        expanded
          ? 'border-neutral-900 bg-white'
          : 'border-neutral-200/70 bg-white/60 hover:border-neutral-300 hover:bg-white',
      ].join(' ')}
    >
      {swatchThumbnail ? (
        <img src={swatchThumbnail} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
      ) : (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${swatchColor}22` }}
        >
          <div className="h-6 w-6 rounded-md" style={{ backgroundColor: swatchColor }} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900">{item.displayName}</p>
        <p className="text-xs text-neutral-500">
          {item.variations.length} seçenek · {formatCentimeters(item.dimensions.width)} ×{' '}
          {formatCentimeters(item.dimensions.depth)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs font-medium text-neutral-600">{priceLabel}</span>
        {expanded ? (
          <ChevronDown size={16} className="text-neutral-400" />
        ) : (
          <ChevronRight size={16} className="text-neutral-400" />
        )}
      </div>
    </button>
  );
}
