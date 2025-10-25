import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://crqxtdbmssghkaktextv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycXh0ZGJtc3NnaGtha3RleHR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU1NjMyMCwiZXhwIjoyMDc1MTMyMzIwfQ.BIxXxhn9ncrZZwr5ZipqGB8oAVuKpGyiJUFFUNnnSeA"
);

export default function CreateUsersTest() {
  const [status, setStatus] = useState("");

  const createUsers = async () => {
    setStatus("Création en cours...");

    try {
      const { data: alice, error: errA } = await supabaseAdmin.auth.admin.createUser({
        email: "alice@test.com",
        password: "alice123",
        email_confirm: true,
      });

      const { data: bob, error: errB } = await supabaseAdmin.auth.admin.createUser({
        email: "bob@test.com",
        password: "bob123",
        email_confirm: true,
      });

      if (errA || errB) throw errA || errB;

      setStatus(`✅ Utilisateurs créés : ${alice.user.email}, ${bob.user.email}`);
    } catch (e: any) {
      setStatus("Erreur : " + e.message);
      console.error(e);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Créer les utilisateurs tests</h2>
      <button onClick={createUsers}>Créer Alice & Bob</button>
      <p>{status}</p>
    </div>
  );
}

