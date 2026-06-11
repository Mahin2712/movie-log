import { useCallback, useRef } from "react";
import { useLibrary } from "./useLibrary";
import { libraryService } from "../sync/libraryService";
import { normalizeMedia } from "../utils/mediaUtils";

/**
 * useLibraryActions Hook
 * Provides memoized mutation functions for the library with race-condition protection.
 */
export function useLibraryActions() {
    const { setLibrary, library } = useLibrary();
    
    // Track the latest mutation intent per item ID to prevent race conditions
    // Format: { [mediaId]: mutationTimestamp }
    const mutations = useRef({});

    const trackMutation = (id) => {
        const timestamp = Date.now();
        mutations.current[id] = timestamp;
        return timestamp;
    };

    const isMutationLatest = (id, timestamp) => {
        return mutations.current[id] === timestamp;
    };

    const addToWatchlist = useCallback(async (item) => {
        const norm = normalizeMedia(item);
        const mutationId = trackMutation(norm.id);

        const newItem = {
            ...norm,
            status: norm.media_type === 'tv' ? 'watching' : 'watched',
            updatedAt: new Date().toISOString()
        };
        
        try {
            // 1. Cloud & local storage Sync first
            const saved = await libraryService.saveItem(newItem);
            
            // 2. Only update state on success if no newer mutation has started
            if (isMutationLatest(newItem.id, mutationId)) {
                setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            }
            return saved;
        } catch (error) {
            console.error("Add to watchlist failed", error);
            throw error;
        }
    }, [setLibrary]);

    const addToWishlist = useCallback(async (item) => {
        const norm = normalizeMedia(item);
        const mutationId = trackMutation(norm.id);

        const newItem = {
            ...norm,
            status: 'wishlist',
            updatedAt: new Date().toISOString()
        };
        
        try {
            const saved = await libraryService.saveItem(newItem);
            if (isMutationLatest(newItem.id, mutationId)) {
                setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            }
            return saved;
        } catch (error) {
            console.error("Add to wishlist failed", error);
            throw error;
        }
    }, [setLibrary]);

    const removeFromLibrary = useCallback(async (id) => {
        const item = library[id];
        if (!item) return;

        const mutationId = trackMutation(id);

        try {
            await libraryService.removeItem(item.media_type, item.tmdb_id);
            if (isMutationLatest(id, mutationId)) {
                setLibrary(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }
        } catch (error) {
            console.error("Remove from library failed", error);
            throw error;
        }
    }, [library, setLibrary]);

    const setRating = useCallback(async (itemOrId, value) => {
        let item;
        let id;
        
        if (typeof itemOrId === 'object' && itemOrId !== null) {
            const norm = normalizeMedia(itemOrId);
            id = norm.id;
            item = library[id] || norm;
        } else {
            id = String(itemOrId);
            item = library[id];
        }

        if (!item) {
            console.error("Cannot set rating: Item not found and no media object provided.");
            return;
        }

        const mutationId = trackMutation(id);

        const newItem = {
            ...item,
            status: item.status && item.status !== 'wishlist' ? item.status : 'watched',
            rating: value === "" ? null : Number(value),
            updatedAt: new Date().toISOString()
        };

        try {
            const saved = await libraryService.saveItem(newItem);
            if (isMutationLatest(id, mutationId)) {
                setLibrary(prev => ({ ...prev, [id]: saved }));
            }
        } catch (error) {
            console.error("Set rating failed", error);
            throw error;
        }
    }, [library, setLibrary]);

    const updateItem = useCallback(async (updatedItem) => {
        const norm = normalizeMedia(updatedItem);
        const prevItem = library[norm.id];
        const mutationId = trackMutation(norm.id);
        
        try {
            const saved = await libraryService.saveItem(norm);
            if (isMutationLatest(norm.id, mutationId)) {
                setLibrary(prev => ({ ...prev, [saved.id]: saved }));
            }
            return saved;
        } catch (error) {
            console.error("Update item failed", error);
            throw error;
        }
    }, [setLibrary]);

    return {
        addToWatchlist,
        addToWishlist,
        removeFromLibrary,
        setRating,
        updateItem
    };
}
