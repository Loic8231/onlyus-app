import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const login = async () => {
    setStatus("Connexion...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("Erreur : " + error.message);
    } else {
      setStatus("✅ Connecté !");
      console.log("Utilisateur connecté :", await supabase.auth.getUser());
      // 🚀 Redirection vers la racine : StartupRedirect fera Chat ou Discover
      window.location.href = "/";
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setStatus("Déconnecté");
  };

  // 🔹 Bouton temporaire pour forcer la déconnexion si besoin
  const forceLogout = async () => {
    await supabase.auth.signOut();
    alert("Déconnexion forcée réussie !");
  };

  return (
    <div className="app-safe" style={{ padding: 20, color: "#fff" }}>
      <h2>Connexion</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Mot de passe"
        />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={login}>Se connecter</button>
        <button onClick={() => (window.location.href = "/register")}>
          Créer un compte
        </button>
        <button onClick={logout}>Déconnexion</button>
        <button onClick={forceLogout}>Forcer déconnexion</button>
      </div>

      <div style={{ marginTop: 12 }}>{status}</div>
    </div>
  );
}

