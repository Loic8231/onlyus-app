import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// === Onboarding / auth flow ===
import Home from "./screens/Home";
import Rules from "./screens/Rules";
import FindSpecial from "./screens/FindSpecial";
import Signup from "./screens/Signup";
import SignupEmail from "./screens/SignupEmail";
import VerifyCode from "./screens/VerifyCode";
import CreateProfile from "./screens/CreateProfile";
import Preferences from "./screens/Preferences";
import Interests from "./screens/Interests";

// === Discover & profil ===
import Discover from "./screens/Discover";
import ProfileDetails from "./screens/ProfileDetails";

// === Match / Chat ===
import Match from "./screens/Match";
import Chat from "./screens/Chat";
import EndMatchModal from "./screens/EndMatchModal";
import MatchEnded from "./screens/MatchEnded";

// === Appels vocaux ===
import VoiceCall from "./screens/VoiceCall";
import CallEnded from "./screens/CallEnded";

// === Paramètres ===
import SettingsHome from "./screens/SettingsHome";
import SettingsAccount from "./screens/SettingsAccount";
import SettingsNotifications from "./screens/SettingsNotifications";
import SettingsPrivacy from "./screens/SettingsPrivacy";
import SettingsHelp from "./screens/SettingsHelp";
import About from "./screens/About";

// === Test Supabase ===
import MessageTest from "./screens/MessageTest";

// (Optionnel) composant wrapper pour gérer la redirection initiale
function EntryRedirect() {
  const hasOngoingMatch = localStorage.getItem("hasMatch") === "true";
  if (hasOngoingMatch) return <Navigate to="/chat" replace />;
  return <Navigate to="/discover" replace />;
}

const router = createBrowserRouter([
  // Point d’entrée
  { path: "/", element: <EntryRedirect /> },

  // Onboarding / première connexion
  { path: "/home", element: <Home /> },
  { path: "/rules", element: <Rules /> },
  { path: "/find-special", element: <FindSpecial /> },
  { path: "/signup", element: <Signup /> },
  { path: "/signup-email", element: <SignupEmail /> },
  { path: "/verify-code", element: <VerifyCode /> },
  { path: "/create-profile", element: <CreateProfile /> },
  { path: "/preferences", element: <Preferences /> },
  { path: "/interests", element: <Interests /> },

  // Découverte & profil
  { path: "/discover", element: <Discover /> },
  { path: "/profile-details", element: <ProfileDetails /> },

  // Match → Chat
  { path: "/match", element: <Match /> },
  { path: "/chat", element: <Chat /> },
  { path: "/end-match", element: <EndMatchModal /> },
  { path: "/match-ended", element: <MatchEnded /> },

  // Appel vocal
  { path: "/voice-call", element: <VoiceCall /> },
  { path: "/call-ended", element: <CallEnded /> },

  // Paramètres
  { path: "/settings", element: <SettingsHome /> },
  { path: "/settings/account", element: <SettingsAccount /> },
  { path: "/settings/notifications", element: <SettingsNotifications /> },
  { path: "/settings/privacy", element: <SettingsPrivacy /> },
  { path: "/settings/help", element: <SettingsHelp /> },
  { path: "/settings/about", element: <About /> },

  // Test Supabase
  { path: "/test", element: <MessageTest /> },

  // 404 → on renvoie sur l’entrée
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

