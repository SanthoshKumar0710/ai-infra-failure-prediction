import { ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "blue",
}) {
  return (
    <article className={`stat-card stat-${variant}`}>

      {/* Background glow */}
      <div className="stat-glow"></div>

      <div className="stat-card-top">

        <div className="stat-icon">
          {icon}
        </div>

        <button className="stat-arrow">
          <ArrowUpRight size={15} />
        </button>

      </div>

      <div className="stat-info">

        <span className="stat-title">
          {title}
        </span>

        <div className="stat-value">
          {value}
        </div>

        <div className="stat-bottom">

          <span className="stat-subtitle">
            {subtitle}
          </span>

          <span className="stat-status">
            <span className="status-dot"></span>
            Live
          </span>

        </div>

      </div>

      {/* Decorative line */}
      <div className="stat-line"></div>

    </article>
  );
}

export default StatCard;