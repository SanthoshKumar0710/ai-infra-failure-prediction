import { useEffect, useState, useCallback } from "react";

import {
  Server,
  BrainCircuit,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import { getPredictions } from "../api/predictions";

import PageLayout from "../components/PageLayout";
import Hero from "../components/Hero";
import StatCard from "../components/StatCard";
import PredictionChart from "../components/PredictionChart";
import RiskChart from "../components/RiskChart";
import ServerTable from "../components/ServerTable";

function Dashboard() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD PREDICTIONS
  // ============================================================

  const loadPredictions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getPredictions(100, 0);

      setPredictions(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load predictions:",
        err
      );

      setError(
        "Unable to load infrastructure predictions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPredictions();
  }, [loadPredictions]);

  // ============================================================
  // DASHBOARD STATISTICS
  // ============================================================

  const totalPredictions =
    predictions.length;

  const predictedFailures =
    predictions.filter(
      (prediction) =>
        prediction.predicted_failure === true
    ).length;

  const safePredictions =
    predictions.filter(
      (prediction) =>
        prediction.predicted_failure === false
    ).length;

  const highRisk =
    predictions.filter(
      (prediction) =>
        prediction.risk_level?.toLowerCase() ===
        "high"
    ).length;

  const mediumRisk =
    predictions.filter(
      (prediction) =>
        prediction.risk_level?.toLowerCase() ===
        "medium"
    ).length;

  const lowRisk =
    predictions.filter(
      (prediction) =>
        prediction.risk_level?.toLowerCase() ===
        "low"
    ).length;

  // ============================================================
  // UNIQUE SERVERS
  // ============================================================

  const servers = [
    ...new Set(
      predictions
        .map(
          (prediction) =>
            prediction.server_id
        )
        .filter(Boolean)
    ),
  ];

  // ============================================================
  // FAILURE RATE
  // ============================================================

  const failureRate =
    totalPredictions > 0
      ? (
          (predictedFailures /
            totalPredictions) *
          100
        ).toFixed(1)
      : "0.0";

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <PageLayout>

      {/* ======================================================
          HERO
      ====================================================== */}

      <Hero
        totalServers={servers.length}
      />

      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="error-message">

          <div className="error-content">

            <ShieldAlert size={19} />

            <span>
              {error}
            </span>

          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              loadPredictions(true)
            }
            disabled={refreshing}
          >

            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            Retry

          </button>

        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <div className="loading glass-panel">

          <div className="loading-spinner"></div>

          <span>
            Loading infrastructure
            intelligence...
          </span>

        </div>

      ) : (

        <>

          {/* ==================================================
              KPI STATISTICS
          ================================================== */}

          <section className="stats-grid">

            <StatCard
              title="Total Servers"
              value={servers.length}
              subtitle="Infrastructure monitored"
              icon={
                <Server size={21} />
              }
              variant="blue"
            />

            <StatCard
              title="Total Predictions"
              value={totalPredictions}
              subtitle="AI predictions generated"
              icon={
                <BrainCircuit
                  size={21}
                />
              }
              variant="purple"
            />

            <StatCard
              title="Predicted Failures"
              value={predictedFailures}
              subtitle="Requires attention"
              icon={
                <AlertTriangle
                  size={21}
                />
              }
              variant="red"
            />

            <StatCard
              title="High Risk"
              value={highRisk}
              subtitle="Critical infrastructure"
              icon={
                <ShieldAlert
                  size={21}
                />
              }
              variant="orange"
            />

          </section>


          {/* ==================================================
              QUICK STATUS
          ================================================== */}

          <section className="dashboard-status-row">

            {/* SAFE */}

            <div className="status-summary glass-panel">

              <div className="status-summary-icon safe">

                <CheckCircle2
                  size={18}
                />

              </div>

              <div>

                <span>
                  Safe Predictions
                </span>

                <strong>
                  {safePredictions}
                </strong>

              </div>

            </div>


            {/* FAILURES */}

            <div className="status-summary glass-panel">

              <div className="status-summary-icon danger">

                <AlertTriangle
                  size={18}
                />

              </div>

              <div>

                <span>
                  Failure Predictions
                </span>

                <strong>
                  {predictedFailures}
                </strong>

              </div>

            </div>


            {/* HIGH RISK */}

            <div className="status-summary glass-panel">

              <div className="status-summary-icon warning">

                <ShieldAlert
                  size={18}
                />

              </div>

              <div>

                <span>
                  High Risk Servers
                </span>

                <strong>
                  {highRisk}
                </strong>

              </div>

            </div>


            {/* FAILURE RATE */}

            <div className="status-summary glass-panel">

              <div className="status-summary-icon purple">

                <BrainCircuit
                  size={18}
                />

              </div>

              <div>

                <span>
                  Failure Rate
                </span>

                <strong>
                  {failureRate}%
                </strong>

              </div>

            </div>

          </section>


          {/* ==================================================
              RISK OVERVIEW
          ================================================== */}

          <section className="risk-overview glass-panel">

            <div className="risk-overview-header">

              <div>

                <span className="chart-eyebrow">
                  INFRASTRUCTURE HEALTH
                </span>

                <h2>
                  Current Risk Overview
                </h2>

                <p>
                  Real-time distribution of
                  infrastructure predictions.
                </p>

              </div>

              <div className="risk-overview-live">

                <span className="live-dot"></span>

                Monitoring

              </div>

            </div>


            <div className="risk-overview-bars">

              {/* LOW */}

              <div className="risk-overview-item">

                <div className="risk-overview-label">

                  <span>
                    Low Risk
                  </span>

                  <strong>
                    {lowRisk}
                  </strong>

                </div>

                <div className="risk-progress">

                  <div
                    className="risk-progress-low"
                    style={{
                      width:
                        totalPredictions > 0
                          ? `${
                              (lowRisk /
                                totalPredictions) *
                              100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>


              {/* MEDIUM */}

              <div className="risk-overview-item">

                <div className="risk-overview-label">

                  <span>
                    Medium Risk
                  </span>

                  <strong>
                    {mediumRisk}
                  </strong>

                </div>

                <div className="risk-progress">

                  <div
                    className="risk-progress-medium"
                    style={{
                      width:
                        totalPredictions > 0
                          ? `${
                              (mediumRisk /
                                totalPredictions) *
                              100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>


              {/* HIGH */}

              <div className="risk-overview-item">

                <div className="risk-overview-label">

                  <span>
                    High Risk
                  </span>

                  <strong>
                    {highRisk}
                  </strong>

                </div>

                <div className="risk-progress">

                  <div
                    className="risk-progress-high"
                    style={{
                      width:
                        totalPredictions > 0
                          ? `${
                              (highRisk /
                                totalPredictions) *
                              100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              CHARTS
          ================================================== */}

          <section className="charts-grid">

            <PredictionChart
              predictions={
                predictions
              }
            />

            <RiskChart
              predictions={
                predictions
              }
            />

          </section>


          {/* ==================================================
              SERVER / PREDICTION TABLE
          ================================================== */}

          <section className="dashboard-table-section">

            <div className="section-heading">

              <div>

                <span className="chart-eyebrow">
                  INFRASTRUCTURE MONITORING
                </span>

                <h2>
                  Recent Predictions
                </h2>

                <p>
                  AI-powered infrastructure
                  failure predictions
                </p>

              </div>


              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  loadPredictions(true)
                }
                disabled={refreshing}
              >

                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}

              </button>

            </div>


            <ServerTable
              predictions={
                predictions
              }
            />

          </section>

        </>

      )}

    </PageLayout>
  );
}

export default Dashboard;