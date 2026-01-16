import { useState } from 'react';
import HelpIcon from './HelpIcon';
import ApiKeyHelpModal from './ApiKeyHelpModal';

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
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
    // Reset input value to allow re-selecting same file
    e.target.value = '';
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setProgress(null);
  };

  const handleStartImport = async () => {
    if (!selectedFile || importing) return;

    setImporting(true);
    setProgress({ processed: 0, total: 0, imported: 0, skipped: 0, failed: 0 });

    try {
      await onImport(selectedFile, (progressData) => {
        setProgress(progressData);
      });
    } finally {
      setImporting(false);
      setSelectedFile(null);
      setProgress(null);
    }
  };

  const progressPercentage = progress && progress.total > 0
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Settings</h3>

        {/* API KEY */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
          <label style={{ fontSize: 13, color: "var(--text-muted)" }}>
            TMDB API Key
          </label>
          <HelpIcon onClick={() => setShowHelp(true)} />
        </div>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste TMDB v3 API key"
          style={{ width: "100%", padding: 8, borderRadius: 8, marginTop: 6 }}
        />

        {showHelp && <ApiKeyHelpModal onClose={() => setShowHelp(false)} />}

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

          {/* FILE SELECTION ROW */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2, flexWrap: 'wrap' }}>
            <label htmlFor="import-file" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: importing ? '#555' : 'linear-gradient(90deg,#4f7cff,#38bdf8)',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 10,
              fontWeight: 500,
              fontSize: 15,
              cursor: importing ? 'not-allowed' : 'pointer',
              boxShadow: importing ? 'none' : '0 2px 8px rgba(79,124,255,0.10)',
              border: 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
              opacity: importing ? 0.6 : 1
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              Choose File
              <input
                id="import-file"
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                disabled={importing}
                style={{ display: 'none' }}
              />
            </label>

            {/* FILE NAME DISPLAY */}
            {selectedFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {selectedFile.name}
                </span>
                {!importing && (
                  <button
                    onClick={handleClearFile}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* START IMPORT BUTTON */}
          {selectedFile && (
            <button
              onClick={handleStartImport}
              disabled={importing}
              style={{
                background: importing ? '#555' : 'linear-gradient(90deg,#10b981,#34d399)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                cursor: importing ? 'not-allowed' : 'pointer',
                boxShadow: importing ? 'none' : '0 2px 8px rgba(16,185,129,0.15)',
                transition: 'all 0.2s',
                opacity: importing ? 0.6 : 1
              }}
            >
              {importing ? '⌛ Importing...' : '▶ Start Import'}
            </button>
          )}

          {/* PROGRESS BAR */}
          {importing && progress && (
            <div style={{ marginTop: 8 }}>
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: 8,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 10,
                overflow: 'hidden',
                marginBottom: 8
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercentage}%`,
                  background: 'linear-gradient(90deg,#4f7cff,#38bdf8)',
                  transition: 'width 0.3s ease',
                  borderRadius: 10
                }} />
              </div>

              {/* Progress Text */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {progress.processed}/{progress.total} items ({progressPercentage}%)
                </div>
                <div>
                  Imported: <span style={{ color: '#10b981' }}>{progress.imported}</span> •
                  Skipped: <span style={{ color: '#f59e0b' }}>{progress.skipped}</span> •
                  Failed: <span style={{ color: '#ef4444' }}>{progress.failed}</span>
                </div>
              </div>
            </div>
          )}

          {/* EXPORT BUTTONS */}
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
