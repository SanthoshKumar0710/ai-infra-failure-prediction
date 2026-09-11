import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", value: 22 },
  { day: "Tue", value: 31 },
  { day: "Wed", value: 27 },
  { day: "Thu", value: 48 },
  { day: "Fri", value: 42 },
  { day: "Sat", value: 65 },
  { day: "Sun", value: 58 },
];

function PredictionChart() {
  return (
    <div className="glass-panel chart-panel">

      <div className="panel-header">
        <div>
          <h3>Failure Probability Trend</h3>
          <p>Last 7 days</p>
        </div>

        <select>
          <option>7 Days</option>
          <option>30 Days</option>
        </select>
      </div>

      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={data}>

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
                  stopColor="#9b5cff"
                  stopOpacity={0.6}
                />

                <stop
                  offset="100%"
                  stopColor="#9b5cff"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
            />

            <XAxis
              dataKey="day"
              stroke="#777"
            />

            <YAxis
              stroke="#777"
            />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#a970ff"
              fill="url(#predictionGradient)"
              strokeWidth={3}
            />

          </AreaChart>

        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default PredictionChart;