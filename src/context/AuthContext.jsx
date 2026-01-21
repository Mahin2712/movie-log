import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { ensureUserDocument } from "../firebase/firestore";

// 1. Initialize Context with default values
const AuthContext = createContext({
    authUser: null,
    authLoading: true,
});

// 2. Provider Component
export function AuthProvider({ children }) {
    const [authUser, setAuthUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    const mappedUser = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName, // or 'name' based on your preference
                        photoURL: user.photoURL,
                    };

                    // Update local state first for a responsive UI
                    setAuthUser(mappedUser);

                    // Sync user data with Firestore
                    await ensureUserDocument(mappedUser);
                } else {
                    setAuthUser(null);
                }
            } catch (error) {
                console.error("Error in Auth State Change:", error);
            } finally {
                // Always stop the loading spinner, even if Firestore sync fails
                setAuthLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ authUser, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// 3. Custom Hook for easy access
export function useAuth() {
    return useContext(AuthContext);
}
