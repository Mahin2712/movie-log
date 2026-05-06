import React from "react";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";

/**
 * AppShell Component
 * A consistent wrapper for the application layout.
 * Handles the Navbar, Mobile Navigation, and main content area spacing.
 */
const AppShell = ({ children, activeTab, onTabChange, user, onSignOut }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Top Navbar - Desktop & Tablet */}
      <Navbar 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        user={user} 
        onSignOut={onSignOut} 
      />

      {/* Main Content Area */}
      <main className="pb-24 md:pb-0 pt-16 md:pt-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default AppShell;
