import { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import AuthModal from '../auth/AuthModal';

/**
 * Sol üst köşede sabit duran hesap butonu. Giriş yoksa modal açar,
 * gerçek bir hesapla girişliyse email + çıkış menüsü gösterir.
 *
 * `useAuth` her ziyarette otomatik bir anonim oturum açtığı için `user`
 * neredeyse her zaman dolu gelir — ama bu "gerçek giriş" değil, sadece
 * kaydetmenin çalışması için arka planda tutulan bir kimlik. O yüzden
 * burada `user.is_anonymous` kontrol ediliyor: anonim oturumdayken buton
 * hâlâ "Giriş Yap" gösterir, sadece email/şifre ile gerçekten giriş
 * yapıldığında email + çıkış menüsüne geçer.
 */
export default function AccountButton() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isRealUser = user && !user.is_anonymous;

  if (!isRealUser) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="pointer-events-auto fixed left-5 top-[calc(env(safe-area-inset-top,0px)+1.25rem)] z-30 flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-[0_8px_40px_rgba(0,0,0,0.14)] backdrop-blur-2xl backdrop-saturate-150 transition-transform hover:scale-105 active:scale-95"
        >
          <User size={16} />
          Giriş Yap
        </button>
        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="pointer-events-auto fixed left-5 top-[calc(env(safe-area-inset-top,0px)+1.25rem)] z-30">
      <button
        type="button"
        onClick={() => setIsMenuOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-[0_8px_40px_rgba(0,0,0,0.14)] backdrop-blur-2xl backdrop-saturate-150 transition-transform hover:scale-105 active:scale-95"
      >
        <User size={16} />
        {user.email}
      </button>
      {isMenuOpen && (
        <div className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-lg backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}