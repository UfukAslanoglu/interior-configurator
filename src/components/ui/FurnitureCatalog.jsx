import { useState } from 'react';
import { CATALOG } from '../../data/catalogData';
import { useDesignStore } from '../../store/designStore';
import ItemCard from './ItemCard';
import ItemVariations from './ItemVariations';

/**
 * The whole catalog panel, built from a single `CATALOG.map()` chain — no
 * hard-coded category or item components. Dropping a new item (or a new
 * variation, or a whole new category) into data/catalogData.js is enough
 * for it to appear here with zero code changes.
 *
 * Tapping an item's card expands its variation list inline (accordion
 * style, one item open at a time); tapping a variation adds a NEW instance
 * to the scene via `addFurnitureToScene`.
 */
export default function FurnitureCatalog() {
  const addFurnitureToScene = useDesignStore((s) => s.addFurnitureToScene);
  const [expandedItemId, setExpandedItemId] = useState(null);

  const handleToggle = (itemId) => {
    setExpandedItemId((current) => (current === itemId ? null : itemId));
  };

  return (
    <div className="flex flex-col gap-5 overflow-y-auto px-4 py-4">
      {CATALOG.map((category) => (
        <section key={category.categoryName}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {category.categoryName}
          </h3>
          <div className="flex flex-col gap-2">
            {category.items.map((item) => (
              <div key={item.id}>
                <ItemCard
                  item={item}
                  expanded={expandedItemId === item.id}
                  onToggle={() => handleToggle(item.id)}
                />
                {expandedItemId === item.id && (
                  <ItemVariations
                    item={item}
                    onSelect={(variation) => addFurnitureToScene(item.id, variation.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
