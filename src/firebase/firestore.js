import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { app } from "./firebase";

let db = null;

if (app) {
    try {
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
            })
        });
    } catch (error) {
        console.warn("Firestore initialization failed:", error);
    }
}

export { db };
export async function ensureUserDocument(authUser) {
    if (!db || !authUser || !authUser.uid) return null;

    try {

    const userRef = doc(db, "users", authUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        const newData = {
            profile: {
                name: authUser.name || "",
                email: authUser.email || "",
                photoURL: authUser.photo || "",
                createdAt: serverTimestamp(),
            },
            meta: {
                migrated: false,
                lastLogin: serverTimestamp(),
                version: 1,
            },
        };
        await setDoc(userRef, newData);
        return newData;
    } else {
        await updateDoc(userRef, {
            "meta.lastLogin": serverTimestamp(),
        });
    }
    } catch (err) {
        console.warn("ensureUserDocument failed:", err);
        return null;
    }
}

