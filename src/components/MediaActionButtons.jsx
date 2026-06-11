import React, { useState } from 'react';

/**
 * Unified action buttons for media items (Watched, Wishlist)
 */
const MediaActionButtons = ({ 
    item, 
    isInWatchlist, 
    isInWishlist, 
    onAddToWatchlist, 
    onAddToWishlist,
    layout = "grid", // "grid" or "list"
    className = ""
}) => {
    const [pendingAction, setPendingAction] = useState(null);

    const handleWatchlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPendingAction('watchlist');
        try {
            await onAddToWatchlist?.(item);
        } catch (err) {
            console.error(err);
        } finally {
            setPendingAction(null);
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isInWatchlist) {
            setPendingAction('wishlist');
            try {
                await onAddToWishlist?.(item);
            } catch (err) {
                console.error(err);
            } finally {
                setPendingAction(null);
            }
        }
    };

    if (layout === "list") {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <button
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${isInWatchlist
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-600 text-white hover:bg-blue-500 shadow-md active:scale-95"
                        }`}
                    disabled={isInWatchlist || pendingAction !== null}
                    onClick={handleWatchlist}
                >
                    {pendingAction === 'watchlist' ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isInWatchlist ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <span className="text-base font-bold">+</span>
                    )}
                    Watched
                </button>

                <button
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border transition ${isInWatchlist
                        ? "opacity-30 cursor-not-allowed bg-zinc-800 border-zinc-700 text-zinc-600"
                        : isInWishlist
                            ? "bg-red-900/20 border-red-800 text-red-500"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700"
                        }`}
                    disabled={isInWatchlist || pendingAction !== null}
                    onClick={handleWishlist}
                    title={isInWatchlist ? "Already watched" : isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                >
                    {pendingAction === 'wishlist' ? (
                        <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : isInWishlist ? (
                        "♥"
                    ) : (
                        "♡"
                    )}
                </button>
            </div>
        );
    }

    // Default: Grid layout (Netflix/Letterboxd style)
    return (
        <div className={`flex items-center gap-2 w-full ${className}`}>
            <button
                className={`flex-1 h-11 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border rounded-xl flex items-center justify-center gap-2 shadow-lg
                ${isInWatchlist 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-blue-600 text-white hover:bg-blue-500 border-blue-400 shadow-blue-900/20"}`}
                disabled={isInWatchlist || pendingAction !== null}
                onClick={handleWatchlist}
            >
                {pendingAction === 'watchlist' ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isInWatchlist ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <span className="text-sm">+</span>
                )}
                Watched
            </button>

            <button
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all active:scale-90
                ${isInWatchlist 
                    ? "opacity-30 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-700" 
                    : isInWishlist 
                        ? "bg-red-900/20 border-red-800 text-red-500" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600"}`}
                onClick={handleWishlist}
                disabled={isInWatchlist || pendingAction !== null}
            >
                {pendingAction === 'wishlist' ? (
                    <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <span className="text-lg">{isInWishlist ? "♥" : "♡"}</span>
                )}
            </button>
        </div>
    );
};

export default MediaActionButtons;
