import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Bell,
  BrainCircuit,
  ShieldCheck,
  Server,
  X,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";

import PageLayout from "../components/PageLayout";

function Settings({ currentUser }) {
  const navigate = useNavigate();
  const [showGeneralModal, setShowGeneralModal] = useState(false);

  const settings = [
    {
      id: "general",
      icon: SettingsIcon,
      title: "General Settings",
      description: "Configure general system settings and platform environment.",
      actionLabel: "View Details",
      isModal: true,
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notification Settings",
      description: "Manage alerts, thresholds, and infrastructure notifications.",
      actionLabel: "Open Alerts",
      route: "/alerts",
    },
    {
      id: "ai_model",
      icon: BrainCircuit,
      title: "AI Model Settings",
      description: "Configure prediction models and view intelligence metrics.",
      actionLabel: "Open Predictions",
      route: "/predictions",
    },
    {
      id: "security",
      icon: ShieldCheck,
      title: "Security Settings",
      description: "Manage authentication, RBAC roles, and security credentials.",
      actionLabel: "Open Profile",
      route: "/profile",
    },
    {
      id: "system",
      icon: Server,
      title: "System Settings",
      description: "Configure infrastructure servers, environments, and preferences.",
      actionLabel: "Open Servers",
      route: "/servers",
    },
  ];

  const handleSettingClick = (setting) => {
    if (setting.isModal) {
      setShowGeneralModal(true);
    } else if (setting.route) {
      navigate(setting.route);
    }
  };

  const handleKeyDown = (e, setting) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSettingClick(setting);
    }
  };

  return (
    <PageLayout>
      <style>{`
        .setting-item-interactive {
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          outline: none;
          position: relative;
        }

        .setting-item-interactive:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.4) !important;
          box-shadow: 0 8px 24px -6px rgba(99, 102, 241, 0.25);
          background: rgba(18, 25, 46, 0.75) !important;
        }

        .setting-item-interactive:focus-visible {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.35);
        }

        .setting-action-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .setting-action-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
          font-size: 12px;
          font-weight: 500;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .setting-item-interactive:hover .setting-action-badge {
          background: rgba(99, 102, 241, 0.22);
          border-color: rgba(99, 102, 241, 0.45);
          color: #ffffff;
        }

        /* Modal Dialog */
        .settings-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(4, 7, 17, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          box-sizing: border-box;
        }

        .settings-modal-card {
          width: 100%;
          max-width: 540px;
          background: rgba(13, 20, 38, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 28px 30px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.2);
          color: #f1f5f9;
          animation: modalFadeIn 0.2s ease;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .settings-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .settings-modal-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
        }

        .settings-modal-close-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .settings-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .settings-param-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .settings-param-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          background: rgba(7, 11, 24, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          font-size: 13.5px;
        }

        .settings-param-label {
          color: #94a3b8;
          font-weight: 500;
        }

        .settings-param-value {
          color: #f1f5f9;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .settings-param-value.status-online {
          color: #34d399;
        }

        .settings-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>

      <div className="page-header">
        <div>
          <div className="page-title-row">
            <SettingsIcon size={25} />
            <h1>Settings</h1>
          </div>
          <p>Configure your AI infrastructure platform.</p>
        </div>
      </div>

      <div className="settings-list">
        {settings.map((setting) => {
          const Icon = setting.icon;

          return (
            <div
              className="glass-panel setting-item setting-item-interactive"
              key={setting.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSettingClick(setting)}
              onKeyDown={(e) => handleKeyDown(e, setting)}
              aria-label={`${setting.title}: ${setting.description}`}
            >
              <div className="setting-icon">
                <Icon size={20} />
              </div>

              <div className="setting-content">
                <h3>{setting.title}</h3>
                <p>{setting.description}</p>
              </div>

              <div className="setting-action-group">
                <span className="setting-action-badge">
                  {setting.actionLabel}
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* General Settings Platform Configuration Modal */}
      {showGeneralModal && (
        <div
          className="settings-modal-backdrop"
          onClick={() => setShowGeneralModal(false)}
        >
          <div
            className="settings-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="general-settings-title"
          >
            <div className="settings-modal-header">
              <h2 id="general-settings-title">
                <Sliders size={20} color="#818cf8" />
                General System Settings
              </h2>
              <button
                type="button"
                className="settings-modal-close-btn"
                onClick={() => setShowGeneralModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-param-grid">
              <div className="settings-param-row">
                <span className="settings-param-label">Platform Suite</span>
                <span className="settings-param-value">InfraSafe AI v1.0.0</span>
              </div>

              <div className="settings-param-row">
                <span className="settings-param-label">System State</span>
                <span className="settings-param-value status-online">
                  <CheckCircle2 size={15} />
                  Operational
                </span>
              </div>

              <div className="settings-param-row">
                <span className="settings-param-label">Backend API URL</span>
                <span className="settings-param-value" style={{ fontFamily: "monospace", fontSize: 12 }}>
                  http://localhost:8000/api/v1
                </span>
              </div>

              <div className="settings-param-row">
                <span className="settings-param-label">Active Operator</span>
                <span className="settings-param-value">
                  {currentUser?.full_name || "Administrator"} ({currentUser?.email || "admin@example.com"})
                </span>
              </div>

              <div className="settings-param-row">
                <span className="settings-param-label">Access Role</span>
                <span className="settings-param-value" style={{ textTransform: "capitalize" }}>
                  {currentUser?.role || "admin"}
                </span>
              </div>

              <div className="settings-param-row">
                <span className="settings-param-label">Interface Theme</span>
                <span className="settings-param-value">Infrastructure Dark Mode</span>
              </div>

              <div className="settings-param-row">
                <span className="settings-param-label">Live Telemetry</span>
                <span className="settings-param-value status-online">
                  <Info size={14} />
                  Active Polling (30s)
                </span>
              </div>
            </div>

            <div className="settings-modal-footer">
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowGeneralModal(false)}
                style={{ padding: "8px 20px", fontSize: 13 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default Settings;