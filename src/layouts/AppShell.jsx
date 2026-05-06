import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useLibrary } from "../hooks/useLibrary";

/**
 * AppShell Component
 * Handles the high-level layout, sidebar, and header.
 */
export default function AppShell({ 
    children, 
    activeTab, 
    setActiveTab, 
    search, 
    setSearch, 
    mediaType, 
    setMediaType, 
    onOpenSettings,
    viewMode,
    setViewMode,
    onExitSearch
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { loading: libraryLoading } = useLibrary();

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
            {/* Sidebar / Mobile Drawer */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                    onExitSearch();
                }}
                mobileOpen={mobileMenuOpen}
                setMobileOpen={setMobileMenuOpen}
            />

            {/* Main Area */}
            <div className="flex flex-col flex-1 overflow-hidden relative w-full">
                {/* Syncing Loader */}
                {libraryLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-zinc-400 font-medium animate-pulse">Syncing Library...</p>
                        </div>
                    </div>
                )}

                <Header
                    title="Movie-Log v2"
                    search={search}
                    setSearch={setSearch}
                    mediaType={mediaType}
                    setMediaType={setMediaType}
                    onOpenSettings={onOpenSettings}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onOpenMobileMenu={() => setMobileMenuOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
