export default function SettingsModal({
  apiKey,
  setApiKey,
  autoRefresh,
  setAutoRefresh,
  onImport,
  onExportWatched,
  onExportWishlist,
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

        {/* IMPORT/EXPORT */}
        <div className="card" style={{ marginTop: 16, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 2, letterSpacing: 0.2 }}>
            Import watched list
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>
            Supports old & new exports (<b>CSV</b> / <b>JSON</b>). Duplicates will be skipped.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
            <label htmlFor="import-file" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(90deg,#4f7cff,#38bdf8)',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 10,
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79,124,255,0.10)',
              border: 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              Import File
              <input
                id="import-file"
                type="file"
                accept=".json,.csv"
                onChange={(e) => onImport(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Choose a file to import
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, minWidth: 0, transition: 'box-shadow 0.2s, background 0.2s', boxShadow: '0 2px 8px rgba(79,124,255,0.08)' }}
              onClick={onExportWatched}
            >
              Export Watched List
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, minWidth: 0, background: 'linear-gradient(90deg,#ff5a7a,#ffb86c)', color: '#fff', border: 'none', transition: 'box-shadow 0.2s, background 0.2s', boxShadow: '0 2px 8px rgba(255,90,122,0.08)' }}
              onClick={onExportWishlist}
            >
              Export Wishlist
            </button>
          </div>
        </div>

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
