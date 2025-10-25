import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useActiveMatch } from "../hooks/useActiveMatch";

// Où envoyer un visiteur SANS session (page publique / home / register)
const NO_SESSION_DEST = "/home"; // change vers "/register" quand tu voudras

export default function StartupRedirect() {
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
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!userId) { navigate(NO_SESSION_DEST, { replace: true }); return; }
    if (activeMatch === null) return; // charge la requête matches
    navigate(activeMatch ? "/chat" : "/discover", { replace: true });
  }, [checked, userId, activeMatch, navigate]);

  // petit splash
  return (
    <div style={{color:"#fff",padding:24}}>Chargement…</div>
  );
}
