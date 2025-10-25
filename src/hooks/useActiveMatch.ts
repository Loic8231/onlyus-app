import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useActiveMatch(userId?: string | null) {
  const [activeMatch, setActiveMatch] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    // ⚠️ Pas de session => on reste à null (pas de redirection)
    if (!userId) {
      setActiveMatch(null);
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("id")
        .eq("active", true)
        .or(`user1.eq.${userId},user2.eq.${userId}`)
        .limit(1);

      if (cancelled) return;

      if (error) {
        console.error("[useActiveMatch]", error);
        setActiveMatch(false);
      } else {
        setActiveMatch((data?.length ?? 0) > 0);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return activeMatch; // true | false | null
}