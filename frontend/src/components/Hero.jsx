import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  Server,
} from "lucide-react";

function Hero({ totalServers = 0 }) {
  const navigate = useNavigate();

  return (
    <section className="hero-liquid">

      {/* Background glow */}
      <div className="hero-glow hero-glow-one"></div>
      <div className="hero-glow hero-glow-two"></div>
      <div className="hero-glow hero-glow-three"></div>

      {/* Floating particles */}
      <div className="hero-particle particle-one"></div>
      <div className="hero-particle particle-two"></div>
      <div className="hero-particle particle-three"></div>
      <div className="hero-particle particle-four"></div>

      <div className="hero-content">

        {/* LEFT SIDE */}
        <div className="hero-copy">

          {/* Badge */}
          <div className="hero-badge">

            <span className="badge-icon">
              <Sparkles size={13} />
            </span>

            AI Infrastructure Intelligence

            <span className="badge-dot"></span>

            Live
          </div>

          {/* Heading */}
          <h1>
            Predict.
            <br />

            <span className="gradient-text">
              Prevent.
            </span>

            <br />

            Protect your
            <br />

            infrastructure.
          </h1>

          {/* Description */}
          <p className="hero-description">
            Monitor your infrastructure in real time and use
            AI-powered failure prediction to identify risky
            servers before downtime happens.
          </p>

          {/* Buttons */}
          <div className="hero-actions">

            <button
              type="button"
              className="hero-primary-button"
              onClick={() => navigate("/predictions")}
            >

              <BrainCircuit size={17} />

              Explore Insights

              <ArrowUpRight size={16} />

            </button>

            <button
              type="button"
              className="hero-secondary-button"
              onClick={() => navigate("/metrics")}
            >

              <Activity size={16} />

              View Metrics

            </button>

          </div>

          {/* Mini stats */}
          <div className="hero-mini-stats">

            <div className="hero-mini-stat">

              <div className="mini-icon blue">
                <Server size={15} />
              </div>

              <div>
                <strong>
                  {totalServers}
                </strong>

                <span>
                  Servers
                </span>
              </div>

            </div>

            <div className="hero-mini-stat">

              <div className="mini-icon green">
                <ShieldCheck size={15} />
              </div>

              <div>
                <strong>
                  AI
                </strong>

                <span>
                  Prediction
                </span>
              </div>

            </div>

            <div className="hero-mini-stat">

              <div className="mini-icon purple">
                <Activity size={15} />
              </div>

              <div>
                <strong>
                  Live
                </strong>

                <span>
                  Monitoring
                </span>
              </div>

            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="hero-visual">

          {/* Glow behind server */}
          <div className="server-glow"></div>

          {/* Orbit rings */}
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>
          <div className="orbit orbit-three"></div>


          {/* AI cloud */}
          <div className="ai-cloud">

            <div className="cloud-part cloud-one"></div>
            <div className="cloud-part cloud-two"></div>
            <div className="cloud-part cloud-three"></div>

            <div className="cloud-core">
              <BrainCircuit size={31} />
            </div>

          </div>


          {/* Server stack */}
          <div className="server-stack">

            <div className="server-layer layer-top">

              <div className="server-led"></div>
              <div className="server-led"></div>
              <div className="server-led"></div>

              <span>
                AI CORE
              </span>

            </div>

            <div className="server-layer layer-middle">

              <div className="server-led"></div>
              <div className="server-led"></div>
              <div className="server-led"></div>

              <span>
                PREDICTION ENGINE
              </span>

            </div>

            <div className="server-layer layer-bottom">

              <div className="server-led"></div>
              <div className="server-led"></div>
              <div className="server-led"></div>

              <span>
                INFRASTRUCTURE
              </span>

            </div>

          </div>


          {/* Floating metric cards */}

          <div className="floating-card floating-card-one">

            <div className="floating-card-icon blue">
              <Activity size={15} />
            </div>

            <div>
              <span>
                System Health
              </span>

              <strong>
                98.7%
              </strong>
            </div>

          </div>


          <div className="floating-card floating-card-two">

            <div className="floating-card-icon green">
              <ShieldCheck size={15} />
            </div>

            <div>
              <span>
                Prediction Engine
              </span>

              <strong>
                Online
              </strong>
            </div>

          </div>


          <div className="floating-card floating-card-three">

            <div className="pulse-dot"></div>

            <div>
              <span>
                AI Monitoring
              </span>

              <strong>
                Active
              </strong>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;