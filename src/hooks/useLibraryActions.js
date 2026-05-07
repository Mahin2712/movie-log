import { useCallback } from "react";
import { useLibrary } from "./useLibrary";
import { libraryService } from "../sync/libraryService";
import { normalizeMedia } from "../utils/mediaUtils";

/**
 * useLibraryActions Hook
 * Provides memoized mutation functions for the library.
 */
export function useLibraryActions() {
    const { setLibrary, library } = useLibrary();

    const addToWatchlist = useCallback(async (item) => {
        const norm = normalizeMedia(item);
        const newItem = {
            ...norm,
            status: norm.media_type === 'tv' ? 'watching' : 'watched',
            updatedAt: new Date().toISOString()
        };
        
        // Optimistic Update
        setLibrary(prev => ({ ...prev, [newItem.id]: newItem }));

        try {
            const saved = await libraryService.saveItem(newItem);
            // Sync again with server data (in case server added metadata)
            setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            return saved;
        } catch (error) {
            console.error("Add to watchlist failed", error);
            // Rollback
            setLibrary(prev => {
                const next = { ...prev };
                delete next[newItem.id];
                return next;
            });
            throw error;
        }
    }, [setLibrary]);

    const addToWishlist = useCallback(async (item) => {
        const norm = normalizeMedia(item);
        const newItem = {
            ...norm,
            status: 'wishlist',
            updatedAt: new Date().toISOString()
        };
        
        // Optimistic Update
        setLibrary(prev => ({ ...prev, [newItem.id]: newItem }));

        try {
            const saved = await libraryService.saveItem(newItem);
            setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            return saved;
        } catch (error) {
            console.error("Add to wishlist failed", error);
            setLibrary(prev => {
                const next = { ...prev };
                delete next[newItem.id];
                return next;
            });
            throw error;
        }
    }, [setLibrary]);

    const removeFromLibrary = useCallback(async (id) => {
        const item = library[id];
        if (!item) return;

        // Optimistic Update
        setLibrary(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        try {
            await libraryService.removeItem(item.media_type, item.tmdb_id);
        } catch (error) {
            console.error("Remove from library failed", error);
            // Rollback
            setLibrary(prev => ({ ...prev, [id]: item }));
            throw error;
        }
    }, [library, setLibrary]);

    const setRating = useCallback(async (mediaId, value) => {
        const item = library[mediaId];
        if (!item) return;

        const newItem = {
            ...item,
            rating: value === "" ? null : Number(value),
            updatedAt: new Date().toISOString()
        };

        // Optimistic Update
        setLibrary(prev => ({ ...prev, [mediaId]: newItem }));

        try {
            const saved = await libraryService.saveItem(newItem);
            setLibrary(prev => ({ ...prev, [saved.id]: saved }));
        } catch (error) {
            console.error("Set rating failed", error);
            // Rollback
            setLibrary(prev => ({ ...prev, [mediaId]: item }));
            throw error;
        }
    }, [library, setLibrary]);

    const updateItem = useCallback(async (updatedItem) => {
        const prevItem = library[updatedItem.id];
        
        // Optimistic
        setLibrary(prev => ({ ...prev, [updatedItem.id]: updatedItem }));

        try {
            const saved = await libraryService.saveItem(updatedItem);
            setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            return saved;
        } catch (error) {
            console.error("Update item failed", error);
            if (prevItem) {
                setLibrary(prev => ({ ...prev, [updatedItem.id]: prevItem }));
            }
            throw error;
        }
    }, [library, setLibrary]);

    return {
        addToWatchlist,
        addToWishlist,
        removeFromLibrary,
        setRating,
        updateItem
    };
}
