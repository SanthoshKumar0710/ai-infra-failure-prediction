import { useEffect, useState, useCallback } from "react";
import { BrainCircuit, RefreshCw } from "lucide-react";
import { getPredictions } from "../api/predictions";
import PageLayout from "../components/PageLayout";
import ServerTable from "../components/ServerTable";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function PredictionChart({ predictions = [] }) {

  const data = [...predictions]
    .sort(
      (a, b) =>
        new Date(a.created_at) -
        new Date(b.created_at)
    )
    .map((prediction, index) => ({
      name: new Date(
        prediction.created_at
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

      probability:
        Number(prediction.failure_probability || 0) * 100,

      index: index + 1,
    }));

  return (
    <section className="chart-card prediction-chart-card">

      <div className="chart-header">

        <div>
          <span className="chart-eyebrow">
            AI ANALYTICS
          </span>

          <h2>
            Failure Prediction Trend
          </h2>

          <p>
            Real-time infrastructure failure probability
          </p>
        </div>

        <div className="chart-badge">
          <span className="live-dot"></span>
          Live
        </div>

      </div>

      <div className="chart-summary">

        <div>
          <span>Current Risk</span>

          <strong>
            {data.length
              ? `${data[data.length - 1].probability.toFixed(2)}%`
              : "0.00%"}
          </strong>
        </div>

        <div>
          <span>Predictions</span>

          <strong>
            {predictions.length}
          </strong>
        </div>

      </div>

      <div className="chart-container">

        {data.length === 0 ? (

          <div className="chart-empty">
            No prediction data available.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >

              <defs>

                <linearGradient
                  id="predictionGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#48d7ff"
                    stopOpacity={0.42}
                  />

                  <stop
                    offset="100%"
                    stopColor="#48d7ff"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,0.055)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#656b80",
                  fontSize: 10,
                }}
              />

              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#656b80",
                  fontSize: 10,
                }}
                tickFormatter={(value) =>
                  `${value}%`
                }
              />

              <Tooltip
                contentStyle={{
                  background:
                    "rgba(15,18,35,0.92)",
                  border:
                    "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "12px",
                  backdropFilter: "blur(15px)",
                  boxShadow:
                    "0 15px 35px rgba(0,0,0,0.35)",
                }}
                labelStyle={{
                  color: "#8f96aa",
                  fontSize: 10,
                }}
                itemStyle={{
                  color: "#55ddff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                formatter={(value) => [
                  `${Number(value).toFixed(2)}%`,
                  "Failure probability",
                ]}
              />

              <Area
                type="monotone"
                dataKey="probability"
                stroke="#48d7ff"
                strokeWidth={2.5}
                fill="url(#predictionGradient)"
                dot={{
                  r: 3,
                  fill: "#48d7ff",
                  stroke:
                    "rgba(255,255,255,0.8)",
                  strokeWidth: 1,
                }}
                activeDot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#48d7ff",
                  strokeWidth: 3,
                }}
              />

            </AreaChart>

          </ResponsiveContainer>

        )}

      </div>

    </section>
  );
}

function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPredictions();
  }, [loadPredictions]);

  return (
    <PageLayout>

      <div className="page-header">

        <div>

          <div className="page-title-row">

            <BrainCircuit size={25} />

            <h1>
              AI Predictions
            </h1>

          </div>

          <p>
            Real-time infrastructure failure prediction analytics.
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

      {error && (
        <div className="error-message">
          <div className="error-content">
            <span>
              {error}
            </span>
          </div>
        </div>
      )}

      {loading ? (

        <div className="loading glass-panel">

          <div className="loading-spinner"></div>

          <span>
            Loading prediction intelligence...
          </span>

        </div>

      ) : (

        <div
          className="predictions-page-content"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >

          <PredictionChart
            predictions={predictions}
          />

          <section className="dashboard-table-section">

            <div className="section-heading">

              <div>

                <span className="chart-eyebrow">
                  INFRASTRUCTURE MONITORING
                </span>

                <h2>
                  Prediction Log
                </h2>

                <p>
                  Details of all generated failure predictions
                </p>

              </div>

            </div>

            <ServerTable
              predictions={predictions}
            />

          </section>

        </div>

      )}

    </PageLayout>
  );
}

export default Predictions;