export default function SettingsModal({
  apiKey,
  setApiKey,
  autoRefresh,
  setAutoRefresh,
  onImport,
  onClose
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Settings</h3>

        {/* API KEY */}
        <label style={{ display: "block", marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
          TMDB API Key
        </label>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste TMDB v3 API key"
          style={{ width: "100%", padding: 8, borderRadius: 8, marginTop: 6 }}
        />

        {/* AUTO REFRESH */}
        <label style={{ display: "block", marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
          Auto refresh (mins)
        </label>
        <input
          type="number"
          min="1"
          value={autoRefresh}
          onChange={(e) =>
            setAutoRefresh(Math.max(1, Number(e.target.value || 1)))
          }
          style={{ width: 120, padding: 8, borderRadius: 8, marginTop: 6 }}
        />

        {/* IMPORT */}
        <label className="card" style={{ marginTop: 16, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Import watched list
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
            Supports old & new exports (CSV / JSON). Duplicates will be skipped.
          </div>
          <input
            type="file"
            accept=".json,.csv"
            onChange={(e) => onImport(e.target.files[0])}
          />
        </label>

        {/* ACTIONS */}
        <div style={{ marginTop: 14, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Close</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              localStorage.setItem("movieApp_apiKey", apiKey || "");
              localStorage.setItem("movieApp_refreshMins", String(autoRefresh));
              onClose();
              alert("Saved settings");
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
