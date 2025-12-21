import React from "react";

/**
 * Compact, collapsible stats panel.
 * - collapsed by default
 * - small summary when collapsed (top 3 genres pills)
 * - expanded view: top genres + rating bars (1-10) split in two cols
 * - max-height with scroll so it never overflows the page
 *
 * props:
 * - stats: { totalWatched, topGenres, ratingCount, ratingPercent }
 */
export default function StatsPanel({ stats }) {
  const [open, setOpen] = React.useState(false); // default CLOSED
  const [showAllGenres, setShowAllGenres] = React.useState(false);

  if (!stats || stats.totalWatched === 0) return null;

  const { topGenres = [], ratingCount = {}, ratingPercent = {} } = stats;

  // compact summary (top 3 genres)
  const top3 = topGenres.slice(0, 3);

  // For expanded view: show first N genres, with option to show all
  const GENRE_PREVIEW = 6;
  const visibleGenres = showAllGenres ? topGenres : topGenres.slice(0, GENRE_PREVIEW);

  const leftRatings = [10, 9, 8, 7, 6];
  const rightRatings = [5, 4, 3, 2, 1];

  // optional: persist open state (uncomment if you want persistence)
  // React.useEffect(() => {
  //   const v = localStorage.getItem("stats_panel_open");
  //   if (v !== null) setOpen(v === "1");
  // }, []);
  // React.useEffect(() => {
  //   localStorage.setItem("stats_panel_open", open ? "1" : "0");
  // }, [open]);

  return (
    <div className={`stats-panel dropdown-card ${open ? "open" : "closed"}`}>
      <div className="stats-header">
        <div>
          <div className="stats-title">Your Watch Stats</div>
          {/* when collapsed show small subtitle */}
          {!open && (
            <div className="stats-subtitle">
              {top3.length ? (
                <>
                  <span className="mini-label">Top:</span>
                  {top3.map(([name], i) => (
                    <span key={name} className="genre-pill">{name}</span>
                  ))}
                </>
              ) : (
                <span className="stats-muted">No genre data</span>
              )}
            </div>
          )}
        </div>

        <div className="stats-controls">
          <button
            className="btn btn-ghost"
            onClick={() => setOpen(s => !s)}
            aria-expanded={open}
          >
            {open ? "Hide" : "Show stats"}
          </button>
        </div>
      </div>

      <div className="stats-body" style={{ display: open ? "block" : "none" }}>
        <div className="stats-grid-compact compact-packed">
          {/* LEFT: Top genres (fractional share) */}
          <div className="stats-card small">
            <div className="stats-label">Top genres (share)</div>
            <ul className="genre-list compact">
              {visibleGenres.map(([name, val]) => {
                // show percentage-like number (val represents fractional count)
                const pct = Math.round((val / Math.max(1, stats.totalWatched)) * 10000) / 100;
                return (
                  <li key={name} className="genre-row compact">
                    <div className="genre-left">
                      <div className="genre-name">{name}</div>
                      <div className="genre-value">{pct}</div>
                    </div>

                    <div className="genre-bar-wrap small">
                      <div className="genre-bar" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>

            {topGenres.length > GENRE_PREVIEW && (
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setShowAllGenres(s => !s)}>
                  {showAllGenres ? "Show fewer" : `Show all (${topGenres.length})`}
                </button>
                <div className="stats-muted" style={{ marginLeft: "auto" }}>
                  total movies: {stats.totalWatched}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Ratings distribution (compact two columns) */}
          <div className="stats-card small">
            <div className="stats-label">Ratings distribution (1–10)</div>
            <div className="ratings-split compact">
              <div className="ratings-col">
                {leftRatings.map(r => {
                  const count = ratingCount[r] || 0;
                  const pct = ratingPercent[r] || 0;
                  return (
                    <div key={r} className="rating-row compact">
                      <div className="rating-label">⭐{r}</div>
                      <div className="rating-bar-wrap small">
                        <div className="rating-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="rating-count">{count}</div>
                    </div>
                  );
                })}
              </div>

              <div className="ratings-col">
                {rightRatings.map(r => {
                  const count = ratingCount[r] || 0;
                  const pct = ratingPercent[r] || 0;
                  return (
                    <div key={r} className="rating-row compact">
                      <div className="rating-label">⭐{r}</div>
                      <div className="rating-bar-wrap small">
                        <div className="rating-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="rating-count">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
