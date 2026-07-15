import VariationOption from './VariationOption';

/**
 * Renders every variation of a single catalog item — 2, 5, or 100, it
 * doesn't matter. Two things make that true:
 *
 *  1. A pure `.map()` over `item.variations`: no per-item or per-count
 *     special-casing, no "if more than N, do X" branch anywhere.
 *  2. A CSS Grid with `repeat(auto-fill, minmax(...))` columns and a fixed
 *     `max-height` + `overflow-y-auto`: the grid auto-computes how many
 *     columns fit the available width, and once the content taller than
 *     `max-height` it scrolls internally instead of pushing the rest of
 *     the panel (Toolbar, catalog list, etc.) off-screen. Adding items to
 *     data/catalogData.js never requires touching this component.
 *
 * @param {{
 *   item: import('../../data/catalogData').CatalogItem,
 *   activeVariationId?: string,
 *   onSelect: (variation: object) => void
 * }} props
 */
export default function ItemVariations({ item, activeVariationId, onSelect }) {
  return (
    <div
      role="listbox"
      aria-label={`${item.displayName} varyasyonları`}
      className="mb-2 mt-1 grid max-h-64 gap-2 overflow-y-auto rounded-2xl bg-neutral-50 p-2"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))' }}
    >
      {item.variations.map((variation) => (
        <VariationOption
          key={variation.id}
          variation={variation}
          isActive={variation.id === activeVariationId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
