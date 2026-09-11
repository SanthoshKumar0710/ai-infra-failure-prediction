import { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Servers from "./pages/Servers";
import Predictions from "./pages/Predictions";
import Metrics from "./pages/Metrics";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import PredictionDetails from "./pages/PredictionDetails";

import { getMe, logoutUser } from "./api/auth";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setAuthenticated(false);
    }
  }, []);

  // Verify current authentication
  const verifyAuth = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    // No access token
    if (!token) {
      setAuthenticated(false);
      setUser(null);
      setCheckingAuth(false);
      return;
    }

    try {
      const userData = await getMe();

      setUser(userData);
      setAuthenticated(true);
    } catch (err) {
      console.error("Authentication validation failed:", err);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      setUser(null);
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  // Check authentication when application starts
  useEffect(() => {
    verifyAuth();

    const handleAuthLogoutEvent = () => {
      setUser(null);
      setAuthenticated(false);
    };

    window.addEventListener(
      "auth_logout",
      handleAuthLogoutEvent
    );

    return () => {
      window.removeEventListener(
        "auth_logout",
        handleAuthLogoutEvent
      );
    };
  }, [verifyAuth]);

  // Called after successful login
  const handleLoginSuccess = useCallback(() => {
    verifyAuth();
  }, [verifyAuth]);

  // Show loading screen while checking authentication
  if (checkingAuth) {
    return (
      <div className="login-page">
        <div
          className="login-card glass-panel"
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >
          <div
            className="loading-spinner"
            style={{
              margin: "0 auto 16px",
            }}
          />

          <span>Verifying platform session...</span>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!authenticated) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // Authenticated application
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Dashboard
        ========================== */}
        <Route
          path="/"
          element={
            <Dashboard
              onLogout={handleLogout}
              currentUser={user}
            />
          }
        />

        {/* =========================
            Servers
        ========================== */}
        <Route
          path="/servers"
          element={
            <Servers
              currentUser={user}
            />
          }
        />

        {/* =========================
            Predictions
        ========================== */}
        <Route
          path="/predictions"
          element={
            <Predictions
              currentUser={user}
            />
          }
        />

        {/* =========================
            Prediction Details
        ========================== */}
        <Route
          path="/predictions/:predictionId"
          element={
            <PredictionDetails
              currentUser={user}
            />
          }
        />

        {/* =========================
            Metrics
        ========================== */}
        <Route
          path="/metrics"
          element={
            <Metrics
              currentUser={user}
            />
          }
        />

        {/* =========================
            Alerts
        ========================== */}
        <Route
          path="/alerts"
          element={
            <Alerts
              currentUser={user}
            />
          }
        />

        {/* =========================
            Analytics
        ========================== */}
        <Route
          path="/analytics"
          element={
            <Analytics
              currentUser={user}
            />
          }
        />

        {/* =========================
            Settings
        ========================== */}
        <Route
          path="/settings"
          element={
            <Settings
              currentUser={user}
            />
          }
        />

        {/* =========================
            Profile
        ========================== */}
        <Route
          path="/profile"
          element={
            <Profile
              currentUser={user}
            />
          }
        />

        {/* =========================
            Fallback
        ========================== */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;