import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

function RiskChart({ predictions = [] }) {

  const low = predictions.filter(
    (p) => p.risk_level?.toLowerCase() === "low"
  ).length;

  const medium = predictions.filter(
    (p) => p.risk_level?.toLowerCase() === "medium"
  ).length;

  const high = predictions.filter(
    (p) => p.risk_level?.toLowerCase() === "high"
  ).length;

  const data = [
    {
      name: "Low",
      value: low,
    },
    {
      name: "Medium",
      value: medium,
    },
    {
      name: "High",
      value: high,
    },
  ];

  const total = predictions.length;

  const COLORS = [
    "#43dfa4",
    "#ffc34d",
    "#ff5b72",
  ];

  return (
    <section className="chart-card risk-chart-card">

      <div className="chart-header">

        <div>

          <span className="chart-eyebrow">
            RISK ANALYSIS
          </span>

          <h2>
            Risk Distribution
          </h2>

          <p>
            Current infrastructure health
          </p>

        </div>

        <div className="risk-total">

          <strong>
            {total}
          </strong>

          <span>
            Total
          </span>

        </div>

      </div>

      <div className="risk-chart-body">

        <div className="donut-container">

          {total === 0 ? (

            <div className="chart-empty">
              No data
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={4}
                  stroke="none"
                >

                  {data.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index]}
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  contentStyle={{
                    background:
                      "rgba(15,18,35,0.94)",
                    border:
                      "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "12px",
                    backdropFilter:
                      "blur(15px)",
                  }}
                  itemStyle={{
                    color: "#ffffff",
                    fontSize: 12,
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

          )}

          <div className="donut-center">

            <strong>
              {total}
            </strong>

            <span>
              Predictions
            </span>

          </div>

        </div>

        <div className="risk-legend">

          <RiskItem
            label="Low Risk"
            value={low}
            color="#43dfa4"
            total={total}
          />

          <RiskItem
            label="Medium Risk"
            value={medium}
            color="#ffc34d"
            total={total}
          />

          <RiskItem
            label="High Risk"
            value={high}
            color="#ff5b72"
            total={total}
          />

        </div>

      </div>

    </section>
  );
}


function RiskItem({
  label,
  value,
  color,
  total,
}) {

  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div className="risk-item">

      <div className="risk-item-left">

        <span
          className="risk-dot"
          style={{
            background: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />

        <span>
          {label}
        </span>

      </div>

      <div className="risk-item-right">

        <strong>
          {value}
        </strong>

        <span>
          {percentage}%
        </span>

      </div>

    </div>
  );
}

export default RiskChart;