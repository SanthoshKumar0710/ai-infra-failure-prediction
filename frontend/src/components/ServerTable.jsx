import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Server,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function ServerTable({
  predictions = [],
}) {
  const navigate = useNavigate();

  if (!predictions.length) {
    return (
      <div className="empty-table glass-panel">

        <Server size={25} />

        <h3>
          No predictions available
        </h3>

        <p>
          Infrastructure predictions will
          appear here once the AI engine
          receives metrics.
        </p>

      </div>
    );
  }

  return (
    <div className="server-table-wrapper glass-panel">

      <div className="server-table">

        {/* HEADER */}

        <div className="server-table-header">

          <span>
            SERVER
          </span>

          <span>
            PROBABILITY
          </span>

          <span>
            RISK
          </span>

          <span>
            STATUS
          </span>

          <span></span>

        </div>


        {/* ROWS */}

        {predictions.map(
          (prediction) => {
            const probability =
              Number(
                prediction.failure_probability ||
                  0
              ) * 100;

            const risk =
              prediction.risk_level?.toLowerCase() ||
              "low";

            const failed =
              prediction.predicted_failure ===
              true;

            return (
              <button
                type="button"
                className="server-table-row"
                key={prediction.id}
                onClick={() =>
                  navigate(
                    `/predictions/${prediction.id}`
                  )
                }
              >

                {/* SERVER */}

                <div className="server-name">

                  <div className="server-avatar">

                    <Server
                      size={15}
                    />

                  </div>

                  <div>

                    <strong>
                      {prediction.server_id?.slice(
                        0,
                        8
                      )}
                      ...
                    </strong>

                    <span>
                      {prediction.model_version ||
                        "v1.0"}
                    </span>

                  </div>

                </div>


                {/* PROBABILITY */}

                <div className="probability-cell">

                  <strong>
                    {probability.toFixed(
                      2
                    )}
                    %
                  </strong>

                  <div className="mini-progress">

                    <div
                      className={`mini-progress-fill ${risk}`}
                      style={{
                        width: `${Math.min(
                          probability,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                {/* RISK */}

                <div>

                  <span
                    className={`risk-badge ${risk}`}
                  >
                    {risk}
                  </span>

                </div>


                {/* STATUS */}

                <div>

                  {failed ? (

                    <span className="prediction-status-small danger">

                      <AlertTriangle
                        size={13}
                      />

                      Failure

                    </span>

                  ) : (

                    <span className="prediction-status-small safe">

                      <CheckCircle2
                        size={13}
                      />

                      Safe

                    </span>

                  )}

                </div>


                {/* ARROW */}

                <div className="table-arrow">

                  <ChevronRight
                    size={17}
                  />

                </div>

              </button>
            );
          }
        )}

      </div>

    </div>
  );
}

export default ServerTable;