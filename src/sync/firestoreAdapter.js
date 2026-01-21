import { db } from "../firebase/firestore";
import { collection, doc, getDocs, setDoc, writeBatch, serverTimestamp, updateDoc } from "firebase/firestore";
import { getMediaKey } from "./mergeRules";
import { sanitizeForFirestore } from "./sanitizers";

/**
 * Firestore Adapter
 * Responsibilities:
 * - Read/Write user library from Firestore
 * - Batch writes for migration
 * - Dumb IO layer (No merge logic)
 */


/**
 * Reads the deletedItems tombstone map
 */
export const readDeletedItems = async (uid) => {
    if (!uid) return {};
    try {
        const metaRef = doc(db, "users", uid, "meta", "general");
        const snapshot = await (await import("firebase/firestore")).getDoc(metaRef);
        if (snapshot.exists()) {
            return snapshot.data().deletedItems || {};
        }
        return {};
    } catch (error) {
        console.warn("Error reading deleted items:", error);
        return {};
    }
};


/**
 * Reads the entire library for a user from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Map of mediaKey -> item
 */
export const readUserLibrary = async (uid) => {
    if (!uid) return {};

    try {
        const libraryRef = collection(db, "users", uid, "library");
        const snapshot = await getDocs(libraryRef);

        const library = {};
        snapshot.forEach(doc => {
            library[doc.id] = { id: doc.id, ...doc.data() };
        });

        return library;
    } catch (error) {
        console.error("Error reading Firestore library:", error);
        throw error;
    }
};



/**
 * Writes a single item to Firestore
 * @param {string} uid - User ID
 * @param {Object} item - The item to write
 */
export const writeLibraryItem = async (uid, item) => {
    if (!uid || !item) return;

    const key = getMediaKey(item.media_type, item.tmdb_id);
    const itemRef = doc(db, "users", uid, "library", key);

    try {
        // Use setDoc with merge: true to avoid overwriting unrelated fields if schema changes,
        // but generally we want to overwrite with the specific passed item state.
        // However, we must ensure serverTimestamp is handled if needed.
        // The merge logic should have already prepared the item.

        // We'll trust the input item is fully formed from the merge logic.
        const writeData = sanitizeForFirestore({
            ...item,
            updatedAt: serverTimestamp() // Always update server timestamp on write
        });

        await setDoc(itemRef, writeData); // Strict schema: Overwrite to remove any non-whitelisted fields
    } catch (error) {
        console.error("Error writing library item:", error);
        throw error;
    }

};

/**
 * Deletes a single item from Firestore
 * @param {string} uid - User ID
 * @param {Object} item - The item to delete (needs tmdb_id and media_type)
 */
export const deleteLibraryItem = async (uid, item) => {
    if (!uid || !item) return;

    const key = getMediaKey(item.media_type, item.tmdb_id);
    const itemRef = doc(db, "users", uid, "library", key);
    const metaRef = doc(db, "users", uid, "meta", "general");

    try {
        const batch = (await import("firebase/firestore")).writeBatch(db);

        // 1. Soft Delete Item (for Delta Sync)
        batch.set(itemRef, {
            deleted: true,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // 2. Add to Tombstone Map (Permanent Memory)
        // We use dot notation to update a specific key in the map
        batch.set(metaRef, {
            deletedItems: {
                [key]: true
            },
            updatedAt: serverTimestamp()
        }, { merge: true });

        await batch.commit();
    } catch (error) {
        console.error("Error deleting library item:", error);
        throw error;
    }
};

/**
 * Reads only items updated since a specific timestamp
 * @param {string} uid - User ID
 * @param {string|Date} since - ISO string or Date object
 * @returns {Promise<Object>} Map of mediaKey -> item
 */
export const readUserLibrarySince = async (uid, since) => {
    if (!uid) return {};

    try {
        const libraryRef = collection(db, "users", uid, "library");
        const { query, where, getDocs, Timestamp } = await import("firebase/firestore");

        // Convert to Firestore Timestamp for comparison if needed, or stick to ISO string depending on storage
        // usage. Since we store serverTimestamp() for updatedAt, we should compare against Timestamps.
        // But if since is from localStorage (ISO string), we need to convert.
        const sinceDate = new Date(since);

        const q = query(
            libraryRef,
            where("updatedAt", ">", sinceDate)
        );

        const snapshot = await getDocs(q);

        const library = {};
        snapshot.forEach(doc => {
            library[doc.id] = { id: doc.id, ...doc.data() };
        });

        return library;
    } catch (error) {
        console.error("Error reading Firestore delta:", error);
        // Fallback to full sync if delta fails? Or throw?
        throw error;
    }
};

/**
 * Batch write multiple items to Firestore (Atomic)
 * @param {string} uid - User ID
 * @param {Object} itemsMap - Map of mediaKey -> item
 */
export const batchWriteLibrary = async (uid, itemsMap) => {
    if (!uid || Object.keys(itemsMap).length === 0) return;

    try {
        const batch = writeBatch(db);

        Object.entries(itemsMap).forEach(([key, item]) => {
            const docRef = doc(db, "users", uid, "library", key);
            batch.set(docRef, sanitizeForFirestore({
                ...item,
                updatedAt: serverTimestamp()
            }));
        });

        await batch.commit();
    } catch (error) {
        console.error("Error executing batch write:", error);
        throw error;
    }
};

/**
 * Update user metadata (e.g. migration status)
 * @param {string} uid 
 * @param {Object} updates 
 */
export const updateUserMeta = async (uid, updates) => {
    if (!uid) return;

    const userRef = doc(db, "users", uid);
    try {
        await setDoc(userRef, { meta: updates }, { merge: true });
    } catch (error) {
        console.error("Error updating user meta:", error);
        throw error;
    }
};

/**
 * Get user metadata
 */
export const getUserMeta = async (uid) => {
    // Actually, we might need to read the user doc to check 'migrated' status
    // This is usually done in `ensureUserDocument` or separately.
    // Let's rely on standard firestore get.
    // Note: `ensureUserDocument` in `firebase/firestore.js` handles creation.
    // We'll add a helper here just in case.
    return {}; // Not implementing a read here yet unless needed for migration check
    // Migration check likely uses the profile/meta data loaded in AuthContext or fetched explicitly.
};
