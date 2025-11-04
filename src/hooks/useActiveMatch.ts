// src/hooks/useActiveMatch.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Retourne:
 *  - true  : l'utilisateur a au moins un match actif (présence dans match_participants)
 *  - false : aucun match actif
 *  - null  : indéterminé (pas encore chargé / pas d'user)
 */
export function useActiveMatch(userId?: string | null) {
  const [activeMatch, setActiveMatch] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    if (!userId) {
      setActiveMatch(null);
      return;
    }

    (async () => {
      // Lecture initiale
      const { data, error } = await supabase
        .from("match_participants")
        .select("match_id")
        .eq("user_id", userId)
        .limit(1);

      if (cancelled) return;

      if (error) {
        console.error("[useActiveMatch] initial fetch error:", error);
        setActiveMatch(false);
      } else {
        setActiveMatch((data?.length ?? 0) > 0);
      }

      // Realtime : on se met à jour sur INSERT / DELETE pour cet utilisateur
      channel = supabase
        .channel(`mp:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "match_participants", filter: `user_id=eq.${userId}` },
          () => setActiveMatch(true)
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "match_participants", filter: `user_id=eq.${userId}` },
          async () => {
            // On re-vérifie s'il en reste encore
            const { data: left } = await supabase
              .from("match_participants")
              .select("match_id", { count: "exact", head: true })
              .eq("user_id", userId);
            setActiveMatch((left?.length ?? 0) > 0);
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  return activeMatch;
}
