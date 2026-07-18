/**
 * Lightweight client-only auth check for public routes (e.g. the marketing
 * course pages) that live outside the `_authenticated` route tree and so
 * can't read `useAuthContext()`. Reads the session straight from the browser
 * Supabase client and subscribes to changes; never runs during SSR.
 */
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

type ClientSession = {
  loading: boolean;
  isSignedIn: boolean;
};

export function useClientSession(): ClientSession {
  const [state, setState] = useState<ClientSession>({ loading: true, isSignedIn: false });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ loading: false, isSignedIn: false });
      return;
    }

    let active = true;
    supabase.auth.getUser().then((result: { data: { user: User | null } }) => {
      if (active) setState({ loading: false, isSignedIn: Boolean(result.data.user) });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (active) setState({ loading: false, isSignedIn: Boolean(session?.user) });
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}
