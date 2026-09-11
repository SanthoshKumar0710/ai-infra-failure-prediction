import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { getAlerts, markAlertRead, deleteAlert } from "../api/alerts";
import PageLayout from "../components/PageLayout";

function Alerts({ currentUser }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const loadAlertsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const data = await getAlerts(100, 0, unreadOnly);
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load alerts:", err);
      setError(
        err.response?.data?.detail || "Unable to load infrastructure alerts from backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    loadAlertsData();
  }, [loadAlertsData]);

  const handleMarkRead = async (alertId) => {
    try {
      await markAlertRead(alertId);
      loadAlertsData(true);
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await deleteAlert(alertId);
      loadAlertsData(true);
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  const canDelete = currentUser?.role === "admin";

  return (
    <PageLayout>
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <Bell size={25} />
            <h1>Alerts & Notifications</h1>
          </div>
          <p>Real-time infrastructure alerts generated from AI failure predictions.</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={() => loadAlertsData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="glass-panel server-controls" style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          type="button"
          className={`filter ${!unreadOnly ? "active" : ""}`}
          onClick={() => setUnreadOnly(false)}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          type="button"
          className={`filter ${unreadOnly ? "active" : ""}`}
          onClick={() => setUnreadOnly(true)}
        >
          Unread Alerts
        </button>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-content">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button type="button" className="secondary-button" onClick={() => loadAlertsData(true)}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading glass-panel">
          <div className="loading-spinner"></div>
          <span>Loading infrastructure alerts...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "#8f96aa" }}>
          <Bell size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
          <h3>No alerts found</h3>
          <p>Your infrastructure is operating normally with no active warnings or critical failure alerts.</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => {
            const severity = alert.severity?.toLowerCase() || "warning";
            const Icon =
              severity === "critical"
                ? ShieldAlert
                : severity === "warning"
                ? AlertTriangle
                : Info;

            return (
              <div
                className={`glass-panel alert-card ${severity} ${alert.is_read ? "read" : "unread"}`}
                key={alert.id}
                style={{
                  opacity: alert.is_read ? 0.75 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div className="alert-icon">
                    <Icon size={21} />
                  </div>

                  <div className="alert-content">
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "15px" }}>
                      {alert.title}{" "}
                      {!alert.is_read && (
                        <span
                          style={{
                            background: "#38bdf8",
                            color: "#0f172a",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "10px",
                            marginLeft: "8px",
                            textTransform: "uppercase",
                          }}
                        >
                          New
                        </span>
                      )}
                    </h3>
                    <p style={{ margin: 0, color: "#8f96aa", fontSize: "13px" }}>{alert.message}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span className="alert-time" style={{ fontSize: "12px", color: "#64748b" }}>
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>

                  {!alert.is_read && (
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                      title="Mark as Read"
                      onClick={() => handleMarkRead(alert.id)}
                    >
                      <CheckCircle2 size={14} /> Read
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      className="table-action danger"
                      title="Delete Alert"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}

export default Alerts;