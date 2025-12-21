import React from "react";
import StatsPanel from "../components/StatsPanel";

export default function InsightsPage({ stats }) {
  if (!stats) return null;

  return (
    <div className="page insights-page">
      <h2>Viewing activity</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.allTime}</div>
          <div className="stat-label">All time</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.thisYear}</div>
          <div className="stat-label">This year</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.thisMonth}</div>
          <div className="stat-label">This month</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.thisWeek}</div>
          <div className="stat-label">This week</div>
        </div>
      </div>
    </div>
  );
}
