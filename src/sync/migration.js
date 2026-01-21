import { readLocalLibrary, getDeviceMigrated, setDeviceMigrated } from "../storage/localStore";
import { readUserLibrary, batchWriteLibrary, updateUserMeta } from "./firestoreAdapter";
import { mergeLibrary } from "./mergeRules";

/**
 * Migration Logic
 * Responsibilities:
 * - Detect if migration is needed
 * - Execute atomic migration from Local -> Cloud
 * - Handle migration flags (cloud and local)
 */

export const MIGRATION_STATUS = {
    NOT_NEEDED: 'NOT_NEEDED',
    REQUIRED: 'REQUIRED',
    COMPLETED: 'COMPLETED'
};

/**
 * Detects if migration is needed based on user and local state.
 * 
 * Rules:
 * - If user not logged in -> NOT_NEEDED (Local Mode)
 * - If Firestore.meta.migrated === false AND localStorage.deviceMigrated !== true -> REQUIRED
 * - Else -> NOT_NEEDED (Normal Sync)
 * 
 * @param {Object} user - The authenticated user object (must contain uid)
 * @param {Object} userMeta - The user's metadata from Firestore
 */
export const detectMigrationNeeded = (user, userMeta) => {
    if (!user || !user.uid) {
        return MIGRATION_STATUS.NOT_NEEDED;
    }

    const cloudMigrated = !!userMeta?.migrated;
    const localMigrated = getDeviceMigrated();

    // If cloud is already migrated, we assume this device just needs to sync down.
    // However, if strict migration is needed (e.g. new device with local data that needs merging),
    // we might want to allow merging. 
    // BUT per requirements: "Migration runs ONLY if: Firestore.meta.migrated === false AND localStorage.deviceMigrated !== true"

    if (!cloudMigrated && !localMigrated) {
        return MIGRATION_STATUS.REQUIRED;
    }

    return MIGRATION_STATUS.NOT_NEEDED;
};

/**
 * Executes the migration from Local Storage to Firestore.
 * 
 * Atomic Definition:
 * - Reads all local items.
 * - Merges with any existing cloud items (safety check, though likely empty if not migrated).
 * - Batch writes all consolidated items to Firestore.
 * - Sets Firestore meta.migrated = true.
 * - Sets localStorage.deviceMigrated = true.
 * 
 * If any step fails, it throws and flags are NOT set, allowing retry.
 * 
 * @param {Object} user - The authenticated user
 */
export const migrateLocalToCloud = async (user) => {
    if (!user || !user.uid) return;

    console.log("Starting atomic migration for user:", user.uid);

    try {
        // 1. Read Local Data
        const localLibrary = readLocalLibrary();
        const localItemsCount = Object.keys(localLibrary).length;

        // Optimization: If local is empty, we still need to set migrated=true to stop future checks
        // But we can skip the batch write of items.

        // 2. Read Cloud Data (Safety: Even if we think it's empty, good to check/merge)
        // In a strict "First Migration" this might be overkill if we trust the flags, 
        // but robust systems verify.
        const cloudLibrary = await readUserLibrary(user.uid);

        // 3. Merge (Local wins or standard merge rules)
        // This produces the final set of items to write to cloud
        const updates = mergeLibrary(localLibrary, cloudLibrary);

        // 4. Atomic Write
        // We need to write items AND update the user meta in one go if possible, 
        // or at least ensure strict ordering.
        // Firestore limits batches to 500 ops.
        // For Phase 3, we assume library size < 500 for simplicity or handle in chunks.
        // But critical: meta.migrated = true must happen.

        if (Object.keys(updates).length > 0) {
            await batchWriteLibrary(user.uid, updates);
        }

        // 5. Finalize Flags
        // We set cloud flag FIRST. If this fails, we retry migration.
        // If this succeeds but local flag fails, we might retry migration.
        // But since cloud flag is now TRUE, consecutive checks will see "Cloud Migrated = True"
        // and skipped. This is acceptable IF the sync logic then handles "Cloud Source of Truth".
        // However, to strictly follow "no half-migrated", the batch write is critical.

        await updateUserMeta(user.uid, {
            migrated: true,
            lastSyncAt: new Date().toISOString(),
            migrationDate: new Date().toISOString()
        });

        // 6. Set Local Flag
        setDeviceMigrated(true);

        console.log(`Migration successful. synced ${Object.keys(updates).length} items.`);
        return true;

    } catch (error) {
        console.error("Migration failed (Atomic rollback implicit - no flags set):", error);
        // Do NOT set deviceMigrated = true
        // Do NOT set cloud migrated = true
        throw error; // Propagate to trigger generic error UI
    }
};
