import { useMemo } from 'react';
import { Wallet } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { getVariationById } from '../../data/catalogData';
import { formatPrice } from '../../utils/formatters';

/**
 * Sol üst köşede, AccountButton'ın hemen altında sabit duran, odaya
 * yerleştirilen tüm eşyaların toplam fiyatını canlı gösteren rozet.
 * Her `placedItem`'ın güncel `activeVariationId`'sini catalogData.js'ten
 * çözüp `price` alanlarını toplar — model swap (renk/stil değişimi) veya
 * eşya ekleme/silme anında toplamı günceller, ayrı bir state tutmaz.
 *
 * Oda boşken (hiç eşya yokken) gösterilmez.
 */
export default function BudgetSummary() {
  const placedItems = useDesignStore((s) => s.placedItems);

  const total = useMemo(
    () =>
      placedItems.reduce((sum, placedItem) => {
        const resolved = getVariationById(placedItem.activeVariationId);
        return sum + (resolved?.variation.price ?? 0);
      }, 0),
    [placedItems]
  );

  if (placedItems.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-5 top-[calc(env(safe-area-inset-top,0px)+4.5rem)] z-30 flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-[0_8px_40px_rgba(0,0,0,0.14)] backdrop-blur-2xl backdrop-saturate-150">
      <Wallet size={16} className="shrink-0 text-neutral-500" />
      <span className="whitespace-nowrap">
        Toplam <span className="font-semibold text-neutral-900">{formatPrice(total)}</span>
        <span className="ml-1 text-neutral-400">· {placedItems.length} eşya</span>
      </span>
    </div>
  );
}
