import { useEffect, useState, useCallback } from "react";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Thermometer,
  Activity,
  RefreshCw,
  Plus,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { getMetrics, createMetric } from "../api/metrics";
import { getServers } from "../api/servers";
import PageLayout from "../components/PageLayout";

function Metrics({ currentUser }) {
  const [metrics, setMetrics] = useState([]);
  const [servers, setServers] = useState([]);
  const [selectedServerId, setSelectedServerId] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submit Metric Form State
  const [serverId, setServerId] = useState("");
  const [cpuUsage, setCpuUsage] = useState("45.5");
  const [memoryUsage, setMemoryUsage] = useState("60.0");
  const [diskUsage, setDiskUsage] = useState("50.0");
  const [networkUsage, setNetworkUsage] = useState("120.0");
  const [temperature, setTemperature] = useState("55.0");
  const [runningProcesses, setRunningProcesses] = useState("150");
  const [diskReadSpeed, setDiskReadSpeed] = useState("50.0");
  const [diskWriteSpeed, setDiskWriteSpeed] = useState("30.0");
  const [swapUsage, setSwapUsage] = useState("10.0");
  const [networkLatency, setNetworkLatency] = useState("15.0");
  const [packetLoss, setPacketLoss] = useState("0.1");
  const [uptimeHours, setUptimeHours] = useState("720");
  const [errorLogs, setErrorLogs] = useState("2");
  const [warningLogs, setWarningLogs] = useState("5");
  const [criticalLogs, setCriticalLogs] = useState("0");
  const [powerConsumption, setPowerConsumption] = useState("250.0");
  const [gpuUsage, setGpuUsage] = useState("20.0");
  const [fanSpeed, setFanSpeed] = useState("2500");
  const [formError, setFormError] = useState("");

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const [metricsData, serversData] = await Promise.all([
        getMetrics(),
        getServers().catch(() => []),
      ]);

      setMetrics(Array.isArray(metricsData) ? metricsData : []);
      setServers(Array.isArray(serversData) ? serversData : []);
      if (serversData.length > 0 && !serverId) {
        setServerId(serversData[0].id);
      }
    } catch (err) {
      console.error("Failed to load metrics data:", err);
      setError(
        err.response?.data?.detail || "Unable to load infrastructure metrics from backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serverId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateMetric = async (e) => {
    e.preventDefault();
    if (!serverId) {
      setFormError("Please select a server.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      await createMetric({
        server_id: serverId,
        cpu_usage: parseFloat(cpuUsage),
        memory_usage: parseFloat(memoryUsage),
        disk_usage: parseFloat(diskUsage),
        network_usage: parseFloat(networkUsage),
        temperature: parseFloat(temperature),
        running_processes: parseInt(runningProcesses, 10),
        disk_read_speed: parseFloat(diskReadSpeed),
        disk_write_speed: parseFloat(diskWriteSpeed),
        swap_usage: parseFloat(swapUsage),
        network_latency: parseFloat(networkLatency),
        packet_loss: parseFloat(packetLoss),
        uptime_hours: parseFloat(uptimeHours),
        error_logs: parseInt(errorLogs, 10),
        warning_logs: parseInt(warningLogs, 10),
        critical_logs: parseInt(criticalLogs, 10),
        power_consumption: parseFloat(powerConsumption),
        gpu_usage: parseFloat(gpuUsage),
        fan_speed: parseFloat(fanSpeed),
      });

      setShowAddModal(false);
      loadData(true);
    } catch (err) {
      console.error("Failed to submit metric:", err);
      setFormError(
        err.response?.data?.detail || err.message || "Failed to submit metric snapshot."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMetrics = metrics.filter(
    (m) => selectedServerId === "ALL" || m.server_id === selectedServerId
  );

  const latestMetric = filteredMetrics[0] || metrics[0];

  const statCards = [
    {
      title: "CPU Usage",
      value: latestMetric ? `${latestMetric.cpu_usage.toFixed(1)}%` : "0.0%",
      percent: latestMetric ? latestMetric.cpu_usage : 0,
      icon: Cpu,
      variant: "blue",
    },
    {
      title: "Memory Usage",
      value: latestMetric ? `${latestMetric.memory_usage.toFixed(1)}%` : "0.0%",
      percent: latestMetric ? latestMetric.memory_usage : 0,
      icon: MemoryStick,
      variant: "purple",
    },
    {
      title: "Disk Usage",
      value: latestMetric ? `${latestMetric.disk_usage.toFixed(1)}%` : "0.0%",
      percent: latestMetric ? latestMetric.disk_usage : 0,
      icon: HardDrive,
      variant: "orange",
    },
    {
      title: "Network Usage",
      value: latestMetric ? `${latestMetric.network_usage.toFixed(1)} MB/s` : "0.0 MB/s",
      percent: latestMetric ? Math.min((latestMetric.network_usage / 1000) * 100, 100) : 0,
      icon: Network,
      variant: "green",
    },
    {
      title: "Temperature",
      value: latestMetric ? `${(latestMetric.temperature || 0).toFixed(1)}°C` : "0°C",
      percent: latestMetric ? Math.min((latestMetric.temperature || 0), 100) : 0,
      icon: Thermometer,
      variant: "red",
    },
    {
      title: "Network Latency",
      value: latestMetric ? `${latestMetric.network_latency.toFixed(1)} ms` : "0 ms",
      percent: latestMetric ? Math.min((latestMetric.network_latency / 200) * 100, 100) : 0,
      icon: Activity,
      variant: "blue",
    },
  ];

  const chartData = [...filteredMetrics]
    .reverse()
    .slice(-20)
    .map((m) => ({
      time: new Date(m.collected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      CPU: m.cpu_usage,
      Memory: m.memory_usage,
      Disk: m.disk_usage,
    }));

  const canEdit = currentUser?.role === "operator" || currentUser?.role === "admin" || currentUser?.role === "ml_engineer";

  return (
    <PageLayout>
      <div className="page-header">
        <div>
          <div className="page-title-row">
            <Activity size={25} />
            <h1>Infrastructure Metrics</h1>
          </div>
          <p>Real-time infrastructure health metrics collected from monitored servers.</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={() => loadData(true)}
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
              Submit Metric
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-content">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button type="button" className="secondary-button" onClick={() => loadData(true)}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading glass-panel">
          <div className="loading-spinner"></div>
          <span>Loading live metric stream...</span>
        </div>
      ) : metrics.length === 0 ? (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "#8f96aa" }}>
          <Activity size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
          <h3>No metrics recorded yet</h3>
          <p>Submit your first server metric snapshot to trigger ML failure prediction.</p>
          {canEdit && (
            <button
              type="button"
              className="primary-button"
              style={{ marginTop: "16px" }}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> Submit Metric Snapshot
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="metrics-grid">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div className={`metric-card glass-${card.variant}`} key={card.title}>
                  <div className="metric-icon">
                    <Icon size={21} />
                  </div>
                  <div className="metric-name">{card.title}</div>
                  <div className="metric-value">{card.value}</div>
                  <div className="metric-bar">
                    <span style={{ width: `${Math.min(Math.max(card.percent, 0), 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-panel metrics-large-chart" style={{ padding: "24px" }}>
            <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3>Infrastructure Performance History</h3>
                <p>Real-time system telemetry</p>
              </div>

              {servers.length > 0 && (
                <select
                  value={selectedServerId}
                  onChange={(e) => setSelectedServerId(e.target.value)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "8px 12px",
                  }}
                >
                  <option value="ALL">All Monitored Servers</option>
                  {servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.hostname} ({s.ip_address})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ height: "300px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#656b80" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#656b80" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,18,35,0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="CPU" stroke="#48d7ff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Memory" stroke="#a78bfa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Disk" stroke="#fb923c" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* SUBMIT METRIC MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h2>Submit Infrastructure Metric</h2>
              <button type="button" className="close-button" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="login-error" style={{ marginBottom: "16px" }}>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMetric}>
              <div className="form-group">
                <label>Target Server *</label>
                <select value={serverId} onChange={(e) => setServerId(e.target.value)} required>
                  <option value="">Select a server...</option>
                  {servers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.hostname} ({s.ip_address})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label>CPU Usage (%)</label>
                  <input type="number" step="0.1" min="0" max="100" value={cpuUsage} onChange={(e) => setCpuUsage(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Memory Usage (%)</label>
                  <input type="number" step="0.1" min="0" max="100" value={memoryUsage} onChange={(e) => setMemoryUsage(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Disk Usage (%)</label>
                  <input type="number" step="0.1" min="0" max="100" value={diskUsage} onChange={(e) => setDiskUsage(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Network Usage (MB/s)</label>
                  <input type="number" step="0.1" min="0" value={networkUsage} onChange={(e) => setNetworkUsage(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input type="number" step="0.1" min="0" value={temperature} onChange={(e) => setTemperature(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Running Processes</label>
                  <input type="number" min="0" value={runningProcesses} onChange={(e) => setRunningProcesses(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Critical Logs Count</label>
                  <input type="number" min="0" value={criticalLogs} onChange={(e) => setCriticalLogs(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Error Logs Count</label>
                  <input type="number" min="0" value={errorLogs} onChange={(e) => setErrorLogs(e.target.value)} required />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Analyzing ML..." : "Submit & Predict"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default Metrics;