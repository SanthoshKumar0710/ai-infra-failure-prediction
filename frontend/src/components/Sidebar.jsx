import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Server,
  LineChart,
  BrainCircuit,
  Bell,
  BarChart3,
  Settings,
  User,
  Activity,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { getMe, logoutUser } from "../api/auth";

function Sidebar() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        // Fall back to placeholder identity below
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navigation = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Servers", path: "/servers", icon: Server },
    { label: "Metrics", path: "/metrics", icon: LineChart },
    { label: "Predictions", path: "/predictions", icon: BrainCircuit },
    { label: "Alerts", path: "/alerts", icon: Bell },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Settings", path: "/settings", icon: Settings },
    { label: "Profile", path: "/profile", icon: User },
  ];

  const displayName = profile?.full_name || "Admin User";
  const displayEmail = profile?.email || "admin@example.com";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "AU";

  return (
    <aside className="sidebar">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="brand">
        <div className="brand-icon">
          <Activity size={20} />
        </div>

        <div>
          <strong>AI Infra Monitor</strong>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="sidebar-menu">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span className="menu-icon">
              <Icon size={18} />
            </span>

            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* =====================================================
          BOTTOM PROFILE CARD
      ===================================================== */}

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>

        <div className="sidebar-user-info">
          <strong>{displayName}</strong>
          <small>{displayEmail}</small>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          title="Log out"
          onClick={async () => {
            await logoutUser();
            window.location.href = "/";
          }}
        >
          <LogOut size={16} />
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;
