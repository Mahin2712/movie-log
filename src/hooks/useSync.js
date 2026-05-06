import { useState, useEffect } from "react";
import { libraryService } from "../sync/libraryService";
import { useAuth } from "../context/AuthContext";

/**
 * useSync Hook
 * Handles the initialization and synchronization of the library state.
 * Returns the library state and loading status.
 */
export function useSync() {
    const [library, setLibrary] = useState({});
    const [loading, setLoading] = useState(true);
    const { authUser, authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;

        const initLibrary = async () => {
            // Update service with current user
            libraryService.setUser(authUser);

            // 1. Instant Bootstrap from Local Cache
            const { readLocalLibrary } = await import("../storage/localStore");
            const local = readLocalLibrary();
            if (Object.keys(local).length > 0) {
                setLibrary(local);
            }

            // 2. Determine if we should show "Blocking" loader
            // We block ONLY on first login (no sync timestamp)
            const lastSyncAt = localStorage.getItem(`lastSyncAt_${authUser?.uid}`);
            const isFirstLogin = authUser && !lastSyncAt;

            if (isFirstLogin) {
                setLoading(true);
            }

            try {
                const lib = await libraryService.sync();
                setLibrary(lib || {});
            } catch (error) {
                console.error("Library sync failed:", error);
            } finally {
                setLoading(false);
            }
        };

        initLibrary();
    }, [authUser, authLoading]);

    return { library, setLibrary, loading };
}
