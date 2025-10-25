import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Création du compte...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }, // ira dans raw_user_meta_data, lu par le trigger
      },
    });

    if (error) {
      setStatus("Erreur : " + error.message);
      return;
    }

    // Deux cas :
    // - Si la confirmation d'email est désactivée : session dispo -> on redirige.
    // - Si la confirmation est activée : pas de session -> on affiche un message.
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      setStatus("✅ Compte créé et connecté.");
      navigate("/discover", { replace: true });
    } else {
      setStatus("✅ Compte créé. Vérifie ta boîte mail pour confirmer, puis connecte-toi.");
    }
  };

  return (
    <div className="app-safe" style={{ padding: 20, color: "#fff" }}>
      <h2>Créer un compte</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input placeholder="Pseudo (optionnel)" value={username} onChange={e => setUsername(e.target.value)} />
        <button type="submit">S’inscrire</button>
      </form>
      <div style={{ marginTop: 12 }}>{status}</div>
    </div>
  );
}
