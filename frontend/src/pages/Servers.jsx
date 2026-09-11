import { useEffect, useState, useCallback } from "react";
import {
  Server,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

import { getServers, createServer, deleteServer } from "../api/servers";
import PageLayout from "../components/PageLayout";

function Servers({ currentUser }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(() => {
    return new URLSearchParams(window.location.search).get("search") || "";
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("Ubuntu 22.04 LTS");
  const [environment, setEnvironment] = useState("development");
  const [serverStatus, setServerStatus] = useState("online");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadServersData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const data = await getServers();
      setServers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load servers:", err);
      setError(
        err.response?.data?.detail || "Unable to load infrastructure servers from backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadServersData();
  }, [loadServersData]);

  const handleAddServer = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      await createServer({
        hostname,
        ip_address: ipAddress,
        operating_system: operatingSystem,
        environment,
        status: serverStatus,
        description: description || undefined,
      });

      setShowAddModal(false);
      setHostname("");
      setIpAddress("");
      setDescription("");
      loadServersData(true);
    } catch (err) {
      console.error("Failed to create server:", err);
      setFormError(
        err.response?.data?.detail || err.message || "Failed to create server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteServer = async (serverId, hostname) => {
    if (!window.confirm(`Are you sure you want to delete server '${hostname}'?`)) {
      return;
    }

    try {
      await deleteServer(serverId);
      loadServersData(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete server.");
    }
  };

  const filteredServers = servers.filter((srv) => {
    const matchesSearch =
      srv.hostname.toLowerCase().includes(search.toLowerCase()) ||
      srv.ip_address.toLowerCase().includes(search.toLowerCase()) ||
      srv.operating_system.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      srv.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const canEdit = currentUser?.role === "operator" || currentUser?.role === "admin" || currentUser?.role === "ml_engineer";
  const canDelete = currentUser?.role === "admin";

  return (
    <PageLayout>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <Server size={25} />
            <h1>Servers</h1>
          </div>
          <p>Manage and monitor live infrastructure servers from backend.</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={() => loadServersData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          {canEdit && (
            <button
              type="button"
              className="primary-button"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={17} />
              Add Server
            </button>
          )}
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="glass-panel server-controls">
        <div className="search-box">
          <Search size={17} />
          <input
            placeholder="Search by hostname, IP, OS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          {["ALL", "ONLINE", "OFFLINE", "MAINTENANCE"].map((statusKey) => (
            <button
              key={statusKey}
              type="button"
              className={`filter ${statusFilter === statusKey ? "active" : ""}`}
              onClick={() => setStatusFilter(statusKey)}
            >
              {statusKey.charAt(0) + statusKey.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => loadServersData(true)}
          >
            Retry
          </button>
        </div>
      )}

      {/* SERVER LIST / TABLE */}
      {loading ? (
        <div className="loading glass-panel">
          <div className="loading-spinner"></div>
          <span>Loading servers from database...</span>
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "#8f96aa" }}>
          <Server size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
          <h3>No servers found</h3>
          <p>
            {servers.length === 0
              ? "No infrastructure servers have been registered yet."
              : "No servers match your search filter."}
          </p>
          {servers.length === 0 && canEdit && (
            <button
              type="button"
              className="primary-button"
              style={{ marginTop: "16px" }}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> Register First Server
            </button>
          )}
        </div>
      ) : (
        <div className="glass-panel table-panel">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>IP Address</th>
                  <th>Operating System</th>
                  <th>Environment</th>
                  <th>Status</th>
                  <th>Registered</th>
                  {canDelete && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredServers.map((server) => (
                  <tr key={server.id}>
                    <td>
                      <strong>{server.hostname}</strong>
                      {server.description && (
                        <div style={{ fontSize: "11px", color: "#8f96aa" }}>{server.description}</div>
                      )}
                    </td>
                    <td>{server.ip_address}</td>
                    <td>{server.operating_system}</td>
                    <td>
                      <span className="environment-badge">
                        {server.environment}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${server.status.toLowerCase()}`}>
                        {server.status}
                      </span>
                    </td>
                    <td>
                      {new Date(server.created_at).toLocaleDateString()}
                    </td>
                    {canDelete && (
                      <td>
                        <button
                          type="button"
                          className="table-action danger"
                          title="Delete Server"
                          onClick={() => handleDeleteServer(server.id, server.hostname)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD SERVER MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>Register New Server</h2>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="login-error" style={{ marginBottom: "16px" }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddServer}>
              <div className="form-group">
                <label>Hostname *</label>
                <input
                  type="text"
                  placeholder="srv-web-prod-01"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>IP Address *</label>
                <input
                  type="text"
                  placeholder="10.0.1.45"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Operating System</label>
                <input
                  type="text"
                  value={operatingSystem}
                  onChange={(e) => setOperatingSystem(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                >
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              <div className="form-group">
                <label>Initial Status</label>
                <select
                  value={serverStatus}
                  onChange={(e) => setServerStatus(e.target.value)}
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Primary web tier application server"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Server"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default Servers;