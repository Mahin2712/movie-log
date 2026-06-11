import React, { useState } from 'react';

/**
 * SettingsModal Component
 * Redesigned for premium aesthetics and mobile responsiveness using Tailwind.
 */
export default function SettingsModal({
  autoRefresh = 15,
  setAutoRefresh,
  onImport,
  onExportWatched,
  onExportWishlist,
  onClose
}) {
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [localAutoRefresh, setLocalAutoRefresh] = useState(autoRefresh);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
    e.target.value = ''; // Reset input to allow re-selection
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
    } catch (err) {
      console.error("Import error:", err);
    } finally {
      setImporting(false);
      setSelectedFile(null);
      setProgress(null);
    }
  };

  const handleSave = () => {
    if (setAutoRefresh) {
      setAutoRefresh(localAutoRefresh);
    }
    localStorage.setItem("movieApp_refreshMins", String(localAutoRefresh));
    onClose();
  };

  const progressPercentage = progress && progress.total > 0
    ? Math.round((progress.processed / progress.total) * 100)
    : 0;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-zinc-900/90 border border-white/10 rounded-[2rem] shadow-2xl p-6 sm:p-8 backdrop-blur-2xl max-w-md w-full flex flex-col gap-6 animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Background Decorator */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[50px] pointer-events-none rounded-full" />

        <div className="flex flex-col gap-1.5">
          <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">
            Settings <span className="text-blue-500">.</span>
          </h3>
          <p className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Customize your synchronization and backup data.</p>
        </div>

        {/* AUTO REFRESH */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">
            Background Sync Interval
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={localAutoRefresh}
              onChange={(e) => setLocalAutoRefresh(Math.max(1, Number(e.target.value || 1)))}
              className="w-24 px-4 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none text-white text-sm transition-all"
            />
            <span className="text-sm font-semibold text-zinc-400">minutes</span>
          </div>
        </div>

        {/* DATA MANAGEMENT CARD */}
        <div className="p-5 rounded-2xl bg-zinc-950/50 border border-white/5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-zinc-200">Data Transfer</h4>
            <p className="text-[11px] text-zinc-500 font-medium">Import JSON or CSV exports. Existing duplicates will be skipped automatically.</p>
          </div>

          {/* FILE SELECTION ROW */}
          <div className="flex items-center gap-3 flex-wrap">
            <label 
              htmlFor="import-file" 
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all border border-transparent shadow-lg cursor-pointer ${
                importing 
                  ? 'bg-zinc-800 border-zinc-700/50 opacity-50 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 active:scale-95'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Choose File
              <input
                id="import-file"
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                disabled={importing}
                className="hidden"
              />
            </label>

            {/* FILE NAME DISPLAY */}
            {selectedFile && (
              <div className="flex items-center gap-2 max-w-[200px] shrink">
                <span className="text-xs font-semibold text-zinc-300 truncate">
                  {selectedFile.name}
                </span>
                {!importing && (
                  <button
                    onClick={handleClearFile}
                    className="p-1 rounded-full text-zinc-500 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-md ${
                importing
                  ? 'bg-zinc-800 cursor-not-allowed opacity-50'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-emerald-900/10'
              }`}
            >
              {importing ? '⌛ Importing...' : '▶ Start Import'}
            </button>
          )}

          {/* PROGRESS BAR */}
          {importing && progress && (
            <div className="mt-2 flex flex-col gap-2.5">
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex flex-col gap-1 text-[11px] font-medium text-zinc-500">
                <span className="text-zinc-300 font-bold">
                  Processed {progress.processed} of {progress.total} ({progressPercentage}%)
                </span>
                <div className="flex gap-2">
                  <span>Imported: <span className="text-emerald-400 font-bold">{progress.imported}</span></span>
                  <span>Skipped: <span className="text-yellow-500 font-bold">{progress.skipped}</span></span>
                  <span>Failed: <span className="text-red-400 font-bold">{progress.failed}</span></span>
                </div>
              </div>
            </div>
          )}

          <div className="w-full h-px bg-white/5 my-1" />

          {/* EXPORT BUTTONS */}
          <div className="flex gap-3">
            <button
              className="flex-1 py-3 px-2 text-center rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
              onClick={onExportWatched}
            >
              Export Watched
            </button>
            <button
              className="flex-1 py-3 px-2 text-center rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
              onClick={onExportWishlist}
            >
              Export Wishlist
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-2">
          <button 
            className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-white/5"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
