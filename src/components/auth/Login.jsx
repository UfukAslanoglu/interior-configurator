import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

/**
 * Email/password sign-in. Doesn't manage session state itself — it just
 * calls `supabase.auth.signInWithPassword`, and the app-wide `useAuth()`
 * hook (subscribed via onAuthStateChange) picks up the resulting session
 * automatically, so App.jsx re-renders into the logged-in view on its own.
 *
 * @param {{ onSwitchToRegister?: () => void }} props
 */
export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);
    if (signInError) {
      setError(signInError.message);
    }
    // On success there's nothing else to do here — onAuthStateChange in
    // useAuth() fires, session updates, App.jsx swaps views.
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <h2 className="text-lg font-semibold text-neutral-900">Giriş Yap</h2>

      <div className="relative">
        <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta"
          required
          className="w-full rounded-xl border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-neutral-900"
        />
      </div>

      <div className="relative">
        <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
          required
          minLength={6}
          className="w-full rounded-xl border border-neutral-300 py-2 pl-9 pr-9 text-sm outline-none transition focus:border-neutral-900"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
        {isSubmitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </button>

      {onSwitchToRegister && (
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-sm text-neutral-500 underline underline-offset-2"
        >
          Hesabın yok mu? Kayıt ol
        </button>
      )}
    </form>
  );
}
