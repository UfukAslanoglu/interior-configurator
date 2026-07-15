import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Sitenin frosted-glass diline uyumlu, tarayıcının çirkin native
 * `window.confirm`/`window.alert` kutularının yerini alan tehlikeli-işlem
 * onay penceresi. Gallery'nin silme akışı bunu kullanıyor.
 *
 * @param {{
 *   isOpen: boolean,
 *   title: string,
 *   description?: string,
 *   confirmLabel?: string,
 *   isConfirming?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void
 * }} props
 */
export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Sil',
  isConfirming = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm animate-backdrop-fade-in"
      onClick={(e) => {
        // Bu backdrop, Gallery'nin kendi backdrop'ının İÇİNDE render ediliyor
        // — stopPropagation olmadan tıklama Gallery'nin onClose'ına da
        // sızar ve arkasındaki galeriyi de kapatır.
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        className="animate-modal-pop-in relative w-full max-w-xs rounded-3xl border border-white/60 bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={18} />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-neutral-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3.5 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConfirming && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
