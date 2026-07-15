import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

/**
 * Email/password sign-up.
 *
 * `useAuth()` auto-establishes an anonymous session for every visitor, so
 * by the time someone opens this form they almost always already have an
 * anonymous `auth.uid()` — and possibly designs saved under it. Instead of
 * `supabase.auth.signUp()` (which would create a brand-new user with a
 * DIFFERENT uid, orphaning anything saved anonymously), we call
 * `supabase.auth.updateUser({ email, password })` while that anonymous
 * session is active. This UPGRADES the same user in place — same
 * `auth.uid()`, now with real credentials — so every design already tied
 * to it (via `designs.user_id`) is automatically owned by the new account.
 * No migration step needed.
 *
 * Falls back to plain `signUp` in the unlikely case there's no session at
 * all yet (e.g. anonymous sign-in briefly failed).
 *
 * Note: if Supabase's "Confirm email" setting is ON, the upgrade still
 * requires clicking a confirmation link before the email takes effect —
 * this shows a "check your email" message in that case, same as before.
 *
 * @param {{ onSwitchToLogin?: () => void }} props
 */
export default function Register({ onSwitchToLogin }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const isUpgradingAnonymous = Boolean(user?.is_anonymous);

    if (isUpgradingAnonymous) {
      const { data, error: updateError } = await supabase.auth.updateUser({ email, password });
      setIsSubmitting(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      // If "Confirm email" is on, the new email isn't active until the
      // user clicks the link Supabase just sent — email_confirmed_at stays
      // empty until then. If it's off, the upgrade is already complete and
      // onAuthStateChange will swap the UI over on its own.
      if (!data.user?.email_confirmed_at) {
        setNeedsEmailConfirmation(true);
      }
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setIsSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      setNeedsEmailConfirmation(true);
    }
  };

  if (needsEmailConfirmation) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <MailCheck size={18} />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">E-postanı kontrol et</h2>
        <p className="text-sm text-neutral-600">
          {email} adresine bir onay bağlantısı gönderdik. Onayladıktan sonra giriş yapabilirsin — o ana kadar
          kaydettiğin tasarımlar zaten hesabına bağlı, kaybolmaz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <h2 className="text-lg font-semibold text-neutral-900">Kayıt Ol</h2>

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
          placeholder="Şifre (en az 6 karakter)"
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
        {isSubmitting ? 'Kayıt olunuyor…' : 'Kayıt Ol'}
      </button>

      {onSwitchToLogin && (
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm text-neutral-500 underline underline-offset-2"
        >
          Zaten hesabın var mı? Giriş yap
        </button>
      )}
    </form>
  );
}
