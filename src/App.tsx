// src/App.tsx
import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";

/**
 * 1) IMPORTS DES ÉCRANS
 */
import Login from "./screens/Login";
import Register from "./screens/Register";
import Home from "./screens/Home";
import Rules from "./screens/Rules";
import Signup from "./screens/Signup";
import SignupEmail from "./screens/SignupEmail";
import VerifyCode from "./screens/VerifyCode";
import CreateProfile from "./screens/CreateProfile";
import Preferences from "./screens/Preferences";
import Interests from "./screens/Interests";

import Discover from "./screens/Discover";
import ProfileDetails from "./screens/ProfileDetails";
import Match from "./screens/Match";
import Chat from "./screens/Chat";
import MessageTest from "./screens/MessageTest";
import UserProfile from "./screens/UserProfile";

import EndMatchModal from "./screens/EndMatchModal";
import MatchEnded from "./screens/MatchEnded";

import VoiceCall from "./screens/VoiceCall";

import SettingsHome from "./screens/SettingsHome";
import SettingsAccount from "./screens/SettingsAccount";
import SettingsNotifications from "./screens/SettingsNotifications";
import SettingsPrivacy from "./screens/SettingsPrivacy";
import SettingsHelp from "./screens/SettingsHelp";
import About from "./screens/About";
import CreateUsersTest from "./screens/CreateUsersTest";

/**
 * 2) REDIRECT + GARDE
 */
import StartupRedirect from "./screens/StartupRedirect";

/** ✅ Garde locale (remplace l'ancien import ./components/ProtectedRoute) */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        setAuthed(!!data.user);
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return <div style={{ padding: 16, color: "#fff" }}>Chargement…</div>;
  }
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div style={{ padding: 16, color: "#fff" }}>Chargement…</div>}>
      {children}
    </Suspense>
  );
}

/**
 * 3) APP
 */
export default function App() {
  const location = useLocation();

  return (
    <Shell>
      <div className="app-safe">
        <div key={location.pathname} className="route-fade">
          <Routes location={location}>
            {/* Démarrage intelligent */}
            <Route path="/" element={<StartupRedirect />} />

            {/* Pages publiques / onboarding */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/signup-email" element={<SignupEmail />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/interests" element={<Interests />} />

            {/* Espace protégé */}
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile-details"
              element={
                <ProtectedRoute>
                  <ProfileDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match"
              element={
                <ProtectedRoute>
                  <Match />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <MessageTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Chat & fin de match */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/end-match"
              element={
                <ProtectedRoute>
                  <EndMatchModal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match-ended"
              element={
                <ProtectedRoute>
                  <MatchEnded />
                </ProtectedRoute>
              }
            />

            {/* Appel vocal */}
            <Route
              path="/voice-call"
              element={
                <ProtectedRoute>
                  <VoiceCall />
                </ProtectedRoute>
              }
            />

            {/* Paramètres */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/account"
              element={
                <ProtectedRoute>
                  <SettingsAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute>
                  <SettingsNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/privacy"
              element={
                <ProtectedRoute>
                  <SettingsPrivacy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/help"
              element={
                <ProtectedRoute>
                  <SettingsHelp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-users"
              element={
                <ProtectedRoute>
                  <CreateUsersTest />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Shell>
  );
}
