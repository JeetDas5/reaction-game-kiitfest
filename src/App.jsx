import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Authenticate from "./Authenticate";
import Homepage from "./Homepage";
import Game from "./Game";
import Result from "./result";
import Leaderboard from "./Leaderboard";
import Admin from "./Admin";
import ProtectedRoute from "./middleware/ProtectedRoute";

const SESSION_KEY = "kf_current_user";

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { kfid: "" };
}

export default function App() {
  const [currentUser, setCurrentUserState] = useState(loadSession);

  // Wrap setter so every auth update is also persisted to sessionStorage
  const setCurrentUser = useCallback((user) => {
    setCurrentUserState(user);
    try {
      if (user && user.kfid) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {}
  }, []);

  return (
    <div className="overflow-hidden antialiased text-neutral-200 selection:bg-neutral-200 selection:text-neutral-800 w-full h-full">
      <Router>
        <Routes>
          {/* 1. Login Page - Pass the state setter so Authenticate can update the user */}
          <Route
            path="/"
            element={
              <Authenticate
                setCurrentUser={setCurrentUser}
                currentUser={currentUser}
              />
            }
          />

          {/* 2. Selection Page */}
          <Route
            path="/home"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <Homepage currentUser={currentUser} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <Game currentUser={currentUser} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/result"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <Result currentUser={currentUser} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <Leaderboard currentUser={currentUser} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute currentUser={currentUser}>
                <Admin currentUser={currentUser} />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}
