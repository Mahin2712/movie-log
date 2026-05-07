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
                {/* Ambient Sync Indicator */}
                {libraryLoading && (
                  <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-2 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <svg className="absolute w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-3.037,2.463-5.5,5.5-5.5s5.5,2.463,5.5,5.5C23,16.537,20.537,19,17.5,19z M17.5,10 c-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5s3.5-1.57,3.5-3.5S19.43,10,17.5,10z M11,17h-1v-4.5c0-1.378-1.122-2.5-2.5-2.5S5,11.122,5,12.5 V17H4v-4.5C4,10.019,6.019,8,8.5,8s4.5,2.019,4.5,4.5V17z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing Library</span>
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
