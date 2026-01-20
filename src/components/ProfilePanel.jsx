import React, { useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { signInWithGoogle, logout } from "../firebase/auth";

export default function ProfilePanel({ onClose }) {
    const { authUser, authLoading } = useAuth();
    const panelRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    if (authLoading) {
        return (
            <div className="absolute right-4 top-16 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 z-50 text-center animate-fade-in">
                <div className="animate-pulse text-zinc-400">Loading...</div>
            </div>
        );
    }

    return (
        <div
            ref={panelRef}
            className="absolute right-4 top-16 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in"
        >
            {authUser ? (
                <div className="p-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <img
                                src={authUser.photoURL}
                                alt={authUser.displayName}
                                className="w-20 h-20 rounded-full border-2 border-zinc-600 object-cover"
                            />
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-zinc-100">
                                {authUser.displayName}
                            </h3>
                            <p className="text-sm text-zinc-400">{authUser.email}</p>
                        </div>

                        <div className="w-full h-px bg-zinc-800 my-2"></div>

                        <button
                            onClick={async () => {
                                await logout();
                                onClose();
                            }}
                            className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-6 text-center">
                    <div className="mb-4">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">👤</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Guest User</h3>
                        <p className="text-zinc-400 text-sm">
                            Sign in to sync your watchlist across devices.
                        </p>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                await signInWithGoogle();
                                // Keep panel open or close it? Close it usually feels better after success
                                // But if it fails, we want to see why. 
                                // Let's close on success for now, user will see their avatar update in header
                                onClose();
                            } catch (e) {
                                console.error("Login failed", e);
                            }
                        }}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            )}
        </div>
    );
}
