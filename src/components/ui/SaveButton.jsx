import { useState, useCallback } from 'react';
import { Save, Loader2, Check, AlertCircle, Ban } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { saveDesign, updateDesign, countUserDesigns } from '../../services/designService';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_EMAIL } from '../../utils/constants';

const MAX_DESIGNS_PER_USER = 5;

/**
 * Kaydet butonu iki moddan birinde çalışır:
 *  - `currentDesignId` doluysa (Gallery'den kendi/admin yetkisiyle bir
 *    tasarım yüklendiyse): UPDATE — aynı satırın üzerine yazar.
 *  - Boşsa: INSERT — yeni bir tasarım oluşturur, bundan sonraki kayıtlar
 *    artık o yeni satırı günceller (aynı oturumda tekrar tekrar Kaydet'e
 *    basmak kopya satır açmasın diye).
 * Yeni tasarım oluştururken admin dışındaki kullanıcılar 5 tasarım
 * sınırına tabi — gerçek sınır Supabase RLS'de zorlanıyor, buradaki sayım
 * sadece kullanıcıya net bir mesaj göstermek için.
 */
export default function SaveButton() {
  const placedItems = useDesignStore((s) => s.placedItems);
  const canvasElement = useDesignStore((s) => s.canvasElement);
  const currentDesignId = useDesignStore((s) => s.currentDesignId);
  const setCurrentDesignId = useDesignStore((s) => s.setCurrentDesignId);
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [status, setStatus] = useState('idle'); // idle | saving | success | error | needs-auth | limit-reached

  const handleSave = useCallback(async () => {
    if (!user) {
      setStatus('needs-auth');
      setTimeout(() => setStatus('idle'), 2200);
      return;
    }
    setStatus('saving');
    try {
      const thumbnail = canvasElement ? canvasElement.toDataURL('image/jpeg', 0.6) : null;

      if (currentDesignId) {
        await updateDesign(currentDesignId, placedItems, thumbnail);
      } else {
        if (!isAdmin) {
          const existingCount = await countUserDesigns(user.id);
          if (existingCount >= MAX_DESIGNS_PER_USER) {
            setStatus('limit-reached');
            setTimeout(() => setStatus('idle'), 2800);
            return;
          }
        }
        const created = await saveDesign(placedItems, user.id, thumbnail);
        setCurrentDesignId(created.id);
      }
      setStatus('success');
    } catch (error) {
      console.error('saveDesign failed:', error);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 2200);
    }
  }, [placedItems, user, canvasElement, currentDesignId, isAdmin, setCurrentDesignId]);

  const isDisabled = status === 'saving' || placedItems.length === 0;

  const label =
    status === 'saving' ? 'Kaydediliyor…'
    : status === 'success' ? 'Kaydedildi'
    : status === 'error' ? 'Kaydedilemedi'
    : status === 'needs-auth' ? 'Önce giriş yap'
    : status === 'limit-reached' ? '5 oda sınırı doldu'
    : 'Kaydet';

  const Icon =
    status === 'saving' ? Loader2
    : status === 'success' ? Check
    : status === 'error' || status === 'needs-auth' ? AlertCircle
    : status === 'limit-reached' ? Ban
    : Save;

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isDisabled}
      title={status === 'limit-reached' ? 'En fazla 5 oda kaydedebilirsin — yeni kaydetmek için galeriden birini sil.' : undefined}
      className={[
        'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50',
        status === 'error' || status === 'needs-auth' || status === 'limit-reached'
          ? 'bg-red-50 text-red-600'
          : status === 'success'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95',
      ].join(' ')}
    >
      <Icon size={14} className={status === 'saving' ? 'animate-spin' : ''} />
      {label}
    </button>
  );
}
