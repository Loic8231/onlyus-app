// src/hooks/useSessionAndRedirect.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useActiveMatch } from "./useActiveMatch";

export function useSessionAndRedirect() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const activeMatch = useActiveMatch(userId);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUserId(data.session?.user?.id ?? null);
      setChecked(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setChecked(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!checked) return;             // attente initiale
    if (!userId) return;              // pas connecté → rester sur Login
    if (activeMatch === null) return; // chargement du hook
    navigate(activeMatch ? "/chat" : "/discover", { replace: true });
  }, [checked, userId, activeMatch, navigate]);
}
