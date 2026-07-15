import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Login from './Login';
import Register from './Register';

/**
 * Login/Register'ı bir pencere (modal) içinde gösterir, ikisi arasında
 * geçiş yapılabilir. Arka plana tıklayınca veya Escape'e basınca kapanır.
 */
export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login');

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm animate-backdrop-fade-in"
      onClick={onClose}
    >
      <div
        className="animate-modal-pop-in relative w-full max-w-sm rounded-3xl border border-white/60 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Kapat" className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-700">
          <X size={18} />
        </button>
        {mode === 'login' ? (
          <Login onSwitchToRegister={() => setMode('register')} />
        ) : (
          <Register onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}