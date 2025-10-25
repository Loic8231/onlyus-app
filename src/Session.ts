// src/session.ts

export type Session = {
  loggedIn: boolean;
  hasActiveMatch: boolean;
};

// 🔹 Lire l'état depuis localStorage
export function getSession(): Session {
  try {
    const raw = localStorage.getItem("session");
    if (!raw) return { loggedIn: false, hasActiveMatch: false };
    return JSON.parse(raw) as Session;
  } catch {
    return { loggedIn: false, hasActiveMatch: false };
  }
}

// 🔹 Sauvegarder l'état
export function setSession(next: Session) {
  localStorage.setItem("session", JSON.stringify(next));
}

// 🔹 Reset complet
export function clearSession() {
  localStorage.removeItem("session");
}
