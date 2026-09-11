import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  BrainCircuit,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Activity,
  RefreshCw,
  Cpu,
  Clock,
  Layers,
} from "lucide-react";

import PageLayout from "../components/PageLayout";
import { getPrediction } from "../api/predictions";

function PredictionDetails() {
  const { predictionId } = useParams();
  const navigate = useNavigate();

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPrediction = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const data = await getPrediction(predictionId);
      setPrediction(data);
    } catch (err) {
      console.error("Failed to load prediction:", err);
      setError("Unable to load prediction details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [predictionId]);

  useEffect(() => {
    if (predictionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPrediction();
    }
  }, [predictionId, loadPrediction]);

  if (loading) {
    return (
      <PageLayout>
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <div className="loading-spinner" style={{ margin: "0 auto 16px" }} />
          <span style={{ color: "#94a3b8", fontSize: "14px" }}>
            Loading prediction intelligence telemetry...
          </span>
        </div>
      </PageLayout>
    );
  }

  if (error || !prediction) {
    return (
      <PageLayout>
        <div
          className="glass-panel"
          style={{
            padding: "48px 32px",
            textAlign: "center",
            maxWidth: "540px",
            margin: "40px auto",
            borderRadius: "20px",
          }}
        >
          <ShieldAlert size={36} color="#f87171" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: "20px", margin: "0 0 8px 0", color: "#ffffff" }}>
            Prediction Unavailable
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 24px 0" }}>
            {error || "The requested prediction could not be found."}
          </p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/predictions")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <ArrowLeft size={16} />
            Back to Predictions
          </button>
        </div>
      </PageLayout>
    );
  }

  const probability = Number(prediction.failure_probability || 0) * 100;
  const risk = prediction.risk_level?.toLowerCase() || "low";
  const failed = prediction.predicted_failure === true;
  const createdAt = prediction.created_at
    ? new Date(prediction.created_at).toLocaleString()
    : "Unknown";

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (Math.min(probability, 100) / 100) * circumference;

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "high":
      case "critical":
        return "#f87171";
      case "medium":
      case "moderate":
        return "#fbbf24";
      default:
        return "#34d399";
    }
  };

  const riskColor = getRiskColor(risk);

  return (
    <PageLayout>
      <style>{`
        .pred-details-wrap {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
        }

        .pred-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .pred-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pred-back-btn:hover {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.35);
          color: #ffffff;
        }

        .pred-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 20px;
          color: #34d399;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .pred-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 10px #34d399;
          animation: pulseDot 2s infinite ease-in-out;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        /* Hero Intelligence Card */
        .pred-hero-card {
          padding: 30px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          background:
            radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15), transparent 45%),
            rgba(13, 20, 38, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
        }

        .pred-hero-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .pred-hero-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
          flex-shrink: 0;
        }

        .pred-hero-title h1 {
          font-size: 26px;
          font-weight: 700;
          margin: 4px 0;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .pred-hero-title p {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .pred-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .pred-hero-badge.danger {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #f87171;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
        }

        .pred-hero-badge.safe {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        }

        /* Score & Overview Grid */
        .pred-score-card {
          padding: 32px;
          border-radius: 20px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 36px;
          align-items: center;
          background: rgba(13, 20, 38, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pred-ring-box {
          position: relative;
          width: 136px;
          height: 136px;
          display: grid;
          place-items: center;
        }

        .pred-ring-text {
          position: absolute;
          text-align: center;
        }

        .pred-ring-text strong {
          display: block;
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }

        .pred-ring-text span {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-top: 2px;
        }

        .pred-summary-content h2 {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .pred-summary-content p {
          font-size: 14.5px;
          line-height: 1.6;
          color: #94a3b8;
          margin: 0 0 20px 0;
          max-width: 650px;
        }

        .pred-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }

        .pred-meta-item span {
          display: block;
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
          margin-bottom: 4px;
        }

        .pred-meta-item strong {
          display: inline-flex;
          align-items: center;
          font-size: 14.5px;
          font-weight: 600;
          color: #f1f5f9;
        }

        .pred-risk-pill {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* 3-column Identifiers Grid */
        .pred-id-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }

        .pred-id-card {
          padding: 20px 22px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(13, 20, 38, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.07);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .pred-id-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.35);
        }

        .pred-id-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .pred-id-icon.blue {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .pred-id-icon.purple {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.25);
        }

        .pred-id-icon.cyan {
          background: rgba(6, 182, 212, 0.15);
          color: #22d3ee;
          border: 1px solid rgba(6, 182, 212, 0.25);
        }

        .pred-id-text span {
          display: block;
          font-size: 11.5px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 3px;
        }

        .pred-id-text strong {
          display: block;
          font-size: 13.5px;
          font-family: monospace;
          color: #e2e8f0;
          word-break: break-all;
        }

        /* Assessment Card */
        .pred-assess-card {
          padding: 28px 32px;
          border-radius: 20px;
          background: rgba(13, 20, 38, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pred-assess-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .pred-assess-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .pred-assess-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .pred-assess-item {
          padding: 16px 18px;
          background: rgba(7, 11, 24, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .pred-assess-item span {
          display: block;
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }

        .pred-assess-item strong {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
        }

        .pred-bar-wrap {
          margin-top: 10px;
          height: 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .pred-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .pred-rec-box {
          padding: 16px 18px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .pred-rec-box.danger {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .pred-rec-box.safe {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #6ee7b7;
        }

        @media (max-width: 768px) {
          .pred-score-card {
            grid-template-columns: 1fr;
            text-align: center;
            justify-items: center;
          }

          .pred-meta-row {
            justify-content: center;
          }

          .pred-hero-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="pred-details-wrap">
        {/* Topbar navigation & status */}
        <div className="pred-topbar">
          <button
            type="button"
            className="pred-back-btn"
            onClick={() => navigate("/predictions")}
          >
            <ArrowLeft size={16} />
            Back to Predictions
          </button>

          <div className="pred-live-pill">
            <span className="pred-live-dot"></span>
            AI Monitoring Active
          </div>
        </div>

        {/* Hero Intelligence Header */}
        <div className="pred-hero-card">
          <div className="pred-hero-left">
            <div className="pred-hero-icon">
              <BrainCircuit size={28} />
            </div>
            <div className="pred-hero-title">
              <span className="chart-eyebrow" style={{ color: "#818cf8" }}>
                INFRASTRUCTURE INTELLIGENCE
              </span>
              <h1>Failure Assessment Node</h1>
              <p>Detailed AI failure telemetry and risk calculation for node.</p>
            </div>
          </div>

          <div className={`pred-hero-badge ${failed ? "danger" : "safe"}`}>
            {failed ? (
              <>
                <AlertTriangle size={18} />
                Failure Predicted
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Infrastructure Safe
              </>
            )}
          </div>
        </div>

        {/* Score & AI Prediction Overview */}
        <div className="pred-score-card">
          <div className="pred-ring-box">
            <svg width="136" height="136" viewBox="0 0 136 136">
              <circle
                cx="68"
                cy="68"
                r={radius}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="10"
              />
              <circle
                cx="68"
                cy="68"
                r={radius}
                fill="transparent"
                stroke={riskColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                transform="rotate(-90 68 68)"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>

            <div className="pred-ring-text">
              <strong style={{ color: riskColor }}>
                {probability.toFixed(1)}%
              </strong>
              <span>Failure Risk</span>
            </div>
          </div>

          <div className="pred-summary-content">
            <span className="chart-eyebrow" style={{ color: "#a5b4fc" }}>
              AI INFERENCE SUMMARY
            </span>
            <h2>
              {failed
                ? "Potential Failure Anomaly Detected"
                : "Normal Operating Parameters"}
            </h2>
            <p>
              The AI prediction engine evaluated infrastructure metrics including CPU
              load, memory saturation, network packets, and error rates to calculate
              a <strong>{probability.toFixed(2)}%</strong> probability of downtime.
            </p>

            <div className="pred-meta-row">
              <div className="pred-meta-item">
                <span>Risk Level</span>
                <strong
                  className="pred-risk-pill"
                  style={{
                    backgroundColor: `${riskColor}22`,
                    color: riskColor,
                    border: `1px solid ${riskColor}44`,
                  }}
                >
                  {risk}
                </strong>
              </div>

              <div className="pred-meta-item">
                <span>Model Engine</span>
                <strong>
                  <Cpu size={15} style={{ marginRight: 6, color: "#818cf8" }} />
                  {prediction.model_version || "LightGBM v1.0"}
                </strong>
              </div>

              <div className="pred-meta-item">
                <span>Evaluated At</span>
                <strong>
                  <Clock size={15} style={{ marginRight: 6, color: "#818cf8" }} />
                  {createdAt}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Card Identifiers Grid */}
        <div className="pred-id-grid">
          <div className="pred-id-card">
            <div className="pred-id-icon blue">
              <Server size={20} />
            </div>
            <div className="pred-id-text">
              <span>Server ID</span>
              <strong>{prediction.server_id}</strong>
            </div>
          </div>

          <div className="pred-id-card">
            <div className="pred-id-icon purple">
              <Activity size={20} />
            </div>
            <div className="pred-id-text">
              <span>Metric Telemetry ID</span>
              <strong>{prediction.metric_id}</strong>
            </div>
          </div>

          <div className="pred-id-card">
            <div className="pred-id-icon cyan">
              <Layers size={20} />
            </div>
            <div className="pred-id-text">
              <span>Model Classification</span>
              <strong>{prediction.model_version || "v1.0-prod"}</strong>
            </div>
          </div>
        </div>

        {/* Prediction Assessment Section */}
        <div className="pred-assess-card">
          <div className="pred-assess-header">
            <div>
              <span className="chart-eyebrow" style={{ color: "#818cf8" }}>
                DIAGNOSTIC TELEMETRY
              </span>
              <h2>Prediction Assessment</h2>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => loadPrediction(true)}
              disabled={refreshing}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <RefreshCw size={14} className={refreshing ? "spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="pred-assess-grid">
            <div className="pred-assess-item">
              <span>Calculated Failure Probability</span>
              <strong style={{ color: riskColor }}>
                {probability.toFixed(2)}%
              </strong>
              <div className="pred-bar-wrap">
                <div
                  className="pred-bar-fill"
                  style={{
                    width: `${Math.min(probability, 100)}%`,
                    backgroundColor: riskColor,
                  }}
                />
              </div>
            </div>

            <div className="pred-assess-item">
              <span>Binary Assessment Status</span>
              <strong style={{ color: failed ? "#f87171" : "#34d399" }}>
                {failed ? "CRITICAL (FAILURE)" : "NORMAL (SAFE)"}
              </strong>
            </div>

            <div className="pred-assess-item">
              <span>Severity Band</span>
              <strong style={{ color: riskColor, textTransform: "uppercase" }}>
                {risk} Risk Tier
              </strong>
            </div>
          </div>

          <div className={`pred-rec-box ${failed ? "danger" : "safe"}`}>
            {failed ? (
              <>
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Immediate Action Recommended:</strong> This infrastructure node is exhibiting
                  anomalous telemetry matching prior failure signatures. We recommend draining active traffic
                  and scheduling preventative maintenance before unrecoverable downtime occurs.
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Optimal Health:</strong> All diagnostic metrics are operating within expected tolerance
                  thresholds. No preventative intervention is required at this time. Telemetry monitoring continues 24/7.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default PredictionDetails;