import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
} from "lucide-react";

import PageLayout from "../components/PageLayout";

function Analytics() {

  return (
    <PageLayout>

      <div className="page-header">

        <div>

          <div className="page-title-row">

            <BarChart3 size={25} />

            <h1>
              Analytics
            </h1>

          </div>

          <p>
            Advanced infrastructure analytics and insights.
          </p>

        </div>

      </div>

      <div className="analytics-grid">

        <div className="glass-panel analytics-card">

          <TrendingUp size={22} />

          <span>
            Failure Prediction Accuracy
          </span>

          <strong>
            94.2%
          </strong>

          <small>
            Excellent
          </small>

        </div>

        <div className="glass-panel analytics-card">

          <Clock size={22} />

          <span>
            MTTR
          </span>

          <strong>
            2.4h
          </strong>

          <small>
            Mean Time To Recovery
          </small>

        </div>

        <div className="glass-panel analytics-card">

          <ShieldCheck size={22} />

          <span>
            Availability
          </span>

          <strong>
            99.8%
          </strong>

          <small>
            Infrastructure uptime
          </small>

        </div>

      </div>

      <div className="glass-panel analytics-chart">

        <div className="panel-header">

          <div>

            <h3>
              Predictions Over Time
            </h3>

            <p>
              Last 30 days
            </p>

          </div>

        </div>

        <div className="bar-chart">

          {[65, 82, 55, 91, 72, 88, 60, 75, 93, 70].map(
            (height, index) => (

              <div
                className="bar"
                style={{
                  height: `${height}%`,
                }}
                key={index}
              />

            )
          )}

        </div>

      </div>

    </PageLayout>
  );
}

export default Analytics;