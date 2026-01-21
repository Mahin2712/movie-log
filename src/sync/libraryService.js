import {
    readLocalLibrary,
    writeLocalLibrary,
    updateLocalItem,
    removeLocalItem
} from "../storage/localStore";
import {
    readUserLibrary,
    writeLibraryItem,
    batchWriteLibrary,
    // we use batchWriteLibrary indirectly via migration or atomic sync if needed later
} from "./firestoreAdapter";
import { mergeLibrary } from "./mergeRules";
import { detectMigrationNeeded, migrateLocalToCloud, MIGRATION_STATUS } from "./migration";
import { hydrateLibrary } from "../services/tmdbService";

/**
 * Library Service
 * The public API for all library operations.
 * Orchestrates Local <-> Cloud sync.
 */

class LibraryService {
    constructor() {
        this.user = null;
        this.userMeta = null;
        this.status = 'idle'; // idle, syncing, migration_required, error
    }

    setUser(user, userMeta) {
        this.user = user;
        this.userMeta = userMeta;
    }

    /**
     * Batch save items (for import)
     */
    async saveItems(items) {
        if (!items || items.length === 0) return;

        if (!this.user) {
            // Guest: Loop local update
            items.forEach(item => updateLocalItem(item));
            return items;
        }

        // User: Cloud Batch
        try {
            const map = {};
            items.forEach(item => {
                // Ensure id is set (mediaKey)
                const key = item.id;
                map[key] = {
                    ...item,
                    updatedAt: new Date().toISOString() // refresh timestamp
                };
            });

            await batchWriteLibrary(this.user.uid, map);

            // Mirror to local
            items.forEach(item => updateLocalItem(item));
            return items;
        } catch (error) {
            console.error("Batch save failed", error);
            // Fallback to local
            items.forEach(item => updateLocalItem(item));
        }
    }

    /**
     * Loads the library for the current state.
     * If Guest: reads local.
     * If User: reads cloud (source of truth) and mirrors to local.
     */
    async loadLibrary() {
        let library = {};

        if (!this.user) {
            console.log("LibraryService: Loading local library (Guest)");
            library = readLocalLibrary();
        } else {
            // Logged in flow
            try {
                console.log("LibraryService: Loading cloud library (User)");
                const cloudLibrary = await readUserLibrary(this.user.uid);
                const localHydrated = readLocalLibrary();

                // Merge cloud data with local hydrated cache
                const mergedLibrary = {};
                const itemsToHydrate = [];

                const { readDeletedItems } = await import("./firestoreAdapter");
                const deletedItemsMap = await readDeletedItems(this.user.uid);

                Object.keys(cloudLibrary).forEach(key => {
                    const cloudItem = cloudLibrary[key];
                    const localItem = localHydrated[key];

                    // STRICT FILTER:
                    // 1. Must not be soft-deleted in doc (cloudItem.deleted)
                    // 2. Must not be in tombstone map (deletedItemsMap[key])
                    const isSoftDeleted = cloudItem.deleted === true;
                    const isHardDeleted = deletedItemsMap[key] === true;

                    if (!isSoftDeleted && !isHardDeleted) {
                        if (localItem && localItem.title && (localItem.poster_path !== undefined)) {
                            // Merge user-specific fields from cloud over local cached metadata
                            mergedLibrary[key] = { ...localItem, ...cloudItem };
                        } else {
                            // Needs new hydration
                            itemsToHydrate.push(cloudItem);
                            mergedLibrary[key] = cloudItem;
                        }
                    }
                });

                // Hydrate missing items
                if (itemsToHydrate.length > 0) {
                    console.log(`LibraryService: Hydrating ${itemsToHydrate.length} new/missing items.`);
                    const newlyHydrated = await hydrateLibrary(itemsToHydrate);
                    newlyHydrated.forEach(item => {
                        mergedLibrary[item.id] = item;
                    });
                }

                library = mergedLibrary;
                // Cache FULL hydrated library to local
                writeLocalLibrary(library);

            } catch (error) {
                console.error("LibraryService: Error loading cloud library, falling back to local cache", error);
                library = readLocalLibrary();
            }
        }

        // Final check: if we are loading local (guest or fallback), ensure it's hydrated
        if (!this.user) {
            const items = Object.values(library);
            const needsHydration = items.filter(i => !i.title);
            if (needsHydration.length > 0) {
                const freshHydrated = await hydrateLibrary(needsHydration);
                freshHydrated.forEach(item => { library[item.id] = item; });
                writeLocalLibrary(library);
            }
        }

        return library;
    }

    /**
     * Determines and executes sync/migration logic on startup/login.
     * Returns the final library state.
     */
    async sync() {
        if (!this.user) return this.loadLibrary();

        // Check migration
        const migrationState = detectMigrationNeeded(this.user, this.userMeta);

        if (migrationState === MIGRATION_STATUS.REQUIRED) {
            this.status = 'migrating';
            try {
                await migrateLocalToCloud(this.user);
                this.status = 'idle';
            } catch (error) {
                this.status = 'error';
                console.error("Migration failed", error);
            }
        }

        // Incremental Sync Logic
        const lastSyncAt = localStorage.getItem(`lastSyncAt_${this.user.uid}`);

        if (lastSyncAt && migrationState === MIGRATION_STATUS.DONE) {
            try {
                console.log(`LibraryService: Incremental sync since ${lastSyncAt}`);

                const { readUserLibrarySince } = await import("./firestoreAdapter");
                const delta = await readUserLibrarySince(this.user.uid, lastSyncAt);

                if (Object.keys(delta).length > 0) {
                    console.log(`LibraryService: Found ${Object.keys(delta).length} remote updates.`);
                    const deltaItems = Object.values(delta);
                    const hydratedDeltas = await hydrateLibrary(deltaItems);

                    const currentLocal = readLocalLibrary();
                    const newLocal = { ...currentLocal };

                    hydratedDeltas.forEach(item => {
                        newLocal[item.id] = item;
                    });

                    writeLocalLibrary(newLocal);
                    localStorage.setItem(`lastSyncAt_${this.user.uid}`, new Date().toISOString());

                    return newLocal;
                } else {
                    console.log("LibraryService: No remote changes.");
                    return readLocalLibrary();
                }

            } catch (e) {
                console.warn("Incremental sync failed, falling back to full load", e);
            }
        }

        // Full Sync (Fetch Cloud -> Hydrate)
        const lib = await this.loadLibrary();
        localStorage.setItem(`lastSyncAt_${this.user.uid}`, new Date().toISOString());
        return lib;
    }

    /**
     * Add/Update an item (Write Path)
     * 1. Update Firestore
     * 2. Update Local Mirror
     * 3. Return updated item for UI
     */
    async saveItem(item) {
        if (!this.user) {
            // Guest: Local only
            updateLocalItem(item);
            return item;
        }

        // User: Cloud first, then mirror
        try {
            await writeLibraryItem(this.user.uid, item);

            // Success? Update local mirror
            updateLocalItem(item);
            return item;
        } catch (error) {
            console.error("Failed to save item to cloud", error);
            // If offline, we could write local only and queue.
            // For now, write local so user sees it, but flag logic needed for later sync?
            // "Offline behavior (safe default): Write to localStorage"
            updateLocalItem(item);
            // TODO: Queue for sync
            return item;
        }
    }

    /**
     * Remove an item
     */
    async removeItem(mediaType, tmdbId) {
        // Construct item object for identification
        const item = { media_type: mediaType, tmdb_id: tmdbId };

        // Remove locally first (Optimistic UI)
        removeLocalItem(mediaType, tmdbId);

        if (this.user) {
            try {
                const { deleteLibraryItem } = await import("./firestoreAdapter");
                await deleteLibraryItem(this.user.uid, item);
                console.log(`LibraryService: Deleted ${mediaType}:${tmdbId} from cloud.`);
            } catch (error) {
                console.error("Failed to remove item from cloud", error);
            }
        }
    }
}

export const libraryService = new LibraryService();
