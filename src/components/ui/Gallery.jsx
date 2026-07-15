import { useEffect, useState, useCallback } from 'react';
import { X, Loader2, FolderOpen, Trash2, AlertCircle } from 'lucide-react';
import { listDesigns, deleteDesign } from '../../services/designService';
import { useDesignStore } from '../../store/designStore';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_EMAIL } from '../../utils/constants';
import ConfirmDialog from './ConfirmDialog';

/**
 * Herkese açık galeri: tüm kullanıcıların kaydettiği odalar arasında
 * gezinilebilir (grid + oda önizleme görseli), tıklayınca odaya yüklenir.
 * "Benim Odalarım" üstte, diğer kullanıcıların tasarımları altta ayrı bir
 * bölümde listelenir.
 * Silme: bir kullanıcı sadece KENDİ tasarımını silebilir, ADMIN_EMAIL ise
 * herkesinkini silebilir. Bu sadece UI'da butonu gizliyor/gösteriyor —
 * gerçek yetki Supabase'deki RLS delete/update kurallarında zorlanıyor.
 */
export default function Gallery({ isOpen, onClose }) {
  const loadDesign = useDesignStore((s) => s.loadDesign);
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null); // design awaiting confirmation
  const [deleteError, setDeleteError] = useState(null);

  const fetchDesigns = useCallback(() => {
    setIsLoading(true);
    setError(null);
    listDesigns()
      .then(setDesigns)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchDesigns();
  }, [isOpen, fetchDesigns]);

  if (!isOpen) return null;

  const handleLoad = (design) => {
    // Kendi tasarımını veya admin herhangi birini yüklerse, bundan sonraki
    // Kaydet bu satırın üzerine yazar (düzenleme). Başkasının tasarımını
    // yüklerken sadece bakmak/kopyalamak için — Kaydet'e basarsa kendi
    // hesabında YENİ bir tasarım olarak kaydedilir, orijinali değişmez.
    const canEdit = isAdmin || (user && design.user_id === user.id);
    loadDesign(design.design_data, canEdit ? design.id : null);
    onClose();
  };

  const requestDelete = (event, design) => {
    event.stopPropagation();
    setDeleteError(null);
    setPendingDelete(design);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    try {
      await deleteDesign(pendingDelete.id);
      setDesigns((prev) => prev.filter((d) => d.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const myDesigns = designs.filter((d) => user && d.user_id === user.id);
  const otherDesigns = designs.filter((d) => !(user && d.user_id === user.id));

  const renderCard = (design, { isMine }) => {
    const canDelete = isAdmin || isMine;
    return (
      <button
        key={design.id}
        type="button"
        onClick={() => handleLoad(design)}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 text-left transition hover:border-neutral-900 hover:shadow-md"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
          {design.thumbnail ? (
            <img src={design.thumbnail} alt="Oda önizlemesi" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FolderOpen size={22} className="text-neutral-300" />
            </div>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={(e) => requestDelete(e, design)}
              disabled={deletingId === design.id}
              aria-label="Tasarımı sil"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow transition hover:bg-red-50 disabled:opacity-50 group-hover:opacity-100"
            >
              {deletingId === design.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-0.5 px-3 py-2">
          <p className="truncate text-xs font-medium text-neutral-900">
            {design.design_data?.length ?? 0} eşyalı tasarım
          </p>
          <p className="text-[11px] text-neutral-500">{new Date(design.created_at).toLocaleString('tr-TR')}</p>
        </div>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm animate-backdrop-fade-in"
      onClick={onClose}
    >
      <div
        className="animate-modal-pop-in relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Galeri</h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="text-neutral-400 hover:text-neutral-700">
            <X size={18} />
          </button>
        </div>

        {deleteError && (
          <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-6 py-2.5 text-xs text-red-600">
            <AlertCircle size={14} className="shrink-0" />
            {deleteError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
              <Loader2 size={16} className="animate-spin" /> Yükleniyor…
            </div>
          )}
          {error && <p className="py-16 text-center text-sm text-red-600">{error}</p>}

          {!isLoading && !error && (
            <div className="flex flex-col gap-6">
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Benim Odalarım {myDesigns.length > 0 && `(${myDesigns.length}/5)`}
                </h3>
                {myDesigns.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-400">
                    Henüz hiç oda kaydetmedin.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {myDesigns.map((design) => renderCard(design, { isMine: true }))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Diğer Kullanıcılar
                </h3>
                {otherDesigns.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-neutral-400">
                    Başka kullanıcı tasarımı yok.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {otherDesigns.map((design) => renderCard(design, { isMine: false }))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Bu tasarımı silmek istiyor musun?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        isConfirming={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
