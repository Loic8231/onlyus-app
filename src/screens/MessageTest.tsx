import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// ⚠️ Renseigne tes vrais UUID (profiles.id)
const SENDER   = "9136521c-2a44-461d-9def-acb34244efd5";   // Alice
const RECEIVER = "e54b5dcb-22a4-4bd1-884f-cc546ec033c0";   // Bob
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Msg = {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  content: string;
};

export default function MessageTest() {
  const [content, setContent] = useState("Bonjour !");
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  // Charger uniquement la conversation SENDER <-> RECEIVER
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${SENDER},receiver_id.eq.${RECEIVER}),and(sender_id.eq.${RECEIVER},receiver_id.eq.${SENDER})`
        )
        .order("created_at", { ascending: true });
      if (!error && data) setMessages(data as Msg[]);
      if (error) setStatus("Erreur chargement: " + error.message);
    })();
  }, []);

  // Realtime (INSERT) — on filtre côté client pour cette paire
  useEffect(() => {
    const channel = supabase
      .channel("messages-insert")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (p) => {
          const m = p.new as Msg;
          const isPair =
            (m.sender_id === SENDER && m.receiver_id === RECEIVER) ||
            (m.sender_id === RECEIVER && m.receiver_id === SENDER);
          if (isPair) setMessages(prev => [...prev, m]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = async () => {
    // Vérif format UUID
    if (!UUID_RE.test(SENDER) || !UUID_RE.test(RECEIVER)) {
      setStatus("⚠️ Renseigne SENDER/RECEIVER avec de VRAIS UUID.");
      return;
    }
    if (!content.trim()) {
      setStatus("Message vide.");
      return;
    }

    setStatus("Vérification des profils…");
    const { data: profs, error: checkErr } = await supabase
      .from("profiles")
      .select("id")
      .in("id", [SENDER, RECEIVER]);

    if (checkErr) {
      setStatus("Erreur : " + checkErr.message);
      return;
    }
    if (!profs || profs.length !== 2) {
      setStatus("⚠️ Profils introuvables (vérifie les UUID).");
      return;
    }

    setStatus("Envoi…");
    const { error } = await supabase.from("messages").insert([
      { sender_id: SENDER, receiver_id: RECEIVER, content: content.trim() },
    ]);
    if (error) {
      setStatus("Erreur : " + error.message);
    } else {
      setStatus("Message envoyé !");
      setContent("");
    }
  };

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h2>Test messages (users réels)</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ton message"
          style={{ padding: 8, width: 320 }}
        />
        <button onClick={sendMessage}>Envoyer</button>
      </div>

      <div style={{ marginBottom: 12 }}>{status}</div>

      <div style={{ fontFamily: "monospace", fontSize: 14 }}>
        {messages.map((m) => (
          <div key={m.id}>
            <b>{m.sender_id.slice(0, 8)}</b> → <b>{m.receiver_id.slice(0, 8)}</b> : {m.content}
          </div>
        ))}
      </div>
    </div>
  );
}
