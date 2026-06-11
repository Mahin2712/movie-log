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
        this.hydrationListeners = new Set();
        this.hydrationQueue = [];
        this.queuedKeys = new Set();
        this.isHydrating = false;
        this.hydrationRunId = 0;
    }

    setUser(user, userMeta) {
        this.user = user;
        this.userMeta = userMeta;
        this.hydrationRunId++;
        this.hydrationQueue = [];
        this.queuedKeys.clear();
        this.isHydrating = false;
    }

    registerHydrationListener(listener) {
        this.hydrationListeners.add(listener);
        return () => this.hydrationListeners.delete(listener);
    }

    notifyHydration(item) {
        this.hydrationListeners.forEach(listener => {
            try {
                listener(item);
            } catch (err) {
                console.error("LibraryService: Error in listener:", err);
            }
        });
    }

    startBackgroundHydration(items, runId = this.hydrationRunId) {
        if (!items || items.length === 0) return;

        items.forEach(item => {
            const key = item.id || `${item.media_type}_${item.tmdb_id}`;
            if (!this.queuedKeys.has(key)) {
                this.queuedKeys.add(key);
                this.hydrationQueue.push(item);
            }
        });

        if (this.isHydrating) return;
        this.isHydrating = true;
        this.processHydrationQueue(runId);
    }

    async processHydrationQueue(runId) {
        if (runId !== this.hydrationRunId) {
            console.log(`LibraryService: Queue run ID ${runId} is stale (active: ${this.hydrationRunId}). Stopping worker.`);
            this.isHydrating = false;
            return;
        }

        if (this.hydrationQueue.length === 0) {
            this.isHydrating = false;
            this.queuedKeys.clear();
            return;
        }

        const item = this.hydrationQueue.shift();
        const key = item.id || `${item.media_type}_${item.tmdb_id}`;

        try {
            const { readLocalLibrary, mergeLocalHydratedItem } = await import("../storage/localStore");
            const currentLocal = readLocalLibrary();
            
            // Confirm the item still exists locally before querying TMDB
            if (!currentLocal[key]) {
                console.log(`LibraryService: Item ${key} was deleted during queue. Skipping TMDB fetch.`);
                this.processHydrationQueue(runId);
                return;
            }

            const { fetchTMDBDetails, tmdbToMediaItem } = await import("../services/tmdbService");
            const result = await fetchTMDBDetails(item.tmdb_id, item.media_type);

            if (runId !== this.hydrationRunId) {
                this.isHydrating = false;
                return;
            }

            // Confirm it still exists locally after network call
            if (!readLocalLibrary()[key]) {
                console.log(`LibraryService: Item ${key} was deleted during TMDB network fetch. Skipping merge.`);
                this.processHydrationQueue(runId);
                return;
            }

            if (result.success) {
                const hydrated = tmdbToMediaItem(result.data, item.media_type, item);
                const merged = mergeLocalHydratedItem(hydrated);
                if (merged) {
                    this.notifyHydration(merged);
                }
            } else {
                console.warn(`LibraryService: Background hydration failed for ${key}: ${result.error}`);
                const partial = {
                    ...item,
                    title: item.title || `Untitled (${item.tmdb_id})`,
                    year: item.year || null,
                    _hydrationStatus: "failed"
                };
                const merged = mergeLocalHydratedItem(partial);
                if (merged) {
                    this.notifyHydration(merged);
                }
            }
        } catch (error) {
            console.error(`LibraryService: Error in background hydration for ${key}`, error);
        }

        setTimeout(() => this.processHydrationQueue(runId), 150);
    }

    /**
     * Cleans up malformed/reversed key formats (e.g. 10020_movie) from Firestore
     */
    async cleanupMalformedKeys(uid, cloudLibrary) {
        const malformedKeys = Object.keys(cloudLibrary).filter(key => /^\d+_(movie|tv)$/.test(key));
        if (malformedKeys.length === 0) return cloudLibrary;

        console.log(`LibraryService: Found ${malformedKeys.length} malformed cloud keys. Repairing...`);
        const { batchWriteLibrary } = await import("./firestoreAdapter");
        const updates = {};
        const keysToDelete = [];

        const cleanedLibrary = { ...cloudLibrary };

        for (const malformedKey of malformedKeys) {
            const malformedItem = cloudLibrary[malformedKey];
            const tmdbId = Number(malformedItem.tmdb_id);
            const mediaType = malformedItem.media_type;
            const correctKey = `${mediaType}_${tmdbId}`;

            // Merge if correct key already exists, otherwise convert
            const existingCorrect = cleanedLibrary[correctKey];
            let mergedItem;
            if (existingCorrect) {
                const { mergeItems } = await import("./mergeRules");
                mergedItem = mergeItems(existingCorrect, malformedItem);
            } else {
                mergedItem = {
                    ...malformedItem,
                    id: correctKey
                };
            }

            // Prune internal hydration status
            if (mergedItem._hydrationStatus) {
                delete mergedItem._hydrationStatus;
            }

            cleanedLibrary[correctKey] = mergedItem;
            delete cleanedLibrary[malformedKey];

            updates[correctKey] = mergedItem;
            keysToDelete.push({ rawKey: malformedKey });
        }

        try {
            // 1. Write corrected/merged items to cloud
            await batchWriteLibrary(uid, updates);

            // 2. Hard-delete malformed entries from cloud
            const { db } = await import("../firebase/firestore");
            const { writeBatch, doc } = await import("firebase/firestore");
            const batch = writeBatch(db);
            
            keysToDelete.forEach(k => {
                const malformedRef = doc(db, "users", uid, "library", k.rawKey);
                batch.delete(malformedRef);
            });
            await batch.commit();

            console.log("LibraryService: Malformed cloud keys successfully repaired and deleted.");
        } catch (err) {
            console.error("LibraryService: Malformed keys cloud cleanup failed:", err);
        }

        return cleanedLibrary;
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
            
            // Clean up guest local malformed keys
            const malformedKeys = Object.keys(library).filter(key => /^\d+_(movie|tv)$/.test(key));
            if (malformedKeys.length > 0) {
                console.log(`LibraryService: Cleaning up ${malformedKeys.length} malformed guest keys.`);
                const { mergeItems } = await import("./mergeRules");
                malformedKeys.forEach(key => {
                    const item = library[key];
                    const correctKey = `${item.media_type}_${item.tmdb_id}`;
                    if (library[correctKey]) {
                        library[correctKey] = mergeItems(library[correctKey], item);
                    } else {
                        library[correctKey] = { ...item, id: correctKey };
                    }
                    delete library[key];
                });
                writeLocalLibrary(library);
            }

            // Start background hydration for guest missing metadata
            const needsHydration = Object.values(library).filter(i => !i.title || i.poster_path === undefined);
            if (needsHydration.length > 0) {
                console.log(`LibraryService: Guest background hydrating ${needsHydration.length} items.`);
                this.startBackgroundHydration(needsHydration);
            }
        } else {
            // Logged in flow
            try {
                console.log("%cLibraryService: Fetching cloud library...", "color: #3b82f6; font-weight: bold;");
                let cloudLibrary = await readUserLibrary(this.user.uid);
                console.log(`%cLibraryService: Cloud fetch success (${Object.keys(cloudLibrary).length} items)`, "color: #10b981;");
                
                // Clean up malformed keys in cloud library first
                cloudLibrary = await this.cleanupMalformedKeys(this.user.uid, cloudLibrary);
                
                const localHydrated = readLocalLibrary();

                // Merge cloud data with local hydrated cache
                const mergedLibrary = {};
                const itemsToHydrate = [];

                const { readDeletedItems, batchWriteLibrary } = await import("./firestoreAdapter");
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

                // Find local-only (guest) items that are not in cloud and not tombstoned
                const localOnlyKeys = Object.keys(localHydrated).filter(key => {
                    const inCloud = !!cloudLibrary[key];
                    const isDeleted = deletedItemsMap[key] === true;
                    return !inCloud && !isDeleted;
                });

                if (localOnlyKeys.length > 0) {
                    console.log(`LibraryService: Found ${localOnlyKeys.length} guest items. Uploading to cloud.`);
                    const localOnlyMap = {};
                    localOnlyKeys.forEach(key => {
                        const localItem = localHydrated[key];
                        // Ensure timestamps exist
                        localItem.updatedAt = localItem.updatedAt || new Date().toISOString();
                        localItem.dateAdded = localItem.dateAdded || new Date().toISOString();
                        
                        mergedLibrary[key] = localItem;
                        localOnlyMap[key] = localItem;
                    });
                    
                    try {
                        await batchWriteLibrary(this.user.uid, localOnlyMap);
                        console.log("LibraryService: Guest items successfully uploaded to cloud.");
                    } catch (uploadError) {
                        console.error("LibraryService: Failed to upload guest items to cloud", uploadError);
                    }
                }

                library = mergedLibrary;
                // Cache library immediately
                writeLocalLibrary(library);

                // Start background hydration for cloud items missing metadata
                if (itemsToHydrate.length > 0) {
                    console.log(`LibraryService: Background hydrating ${itemsToHydrate.length} items.`);
                    this.startBackgroundHydration(itemsToHydrate);
                }

            } catch (error) {
                console.error("LibraryService: Error loading cloud library, falling back to local cache", error);
                library = readLocalLibrary();
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
                    
                    const currentLocal = readLocalLibrary();
                    const newLocal = { ...currentLocal };
                    const itemsToHydrate = [];

                    Object.keys(delta).forEach(key => {
                        const deltaItem = delta[key];
                        const isDeleted = deltaItem.deleted === true;

                        if (isDeleted) {
                            delete newLocal[key];
                        } else {
                            const existing = newLocal[key];
                            if (existing && existing.title && existing.poster_path !== undefined) {
                                newLocal[key] = { ...existing, ...deltaItem };
                            } else {
                                newLocal[key] = deltaItem;
                                itemsToHydrate.push(deltaItem);
                            }
                        }
                    });

                    writeLocalLibrary(newLocal);
                    localStorage.setItem(`lastSyncAt_${this.user.uid}`, new Date().toISOString());

                    if (itemsToHydrate.length > 0) {
                        console.log(`LibraryService: Incremental background hydrating ${itemsToHydrate.length} items.`);
                        this.startBackgroundHydration(itemsToHydrate);
                    }

                    return newLocal;
                } else {
                    console.log("LibraryService: No remote changes.");
                    return readLocalLibrary();
                }

            } catch (e) {
                console.warn("Incremental sync failed, falling back to full load", e);
            }
        }

        // Full Sync (Fetch Cloud -> Hydrate in background)
        const lib = await this.loadLibrary();
        localStorage.setItem(`lastSyncAt_${this.user.uid}`, new Date().toISOString());
        console.log("%cLibraryService: Full sync complete.", "color: #10b981; font-weight: bold;");
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
                console.log(`%cLibraryService: Deleted ${mediaType}:${tmdbId} from cloud.`, "color: #10b981; font-weight: bold;");
            } catch (error) {
                console.error("%cLibraryService: Cloud deletion failed", "color: #ef4444;", error);
            }
        }
    }
}

export const libraryService = new LibraryService();
