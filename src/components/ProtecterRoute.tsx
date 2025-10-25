import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setAuthed(!!data.session?.user?.id);
      setChecked(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s?.user?.id);
      setChecked(true);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  if (!checked) return <div style={{color:"#fff",padding:24}}>Chargement…</div>;
  if (!authed) return <Navigate to="/home" replace />; // ou /register
  return <>{children}</>;
}