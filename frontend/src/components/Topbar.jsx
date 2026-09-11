import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Activity,
  X,
} from "lucide-react";

import { getAlerts } from "../api/alerts";

function Topbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "dark";
  });

  // Check for unread alerts
  useEffect(() => {
    let isMounted = true;

    getAlerts(20, 0, true)
      .then((alerts) => {
        if (isMounted && Array.isArray(alerts)) {
          setUnreadCount(alerts.length);
        }
      })
      .catch(() => {
        // Ignore telemetry polling errors
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize theme from storage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
  }, [theme]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/servers?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/servers");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
  };

  return (
    <header className="topbar">
      <style>{`
        .search-form {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-clear-btn {
          background: transparent;
          border: 0;
          color: #64748b;
          cursor: pointer;
          display: grid;
          place-items: center;
          padding: 2px;
          border-radius: 4px;
          margin-left: 6px;
        }

        .search-clear-btn:hover {
          color: #cbd5e1;
        }

        .topbar-bell-btn {
          position: relative;
        }

        .topbar-badge-dot {
          position: absolute;
          top: 6px;
          right: 7px;
          min-width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
        }

        .topbar-badge-count {
          position: absolute;
          top: -3px;
          right: -3px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          border-radius: 10px;
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          display: grid;
          place-items: center;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
        }

        .icon-button:hover {
          border-color: rgba(99, 102, 241, 0.4);
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .system-status-interactive {
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
          outline: none;
        }

        .system-status-interactive:hover {
          transform: translateY(-1px);
          border-color: rgba(38, 211, 145, 0.4);
          background: rgba(38, 211, 145, 0.14);
        }

        /* Light Theme Overrides */
        body.theme-light {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }

        body.theme-light .topbar {
          background: rgba(255, 255, 255, 0.85);
          border-bottom: 1px solid #e2e8f0;
        }

        body.theme-light .search-box {
          background: rgba(15, 23, 42, 0.05);
          border-color: #cbd5e1;
          color: #475569;
        }

        body.theme-light .search-box input {
          color: #0f172a;
        }

        body.theme-light .search-box input::placeholder {
          color: #94a3b8;
        }

        body.theme-light .icon-button {
          background: rgba(15, 23, 42, 0.05);
          border-color: #cbd5e1;
          color: #475569;
        }

        body.theme-light .icon-button:hover {
          background: rgba(15, 23, 42, 0.1);
          color: #0f172a;
        }
      `}</style>

      {/* SEARCH INFRASTRUCTURE */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-box">
          <Search size={18} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search infrastructure..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search infrastructure servers"
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setQuery("")}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* TOPBAR ACTIONS */}
      <div className="topbar-actions">
        {/* Alerts Button */}
        <button
          type="button"
          className="icon-button topbar-bell-btn"
          onClick={() => navigate("/alerts")}
          title={`View Alerts${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          aria-label="Alerts and notifications"
        >
          <Bell size={19} />
          {unreadCount > 0 ? (
            <span className="topbar-badge-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
          ) : (
            <span className="topbar-badge-dot"></span>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="icon-button"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Moon size={19} /> : <Sun size={19} color="#f59e0b" />}
        </button>

        {/* System Telemetry Status */}
        <div
          className="system-status system-status-interactive"
          onClick={() => navigate("/metrics")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/metrics");
            }
          }}
          title="Telemetry Status: Online (Click to view live Metrics)"
        >
          <Activity size={16} />
          System Online
        </div>
      </div>
    </header>
  );
}

export default Topbar;