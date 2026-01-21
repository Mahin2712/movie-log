import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export async function ensureUserDocument(authUser) {
    if (!authUser || !authUser.uid) return;

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
        return snap.data();
    }
}

