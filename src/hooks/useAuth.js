import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Centralizes Supabase session state so App.jsx (and anything else) can
 * just ask "is someone logged in?" without touching supabase.auth
 * directly. On mount:
 *
 *  1. `supabase.auth.getSession()` reads whatever session is already
 *     cached in localStorage (e.g. the user closed the tab and came back).
 *  2. If there's no cached session, we call `signInAnonymously()` so the
 *     user gets a real `auth.uid()` immediately — no login screen, no
 *     "please sign in" wall, saving just works. If they later create a
 *     real account, Supabase can link this anonymous identity to it.
 *  3. `supabase.auth.onAuthStateChange` keeps `session` in sync with any
 *     future sign-in/sign-out/token-refresh event.
 *
 * @returns {{ session: import('@supabase/supabase-js').Session | null, user: object | null, isLoading: boolean }}
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        if (isMounted) {
          setSession(data.session);
          setIsLoading(false);
        }
        return;
      }

      const { data: anonData, error } = await supabase.auth.signInAnonymously();
      if (error) console.error('Anonim giriş başarısız:', error);
      if (isMounted) {
        setSession(anonData?.session ?? null);
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT') {
        // A real sign-out (user clicked "Çıkış Yap") leaves `session` null,
        // which would make SaveButton show "önce giriş yap" until the page
        // is reloaded. Instead, immediately re-establish an anonymous
        // session so saving keeps working without a visible login wall.
        supabase.auth.signInAnonymously().then(({ data: anonData, error }) => {
          if (error) console.error('Anonim giriş başarısız:', error);
          if (isMounted) setSession(anonData?.session ?? null);
        });
        return;
      }
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isLoading };
}